import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff, withTimeout, retryWithTimeout } from '../../utils/retry';

describe('Retry Logic Tests', () => {

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const promise = retryWithBackoff(mockFn, { maxRetries: 3 });
      const result = await promise;
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce({ status: 429, message: 'Rate limited' })
        .mockRejectedValueOnce({ status: 500, message: 'Server error' })
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, { 
        maxRetries: 3, 
        baseDelay: 50 // Fast retry for testing
      });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    }, 10000); // 10 second timeout for this test

    it('should not retry on non-retryable error', async () => {
      const mockFn = vi.fn().mockRejectedValue({ status: 400, message: 'Bad request' });
      
      await expect(
        retryWithBackoff(mockFn, { maxRetries: 3 })
      ).rejects.toMatchObject({ status: 400 });
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries exhausted', async () => {
      const mockFn = vi.fn().mockRejectedValue({ status: 503, message: 'Service unavailable' });
      
      await expect(
        retryWithBackoff(mockFn, { 
          maxRetries: 2,
          baseDelay: 50 // Fast retry for testing
        })
      ).rejects.toMatchObject({ status: 503 });
      
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000);

    it('should retry on timeout message', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('Request timeout'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, { maxRetries: 2, baseDelay: 50 });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);
  });

  describe('withTimeout', () => {
    it('should resolve if promise completes in time', async () => {
      const mockFn = () => Promise.resolve('success');
      
      const result = await withTimeout(mockFn(), 5000, 'Timeout');
      expect(result).toBe('success');
    });

    it('should reject if promise exceeds timeout', async () => {
      const slowFn = () => new Promise(resolve => setTimeout(resolve, 500));
      
      await expect(
        withTimeout(slowFn(), 100, 'Operation timed out')
      ).rejects.toThrow('Operation timed out');
    });
  });

  describe('retryWithTimeout', () => {
    it('should combine retry and timeout logic', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce({ status: 500, message: 'Server error' })
        .mockResolvedValue('success');
      
      const result = await retryWithTimeout(mockFn, 5000, { 
        maxRetries: 2,
        baseDelay: 50
      });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    }, 10000);
  });

  describe('Exponential backoff calculation', () => {
    it('should increase delay exponentially', async () => {
      const delays: number[] = [];
      const mockFn = vi.fn()
        .mockRejectedValueOnce({ status: 429 })
        .mockRejectedValueOnce({ status: 429 })
        .mockResolvedValue('success');
      
      const onRetry = (attempt: number, error: any, delay: number) => {
        delays.push(delay);
      };
      
      await retryWithBackoff(mockFn, {
        maxRetries: 2,
        baseDelay: 100,
        onRetry
      });
      
      // Delays should increase exponentially (with jitter, so we check ranges)
      expect(delays.length).toBe(2);
      expect(delays[0]).toBeGreaterThanOrEqual(70); // ~100 ± 30%
      expect(delays[0]).toBeLessThanOrEqual(130);
      expect(delays[1]).toBeGreaterThanOrEqual(140); // ~200 ± 30%
      expect(delays[1]).toBeLessThanOrEqual(260);
    }, 10000);
  });
});
