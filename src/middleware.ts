import type { AfterResponseMiddleware, BeforeRequestMiddleware } from 'zapier-platform-core';

import { baseUrl } from './lib/api.js';
import { version } from './version.js';

interface ErrorEnvelope {
  error?: string;
  message?: string;
  upgrade_url?: string;
  retryAfter?: number;
}

/**
 * Uploads fetch the user's file from a third-party URL and PUT it to a signed
 * storage URL through the same `z.request`, so neither the API key nor FoPost
 * error handling may leak onto a host that is not ours.
 */
const isFoPostRequest = (url?: string): boolean => {
  if (!url) return false;
  try {
    return new URL(url).host === new URL(baseUrl()).host;
  } catch {
    return false;
  }
};

const parseEnvelope = (content: string): ErrorEnvelope => {
  try {
    const parsed = JSON.parse(content) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as ErrorEnvelope) : {};
  } catch {
    return {};
  }
};

/**
 * FoPost authenticates with `X-API-Key`, not a bearer token. Zapier scrubs the
 * value from logs because it is declared as a password field on the auth.
 */
export const includeApiKey: BeforeRequestMiddleware = (request, _z, bundle) => {
  if (!isFoPostRequest(request.url)) {
    return request;
  }

  request.headers = {
    Accept: 'application/json',
    'User-Agent': `fopost-zapier/${version}`,
    ...request.headers,
  };

  const apiKey = bundle?.authData?.api_key;
  if (apiKey) {
    request.headers['X-API-Key'] = apiKey;
  }

  return request;
};

/**
 * Maps the FoPost `{ error, message }` envelope onto Zapier's error types so
 * users see the API's own wording instead of a bare status code.
 */
export const handleErrors: AfterResponseMiddleware = (response, z) => {
  if (response.status < 400 || !isFoPostRequest(response.request?.url)) {
    return response;
  }

  const body = parseEnvelope(response.content ?? '');
  const code = body.error;
  const message = body.message || code || `FoPost API returned HTTP ${response.status}`;

  if (response.status === 401) {
    // ExpiredAuthError makes Zapier ask the user to reconnect the account.
    throw new z.errors.ExpiredAuthError(`${message} Reconnect your FoPost account.`);
  }

  if (response.status === 429) {
    const header = Number(response.getHeader('retry-after'));
    const retryAfter = Number.isFinite(header) && header > 0 ? header : (body.retryAfter ?? 60);
    throw new z.errors.ThrottledError(message, Math.min(retryAfter, 60));
  }

  if (response.status === 402) {
    const upgrade = body.upgrade_url ? ` Upgrade your plan at ${body.upgrade_url}` : '';
    throw new z.errors.Error(`${message}${upgrade}`, code || 'payment_required', 402);
  }

  throw new z.errors.Error(message, code || `http_${response.status}`, response.status);
};
