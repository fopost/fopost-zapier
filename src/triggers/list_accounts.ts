import type { PollingTriggerPerform, Trigger } from 'zapier-platform-core';

import { get } from '../lib/api.js';
import { accountLabel } from '../lib/format.js';
import { accountSample } from '../lib/samples.js';
import type { AccountSummary } from '../lib/types.js';

interface AccountOption extends Record<string, unknown> {
  id: string;
  name: string;
}

const perform: PollingTriggerPerform<Record<string, unknown>, AccountOption> = async (
  z,
  bundle,
) => {
  const accounts = await get<AccountSummary[]>(z, '/accounts', {
    workspaceId: bundle.inputData.workspace_id as string | undefined,
  });

  return (accounts ?? [])
    .filter((account) => account.active !== false)
    .map((account) => ({
      ...account,
      id: account.id,
      account_name: account.name,
      name: accountLabel(account),
    }));
};

/** Hidden: fills the Accounts dropdown, narrowed to the chosen workspace. */
export const listAccounts: Trigger = {
  key: 'list_accounts',
  noun: 'Account',
  display: {
    label: 'List Connected Accounts',
    description: 'Lists the social accounts connected to a workspace.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    inputFields: [{ key: 'workspace_id', label: 'Workspace', required: false }],
    sample: { ...accountSample, name: 'Aurora Coffee Co. — linkedin (@aurora-coffee)' },
  },
};
