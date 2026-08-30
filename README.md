# FoPost for Zapier

[![CI](https://github.com/fopost/fopost-zapier/actions/workflows/ci.yml/badge.svg)](https://github.com/fopost/fopost-zapier/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Zapier Platform](https://img.shields.io/badge/zapier--platform-19-orange.svg)](https://docs.zapier.com/platform)

The official [FoPost](https://fopost.com) integration for Zapier. It connects FoPost
scheduling and publishing — 30+ social networks from one composer — to everything else in
your Zapier account: draft a post when a row lands in a sheet, publish when a deal closes,
alert the team the moment a delivery fails.

> This is a **Zapier CLI platform app**, not an npm package. It is never published to npm;
> it is pushed to the Zapier platform with `zapier push`. See
> [Installing as a private app](#installing-as-a-private-app).

Documentation: **https://fopost.com/docs** · Issues:
**https://github.com/fopost/fopost-zapier/issues**

## Triggers

| Trigger                    | Fires when                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| **New Published Post**     | FoPost finishes publishing a post. Filterable by workspace and label.                             |
| **Post Failed to Publish** | A post fails to reach one of its accounts. One event per failed account, with the platform error. |
| **New Connected Account**  | A social account is connected to a workspace.                                                     |

Four hidden triggers (`list_workspaces`, `list_accounts`, `list_labels`, `list_posts`) exist
only to fill the dynamic dropdowns on the actions below — accounts and labels narrow to the
workspace you pick.

## Actions

| Action           | Does                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| **Create Post**  | Creates a draft or scheduled post for one or more connected accounts, with media, labels and a title. |
| **Publish Post** | Queues an existing draft or scheduled post for delivery.                                              |
| **Upload Media** | Uploads a file from an earlier Zap step and returns a URL for Create Post.                            |
| **Add Label**    | Creates a label in a workspace.                                                                       |

## Searches

| Search           | Finds                                                                |
| ---------------- | -------------------------------------------------------------------- |
| **Find Post**    | One post by ID, or the newest post matching a text or status search. |
| **Find Account** | A connected account by username, platform or workspace.              |

## Authentication

The integration uses a FoPost **API key**, sent as an `X-API-Key` header. Create one in
FoPost under Settings → API Keys and give it the `workspaces`, `accounts`, `posts` and
`labels` scopes so every trigger and action works. Zapier stores the key as a password field
and scrubs it from logs, and it is only ever sent to `api.fopost.com`.

A `401` is surfaced as an expired connection, so Zapier asks you to reconnect rather than
failing the Zap silently. A `402` carries the upgrade link, and a `429` backs off for as long
as the API asks.

## Installing as a private app

You do not need to wait for the public listing. Anyone with a Zapier account can run this
integration privately:

```bash
git clone https://github.com/fopost/fopost-zapier.git
cd fopost-zapier
npm install

npx zapier-platform login      # once, with your Zapier account
npx zapier-platform register   # once, creates the app and writes .zapierapprc
npx zapier-platform push       # builds and uploads a version
```

`zapier push` prints an invite link. Open it, connect your FoPost API key, and the triggers
and actions show up in the Zap editor. Anyone you share that link with can use the same
private version.

## Development

```bash
npm install
npm test                       # jest + nock, fully offline
npm run lint                   # tsc --noEmit and prettier --check
npm run build                  # tsc -> dist/
npm run validate               # zapier-platform validate (no login required)
```

The source is TypeScript compiled to ESM — Zapier only supports TypeScript integrations as
ESM. Tests never touch the network: every FoPost call is intercepted by `nock`.

There is a runnable end-to-end example that drives the integration's own actions against the
live API:

```bash
npm run build
FOPOST_API_KEY=fp_live_xxx node examples/create-and-publish.mjs
```

## Releasing

Tag `v<version>`; `.github/workflows/release.yml` runs `zapier push` using the repository
secret `ZAPIER_DEPLOY_KEY`. Promoting a version to the public App Directory is a separate,
manual step that goes through Zapier's review.

## License

MIT © Porter Bridge, LLC. See [LICENSE](LICENSE).
