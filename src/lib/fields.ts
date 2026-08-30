import type { PlainInputField } from 'zapier-platform-core';

export const workspaceField = (required: boolean): PlainInputField => ({
  key: 'workspace_id',
  label: 'Workspace',
  type: 'string',
  dynamic: 'list_workspaces.id.name',
  required,
  altersDynamicFields: true,
  helpText: 'The FoPost workspace that owns the accounts and labels below.',
});

export const accountsField: PlainInputField = {
  key: 'accounts',
  label: 'Accounts',
  type: 'string',
  dynamic: 'list_accounts.id.name',
  list: true,
  required: true,
  helpText: 'One or more connected social accounts to post to.',
};

export const labelsField: PlainInputField = {
  key: 'labels',
  label: 'Labels',
  type: 'string',
  dynamic: 'list_labels.id.name',
  list: true,
  required: false,
  helpText: 'Optional labels for reporting and filtering inside FoPost.',
};
