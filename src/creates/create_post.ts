import type { Create, CreatePerform, PlainInputField } from 'zapier-platform-core';

import { post as apiPost } from '../lib/api.js';
import { accountsField, labelsField, workspaceField } from '../lib/fields.js';
import { formatPost, type PostOutput } from '../lib/format.js';
import { postOutputFields } from '../lib/outputs.js';
import { postSample } from '../lib/samples.js';
import type { MediaItem, Post } from '../lib/types.js';

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v'];

const mediaFromUrl = (url: string): MediaItem => {
  const path = url.split('?')[0];
  const name = decodeURIComponent(path.split('/').pop() || 'attachment');
  const extension = (name.split('.').pop() || '').toLowerCase();
  const type: MediaItem['type'] =
    extension === 'gif' ? 'gif' : VIDEO_EXTENSIONS.includes(extension) ? 'video' : 'image';
  return { type, name, url };
};

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value) return [value];
  return [];
};

const perform: CreatePerform<Record<string, unknown>, PostOutput> = async (z, bundle) => {
  const input = bundle.inputData;
  const status = (input.status as string) || 'draft';
  const scheduleAt = input.schedule_at as string | undefined;

  if (status === 'scheduled' && !scheduleAt) {
    throw new z.errors.Error(
      'Set a Schedule At time, or change Status to Draft.',
      'schedule_at_required',
      400,
    );
  }

  const media = toList(input.media_urls).map(mediaFromUrl);
  const body: Record<string, unknown> = {
    workspace_id: input.workspace_id,
    accounts: toList(input.accounts),
    content: [{ text: (input.text as string) ?? '', ...(media.length ? { media } : {}) }],
    status,
  };

  if (status === 'scheduled') body.schedule_at = scheduleAt;
  const labels = toList(input.labels);
  if (labels.length) body.labels = labels;
  if (input.title) body.title = input.title;

  const created = await apiPost<Post>(z, '/posts', body);
  return formatPost(created);
};

/**
 * Accounts and labels only make sense once a workspace is chosen, so they are
 * contributed by a function rather than declared up front.
 */
const scopedFields = async (
  _z: unknown,
  bundle: { inputData: Record<string, unknown> },
): Promise<PlainInputField[]> => {
  if (!bundle.inputData?.workspace_id) return [];
  return [accountsField, labelsField];
};

export const createPost: Create = {
  key: 'create_post',
  noun: 'Post',
  display: {
    label: 'Create Post',
    description:
      'Creates a draft or scheduled post in FoPost and assigns it to one or more connected accounts.',
  },
  operation: {
    perform,
    inputFields: [
      workspaceField(true),
      scopedFields,
      {
        key: 'text',
        label: 'Text',
        type: 'text',
        required: true,
        helpText: 'The post body. FoPost adapts it per network when it publishes.',
      },
      {
        key: 'media_urls',
        label: 'Media URLs',
        type: 'string',
        list: true,
        required: false,
        helpText:
          'Publicly reachable image or video URLs, or URLs returned by the Upload Media action.',
      },
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        required: false,
        default: 'draft',
        choices: { draft: 'Draft', scheduled: 'Scheduled' },
        helpText: 'Scheduled posts also need a Schedule At time.',
      },
      {
        key: 'schedule_at',
        label: 'Schedule At',
        type: 'datetime',
        required: false,
        helpText: 'When to publish. Required when Status is Scheduled.',
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: false,
        helpText: 'Article title or email subject on the networks that take one.',
      },
    ],
    outputFields: postOutputFields,
    sample: postSample,
  },
};
