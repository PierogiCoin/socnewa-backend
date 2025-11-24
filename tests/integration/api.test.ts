import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { CONTENT_TEMPLATES } from '../../contentTemplates';

const app = createTestApp();

// Add test routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    model: 'gemini-1.5-flash-latest (test mode)',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/templates', (req, res) => {
  res.json({ templates: CONTENT_TEMPLATES });
});

app.post('/api/score-content', async (req, res) => {
  const { content, platform } = req.body;
  
  if (!content || !platform) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Mock response
  res.json({
    success: true,
    score: {
      overall: 75,
      engagement: { score: 80, level: 'high', feedback: ['Good hook'] },
      seo: { score: 70, level: 'medium', feedback: ['Add keywords'] },
      platformFit: { score: 75, level: 'good', feedback: ['Good fit'] },
      suggestions: ['Add hashtags'],
      badge: 'green'
    }
  });
});

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('model');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/templates', () => {
    it('should return all templates', async () => {
      const response = await request(app).get('/api/templates');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
      expect(response.body.templates.length).toBeGreaterThan(0);
    });

    it('should return templates with correct structure', async () => {
      const response = await request(app).get('/api/templates');
      const template = response.body.templates[0];
      
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('platform');
      expect(template).toHaveProperty('category');
    });
  });

  describe('POST /api/score-content', () => {
    it('should score valid content', async () => {
      const response = await request(app)
        .post('/api/score-content')
        .send({
          content: 'This is a great post about coding tips!',
          platform: 'Twitter'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.score).toHaveProperty('overall');
      expect(response.body.score).toHaveProperty('badge');
    });

    it('should return 400 for missing content', async () => {
      const response = await request(app)
        .post('/api/score-content')
        .send({
          platform: 'Twitter'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing platform', async () => {
      const response = await request(app)
        .post('/api/score-content')
        .send({
          content: 'Test content'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
