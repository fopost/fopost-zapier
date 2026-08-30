import { createAppTester } from 'zapier-platform-core';
import nock from 'nock';

import App from '../src/index.js';
import {
  API,
  AUTH,
  headerValue,
  perform,
  resetHttp,
  secondWorkspace,
  workspace,
} from './helpers.js';

const appTester = createAppTester(App);

describe('authentication', () => {
  afterEach(resetHttp);

  it('sends the API key as an X-API-Key header', async () => {
    let sentKey: string | undefined;
    let sentAuthorization: string | undefined;

    nock(API)
      .get('/v1/workspaces')
      .reply(function () {
        sentKey = headerValue(this.req.getHeader('x-api-key'));
        sentAuthorization = headerValue(this.req.getHeader('authorization'));
        return [200, { data: [workspace] }];
      });

    const result = await appTester(perform(App.authentication!.test), AUTH);

    expect(sentKey).toBe('fp_test_key_123');
    expect(sentAuthorization).toBeUndefined();
    expect(result).toMatchObject({ id: workspace.id, name: workspace.name, workspace_count: 1 });
  });

  it('resolves a connection label from the workspace name', async () => {
    nock(API)
      .get('/v1/workspaces')
      .reply(200, { data: [workspace] });

    const label = await appTester(perform(App.authentication!.connectionLabel), AUTH);

    expect(label).toBe('Aurora Coffee Co.');
  });

  it('counts the extra workspaces in the connection label', async () => {
    nock(API)
      .get('/v1/workspaces')
      .reply(200, { data: [workspace, secondWorkspace] });

    const label = await appTester(perform(App.authentication!.connectionLabel), AUTH);

    expect(label).toBe('Aurora Coffee Co. (+1 more)');
  });

  it('rejects an API key whose account has no workspaces', async () => {
    nock(API).get('/v1/workspaces').reply(200, { data: [] });

    await expect(appTester(perform(App.authentication!.test), AUTH)).rejects.toThrow(
      /no workspaces/i,
    );
  });
});
