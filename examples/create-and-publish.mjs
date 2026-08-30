#!/usr/bin/env node
/**
 * Runs the integration's own Create Post and Publish Post actions against the
 * live FoPost API — the same code path a Zap takes, without Zapier in the loop.
 *
 *   npm run build
 *   FOPOST_API_KEY=fp_live_xxx node examples/create-and-publish.mjs
 *
 * Optional: FOPOST_WORKSPACE_ID and FOPOST_ACCOUNT_ID to target a specific
 * workspace and account. Both default to the first one the key can reach.
 * Set FOPOST_BASE_URL to point at a non-production API.
 */
import { createAppTester } from 'zapier-platform-core';

import App from '../dist/index.js';

const apiKey = process.env.FOPOST_API_KEY;
if (!apiKey) {
  console.error('Set FOPOST_API_KEY first. Create a key in FoPost under Settings → API Keys.');
  process.exit(1);
}

const appTester = createAppTester(App);
const auth = { authData: { api_key: apiKey } };
const run = (operation, inputData = {}) => appTester(operation.perform, { ...auth, inputData });

const workspaces = await run(App.triggers.list_workspaces.operation);
const workspaceId = process.env.FOPOST_WORKSPACE_ID || workspaces[0]?.id;
if (!workspaceId) {
  console.error('That API key can not reach any workspace.');
  process.exit(1);
}

const accounts = await run(App.triggers.list_accounts.operation, { workspace_id: workspaceId });
const accountId = process.env.FOPOST_ACCOUNT_ID || accounts[0]?.id;
if (!accountId) {
  console.error(`No connected accounts in workspace ${workspaceId}. Connect one in FoPost first.`);
  process.exit(1);
}

const post = await run(App.creates.create_post.operation, {
  workspace_id: workspaceId,
  accounts: [accountId],
  text: 'Posted from the FoPost Zapier integration example.',
  status: 'draft',
});
console.log(`Created draft ${post.id}`);

const published = await run(App.creates.publish_post.operation, { post_id: post.id });
console.log(
  `Queued ${published.queued_count} delivery/deliveries — post is ${published.post_status}`,
);
console.log('Delivery is asynchronous. Watch the New Published Post trigger, or check FoPost.');
