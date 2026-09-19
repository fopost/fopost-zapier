# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What This Is

`fopost-zapier` is the official **FoPost integration for Zapier** — a Zapier CLI platform
app (`zapier-platform-core` v19) that exposes FoPost triggers, actions and searches to
Zapier's 8,000+ apps.

**It is not an npm package and must never be published to one.** `package.json` is
`"private": true` on purpose: the artifact is a build uploaded to the Zapier platform with
`zapier push`, and Zapier is the only distribution channel. There is no registry
coordinate, no `npm publish` step, and nothing here is meant to be imported by other code.

## Brand Rules

- The product is **FoPost** (`fopost.com`). Never write "OwlStack" — retired Aug 2026.
- Never write an email address. Support is https://fopost.com/contact and GitHub issues.
- Never name AI providers/models, infrastructure vendors, or any person. Sample and demo
  data uses fictional brands and `yourbrand.com` domains.

## Architecture

```
src/
  index.ts             defineApp(): auth, middleware, flags, and the operation registries
  authentication.ts    custom auth — one api_key field, test, connectionLabel
  middleware.ts        beforeRequest (X-API-Key) and afterResponse (error mapping)
  version.ts           the User-Agent version, kept in sync with package.json by hand
  lib/
    api.ts             base URL, get/post helpers, {data:...} unwrap, page arithmetic
    types.ts           the FoPost response shapes this app reads
    fields.ts          the workspace/accounts/labels dynamic-dropdown input fields
    format.ts          flattens a Post into the mappable shape a Zap step consumes
    outputs.ts         outputFields per resource
    samples.ts         sample records (required by Zapier's review)
  triggers/            new_post_published, post_failed, new_account_connected
                       + hidden: list_workspaces, list_accounts, list_labels, list_posts
  creates/             create_post, publish_post, upload_media, add_label
  searches/            find_post, find_account
test/                  jest + nock, fully offline
examples/              runnable create-and-publish script against the live API
```

A request flows: perform → `lib/api.ts` `get`/`post` → `z.request` → `includeApiKey`
(beforeRequest) → FoPost → `handleErrors` (afterResponse) → `unwrap` → a formatter.

### Use `z.request`, never the `@fopost/sdk` package

This app deliberately does **not** depend on `@fopost/sdk` (the sibling `fopost-js` repo),
even though it wraps the same API. Zapier apps must issue every HTTP call through
`z.request` so the platform can apply its own throttling, retries, request logging, secret
scrubbing and the app's `beforeRequest`/`afterResponse` middleware. The SDK ships its own
`fetch`, retry loop and error classes, none of which the Zapier runtime can see — pulling
it in would make the integration's traffic invisible to Zapier and silently bypass the
error mapping below. Do not "simplify" this by adding the SDK.

### Middleware

- `includeApiKey` adds `X-API-Key`, `Accept` and a `fopost-zapier/<version>` User-Agent, and
  is **scoped to the FoPost host** — `upload_media` fetches the user's file from a
  third-party URL and PUTs the bytes to a signed storage URL through the same `z.request`,
  and the key must never travel to either.
- `handleErrors` maps the `{ error, message }` envelope: `401` → `ExpiredAuthError` (Zapier
  prompts a reconnect), `429` → `ThrottledError` honouring `Retry-After`, `402` → an error
  carrying `upgrade_url`, everything else → `z.errors.Error` with the API's own message.
  It also no-ops on non-FoPost hosts.
