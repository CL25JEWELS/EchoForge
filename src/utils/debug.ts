/**
 * Debug Utility
 *
 * Provides environment-aware debug logging
 */

// Check if we're in development mode
// Works with both traditional bundlers (process.env) and Vite (import.meta.env)
// Bundlers typically replace process.env.NODE_ENV with the literal value at build time
export const IS_DEBUG_MODE =
  (typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV === 'development') ||
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.MODE === 'development') ||
  false;

/**
 * Debug logger that only logs in development mode
 */
export const debugLog = {
  log: (tag: string, message: string, ...args: unknown[]) => {
    if (IS_DEBUG_MODE) {
      console.log(`[${tag}] ${message}`, ...args);
    }
  },

  error: (tag: string, message: string, ...args: unknown[]) => {
    if (IS_DEBUG_MODE) {
      console.error(`[${tag}] ${message}`, ...args);
    }
  },

  warn: (tag: string, message: string, ...args: unknown[]) => {
    if (IS_DEBUG_MODE) {
      console.warn(`[${tag}] ${message}`, ...args);
    }
  },

  // Always log errors regardless of mode
  alwaysError: (tag: string, message: string, ...args: unknown[]) => {
    console.error(`[${tag}] ${message}`, ...args);
  },

  // Always log warnings regardless of mode
  alwaysWarn: (tag: string, message: string, ...args: unknown[]) => {
    console.warn(`[${tag}] ${message}`, ...args);
  }
};
