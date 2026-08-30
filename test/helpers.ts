import nock from 'nock';

export const API = 'https://api.fopost.com';
export const AUTH = { authData: { api_key: 'fp_test_key_123' } };

export const workspace = {
  id: '8f2c6b1e-4d3a-4a52-9f7c-1b0d5e6a7c31',
  name: 'Aurora Coffee Co.',
  slug: 'aurora-coffee',
  type: 'brand',
  timezone: 'America/New_York',
  language: 'en',
  created_at: '2026-01-14T09:12:00.000Z',
};

export const secondWorkspace = {
  ...workspace,
  id: 'ff000000-0000-4000-8000-000000000002',
  name: 'Aurora Wholesale',
};

export const account = {
  id: 'c4a9d2f7-6e18-4b30-8c55-2fa1e9d47b60',
  workspaceId: workspace.id,
  platform: 'linkedin',
  username: 'aurora-coffee',
  name: 'Aurora Coffee Co.',
  isPrimary: true,
  active: true,
  healthStatus: 'healthy',
};

export const label = {
  id: '5d8e0a34-91b7-4c26-a0f1-77ce4b93de52',
  name: 'Product Launch',
  color: '#0ea5e9',
  workspace: { id: workspace.id, name: workspace.name },
};

export const publishedPost = {
  id: '1a7b3c9d-2e45-4f68-b0c1-9d8e7f6a5b43',
  workspace_id: workspace.id,
  status: 'published',
  content_type: 'post',
  content: [{ text: 'Autumn roast lands tomorrow.', media: [] }],
  accounts: [
    {
      id: account.id,
      platform: 'linkedin',
      username: 'aurora-coffee',
      name: 'Aurora Coffee Co.',
      publish_status: 'published',
      posted_at: '2026-08-28T15:00:12.000Z',
      external_url: 'https://www.linkedin.com/feed/update/urn:li:share:723188441',
    },
  ],
  labels: [{ id: label.id, name: label.name, color: label.color }],
  created_at: '2026-08-27T10:22:00.000Z',
  updated_at: '2026-08-28T15:00:12.000Z',
};

export const listMeta = { current_page: 1, per_page: 100, total: 1, last_page: 1, from: 1, to: 1 };

/** nock reports repeated headers as arrays; collapse to the first value. */
export const headerValue = (raw: unknown): string | undefined =>
  Array.isArray(raw) ? (raw[0] as string) : (raw as string | undefined);

export const resetHttp = (): void => {
  nock.cleanAll();
};

/**
 * `defineApp` widens every perform to `Request | Function`, which appTester's
 * overloads cannot narrow. Tests know they are functions.
 */
export const perform = (fn: unknown): ((z: unknown, bundle: unknown) => unknown) =>
  fn as (z: unknown, bundle: unknown) => unknown;

/** Pulls the perform out of any trigger/create/search operation. */
export const operationPerform = (operation: unknown) =>
  perform((operation as { perform: unknown }).perform);
