const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// @supabase/supabase-js v2.45+ uses dynamic import(OTEL_PKG) in its ESM build
// for optional OpenTelemetry tracing. Hermes doesn't support import() with a
// variable argument, so we force Metro to use the CJS build which uses require()
// instead — the dynamic require silently fails (no @opentelemetry/api installed)
// and is caught by the .catch(() => null) in the Supabase source.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@supabase/supabase-js') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/@supabase/supabase-js/dist/index.cjs'),
      type: 'sourceFile',
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
