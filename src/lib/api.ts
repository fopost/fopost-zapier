import type { ZObject } from 'zapier-platform-core';

/** Default FoPost API root. Override with FOPOST_BASE_URL for staging. */
export const DEFAULT_BASE_URL = 'https://api.fopost.com/v1';

export const baseUrl = (): string =>
  (process.env.FOPOST_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

export const apiUrl = (path: string): string => `${baseUrl()}${path}`;

/**
 * The API answers most reads and writes as `{ "data": ... }`, but a few
 * creates return the resource at the top level. Unwrap either shape.
 */
export const unwrap = <T>(body: unknown): T => {
  if (body && typeof body === 'object' && 'data' in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
};

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

const clean = (params: QueryParams): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') out[key] = String(value);
  }
  return out;
};

/** GET a FoPost endpoint and return the unwrapped payload. */
export const get = async <T>(z: ZObject, path: string, params: QueryParams = {}): Promise<T> => {
  const response = await z.request({ url: apiUrl(path), method: 'GET', params: clean(params) });
  return unwrap<T>(response.data);
};

/** POST a JSON body to a FoPost endpoint and return the unwrapped payload. */
export const post = async <T>(
  z: ZObject,
  path: string,
  body?: Record<string, unknown>,
): Promise<T> => {
  const response = await z.request({ url: apiUrl(path), method: 'POST', body });
  return unwrap<T>(response.data);
};

/** Zapier pages are 0-based; the FoPost API is 1-based. */
export const pageNumber = (metaPage?: number): number => (metaPage ?? 0) + 1;
