import { describe, it, expect } from 'vitest';
import { 
  CONTENT_TEMPLATES, 
  getTemplateById, 
  getTemplatesByCategory, 
  getTemplatesByPlatform,
  applyTemplate 
} from '../../contentTemplates';

describe('contentTemplates', () => {
  describe('CONTENT_TEMPLATES', () => {
    it('should have at least one template', () => {
      expect(CONTENT_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('should have valid template structure', () => {
      const template = CONTENT_TEMPLATES[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('platform');
      expect(template).toHaveProperty('category');
    });
  });

  describe('getTemplateById', () => {
    it('should return template when id exists', () => {
      const template = getTemplateById('viral-tiktok');
      expect(template).toBeDefined();
      expect(template?.id).toBe('viral-tiktok');
      expect(template?.platform).toBe('TikTok');
    });

    it('should return undefined when id does not exist', () => {
      const template = getTemplateById('non-existent-id');
      expect(template).toBeUndefined();
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for valid category', () => {
      const templates = getTemplatesByCategory('social');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.category).toBe('social');
      });
    });

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('invalid' as any);
      expect(templates).toHaveLength(0);
    });

    it('should return professional templates', () => {
      const templates = getTemplatesByCategory('professional');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.category).toBe('professional');
      });
    });
  });

  describe('getTemplatesByPlatform', () => {
    it('should return templates for TikTok', () => {
      const templates = getTemplatesByPlatform('TikTok');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.platform).toBe('TikTok');
      });
    });

    it('should return templates for LinkedIn', () => {
      const templates = getTemplatesByPlatform('LinkedIn');
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(template => {
        expect(template.platform).toBe('LinkedIn');
      });
    });

    it('should return empty array for non-existent platform', () => {
      const templates = getTemplatesByPlatform('NonExistentPlatform');
      expect(templates).toHaveLength(0);
    });
  });

  describe('applyTemplate', () => {
    it('should apply template with user input', () => {
      const template = getTemplateById('viral-tiktok');
      expect(template).toBeDefined();
      
      if (template) {
        const result = applyTemplate(template, { topic: 'Coding tips' });
        expect(result).toBeDefined();
        expect(result.id).toBe('viral-tiktok');
      }
    });
  });
});
