import { createAppTester } from 'zapier-platform-core';
import nock from 'nock';

import App from '../src/index.js';
import {
  account,
  API,
  AUTH,
  label,
  listMeta,
  operationPerform,
  publishedPost,
  resetHttp,
  workspace,
} from './helpers.js';

const appTester = createAppTester(App);
const run = (key: string, inputData: Record<string, unknown> = {}) =>
  appTester(operationPerform(App.triggers[key].operation), { ...AUTH, inputData });

describe('new_post_published', () => {
  afterEach(resetHttp);

  it('returns published posts keyed by a stable id for deduplication', async () => {
    const second = { ...publishedPost, id: 'aaaaaaaa-0000-4000-8000-000000000002' };
    nock(API)
      .get('/v1/posts')
      .query({ status: 'published', page: '1', per_page: '100' })
      .times(2)
      .reply(200, { data: [publishedPost, second], meta: listMeta });

    const first = (await run('new_post_published')) as Array<{ id: string }>;
    const repeat = (await run('new_post_published')) as Array<{ id: string }>;

    const ids = first.map((item) => item.id);
    expect(ids).toEqual([publishedPost.id, second.id]);
    expect(new Set(ids).size).toBe(ids.length);
    // Zapier dedupes on `id`, so the same poll must yield the same ids.
    expect(repeat.map((item) => item.id)).toEqual(ids);
  });

  it('flattens the post into mappable fields', async () => {
    nock(API)
      .get('/v1/posts')
      .query(true)
      .reply(200, { data: [publishedPost], meta: listMeta });

    const [post] = (await run('new_post_published', { workspace_id: workspace.id })) as Array<
      Record<string, unknown>
    >;

    expect(post).toMatchObject({
      id: publishedPost.id,
      status: 'published',
      text: 'Autumn roast lands tomorrow.',
      platforms: ['linkedin'],
      account_ids: [account.id],
      label_names: ['Product Launch'],
      published_at: '2026-08-28T15:00:12.000Z',
      permalink: publishedPost.accounts[0].external_url,
    });
  });

  it('paginates with the page Zapier asks for', async () => {
    const scope = nock(API)
      .get('/v1/posts')
      .query((q) => q.page === '3')
      .reply(200, { data: [], meta: listMeta });

    await appTester(operationPerform(App.triggers.new_post_published.operation), {
      ...AUTH,
      inputData: {},
      meta: { page: 2 },
    });

    expect(scope.isDone()).toBe(true);
  });
});

describe('post_failed', () => {
  afterEach(resetHttp);

  it('emits one event per failed account with a composite id', async () => {
    const failedPost = {
      ...publishedPost,
      status: 'partially_failed',
      accounts: [
        { ...publishedPost.accounts[0], publish_status: 'published' },
        {
          id: 'ee000000-0000-4000-8000-000000000009',
          platform: 'bluesky',
          username: 'aurora',
          name: 'Aurora Coffee Co.',
          publish_status: 'failed',
          error_code: 'token_expired',
          error_message: 'The connection expired.',
          attempts: 3,
          max_attempts: 3,
        },
      ],
    };

    nock(API)
      .get('/v1/posts')
      .query((q) => q.status === 'failed')
      .reply(200, { data: [], meta: listMeta });
    nock(API)
      .get('/v1/posts')
      .query((q) => q.status === 'partially_failed')
      .reply(200, { data: [failedPost], meta: listMeta });

    const results = (await run('post_failed')) as Array<Record<string, unknown>>;

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: `${failedPost.id}:ee000000-0000-4000-8000-000000000009`,
      post_id: failedPost.id,
      platform: 'bluesky',
      error_code: 'token_expired',
    });
  });
});

describe('new_account_connected', () => {
  afterEach(resetHttp);

  it('lists the accounts in a workspace', async () => {
    nock(API)
      .get('/v1/accounts')
      .query({ workspaceId: workspace.id })
      .reply(200, { data: [account] });

    const results = (await run('new_account_connected', { workspace_id: workspace.id })) as Array<{
      id: string;
    }>;

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(account.id);
  });
});

describe('dynamic dropdown triggers', () => {
  afterEach(resetHttp);

  it('list_workspaces returns id and name pairs', async () => {
    nock(API)
      .get('/v1/workspaces')
      .reply(200, { data: [workspace] });

    const results = (await run('list_workspaces')) as Array<{ id: string; name: string }>;

    expect(results).toEqual([expect.objectContaining({ id: workspace.id, name: workspace.name })]);
  });

  it('list_accounts narrows to the chosen workspace and labels each option', async () => {
    const scope = nock(API)
      .get('/v1/accounts')
      .query({ workspaceId: workspace.id })
      .reply(200, { data: [account, { ...account, id: 'inactive', active: false }] });

    const results = (await run('list_accounts', { workspace_id: workspace.id })) as Array<{
      id: string;
      name: string;
    }>;

    expect(scope.isDone()).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: account.id,
      name: 'Aurora Coffee Co. — linkedin (@aurora-coffee)',
    });
  });

  it('list_labels returns id and name pairs for the chosen workspace', async () => {
    nock(API)
      .get('/v1/labels')
      .query({ workspace_id: workspace.id })
      .reply(200, { data: [label] });

    const results = (await run('list_labels', { workspace_id: workspace.id })) as Array<{
      id: string;
      name: string;
    }>;

    expect(results).toEqual([expect.objectContaining({ id: label.id, name: label.name })]);
  });
});

describe('list_posts', () => {
  afterEach(resetHttp);

  it('offers the draft and scheduled posts when no status is given', async () => {
    const draft = { ...publishedPost, id: 'dr', status: 'draft' };
    nock(API)
      .get('/v1/posts')
      .query((q) => q.status === 'draft')
      .reply(200, { data: [draft], meta: listMeta });
    nock(API)
      .get('/v1/posts')
      .query((q) => q.status === 'scheduled')
      .reply(200, { data: [], meta: listMeta });

    const results = (await run('list_posts')) as Array<{ id: string; name: string }>;

    expect(results).toEqual([
      expect.objectContaining({ id: 'dr', name: 'Autumn roast lands tomorrow. (draft)' }),
    ]);
  });

  it('honours a status passed down from the action', async () => {
    const scope = nock(API)
      .get('/v1/posts')
      .query((q) => q.status === 'published')
      .reply(200, { data: [publishedPost], meta: listMeta });

    await run('list_posts', { status: 'published' });

    expect(scope.isDone()).toBe(true);
  });
});
