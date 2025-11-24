import { describe, it, expect } from 'vitest';
import {
  isError,
  hasMessage,
  hasStatusCode,
  getErrorMessage,
  getErrorStatusCode,
  toError,
  isAxiosError
} from '../../utils/errorTypes.js';

console.log('🧪 Test setup complete');

describe('Error Type Utilities', () => {
  describe('isError', () => {
    it('should return true for Error objects', () => {
      const error = new Error('Test error');
      expect(isError(error)).toBe(true);
    });

    it('should return false for non-Error objects', () => {
      expect(isError('string')).toBe(false);
      expect(isError({ message: 'test' })).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
    });
  });

  describe('hasMessage', () => {
    it('should return true for objects with message property', () => {
      expect(hasMessage({ message: 'test' })).toBe(true);
      expect(hasMessage(new Error('test'))).toBe(true);
    });

    it('should return false for objects without message property', () => {
      expect(hasMessage({})).toBe(false);
      expect(hasMessage({ msg: 'test' })).toBe(false);
      expect(hasMessage('string')).toBe(false);
      expect(hasMessage(null)).toBe(false);
    });
  });

  describe('hasStatusCode', () => {
    it('should return true for objects with statusCode or status', () => {
      expect(hasStatusCode({ statusCode: 404 })).toBe(true);
      expect(hasStatusCode({ status: 500 })).toBe(true);
    });

    it('should return false for objects without status properties', () => {
      expect(hasStatusCode({})).toBe(false);
      expect(hasStatusCode({ code: 404 })).toBe(false);
      expect(hasStatusCode('string')).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error objects', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should extract message from objects with message property', () => {
      expect(getErrorMessage({ message: 'Custom error' })).toBe('Custom error');
    });

    it('should return the string if error is a string', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage({})).toBe('An unknown error occurred');
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
    });
  });

  describe('getErrorStatusCode', () => {
    it('should extract statusCode from error', () => {
      expect(getErrorStatusCode({ statusCode: 404 })).toBe(404);
    });

    it('should extract status from error', () => {
      expect(getErrorStatusCode({ status: 500 })).toBe(500);
    });

    it('should return undefined for errors without status', () => {
      expect(getErrorStatusCode({})).toBeUndefined();
      expect(getErrorStatusCode(new Error('test'))).toBeUndefined();
    });
  });

  describe('toError', () => {
    it('should return Error as-is', () => {
      const error = new Error('Test');
      expect(toError(error)).toBe(error);
    });

    it('should convert string to Error', () => {
      const error = toError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
    });

    it('should convert object with message to Error', () => {
      const error = toError({ message: 'Custom error' });
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Custom error');
    });

    it('should handle unknown error types', () => {
      const error = toError({});
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('An unknown error occurred');
    });
  });

  describe('isAxiosError', () => {
    it('should return true for axios-like errors', () => {
      const error = Object.assign(new Error('Axios error'), {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {}
        }
      });
      expect(isAxiosError(error)).toBe(true);
    });

    it('should return false for non-axios errors', () => {
      expect(isAxiosError(new Error('Regular error'))).toBe(false);
      expect(isAxiosError({ message: 'test' })).toBe(false);
      expect(isAxiosError('string')).toBe(false);
    });
  });
});

console.log('✅ All tests completed');