- Two app-level `flags` matter: `throwForThrottlingEarly: false` (core otherwise throws a
  generic `ThrottledError` on 429 _before_ `afterResponse` runs, losing FoPost's wording)
  and `cleanInputData: false` (every perform already treats an empty string as absent).

### Dynamic dropdowns

An action's whole `bundle.inputData` is passed to the dropdown trigger, so `list_accounts`,
`list_labels` and `list_posts` read `bundle.inputData.workspace_id` to narrow their results.
`create_post` also contributes its accounts and labels fields from an `inputFields` function
that returns nothing until a workspace is chosen, and `workspace_id` carries
`altersDynamicFields: true` so the form refreshes when it changes.

### Every operation needs a sample and outputFields

Zapier's review rejects an integration without them, and users see them while mapping
fields. `test/definition.test.ts` fails if a visible trigger, create or search is missing
either — the same structural check `zapier validate` runs, kept in CI.

## API Contract

- Base URL `https://api.fopost.com/v1`, overridable with `FOPOST_BASE_URL`.
- Auth is the header `X-API-Key: <key>` — **not** a bearer token.
- Most responses are `{ "data": ... }`; a few creates return the resource at the top level.
  `unwrap()` handles both. Paginated lists add `meta` (`current_page`, `per_page`, `total`,
  `last_page`, `from`, `to`) — snake_case.
- Errors are `{ "error": "<machine_code>", "message": "<human text>" }`, with `upgrade_url`
  on some 402s.
- Posts, labels and workspaces are snake_case; accounts and deliveries are camelCase. That
  is the API's own inconsistency, not a bug here — `lib/types.ts` mirrors it exactly.
- Retries and backoff are Zapier's job, not ours. Do not add a retry loop.
- Publishing is create-then-publish, and `POST /posts/{id}/publish` returns when delivery is
  **queued**, not live.
- Media upload is a direct upload, never multipart: `POST /media/presign` answers a signed
  `uploadUrl` plus the exact headers to send, the bytes go there with `PUT` and no API key,
  and `POST /media/presign/{uploadId}/complete` returns the stored media. Max 50 MB.

## Commands

```bash
npm install
npm test                       # jest + nock, offline
npm run lint                   # tsc --noEmit -p tsconfig.test.json && prettier --check .
npm run build                  # tsc -> dist/ (also runs as _zapier-build before a push)
npm run validate               # zapier-platform validate — works without logging in
npm run register               # zapier-platform register — once per app, needs a login
npm run push                   # zapier-platform push — needs a login or ZAPIER_DEPLOY_KEY
```

The CLI binary is `zapier-platform`, not `zapier`, in platform v19.

## Conventions

- **TypeScript compiled to ESM.** Zapier supports TypeScript integrations as ESM only: the
  CommonJS Lambda wrapper `require`s a hand-written `index.js` at the app root, while the
  ESM wrapper imports the package `exports` entry and unwraps a default export. So
  `"type": "module"`, `"exports": "./dist/index.js"`, `module: NodeNext`, and every relative
  import carries a `.js` extension. Tests run that source through ts-jest's CommonJS output,
  which is why `jest.config.cjs` maps `.js` specifiers back onto the `.ts` sources.
- Node **>=20** to build and test; Zapier executes platform v19 integrations on **Node 22**,
  which is what CI's release lane and the deployed runtime use.
- Prettier: single quotes, semicolons, trailing commas, 100 char width, 2-space indent.
- Comments are short and explain a "why". No narrated docblocks on obvious code.
- Tests are offline. Every FoPost call is intercepted by `nock`; nothing in CI may reach the
  real API.

## Releasing

Tag `v<version>`; `.github/workflows/release.yml` runs `zapier-platform push`. Requires the
repository secret **`ZAPIER_DEPLOY_KEY`** (Zapier → Settings → Deploy Keys).

Before the first push, someone has to run `zapier-platform register` **once**, interactively,
with a logged-in Zapier account. That command creates the integration on Zapier's side and
writes **`.zapierapprc`**, which holds the app id. `.zapierapprc` is **committed on purpose**
— it is an identifier, not a secret, and CI cannot push without it. `.gitignore` therefore
excludes `build/`, `dist/`, `node_modules/` and `.env`, but never `.zapierapprc`.

`zapier push` uploads a new **private** version. Making it public in the Zapier App Directory
is a separate, manual step: Zapier reviews the integration by hand, and the review checks the
things `zapier validate` warns about — samples, output fields, help text and dynamic
dropdowns on ID fields. Keep `npm run validate` at zero errors and zero warnings.

## Git

Conventional Commits, atomic. Branch `feature/<description>`, merge to `main` via PR.
Never `gh pr create` — push the branch and hand over the compare link.
