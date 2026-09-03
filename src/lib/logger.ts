/**
 * Safe, environment-aware diagnostic logger for Ecorp Academy.
 *
 * DEVELOPMENT (import.meta.env.DEV):
 *   Allows detailed diagnostic telemetry for persistence debugging.
 *
 * PRODUCTION (import.meta.env.PROD):
 *   Strictly suppresses learner PII (UIDs, email addresses, XP, lesson counts,
 *   mission counts, prompt content, bookmarks, achievements, tokens).
 *   Outputs only sanitized, high-level operational statuses and sanitized error codes.
 */

const isDev = Boolean(import.meta.env.DEV);

export const logger = {
  isDev,

  debug(tag: string, detail?: any): void {
    if (isDev) {
      if (detail !== undefined) {
        console.log(`[${tag}]`, detail);
      } else {
        console.log(`[${tag}]`);
      }
    }
  },

  info(tag: string, devDetail?: string | object, prodSummary?: string): void {
    if (isDev) {
      const formatted = typeof devDetail === 'object' ? JSON.stringify(devDetail) : (devDetail || '');
      console.log(`[${tag}] ${formatted}`.trim());
    } else if (prodSummary) {
      console.log(`[${tag}] ${prodSummary}`);
    }
  },

  warn(tag: string, devDetail?: any, prodSummary?: string): void {
    if (isDev) {
      console.warn(`[${tag}]`, devDetail);
    } else if (prodSummary) {
      console.warn(`[${tag}] ${prodSummary}`);
    }
  },

  error(tag: string, err?: any, prodContext?: string): void {
    if (isDev) {
      console.error(`[${tag}]`, err);
    } else {
      const code = err?.code || err?.name || 'unknown_error';
      const msg = prodContext ? `${prodContext} (code: ${code})` : `(code: ${code})`;
      console.error(`[${tag}] ${msg}`);
    }
  },
};
