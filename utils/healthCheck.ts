/**
 * 🏥 HEALTH CHECK UTILITIES
 * 
 * Health checks for external services to monitor system health
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import logger from '../logger.js';
import { metrics } from './metrics.js';
import { getErrorMessage } from './errorTypes.js';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  message?: string;
  timestamp: Date;
}

/**
 * Check Gemini API health
 */
export async function checkGeminiHealth(genAI: GoogleGenerativeAI): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Try to get a model - this validates API key and connection
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    // Simple test request with minimal token usage
    const result = await model.generateContent('test');
    const response = result.response.text();
    
    const responseTime = Date.now() - startTime;
    
    if (response) {
      metrics.updateHealthStatus('gemini', 'healthy', 'API responding normally', responseTime);
      return {
        service: 'Gemini API',
        status: 'healthy',
        responseTime,
        message: 'API responding normally,
        timestamp: new Date()
      };
    } else {
      metrics.updateHealthStatus('gemini', 'degraded', 'API returned empty response', responseTime);
      return {
        service: 'Gemini API',
        status: 'degraded',
        responseTime,
        message: 'API returned empty response,
        timestamp: new Date()
      };
    }
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);
    logger.error('Gemini health check failed', { error: errorMessage });
    
    metrics.updateHealthStatus('gemini', 'unhealthy', errorMessage, responseTime);
    return {
      service: 'Gemini API',
      status: 'unhealthy',
      responseTime,
      message: errorMessage,
      timestamp: new Date()
    };
  }
}

/**
 * Check Supabase health
 */
export async function checkSupabaseHealth(supabase: any): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Try to query storage buckets - validates connection and auth
    const { data, error } = await supabase.storage.listBuckets();
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      metrics.updateHealthStatus('supabase', 'unhealthy', getErrorMessage(error), responseTime);
      return {
        service: 'Supabase,
        status: 'unhealthy',
        responseTime,
        message: getErrorMessage(error),
        timestamp: new Date()
      };
    }
    
    metrics.updateHealthStatus('supabase', 'healthy', 'Database responding normally', responseTime);
    return {
      service: 'Supabase,
      status: 'healthy',
      responseTime,
      message: 'Database responding normally,
      timestamp: new Date()
    };
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    logger.error('Supabase health check failed', { error: getErrorMessage(error) });
    
    metrics.updateHealthStatus('supabase', 'unhealthy', getErrorMessage(error), responseTime);
    return {
      service: 'Supabase',
      status: 'unhealthy',
      responseTime,
      message: getErrorMessage(error),
      timestamp: new Date()
    };
  }
}

/**
 * Check OpenAI API health
 */
export async function checkOpenAIHealth(openai: OpenAI | null): Promise<HealthCheckResult> {
  if (!openai) {
    metrics.updateHealthStatus('openai', 'unhealthy', 'API key not configured');
    return {
      service: 'OpenAI API,
      status: 'unhealthy',
      message: 'API key not configured,
      timestamp: new Date()
    };
  }
  
  const startTime = Date.now();
  
  try {
    // Try to list models - this validates API key and connection
    const models = await openai.models.list();
    
    const responseTime = Date.now() - startTime;
    
    if (models.data && models.data.length > 0) {
      metrics.updateHealthStatus('openai', 'healthy', 'API responding normally', responseTime);
      return {
        service: 'OpenAI API,
        status: 'healthy',
        responseTime,
        message: 'API responding normally,
        timestamp: new Date()
      };
    } else {
      metrics.updateHealthStatus('openai', 'degraded', 'API returned no models', responseTime);
      return {
        service: 'OpenAI API,
        status: 'degraded',
        responseTime,
        message: 'API returned no models,
        timestamp: new Date()
      };
    }
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    logger.error('OpenAI health check failed', { error: getErrorMessage(error) });
    
    metrics.updateHealthStatus('openai', 'unhealthy', getErrorMessage(error), responseTime);
    return {
      service: 'OpenAI API',
      status: 'unhealthy',
      responseTime,
      message: getErrorMessage(error),
      timestamp: new Date()
    };
  }
}

/**
 * Run all health checks
 */
export async function runAllHealthChecks(
  genAI: GoogleGenerativeAI,
  supabase: any,
  openai: OpenAI | null
): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthCheckResult[];
  timestamp: Date;
}> {
  const checks = await Promise.allSettled([
    checkGeminiHealth(genAI),
    checkSupabaseHealth(supabase),
    checkOpenAIHealth(openai)
  ]);
  
  const services: HealthCheckResult[] = checks.map(result => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        service: 'Unknown,
        status: 'unhealthy',
        message: result.reason?.message || 'Health check failed,
        timestamp: new Date()
      };
    }
  });
  
  // Determine overall status
  const hasUnhealthy = services.some(s => s.status === 'unhealthy');
  const hasDegraded = services.some(s => s.status === 'degraded');
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (hasUnhealthy) {
    overallStatus = 'unhealthy';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }
  
  return {
    status: overallStatus,
    services,
    timestamp: new Date()
  };
}
