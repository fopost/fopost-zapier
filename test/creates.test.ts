import { createAppTester } from 'zapier-platform-core';
import nock from 'nock';

import App from '../src/index.js';
import {
  account,
  API,
  AUTH,
  label,
  operationPerform,
  publishedPost,
  resetHttp,
  workspace,
} from './helpers.js';

const appTester = createAppTester(App);
const run = (key: string, inputData: Record<string, unknown>) =>
  appTester(operationPerform(App.creates[key].operation), { ...AUTH, inputData });

describe('create_post', () => {
  afterEach(resetHttp);

  it('posts the FoPost create-post body shape', async () => {
    let sent: Record<string, unknown> | undefined;

    nock(API)
      .post('/v1/posts', (body) => {
        sent = body;
        return true;
      })
      .reply(201, { data: publishedPost });

    await run('create_post', {
      workspace_id: workspace.id,
      accounts: [account.id],
      text: 'Autumn roast lands tomorrow.',
      media_urls: [
        'https://cdn.yourbrand.com/media/roast.jpg',
        'https://cdn.yourbrand.com/clip.mp4',
      ],
      status: 'scheduled',
      schedule_at: '2026-09-01T15:00:00.000Z',
      labels: [label.id],
      title: 'Autumn roast',
    });

    expect(sent).toEqual({
      workspace_id: workspace.id,
      accounts: [account.id],
      content: [
        {
          text: 'Autumn roast lands tomorrow.',
          media: [
            { type: 'image', name: 'roast.jpg', url: 'https://cdn.yourbrand.com/media/roast.jpg' },
            { type: 'video', name: 'clip.mp4', url: 'https://cdn.yourbrand.com/clip.mp4' },
          ],
        },
      ],
      status: 'scheduled',
      schedule_at: '2026-09-01T15:00:00.000Z',
      labels: [label.id],
      title: 'Autumn roast',
    });
  });

  it('omits schedule_at and media from a plain draft', async () => {
    let sent: Record<string, unknown> | undefined;

    nock(API)
      .post('/v1/posts', (body) => {
        sent = body;
        return true;
      })
      .reply(201, { data: publishedPost });

    await run('create_post', {
      workspace_id: workspace.id,
      accounts: [account.id],
      text: 'Draft only.',
    });

    expect(sent).toEqual({
      workspace_id: workspace.id,
      accounts: [account.id],
      content: [{ text: 'Draft only.' }],
      status: 'draft',
    });
  });

  it('refuses a scheduled post with no schedule time', async () => {
    await expect(
      run('create_post', {
        workspace_id: workspace.id,
        accounts: [account.id],
        text: 'When?',
        status: 'scheduled',
      }),
    ).rejects.toThrow(/Schedule At/);
  });

  it('returns the flattened post', async () => {
    nock(API).post('/v1/posts').reply(201, { data: publishedPost });

    const created = (await run('create_post', {
      workspace_id: workspace.id,
      accounts: [account.id],
      text: 'Autumn roast lands tomorrow.',
    })) as Record<string, unknown>;

    expect(created).toMatchObject({
      id: publishedPost.id,
      status: 'published',
      platforms: ['linkedin'],
    });
  });
});

describe('publish_post', () => {
  afterEach(resetHttp);

  it('queues delivery and reports the queued count', async () => {
    let sent: Record<string, unknown> | undefined;

    nock(API)
      .post(`/v1/posts/${publishedPost.id}/publish`, (body) => {
        sent = body;
        return true;
      })
      .reply(202, {
        data: {
          post_status: 'publishing',
          deliveries: [
            { id: 'd1', accountId: account.id, status: 'queued' },
            { id: 'd2', accountId: 'other', status: 'failed' },
          ],
        },
      });

    const result = (await appTester(operationPerform(App.creates.publish_post.operation), {
      ...AUTH,
      inputData: { post_id: publishedPost.id, account_ids: [account.id] },
    })) as Record<string, unknown>;

    expect(sent).toEqual({ accountIds: [account.id] });
    expect(result).toMatchObject({
      id: publishedPost.id,
      post_status: 'publishing',
      queued_count: 1,
    });
  });
});

describe('add_label', () => {
  afterEach(resetHttp);

  it('creates a label with a hex colour', async () => {
    let sent: Record<string, unknown> | undefined;

    nock(API)
      .post('/v1/labels', (body) => {
        sent = body;
        return true;
      })
      .reply(201, { data: label });

    const created = (await run('add_label', {
      workspace_id: workspace.id,
      name: 'Product Launch',
      color: '#0ea5e9',
    })) as Record<string, unknown>;

    expect(sent).toEqual({ workspace_id: workspace.id, name: 'Product Launch', color: '#0ea5e9' });
    expect(created).toMatchObject({ id: label.id, name: 'Product Launch' });
  });

  it('rejects a colour that is not six-digit hex', async () => {
    await expect(
      run('add_label', { workspace_id: workspace.id, name: 'Bad', color: 'blue' }),
    ).rejects.toThrow(/hex color/);
  });
});

describe('upload_media', () => {
  afterEach(resetHttp);

  it('uploads the fetched file as multipart and returns the stored media', async () => {
    let contentType: string | undefined;

    nock('https://files.zapier.com')
      .get('/download/roast.jpg')
      .reply(200, 'binary-bytes', { 'content-type': 'image/jpeg' });

    nock(API)
      .post('/v1/media/upload', (body) => typeof body === 'string' && body.includes('roast.jpg'))
      .reply(function () {
        contentType = ([] as string[]).concat(this.req.getHeader('content-type') as never)[0];
        return [
          201,
          {
            data: [{ id: 'm1', type: 'image', name: 'roast.jpg', url: `${API}/f/m1`, size: 13 }],
          },
        ];
      });

    const uploaded = (await run('upload_media', {
      file: 'https://files.zapier.com/download/roast.jpg',
      workspace_id: workspace.id,
    })) as Record<string, unknown>;

    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
    expect(uploaded).toMatchObject({ id: 'm1', name: 'roast.jpg' });
  });
});
