import type { PollingTriggerPerform, Trigger } from 'zapier-platform-core';

import { get } from '../lib/api.js';
import { workspaceSample } from '../lib/samples.js';
import type { Workspace } from '../lib/types.js';

interface WorkspaceOption extends Record<string, unknown> {
  id: string;
  name: string;
}

const perform: PollingTriggerPerform<Record<string, unknown>, WorkspaceOption> = async (z) => {
  const workspaces = await get<Workspace[]>(z, '/workspaces');
  return (workspaces ?? []).map((workspace) => ({
    ...workspace,
    id: workspace.id,
    name: workspace.name,
  }));
};

/** Hidden: exists only to fill the Workspace dropdown on every action. */
export const listWorkspaces: Trigger = {
  key: 'list_workspaces',
  noun: 'Workspace',
  display: {
    label: 'List Workspaces',
    description: 'Lists the workspaces this API key can reach.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    sample: workspaceSample,
  },
};
