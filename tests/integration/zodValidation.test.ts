import { describe, it, expect } from 'vitest';
import { 
  generateContentSchema,
  generateChatSchema,
  generateBatchSchema,
  generateImagesSchema,
  optimizeMultiPlatformSchema,
  generateABVariantsSchema,
  scoreContentSchema,
  applyTemplateSchema
} from '../../schemas/validation';

describe('Zod Schema Validation', () => {
  describe('generateContentSchema', () => {
    it('should validate correct input', () => {
      const result = generateContentSchema.safeParse({
        contents: 'Hello world'
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty string after trim', () => {
      const result = generateContentSchema.safeParse({
        contents: '   '
      });
      expect(result.success).toBe(false);
    });

    it('should accept array contents', () => {
      const result = generateContentSchema.safeParse({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
      });
      expect(result.success).toBe(true);
    });
  });

  describe('generateChatSchema', () => {
    it('should validate correct prompt', () => {
      const result = generateChatSchema.safeParse({
        prompt: 'Hello AI'
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty prompt', () => {
      const result = generateChatSchema.safeParse({
        prompt: ''
      });
      expect(result.success).toBe(false);
    });
  });

  describe('generateBatchSchema', () => {
    it('should validate correct batch request', () => {
      const result = generateBatchSchema.safeParse({
        topic: 'AI Technology',
        platforms: ['Twitter', 'LinkedIn']
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty platforms', () => {
      const result = generateBatchSchema.safeParse({
        topic: 'AI',
        platforms: []
      });
      expect(result.success).toBe(false);
    });
  });

  describe('scoreContentSchema', () => {
    it('should validate correct content scoring request', () => {
      const result = scoreContentSchema.safeParse({
        content: 'This is a test post for social media platform',
        platform: 'Twitter'
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid platform', () => {
      const result = scoreContentSchema.safeParse({
        content: 'Test content',
        platform: 'InvalidPlatform'
      });
      expect(result.success).toBe(false);
    });

    it('should reject content that is too short', () => {
      const result = scoreContentSchema.safeParse({
        content: 'Short',
        platform: 'Twitter'
      });
      expect(result.success).toBe(false);
    });

    it('should accept all valid platforms', () => {
      const platforms = ['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'];
      platforms.forEach(platform => {
        const result = scoreContentSchema.safeParse({
          content: 'This is valid content for testing',
          platform
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('optimizeMultiPlatformSchema', () => {
    it('should validate correct optimization request', () => {
      const result = optimizeMultiPlatformSchema.safeParse({
        originalText: 'Original post content',
        targetPlatforms: ['Twitter', 'LinkedIn']
      });
      expect(result.success).toBe(true);
    });

    it('should reject text that exceeds max length', () => {
      const result = optimizeMultiPlatformSchema.safeParse({
        originalText: 'x'.repeat(6000),
        targetPlatforms: ['Twitter']
      });
      expect(result.success).toBe(false);
    });
  });

  describe('generateImagesSchema', () => {
    it('should validate correct image generation request', () => {
      const result = generateImagesSchema.safeParse({
        prompt: 'A beautiful sunset'
      });
      expect(result.success).toBe(true);
    });

    it('should reject prompt that exceeds max length', () => {
      const result = generateImagesSchema.safeParse({
        prompt: 'x'.repeat(1500)
      });
      expect(result.success).toBe(false);
    });
  });

  describe('generateABVariantsSchema', () => {
    it('should validate correct A/B variants request', () => {
      const result = generateABVariantsSchema.safeParse({
        originalText: 'Original text for A/B testing'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('applyTemplateSchema', () => {
    it('should validate template application request', () => {
      const result = applyTemplateSchema.safeParse({
        templateId: 'viral-tiktok'
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing templateId', () => {
      const result = applyTemplateSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
