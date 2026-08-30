import type { PollingTriggerPerform, Trigger } from 'zapier-platform-core';

import { get, pageNumber } from '../lib/api.js';
import { workspaceField } from '../lib/fields.js';
import { failedDeliveries, type FailedDeliveryOutput } from '../lib/format.js';
import { failedDeliveryOutputFields } from '../lib/outputs.js';
import { failedDeliverySample } from '../lib/samples.js';
import type { Post } from '../lib/types.js';

// A post that failed everywhere is `failed`; one that failed on some networks is
// `partially_failed`. Both matter, and the API filters on one status at a time.
const FAILING_STATUSES = ['failed', 'partially_failed'] as const;

const perform: PollingTriggerPerform<Record<string, unknown>, FailedDeliveryOutput> = async (
  z,
  bundle,
) => {
  const page = pageNumber(bundle.meta?.page);
  const workspaceId = bundle.inputData.workspace_id as string | undefined;

  const pages = await Promise.all(
    FAILING_STATUSES.map((status) =>
      get<Post[]>(z, '/posts', {
        status,
        workspace_id: workspaceId,
        page,
        per_page: 100,
      }),
    ),
  );

  const platform = bundle.inputData.platform as string | undefined;
  return pages
    .flatMap((posts) => posts ?? [])
    .flatMap(failedDeliveries)
    .filter((delivery) => !platform || delivery.platform === platform);
};

export const postFailed: Trigger = {
  key: 'post_failed',
  noun: 'Failed Delivery',
  display: {
    label: 'Post Failed to Publish',
    description:
      'Triggers when a post fails to reach one of its connected accounts. Fires once per failed account.',
  },
  operation: {
    type: 'polling',
    canPaginate: true,
    perform,
    inputFields: [
      workspaceField(false),
      {
        key: 'platform',
        label: 'Platform',
        type: 'string',
        required: false,
        helpText: 'Only trigger on failures for this network, e.g. `linkedin`.',
      },
    ],
    outputFields: failedDeliveryOutputFields,
    sample: failedDeliverySample,
  },
};
