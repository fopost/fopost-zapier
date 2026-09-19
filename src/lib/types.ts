/**
 * The subset of FoPost API response shapes this integration reads.
 * Field names match the API exactly: post/label/workspace payloads are
 * snake_case, account and delivery payloads are camelCase.
 */

export type PostStatus =
  'draft' | 'scheduled' | 'publishing' | 'published' | 'partially_failed' | 'failed' | 'cancelled';

export type DeliveryStatus =
  'pending' | 'queued' | 'delayed' | 'publishing' | 'published' | 'failed' | 'cancelled';

export interface MediaItem {
  type: 'image' | 'video' | 'gif';
  name: string;
  url: string;
  size?: number;
  alt?: string;
  thumbnail?: string;
}

export interface PostContentBlock {
  id?: number;
  text?: string | null;
  media?: MediaItem[];
  position?: number;
}

export interface PostAccountResult {
  id: string;
  platform: string;
  username: string;
  name: string;
  avatar?: string | null;
  publish_status?: DeliveryStatus;
  posted_at?: string | null;
  platform_post_id?: string | null;
  external_url?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  attempts?: number;
  max_attempts?: number;
}

export interface PostLabelRef {
  id: string;
  name: string;
  color?: string;
}

export interface Post {
  id: string;
  workspace_id: string;
  status: PostStatus;
  content_type: 'post' | 'thread' | 'reel';
  schedule_at?: string | null;
  title?: string | null;
  summary?: string | null;
  content: PostContentBlock[];
  accounts: PostAccountResult[];
  labels: PostLabelRef[];
  created_at?: string;
  updated_at?: string;
}

export interface PageMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
}

export interface WorkspaceAccountRef {
  id: string;
  workspaceId: string;
  platform: string;
  username: string;
  name: string;
  avatar?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: string;
  timezone: string;
  language: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  accounts?: WorkspaceAccountRef[];
}

export interface AccountSummary {
  id: string;
  workspaceId: string;
  platform: string;
  username: string;
  name: string;
  avatar?: string | null;
  isPrimary?: boolean;
  active?: boolean;
  healthStatus?: 'healthy' | 'degraded' | 'expired' | 'revoked' | 'unknown' | null;
  lastHealthCheck?: string | null;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  workspace?: { id: string; name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface PublishDelivery {
  id: string;
  accountId: string;
  status: DeliveryStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  platformPostId?: string | null;
  externalUrl?: string | null;
  postedAt?: string | null;
  attempts?: number;
}

export interface PublishResult {
  post_status: PostStatus;
  deliveries: PublishDelivery[];
  healthWarnings?: unknown[];
}

export interface UploadedMedia {
  id?: string;
  type: 'image' | 'video' | 'gif' | 'document';
  name: string;
  url: string;
  size: number;
}

export interface PresignedUpload {
  uploadId: string;
  uploadUrl: string;
  method: 'PUT';
  headers: Record<string, string>;
  expiresAt: string;
}
