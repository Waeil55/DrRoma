/**
 * MARIAM PRO  Centralized Error Logger
 * Swap console.error for Sentry.captureException etc.
 */

export const logError = (context, err) => {
  console.error(`[MariamPro][${context}]`, err?.message || err);
};
