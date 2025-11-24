import { describe, it, expect, vi, beforeEach } from 'vitest';
import { quickValidate } from '../../contentScoring';

// Error message constants for maintainability
const ERROR_MESSAGES = {
  TOO_SHORT: 'Content jest za krótki (min. 10 znaków)',
  TWITTER_LIMIT: 'Twitter limit: 280 znaków',
  INSTAGRAM_LIMIT: 'Instagram limit: 2200 znaków',
  TOO_MANY_EXCLAMATIONS: 'Zbyt wiele wykrzykników (wygląda jak spam)',
  TOO_MUCH_CAPS: 'Zbyt dużo CAPS LOCKA (wygląda jak krzyk)'
};

describe('contentScoring', () => {
  describe('quickValidate', () => {
    it('should validate content length - too short', () => {
      const result = quickValidate('Hi', 'Twitter');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(ERROR_MESSAGES.TOO_SHORT);
    });

    it('should validate content length - valid', () => {
      const result = quickValidate('This is a valid post with enough content', 'Twitter');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate Twitter length limit', () => {
      const longContent = 'a'.repeat(300);
      const result = quickValidate(longContent, 'Twitter');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(ERROR_MESSAGES.TWITTER_LIMIT);
    });

    it('should validate Instagram length limit', () => {
      const longContent = 'a'.repeat(2300);
      const result = quickValidate(longContent, 'Instagram');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(ERROR_MESSAGES.INSTAGRAM_LIMIT);
    });

    it('should detect excessive exclamation marks', () => {
      const spamContent = 'Buy now!!!!!!';
      const result = quickValidate(spamContent, 'Twitter');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(ERROR_MESSAGES.TOO_MANY_EXCLAMATIONS);
    });

    it('should detect excessive caps lock', () => {
      const capsContent = 'THISISALLCAPSANDLOOKSLIKESPAM';
      const result = quickValidate(capsContent, 'Twitter');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(ERROR_MESSAGES.TOO_MUCH_CAPS);
    });

    it('should pass validation for normal content', () => {
      const normalContent = 'This is a normal post with good content for social media!';
      const result = quickValidate(normalContent, 'LinkedIn');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
