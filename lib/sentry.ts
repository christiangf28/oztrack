import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
export const SENTRY_CONFIGURED = !!dsn && dsn !== 'REPLACE_ME';

export function initSentry() {
  if (!SENTRY_CONFIGURED) return;
  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 0.2,
  });
}

export { Sentry };
