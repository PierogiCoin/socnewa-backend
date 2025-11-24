import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandler, AppError, asyncHandler } from '../../middleware/errorHandler';

describe('Error Handling Tests', () => {
  describe('AppError', () => {
    it('should create custom error with status code', () => {
      const error = new AppError(404, 'Not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle AppError correctly', async () => {
      const app = express();
      
      app.get('/test', (req, res) => {
        throw new AppError(400, 'Bad request');
      });
      
      app.use(errorHandler);

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Bad request');
      expect(response.body.statusCode).toBe(400);
    });

    it('should handle JWT errors', async () => {
      const app = express();
      
      app.get('/test', (req, res) => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });
      
      app.use(errorHandler);

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should handle validation errors', async () => {
      const app = express();
      
      app.get('/test', (req, res) => {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        throw error;
      });
      
      app.use(errorHandler);

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should handle generic errors', async () => {
      const app = express();
      
      app.get('/test', (req, res) => {
        throw new Error('Something went wrong');
      });
      
      app.use(errorHandler);

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('asyncHandler wrapper', () => {
    it('should catch async errors', async () => {
      const app = express();
      
      app.get('/test', asyncHandler(async (req, res) => {
        throw new AppError(500, 'Async error');
      }));
      
      app.use(errorHandler);

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Async error');
    });

    it('should allow successful async operations', async () => {
      const app = express();
      
      app.get('/test', asyncHandler(async (req, res) => {
        res.json({ success: true });
      }));

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
