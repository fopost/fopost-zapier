/**
 * Samples are what a user sees while mapping fields in the Zap editor, and
 * Zapier's review rejects an integration without them. Values are fictional.
 */

export const workspaceSample = {
  id: '8f2c6b1e-4d3a-4a52-9f7c-1b0d5e6a7c31',
  name: 'Aurora Coffee Co.',
  slug: 'aurora-coffee',
  type: 'brand',
  timezone: 'America/New_York',
  language: 'en',
  website: 'https://yourbrand.com',
  created_at: '2026-01-14T09:12:00.000Z',
};

export const accountSample = {
  id: 'c4a9d2f7-6e18-4b30-8c55-2fa1e9d47b60',
  workspaceId: workspaceSample.id,
  platform: 'linkedin',
  username: 'aurora-coffee',
  name: 'Aurora Coffee Co.',
  avatar: 'https://cdn.yourbrand.com/avatars/aurora.png',
  isPrimary: true,
  active: true,
  healthStatus: 'healthy',
  lastHealthCheck: '2026-08-29T18:40:00.000Z',
};

export const labelSample = {
  id: '5d8e0a34-91b7-4c26-a0f1-77ce4b93de52',
  name: 'Product Launch',
  color: '#0ea5e9',
  workspace: { id: workspaceSample.id, name: workspaceSample.name },
  created_at: '2026-03-02T11:05:00.000Z',
  updated_at: '2026-03-02T11:05:00.000Z',
};

const postAccountSample = {
  id: accountSample.id,
  platform: 'linkedin',
  username: 'aurora-coffee',
  name: 'Aurora Coffee Co.',
  avatar: accountSample.avatar,
  publish_status: 'published',
  posted_at: '2026-08-28T15:00:12.000Z',
  platform_post_id: '7231884410992640000',
  external_url: 'https://www.linkedin.com/feed/update/urn:li:share:7231884410992640000',
  error_code: null,
  error_message: null,
  attempts: 1,
  max_attempts: 3,
};

export const postSample = {
  id: '1a7b3c9d-2e45-4f68-b0c1-9d8e7f6a5b43',
  workspace_id: workspaceSample.id,
  status: 'published',
  content_type: 'post',
  title: null,
  summary: null,
  text: 'Our single-origin autumn roast lands tomorrow. Pre-orders open at 9am.',
  schedule_at: '2026-08-28T15:00:00.000Z',
  published_at: '2026-08-28T15:00:12.000Z',
  permalink: postAccountSample.external_url,
  permalinks: [postAccountSample.external_url],
  media_urls: ['https://cdn.yourbrand.com/media/autumn-roast.jpg'],
  account_ids: [accountSample.id],
  platforms: ['linkedin'],
  label_names: [labelSample.name],
  accounts: [postAccountSample],
  labels: [{ id: labelSample.id, name: labelSample.name, color: labelSample.color }],
  created_at: '2026-08-27T10:22:00.000Z',
  updated_at: '2026-08-28T15:00:12.000Z',
};

export const failedDeliverySample = {
  id: `${postSample.id}:${accountSample.id}`,
  post_id: postSample.id,
  post_title: null,
  text: postSample.text,
  workspace_id: workspaceSample.id,
  post_status: 'partially_failed',
  account_id: accountSample.id,
  platform: 'linkedin',
  username: 'aurora-coffee',
  account_name: 'Aurora Coffee Co.',
  error_code: 'token_expired',
  error_message: 'The connection to LinkedIn expired. Reconnect the account in FoPost.',
  attempts: 3,
  max_attempts: 3,
  failed_at: '2026-08-28T15:01:44.000Z',
  permalink: null,
};

export const publishSample = {
  id: postSample.id,
  post_status: 'publishing',
  queued_count: 1,
  deliveries: [
    {
      id: 'b6f4c018-7a2d-4e91-9c33-05e8ad1f7264',
      accountId: accountSample.id,
      status: 'queued',
      errorCode: null,
      errorMessage: null,
      platformPostId: null,
      externalUrl: null,
      postedAt: null,
      attempts: 0,
    },
  ],
};

export const uploadedMediaSample = {
  id: 'd91c7e52-38ab-4f07-9e64-c1b230a5f8d9',
  type: 'image',
  name: 'autumn-roast.jpg',
  url: 'https://cdn.yourbrand.com/media/autumn-roast.jpg',
  size: 248113,
};
