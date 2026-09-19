import { createAppTester } from 'zapier-platform-core';
import nock from 'nock';

import App from '../src/index.js';
import { API, AUTH, headerValue, operationPerform, perform, resetHttp } from './helpers.js';

const appTester = createAppTester(App);
const runAuthTest = () => appTester(perform(App.authentication!.test), AUTH);

describe('error middleware', () => {
  afterEach(resetHttp);

  it('turns a 401 into an ExpiredAuthError so Zapier prompts a reconnect', async () => {
    nock(API)
      .get('/v1/workspaces')
      .reply(401, { error: 'unauthorized', message: 'That API key is not valid.' });

    await expect(runAuthTest()).rejects.toMatchObject({
      name: 'ExpiredAuthError',
      message: expect.stringContaining('That API key is not valid.'),
    });
  });

  it('surfaces the upgrade URL on a 402', async () => {
    nock(API).get('/v1/workspaces').reply(402, {
      error: 'workspace_limit',
      message: 'Your plan allows 1 workspace.',
      upgrade_url: 'https://fopost.com/billing',
    });

    await expect(runAuthTest()).rejects.toThrow(
      /Your plan allows 1 workspace\..*https:\/\/fopost\.com\/billing/,
    );
  });

  it('turns a 429 into a ThrottledError that honours Retry-After', async () => {
    nock(API)
      .get('/v1/workspaces')
      .reply(
        429,
        { error: 'rate_limited', message: 'Too many requests.' },
        { 'Retry-After': '17' },
      );

    // ThrottledError carries its payload as JSON in the message.
    const error = await runAuthTest().catch((err: Error) => err);
    expect(error).toMatchObject({ name: 'ThrottledError' });
    expect(JSON.parse((error as Error).message)).toEqual({
      message: 'Too many requests.',
      delay: 17,
    });
  });

  it('uses the API message for any other failure', async () => {
    nock(API)
      .get('/v1/workspaces')
      .reply(403, { error: 'subscription_required', message: 'Your subscription is inactive.' });

    await expect(runAuthTest()).rejects.toThrow('Your subscription is inactive.');
  });

  it('never sends the API key to a host that is not FoPost', async () => {
    let leakedKey: string | undefined;

    nock('https://files.zapier.com')
      .get('/download/photo.jpg')
      .reply(function () {
        leakedKey = headerValue(this.req.getHeader('x-api-key'));
        return [200, 'binary-bytes', { 'content-type': 'image/jpeg' }];
      });
    nock(API)
      .post('/v1/media/presign')
      .reply(200, {
        data: {
          uploadId: 'up_1',
          uploadUrl: 'https://uploads.example-storage.com/staging/up_1',
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          expiresAt: '2026-09-19T12:00:00.000Z',
        },
      });
    nock('https://uploads.example-storage.com').put('/staging/up_1').reply(200, '');
    nock(API)
      .post('/v1/media/presign/up_1/complete')
      .reply(201, { data: { type: 'image', name: 'photo.jpg', url: `${API}/f/1`, size: 12 } });

    await appTester(operationPerform(App.creates.upload_media.operation), {
      ...AUTH,
      inputData: { file: 'https://files.zapier.com/download/photo.jpg' },
    });

    expect(leakedKey).toBeUndefined();
  });
});
