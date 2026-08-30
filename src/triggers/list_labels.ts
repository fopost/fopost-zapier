import type { PollingTriggerPerform, Trigger } from 'zapier-platform-core';

import { get } from '../lib/api.js';
import { labelSample } from '../lib/samples.js';
import type { Label } from '../lib/types.js';

interface LabelOption extends Record<string, unknown> {
  id: string;
  name: string;
}

const perform: PollingTriggerPerform<Record<string, unknown>, LabelOption> = async (z, bundle) => {
  const labels = await get<Label[]>(z, '/labels', {
    workspace_id: bundle.inputData.workspace_id as string | undefined,
  });
  return (labels ?? []).map((label) => ({ ...label, id: label.id, name: label.name }));
};

/** Hidden: fills the Labels dropdown, narrowed to the chosen workspace. */
export const listLabels: Trigger = {
  key: 'list_labels',
  noun: 'Label',
  display: {
    label: 'List Labels',
    description: 'Lists the labels available in a workspace.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    inputFields: [{ key: 'workspace_id', label: 'Workspace', required: false }],
    sample: labelSample,
  },
};
