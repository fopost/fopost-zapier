import type { OutputFields } from 'zapier-platform-core';

export const postOutputFields: OutputFields = [
  { key: 'id', label: 'Post ID' },
  { key: 'workspace_id', label: 'Workspace ID' },
  { key: 'status', label: 'Status' },
  { key: 'content_type', label: 'Content Type' },
  { key: 'title', label: 'Title' },
  { key: 'summary', label: 'Summary' },
  { key: 'text', label: 'Text', type: 'string' },
  { key: 'schedule_at', label: 'Scheduled At', type: 'datetime' },
  { key: 'published_at', label: 'Published At', type: 'datetime' },
  { key: 'permalink', label: 'Permalink' },
  { key: 'permalinks[]', label: 'All Permalinks' },
  { key: 'media_urls[]', label: 'Media URLs' },
  { key: 'account_ids[]', label: 'Account IDs' },
  { key: 'platforms[]', label: 'Platforms' },
  { key: 'label_names[]', label: 'Labels' },
  { key: 'accounts[]id', label: 'Account ID' },
  { key: 'accounts[]platform', label: 'Account Platform' },
  { key: 'accounts[]username', label: 'Account Username' },
  { key: 'accounts[]publish_status', label: 'Account Publish Status' },
  { key: 'accounts[]external_url', label: 'Account Post URL' },
  { key: 'created_at', label: 'Created At', type: 'datetime' },
  { key: 'updated_at', label: 'Updated At', type: 'datetime' },
];

export const failedDeliveryOutputFields: OutputFields = [
  { key: 'id', label: 'Delivery Key' },
  { key: 'post_id', label: 'Post ID' },
  { key: 'post_title', label: 'Post Title' },
  { key: 'text', label: 'Post Text', type: 'string' },
  { key: 'workspace_id', label: 'Workspace ID' },
  { key: 'post_status', label: 'Post Status' },
  { key: 'account_id', label: 'Account ID' },
  { key: 'platform', label: 'Platform' },
  { key: 'username', label: 'Username' },
  { key: 'account_name', label: 'Account Name' },
  { key: 'error_code', label: 'Error Code' },
  { key: 'error_message', label: 'Error Message', type: 'string' },
  { key: 'attempts', label: 'Attempts', type: 'integer' },
  { key: 'max_attempts', label: 'Max Attempts', type: 'integer' },
  { key: 'failed_at', label: 'Failed At', type: 'datetime' },
];

export const accountOutputFields: OutputFields = [
  { key: 'id', label: 'Account ID' },
  { key: 'workspaceId', label: 'Workspace ID' },
  { key: 'platform', label: 'Platform' },
  { key: 'username', label: 'Username' },
  { key: 'name', label: 'Display Name' },
  { key: 'avatar', label: 'Avatar URL' },
  { key: 'isPrimary', label: 'Is Primary', type: 'boolean' },
  { key: 'active', label: 'Active', type: 'boolean' },
  { key: 'healthStatus', label: 'Health Status' },
  { key: 'lastHealthCheck', label: 'Last Health Check', type: 'datetime' },
];

export const labelOutputFields: OutputFields = [
  { key: 'id', label: 'Label ID' },
  { key: 'name', label: 'Name' },
  { key: 'color', label: 'Color' },
  { key: 'workspace__id', label: 'Workspace ID' },
  { key: 'workspace__name', label: 'Workspace Name' },
  { key: 'created_at', label: 'Created At', type: 'datetime' },
];

export const workspaceOutputFields: OutputFields = [
  { key: 'id', label: 'Workspace ID' },
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'type', label: 'Type' },
  { key: 'timezone', label: 'Timezone' },
  { key: 'language', label: 'Language' },
  { key: 'website', label: 'Website' },
  { key: 'created_at', label: 'Created At', type: 'datetime' },
];

export const publishOutputFields: OutputFields = [
  { key: 'id', label: 'Post ID' },
  { key: 'post_status', label: 'Post Status' },
  { key: 'queued_count', label: 'Queued Deliveries', type: 'integer' },
  { key: 'deliveries[]id', label: 'Delivery ID' },
  { key: 'deliveries[]accountId', label: 'Account ID' },
  { key: 'deliveries[]status', label: 'Delivery Status' },
  { key: 'deliveries[]errorMessage', label: 'Delivery Error' },
  { key: 'deliveries[]externalUrl', label: 'Delivery URL' },
];

export const uploadedMediaOutputFields: OutputFields = [
  { key: 'id', label: 'Media ID' },
  { key: 'type', label: 'Type' },
  { key: 'name', label: 'File Name' },
  { key: 'url', label: 'URL' },
  { key: 'size', label: 'Size In Bytes', type: 'integer' },
];
