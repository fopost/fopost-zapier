import type { PollingTriggerPerform, Trigger } from 'zapier-platform-core';

import { get, pageNumber } from '../lib/api.js';
import { workspaceField } from '../lib/fields.js';
import { formatPost, type PostOutput } from '../lib/format.js';
import { postOutputFields } from '../lib/outputs.js';
import { postSample } from '../lib/samples.js';
import type { Post } from '../lib/types.js';

const perform: PollingTriggerPerform<Record<string, unknown>, PostOutput> = async (z, bundle) => {
  const posts = await get<Post[]>(z, '/posts', {
    status: 'published',
    workspace_id: bundle.inputData.workspace_id as string | undefined,
    label: bundle.inputData.label_id as string | undefined,
    page: pageNumber(bundle.meta?.page),
    per_page: 100,
  });
  return (posts ?? []).map(formatPost);
};

export const newPostPublished: Trigger = {
  key: 'new_post_published',
  noun: 'Published Post',
  display: {
    label: 'New Published Post',
    description: 'Triggers when FoPost finishes publishing a post to its accounts.',
  },
  operation: {
    type: 'polling',
    // The posts list is page/per_page paginated, so Zapier can walk back through history.
    canPaginate: true,
    perform,
    inputFields: [
      workspaceField(false),
      {
        key: 'label_id',
        label: 'Label',
        type: 'string',
        dynamic: 'list_labels.id.name',
        required: false,
        helpText: 'Only trigger on posts carrying this label.',
      },
    ],
    outputFields: postOutputFields,
    sample: postSample,
  },
};
