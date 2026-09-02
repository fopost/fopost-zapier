/**
 * The version Zapier records for an uploaded build. A new integration has to
 * bootstrap at 0.0.x before Zapier accepts anything higher.
 *
 * Kept equal to package.json — definition.test.ts fails if the two drift.
 */
export const version = '0.0.0';
