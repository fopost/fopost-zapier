import type { Search, SearchPerform } from 'zapier-platform-core';

import { get } from '../lib/api.js';
import { workspaceField } from '../lib/fields.js';
import { accountOutputFields } from '../lib/outputs.js';
import { accountSample } from '../lib/samples.js';
import type { AccountSummary } from '../lib/types.js';

const normalise = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .replace(/^@/, '')
    .toLowerCase();

const perform: SearchPerform<Record<string, unknown>, AccountSummary> = async (z, bundle) => {
  const accounts = await get<AccountSummary[]>(z, '/accounts', {
    workspaceId: bundle.inputData.workspace_id as string | undefined,
  });

  const username = normalise(bundle.inputData.username);
  const platform = normalise(bundle.inputData.platform);

  // The accounts endpoint has no server-side filter beyond workspace.
  return (accounts ?? []).filter((account) => {
    if (platform && normalise(account.platform) !== platform) return false;
    if (!username) return true;
    return normalise(account.username) === username || normalise(account.name) === username;
  });
};

export const findAccount: Search = {
  key: 'find_account',
  noun: 'Account',
  display: {
    label: 'Find Account',
    description: 'Finds a connected social account by username, platform or workspace.',
  },
  operation: {
    perform,
    inputFields: [
      { ...workspaceField(false), altersDynamicFields: false },
      {
        key: 'username',
        label: 'Username',
        type: 'string',
        required: false,
        helpText: 'The handle on the network, with or without the leading @.',
      },
      {
        key: 'platform',
        label: 'Platform',
        type: 'string',
        required: false,
        helpText: 'Restrict to one network, e.g. `linkedin` or `bluesky`.',
      },
    ],
    outputFields: accountOutputFields,
    sample: accountSample,
  },
};
