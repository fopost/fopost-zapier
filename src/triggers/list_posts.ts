import type { PollingTriggerPerform, Trigger } from 'zapier-platform-core';

import { get } from '../lib/api.js';
import { postSample } from '../lib/samples.js';
import type { Post } from '../lib/types.js';

// Only a draft or a scheduled post can be published, so those are the ones worth offering.
const PUBLISHABLE_STATUSES = ['draft', 'scheduled'] as const;

interface PostOption extends Record<string, unknown> {
  id: string;
  name: string;
}

const snippet = (post: Post): string => {
  const text = (post.content ?? [])
    .map((block) => block.text ?? '')
    .filter(Boolean)
    .join(' ');
  const headline = post.title || text || 'Untitled post';
  return headline.length > 60 ? `${headline.slice(0, 57)}…` : headline;
};

const perform: PollingTriggerPerform<Record<string, unknown>, PostOption> = async (z, bundle) => {
  const chosen = bundle.inputData.status as string | undefined;
  const statuses = chosen ? [chosen] : [...PUBLISHABLE_STATUSES];

  const pages = await Promise.all(
    statuses.map((status) =>
      get<Post[]>(z, '/posts', {
        status,
        workspace_id: bundle.inputData.workspace_id as string | undefined,
        per_page: 100,
      }),
    ),
  );

  return pages
    .flatMap((posts) => posts ?? [])
    .map((post) => ({ ...post, id: post.id, name: `${snippet(post)} (${post.status})` }));
};

/** Hidden: fills the Post dropdown on Publish Post. */
export const listPosts: Trigger = {
  key: 'list_posts',
  noun: 'Post',
  display: {
    label: 'List Publishable Posts',
    description:
      'Lists posts for a dropdown: the given status, or the draft and scheduled ones by default.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    inputFields: [
      { key: 'workspace_id', label: 'Workspace', required: false },
      { key: 'status', label: 'Status', required: false },
    ],
    sample: { ...postSample, name: 'Autumn roast lands tomorrow. (draft)' },
  },
};
