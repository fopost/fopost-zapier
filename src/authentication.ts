import type { Authentication, PerformFunction } from 'zapier-platform-core';

import { get } from './lib/api.js';
import type { Workspace } from './lib/types.js';

interface ConnectionSummary {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  workspace_count: number;
}

/**
 * The cheapest authenticated read there is: it needs only the `workspaces`
 * scope and returns the names we want on the connection label anyway.
 */
const test: PerformFunction = async (z): Promise<ConnectionSummary> => {
  const workspaces = await get<Workspace[]>(z, '/workspaces');

  if (!workspaces || workspaces.length === 0) {
    throw new z.errors.Error(
      'That API key works, but the account has no workspaces yet. Create one in FoPost first.',
      'no_workspaces',
      404,
    );
  }

  const first = workspaces[0];
  return {
    id: first.id,
    name: first.name,
    slug: first.slug,
    timezone: first.timezone,
    workspace_count: workspaces.length,
  };
};

const connectionLabel: PerformFunction = async (z, bundle): Promise<string> => {
  const cached = bundle.inputData as Partial<ConnectionSummary> | undefined;
  const summary = cached?.name ? (cached as ConnectionSummary) : await test(z, bundle);
  return summary.workspace_count > 1
    ? `${summary.name} (+${summary.workspace_count - 1} more)`
    : summary.name;
};

export const authentication: Authentication = {
  type: 'custom',
  test,
  connectionLabel,
  fields: [
    {
      key: 'api_key',
      label: 'FoPost API Key',
      type: 'password',
      required: true,
      helpText:
        'Create an API key in FoPost under Settings → API Keys, and give it the `workspaces`, ' +
        '`accounts`, `posts` and `labels` scopes so every trigger and action works. ' +
        'Full instructions are at https://fopost.com/docs.',
    },
  ],
};
