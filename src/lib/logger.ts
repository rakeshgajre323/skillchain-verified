import * as Sentry from "@sentry/react";

const isProd = import.meta.env.PROD;

// Paste your Sentry DSN here (DSNs are public-safe browser values).
// Leave empty to disable Sentry while keeping logger API stable.
const SENTRY_DSN = "";

export function initMonitoring() {
  if (!SENTRY_DSN || !isProd) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

export const logger = {
  error(message: string, context?: Record<string, unknown>) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.error(message, context);
    }
    if (SENTRY_DSN) {
      Sentry.captureException(new Error(message), { extra: context });
    }
  },
  warn(message: string, context?: Record<string, unknown>) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.warn(message, context);
    }
    if (SENTRY_DSN) {
      Sentry.captureMessage(message, { level: "warning", extra: context });
    }
  },
  info(message: string, context?: Record<string, unknown>) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.info(message, context);
    }
  },
  event(name: string, data?: Record<string, unknown>) {
    if (!isProd) {
      // eslint-disable-next-line no-console
      console.info(`[event] ${name}`, data);
    }
    if (SENTRY_DSN) {
      Sentry.addBreadcrumb({ category: "app", message: name, data, level: "info" });
    }
  },
};
