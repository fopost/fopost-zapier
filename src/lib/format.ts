import type { AccountSummary, Post, PostAccountResult } from './types.js';

export interface PostOutput {
  id: string;
  workspace_id: string;
  status: string;
  content_type: string;
  title: string | null;
  summary: string | null;
  text: string;
  schedule_at: string | null;
  published_at: string | null;
  permalink: string | null;
  permalinks: string[];
  media_urls: string[];
  account_ids: string[];
  platforms: string[];
  label_names: string[];
  accounts: PostAccountResult[];
  labels: Post['labels'];
  created_at: string | null;
  updated_at: string | null;
}

/** Flattens a post into the mappable shape a Zap step consumes. */
export const formatPost = (post: Post): PostOutput => {
  const blocks = post.content ?? [];
  const accounts = post.accounts ?? [];
  const delivered = accounts.filter((a) => a.publish_status === 'published' && a.posted_at);

  return {
    id: post.id,
    workspace_id: post.workspace_id,
    status: post.status,
    content_type: post.content_type,
    title: post.title ?? null,
    summary: post.summary ?? null,
    text: blocks
      .map((b) => b.text ?? '')
      .filter(Boolean)
      .join('\n\n'),
    schedule_at: post.schedule_at ?? null,
    published_at: delivered.map((a) => a.posted_at as string).sort()[0] ?? null,
    permalink: accounts.find((a) => a.external_url)?.external_url ?? null,
    permalinks: accounts.map((a) => a.external_url).filter((u): u is string => Boolean(u)),
    media_urls: blocks.flatMap((b) => (b.media ?? []).map((m) => m.url)),
    account_ids: accounts.map((a) => a.id),
    platforms: [...new Set(accounts.map((a) => a.platform))],
    label_names: (post.labels ?? []).map((l) => l.name),
    accounts,
    labels: post.labels ?? [],
    created_at: post.created_at ?? null,
    updated_at: post.updated_at ?? null,
  };
};

export interface FailedDeliveryOutput {
  id: string;
  post_id: string;
  post_title: string | null;
  text: string;
  workspace_id: string;
  post_status: string;
  account_id: string;
  platform: string;
  username: string;
  account_name: string;
  error_code: string | null;
  error_message: string | null;
  attempts: number;
  max_attempts: number;
  failed_at: string | null;
  permalink: string | null;
}

/**
 * One Zap trigger event per failed account, not per post: a post that fails on
 * two of four networks should fire twice, and each event should name its network.
 */
export const failedDeliveries = (post: Post): FailedDeliveryOutput[] => {
  const text = (post.content ?? [])
    .map((b) => b.text ?? '')
    .filter(Boolean)
    .join('\n\n');

  return (post.accounts ?? [])
    .filter((account) => account.publish_status === 'failed')
    .map((account) => ({
      // Composite id so a retry that fails again on the same account does not re-fire.
      id: `${post.id}:${account.id}`,
      post_id: post.id,
      post_title: post.title ?? null,
      text,
      workspace_id: post.workspace_id,
      post_status: post.status,
      account_id: account.id,
      platform: account.platform,
      username: account.username,
      account_name: account.name,
      error_code: account.error_code ?? null,
      error_message: account.error_message ?? null,
      attempts: account.attempts ?? 0,
      max_attempts: account.max_attempts ?? 0,
      failed_at: post.updated_at ?? null,
      permalink: account.external_url ?? null,
    }));
};

/** Human label for an account row in a dynamic dropdown. */
export const accountLabel = (account: AccountSummary): string => {
  const handle = account.username ? `@${account.username}` : account.id;
  return `${account.name || handle} — ${account.platform} (${handle})`;
};
