import type { Create, CreatePerform } from 'zapier-platform-core';

import { post as apiPost } from '../lib/api.js';
import { publishOutputFields } from '../lib/outputs.js';
import { publishSample } from '../lib/samples.js';
import type { PublishDelivery, PublishResult } from '../lib/types.js';

interface PublishOutput extends Record<string, unknown> {
  id: string;
  post_status: string;
  queued_count: number;
  deliveries: PublishDelivery[];
}

const perform: CreatePerform<Record<string, unknown>, PublishOutput> = async (z, bundle) => {
  const postId = String(bundle.inputData.post_id);
  const accountIds = bundle.inputData.account_ids;
  const body =
    Array.isArray(accountIds) && accountIds.length ? { accountIds: accountIds.map(String) } : {};

  const result = await apiPost<PublishResult>(z, `/posts/${postId}/publish`, body);
  const deliveries = result?.deliveries ?? [];

  return {
    id: postId,
    post_status: result?.post_status ?? 'publishing',
    queued_count: deliveries.filter((d) => d.status !== 'failed' && d.status !== 'cancelled')
      .length,
    deliveries,
  };
};

export const publishPost: Create = {
  key: 'publish_post',
  noun: 'Published Post',
  display: {
    label: 'Publish Post',
    description:
      'Queues an existing draft or scheduled post for delivery. Delivery is asynchronous — the action returns once the work is queued.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'post_id',
        label: 'Post ID',
        type: 'string',
        required: true,
        helpText: 'The ID returned by Create Post, or found with Find Post.',
      },
      {
        key: 'account_ids',
        label: 'Accounts',
        type: 'string',
        list: true,
        required: false,
        helpText: 'Publish to only these accounts. Leave empty to publish to all of them.',
      },
    ],
    outputFields: publishOutputFields,
    sample: publishSample,
  },
};
