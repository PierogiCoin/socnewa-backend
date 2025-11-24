/**
 * 📊 METRICS AND MONITORING
 * 
 * Simple metrics tracking for monitoring application health and performance
 * Compatible with Prometheus but works standalone
 */

import logger from '../logger.js';

interface Metric {
  count: number;
  sum: number;
  min: number;
  max: number;
  lastUpdated: Date;
}

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  message?: string;
  responseTime?: number;
}

class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private healthStatus: Map<string, HealthStatus> = new Map();
  private requestCounts: Map<string, number> = new Map();

  /**
   * Record a duration metric (e.g., response time)
   */
  recordDuration(name: string, durationMs: number): void {
    const existing = this.metrics.get(name);
    
    if (existing) {
      existing.count++;
      existing.sum += durationMs;
      existing.min = Math.min(existing.min, durationMs);
      existing.max = Math.max(existing.max, durationMs);
      existing.lastUpdated = new Date();
    } else {
      this.metrics.set(name, {
        count: 1,
        sum: durationMs,
        min: durationMs,
        max: durationMs,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1): void {
    const existing = this.requestCounts.get(name) || 0;
    this.requestCounts.set(name, existing + value);
  }

  /**
   * Get metric statistics
   */
  getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number | undefined {
    const metric = this.metrics.get(name);
    if (!metric || metric.count === 0) return undefined;
    return metric.sum / metric.count;
  }

  /**
   * Update health status for a service
   */
  updateHealthStatus(
    service: string,
    status: 'healthy' | 'degraded' | 'unhealthy',
    message?: string,
    responseTime?: number
  ): void {
    this.healthStatus.set(service, {
      service,
      status,
      lastCheck: new Date(),
      message,
      responseTime
    });
  }

  /**
   * Get health status for a service
   */
  getHealthStatus(service: string): HealthStatus | undefined {
    return this.healthStatus.get(service);
  }

  /**
   * Get all health statuses
   */
  getAllHealthStatuses(): HealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this.requestCounts.get(name) || 0;
  }

  /**
   * Get all metrics summary
   */
  getAllMetrics(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    // Duration metrics
    this.metrics.forEach((metric, name) => {
      summary[name] = {
        count: metric.count,
        avg: metric.count > 0 ? metric.sum / metric.count : 0,
        min: metric.min,
        max: metric.max,
        lastUpdated: metric.lastUpdated
      };
    });
    
    // Counter metrics
    this.requestCounts.forEach((count, name) => {
      summary[name] = count;
    });
    
    return summary;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.requestCounts.clear();
    // Don't clear health status - it should persist
  }

  /**
   * Get Prometheus-formatted metrics
   */
  getPrometheusMetrics(): string {
    let output = '';
    
    // Duration metrics
    this.metrics.forEach((metric, name) => {
      const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      output += `# HELP ${safeName}_duration_ms Duration in milliseconds\n`;
      output += `# TYPE ${safeName}_duration_ms summary\n`;
      output += `${safeName}_duration_ms_count ${metric.count}\n`;
      output += `${safeName}_duration_ms_sum ${metric.sum}\n`;
      output += `${safeName}_duration_ms_min ${metric.min}\n`;
      output += `${safeName}_duration_ms_max ${metric.max}\n`;
      if (metric.count > 0) {
        output += `${safeName}_duration_ms_avg ${metric.sum / metric.count}\n`;
      }
      output += '\n';
    });
    
    // Counter metrics
    this.requestCounts.forEach((count, name) => {
      const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      output += `# HELP ${safeName} Request counter\n`;
      output += `# TYPE ${safeName} counter\n`;
      output += `${safeName} ${count}\n\n`;
    });
    
    return output;
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

/**
 * Middleware to track request metrics
 */
export function metricsMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  const path = req.path || req.url;
  const method = req.method;
  
  // Track request count
  metrics.incrementCounter(`http_requests_total`);
  metrics.incrementCounter(`http_requests_${method.toLowerCase()}`);
  
  // Track response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Record response time
    metrics.recordDuration(`http_request_duration_ms`, duration);
    metrics.recordDuration(`http_request_duration_ms_${method.toLowerCase()}`, duration);
    
    // Track status codes
    metrics.incrementCounter(`http_responses_${statusCode}`);
    
    // Log slow requests
    if (duration > 5000) {
      logger.warn(`Slow request detected`, {
        method,
        path,
        duration: `${duration}ms`,
        statusCode
      });
    }
  });
  
  next();
}

/**
 * Track external API call metrics
 */
export function trackAPICall(provider: string, operation: string, durationMs: number, success: boolean): void {
  metrics.recordDuration(`api_call_duration_${provider}`, durationMs);
  metrics.recordDuration(`api_call_duration_${provider}_${operation}`, durationMs);
  metrics.incrementCounter(`api_calls_total_${provider}`);
  metrics.incrementCounter(`api_calls_${success ? 'success' : 'failure'}_${provider}`);
}
