import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandler, asyncHandler, AppError } from '../../middleware/errorHandler';

describe('Improved Error Handling Integration Tests', () => {
  describe('Structured error responses', () => {
    it('should return structured error for AppError', async () => {
      const app = express();
      
      app.get('/test', asyncHandler(async (req, res) => {
        throw new AppError(400, 'Invalid request data');
      }));
      
      app.use(errorHandler);

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid request data');
      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should return 500 with structured response for generic errors', async () => {
      const app = express();
      
      app.get('/test', asyncHandler(async (req, res) => {
        throw new Error('Unexpected error');
      }));
      
      app.use(errorHandler);

      const response = await request(app).get('/test');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body.statusCode).toBeUndefined(); // Not included for generic errors
    });
  });

  describe('asyncHandler wrapper', () => {
    it('should catch validation errors and pass to error handler', async () => {
      const app = express();
      app.use(express.json());
      
      app.post('/api/test', asyncHandler(async (req, res) => {
        const { requiredField } = req.body;
        
        if (!requiredField) {
          throw new AppError(400, 'Missing required field: requiredField');
        }
        
        res.json({ success: true });
      }));
      
      app.use(errorHandler);

      const response = await request(app)
        .post('/api/test')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required field: requiredField');
      expect(response.body.statusCode).toBe(400);
    });

    it('should allow successful requests through', async () => {
      const app = express();
      app.use(express.json());
      
      app.post('/api/test', asyncHandler(async (req, res) => {
        const { data } = req.body;
        res.json({ success: true, data });
      }));
      
      app.use(errorHandler);

      const response = await request(app)
        .post('/api/test')
        .send({ data: 'test' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('test');
    });
  });

  describe('Multiple async routes with error handling', () => {
    it('should handle errors from different routes consistently', async () => {
      const app = express();
      app.use(express.json());
      
      app.post('/api/route1', asyncHandler(async (req, res) => {
        throw new AppError(400, 'Route 1 validation failed');
      }));
      
      app.post('/api/route2', asyncHandler(async (req, res) => {
        throw new AppError(404, 'Resource not found');
      }));
      
      app.post('/api/route3', asyncHandler(async (req, res) => {
        throw new AppError(500, 'Internal processing error');
      }));
      
      app.use(errorHandler);

      const response1 = await request(app).post('/api/route1').send({});
      expect(response1.status).toBe(400);
      expect(response1.body.statusCode).toBe(400);
      
      const response2 = await request(app).post('/api/route2').send({});
      expect(response2.status).toBe(404);
      expect(response2.body.statusCode).toBe(404);
      
      const response3 = await request(app).post('/api/route3').send({});
      expect(response3.status).toBe(500);
      expect(response3.body.statusCode).toBe(500);
    });
  });
});
