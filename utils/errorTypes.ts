/**
 * Utility types and functions for proper error handling in TypeScript
 * Eliminates the need for `any` type in catch blocks
 */

/**
 * Type guard to check if an error is an Error object
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if an error has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Type guard to check if an error has a status/statusCode property
 */
export function hasStatusCode(error: unknown): error is { statusCode: number } | { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('statusCode' in error || 'status' in error)
  );
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  
  if (hasMessage(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

/**
 * Safely extract status code from error
 */
export function getErrorStatusCode(error: unknown): number | undefined {
  if (!hasStatusCode(error)) {
    return undefined;
  }
  
  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode;
  }
  
  if ('status' in error && typeof error.status === 'number') {
    return error.status;
  }
  
  return undefined;
}

/**
 * Converts unknown error to Error object
 */
export function toError(error: unknown): Error {
  if (isError(error)) {
    return error;
  }
  
  const message = getErrorMessage(error);
  return new Error(message);
}

/**
 * Type for axios-like errors with response property
 */
export interface AxiosLikeError extends Error {
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
  code?: string;
  config?: unknown;
}

/**
 * Type guard for axios-like errors
 */
export function isAxiosError(error: unknown): error is AxiosLikeError {
  return (
    isError(error) &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object'
  );
}
