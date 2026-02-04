/**
 * Validation Utility
 *
 * Common validation functions to reduce code duplication
 */

/**
 * Ensures a value is not null or undefined
 * Logs a warning and returns false if the value is null/undefined
 */
export function ensureExists<T>(
  value: T | null | undefined,
  errorMessage: string,
  logPrefix: string = ''
): value is T {
  if (value === null || value === undefined) {
    console.warn(`${logPrefix} ${errorMessage}`);
    return false;
  }
  return true;
}

/**
 * Gets a value or throws an error if it doesn't exist
 * Useful for operations that cannot continue without the value
 */
export function requireValue<T>(
  value: T | null | undefined,
  errorMessage: string
): T {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
  return value;
}
