// zapier-platform-core exposes its schema helpers as untyped internals.
declare module 'zapier-platform-core/src/tools/schema' {
  const schemaTools: {
    prepareApp: (app: unknown) => unknown;
    validateApp: (compiledApp: unknown) => unknown[];
  };
  export default schemaTools;
}
