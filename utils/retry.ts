/**
 * 🔄 RETRY LOGIC WITH EXPONENTIAL BACKOFF
 * 
 * Implements retry logic for external API calls with:
 * - Exponential backoff
 * - Jitter to prevent thundering herd
 * - Configurable retryable errors
 * - Timeout support
 */

import logger from '../logger.js';
import { getErrorMessage } from './errorTypes.js';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryableErrors?: number[];
  retryableErrorMessages?: string[];
  onRetry?: (attempt: number, error: any, delay: number) => void;
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter: ±30% randomization to prevent thundering herd
  const jitter = cappedDelay * 0.3 * (Math.random() * 2 - 1);
  
  return Math.floor(cappedDelay + jitter);
}

/**
 * Check if error is retryable
 */
function isRetryableError(
  error: any,
  retryableErrors: number[],
  retryableErrorMessages: string[]
): boolean {
  // Check HTTP status codes
  if (error?.status && retryableErrors.includes(error.status)) {
    return true;
  }
  
  if (error?.response?.status && retryableErrors.includes(error.response.status)) {
    return true;
  }
  
  // Check error messages
  if (error?.message) {
    const errorMessage = getErrorMessage(error).toLowerCase();
    return retryableErrorMessages.some(msg => errorMessage.includes(msg.toLowerCase()));
  }
  
  // Check error codes
  if (error?.code) {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
    return retryableCodes.includes(error.code);
  }
  
  return false;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after all retries exhausted
 * 
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => api.generateContent(prompt),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryableErrors = [429, 500, 502, 503, 504, 408],
    retryableErrorMessages = ['timeout', 'network error', 'ECONNRESET', 'ETIMEDOUT'],
    onRetry
  } = options;

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Try to execute the function
      const result = await fn();
      
      // Log success if this was a retry
      if (attempt > 0) {
        logger.info(`[Retry] Success on attempt ${attempt + 1}/${maxRetries + 1}`);
      }
      
      return result;
    } catch (error: unknown) {
      lastError = error;
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
        const statusCode = (error as { status?: number; response?: { status?: number } }).status || 
                          (error as { response?: { status?: number } }).response?.status;
        logger.error(`[Retry] Failed after ${attempt + 1} attempts`, {
          error: errorMessage,
          status: statusCode
        });
        throw error;
      }
      
      // Check if error is retryable
      if (!isRetryableError(error, retryableErrors, retryableErrorMessages)) {
        const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
        const statusCode = (error as { status?: number; response?: { status?: number } }).status || 
                          (error as { response?: { status?: number } }).response?.status;
        logger.warn(`[Retry] Non-retryable error on attempt ${attempt + 1}`, {
          error: errorMessage,
          status: statusCode
        });
        throw error;
      }
      
      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, baseDelay, maxDelay);
      
      // Log retry attempt
      const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error';
      const statusCode = (error as { status?: number; response?: { status?: number } }).status || 
                        (error as { response?: { status?: number } }).response?.status;
      logger.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed`, {
        error: errorMessage,
        status: statusCode,
        retryingIn: `${delay}ms`,
        nextAttempt: attempt + 2
      });
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error, delay);
      }
      
      // Wait before next retry
      await sleep(delay);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Wrap a promise with a timeout
 * 
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Error message if timeout occurs
 * @returns Promise that rejects with timeout error if time exceeded
 * 
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   api.slowOperation(),
 *   30000,
 *   'Operation timed out after 30s'
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
    }, timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
}

/**
 * Retry with timeout
 * Combines retry logic with timeout functionality
 * 
 * @param fn - Async function to retry
 * @param timeoutMs - Timeout in milliseconds
 * @param retryOptions - Retry configuration options
 * @returns Promise that resolves with the function result
 * 
 * @example
 * ```typescript
 * const result = await retryWithTimeout(
 *   () => api.generateImage(prompt),
 *   60000,
 *   { maxRetries: 2, baseDelay: 2000 }
 * );
 * ```
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(
    () => withTimeout(fn(), timeoutMs, `Operation timed out after ${timeoutMs}ms`),
    retryOptions
  );
}
