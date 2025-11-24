import { z } from 'zod';

/**
 * 🛡️ REQUEST VALIDATION SCHEMAS
 * 
 * Zod schemas for validating API request bodies
 * Prevents injection attacks and ensures data integrity
 */

// Content generation schemas
export const generateContentSchema = z.object({
  contents: z.union([
    z.string().trim().min(1, 'Contents cannot be empty'),
    z.array(z.any()).min(1, 'Contents array cannot be empty')
  ]),
  config: z.object({
    systemInstruction: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxOutputTokens: z.number().positive().optional()
  }).optional()
});

export const generateChatSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt cannot be empty'),
  history: z.array(z.any()).optional()
});

export const generateBatchSchema = z.object({
  topic: z.string().trim().min(1, 'Topic cannot be empty'),
  platforms: z.array(z.string()).min(1, 'At least one platform is required')
});

// Image generation schema
export const generateImagesSchema = z.object({
  prompt: z.string().trim().min(1, 'Prompt cannot be empty').max(1000, 'Prompt too long'),
  config: z.object({
    quality: z.enum(['standard', 'hd']).optional(),
    size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional()
  }).optional()
});

// Multi-platform optimization schema
export const optimizeMultiPlatformSchema = z.object({
  originalText: z.string().trim().min(1, 'Original text cannot be empty').max(5000, 'Text too long'),
  targetPlatforms: z.array(z.string()).min(1, 'At least one target platform is required')
});

// A/B variants schema
export const generateABVariantsSchema = z.object({
  originalText: z.string().trim().min(1, 'Original text cannot be empty').max(5000, 'Text too long')
});

// Content scoring schema
export const scoreContentSchema = z.object({
  content: z.string().trim().min(10, 'Content must be at least 10 characters').max(10000, 'Content too long'),
  platform: z.enum(['Twitter', 'Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'], {
    errorMap: () => ({ message: 'Invalid platform' })
  }),
  context: z.object({
    hasHashtags: z.boolean().optional(),
    hasEmojis: z.boolean().optional(),
    targetAudience: z.string().optional()
  }).optional()
});

// Template application schema
export const applyTemplateSchema = z.object({
  templateId: z.string().trim().min(1, 'Template ID is required'),
  userInput: z.record(z.any()).optional()
});

/**
 * Validation middleware factory
 * Creates middleware that validates request body against a schema
 */
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        statusCode: 400,
        details: errors
      });
    }
    
    next();
  };
}
