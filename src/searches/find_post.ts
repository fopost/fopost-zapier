import type { Search, SearchPerform } from 'zapier-platform-core';

import { get } from '../lib/api.js';
import { workspaceField } from '../lib/fields.js';
import { formatPost, type PostOutput } from '../lib/format.js';
import { postOutputFields } from '../lib/outputs.js';
import { postSample } from '../lib/samples.js';
import type { Post } from '../lib/types.js';

const perform: SearchPerform<Record<string, unknown>, PostOutput> = async (z, bundle) => {
  const postId = bundle.inputData.post_id as string | undefined;

  // An exact id beats any text search, so take that path when one is given.
  if (postId) {
    const single = await get<Post>(z, `/posts/${postId}`);
    return single ? [formatPost(single)] : [];
  }

  const posts = await get<Post[]>(z, '/posts', {
    workspace_id: bundle.inputData.workspace_id as string | undefined,
    status: bundle.inputData.status as string | undefined,
    search: bundle.inputData.search as string | undefined,
    label: bundle.inputData.label_id as string | undefined,
    per_page: 25,
  });

  return (posts ?? []).map(formatPost);
};

export const findPost: Search = {
  key: 'find_post',
  noun: 'Post',
  display: {
    label: 'Find Post',
    description: 'Finds a post by ID, or the newest post matching a text search.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'post_id',
        label: 'Post ID',
        type: 'string',
        required: false,
        helpText: 'Look up one exact post. Every other field is ignored when this is set.',
      },
      { ...workspaceField(false), altersDynamicFields: false },
      {
        key: 'search',
        label: 'Search Text',
        type: 'string',
        required: false,
        helpText: 'Full-text match against the post body.',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        required: false,
        choices: {
          draft: 'Draft',
          scheduled: 'Scheduled',
          publishing: 'Publishing',
          published: 'Published',
          partially_failed: 'Partially Failed',
          failed: 'Failed',
          cancelled: 'Cancelled',
        },
      },
      {
        key: 'label_id',
        label: 'Label',
        type: 'string',
        dynamic: 'list_labels.id.name',
        required: false,
      },
    ],
    outputFields: postOutputFields,
    sample: postSample,
  },
};
