import { createAppTester } from 'zapier-platform-core';
import nock from 'nock';

import App from '../src/index.js';
import {
  account,
  API,
  AUTH,
  listMeta,
  operationPerform,
  publishedPost,
  resetHttp,
  workspace,
} from './helpers.js';

const appTester = createAppTester(App);
const run = (key: string, inputData: Record<string, unknown>) =>
  appTester(operationPerform(App.searches[key].operation), { ...AUTH, inputData });

describe('find_post', () => {
  afterEach(resetHttp);

  it('fetches one post by id and ignores the other filters', async () => {
    const scope = nock(API)
      .get(`/v1/posts/${publishedPost.id}`)
      .reply(200, { data: publishedPost });

    const results = (await run('find_post', {
      post_id: publishedPost.id,
      search: 'ignored',
    })) as Array<{ id: string }>;

    expect(scope.isDone()).toBe(true);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(publishedPost.id);
  });

  it('searches by text and status', async () => {
    nock(API)
      .get('/v1/posts')
      .query({ workspace_id: workspace.id, status: 'published', search: 'roast', per_page: '25' })
      .reply(200, { data: [publishedPost], meta: listMeta });

    const results = (await run('find_post', {
      workspace_id: workspace.id,
      status: 'published',
      search: 'roast',
    })) as Array<{ id: string; text: string }>;

    expect(results[0]).toMatchObject({
      id: publishedPost.id,
      text: 'Autumn roast lands tomorrow.',
    });
  });
});

describe('find_account', () => {
  afterEach(resetHttp);

  it('matches a username with or without the leading @', async () => {
    nock(API)
      .get('/v1/accounts')
      .query(true)
      .reply(200, { data: [account, { ...account, id: 'other', username: 'somewhere-else' }] });

    const results = (await run('find_account', { username: '@Aurora-Coffee' })) as Array<{
      id: string;
    }>;

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(account.id);
  });

  it('filters by platform', async () => {
    nock(API)
      .get('/v1/accounts')
      .query(true)
      .reply(200, { data: [account, { ...account, id: 'bsky', platform: 'bluesky' }] });

    const results = (await run('find_account', { platform: 'bluesky' })) as Array<{ id: string }>;

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('bsky');
  });
});
