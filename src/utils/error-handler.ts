/**
 * Error Handler Utility
 *
 * Centralized error handling to reduce code duplication
 */

/**
 * Wraps an async function with error handling
 * Logs errors to console with a custom message prefix
 */
export async function handleAsyncError<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
}

/**
 * Wraps an async function with error handling and optional finally callback
 * Useful for operations that need cleanup (e.g., setting loading state)
 */
export async function handleAsyncErrorWithFinally<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  finallyFn?: () => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  } finally {
    if (finallyFn) {
      finallyFn();
    }
  }
}
