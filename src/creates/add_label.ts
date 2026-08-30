import type { Create, CreatePerform } from 'zapier-platform-core';

import { post as apiPost } from '../lib/api.js';
import { workspaceField } from '../lib/fields.js';
import { labelOutputFields } from '../lib/outputs.js';
import { labelSample } from '../lib/samples.js';
import type { Label } from '../lib/types.js';

const DEFAULT_COLOR = '#0ea5e9';
const HEX = /^#[0-9a-fA-F]{6}$/;

const perform: CreatePerform<Record<string, unknown>, Label> = async (z, bundle) => {
  const color = (bundle.inputData.color as string) || DEFAULT_COLOR;

  if (!HEX.test(color)) {
    throw new z.errors.Error(
      `"${color}" is not a six-digit hex color like #0ea5e9.`,
      'invalid_color',
      400,
    );
  }

  return apiPost<Label>(z, '/labels', {
    workspace_id: bundle.inputData.workspace_id,
    name: bundle.inputData.name,
    color,
  });
};

export const addLabel: Create = {
  key: 'add_label',
  noun: 'Label',
  display: {
    label: 'Add Label',
    description: 'Creates a label in a workspace so posts can be grouped and reported on.',
  },
  operation: {
    perform,
    inputFields: [
      workspaceField(true),
      { key: 'name', label: 'Name', type: 'string', required: true },
      {
        key: 'color',
        label: 'Color',
        type: 'string',
        required: false,
        default: DEFAULT_COLOR,
        helpText: 'Six-digit hex color, e.g. `#0ea5e9`.',
      },
    ],
    outputFields: labelOutputFields,
    sample: labelSample,
  },
};
