import schemaTools from 'zapier-platform-core/src/tools/schema';

import App from '../src/index.js';

/**
 * The same structural check `zapier validate` runs, kept in CI so a malformed
 * trigger or a missing sample fails a pull request instead of a push.
 */
describe('app definition', () => {
  it('passes the Zapier platform schema', () => {
    const results = schemaTools.validateApp(schemaTools.prepareApp(App));
    expect(results).toEqual([]);
  });

  it('gives every user-visible action a sample and output fields', () => {
    const operations = [
      ...Object.values(App.triggers),
      ...Object.values(App.creates),
      ...Object.values(App.searches),
    ].filter((action) => !action.display.hidden);

    for (const action of operations) {
      expect(action.operation.sample).toBeDefined();
      expect(action.operation.outputFields?.length).toBeGreaterThan(0);
    }
  });
});

describe('version', () => {
  it('matches package.json, which is the version Zapier records', () => {
    // A mismatch is invisible until Zapier rejects the upload, because the
    // app definition takes its version from src/version.ts, not package.json.
    const pkg = require('../package.json') as { version: string };
    expect(App.version).toBe(pkg.version);
  });
});
