import type { PollingTriggerPerform, Trigger } from 'zapier-platform-core';

import { get } from '../lib/api.js';
import { workspaceField } from '../lib/fields.js';
import { accountOutputFields } from '../lib/outputs.js';
import { accountSample } from '../lib/samples.js';
import type { AccountSummary } from '../lib/types.js';

const perform: PollingTriggerPerform<Record<string, unknown>, AccountSummary> = async (
  z,
  bundle,
) => {
  const accounts = await get<AccountSummary[]>(z, '/accounts', {
    workspaceId: bundle.inputData.workspace_id as string | undefined,
  });
  return accounts ?? [];
};

export const newAccountConnected: Trigger = {
  key: 'new_account_connected',
  noun: 'Connected Account',
  display: {
    label: 'New Connected Account',
    description: 'Triggers when a social account is connected to a FoPost workspace.',
  },
  operation: {
    type: 'polling',
    // The accounts endpoint returns the full set in one response; there is nothing to page.
    canPaginate: false,
    perform,
    inputFields: [workspaceField(false)],
    outputFields: accountOutputFields,
    sample: accountSample,
  },
};
