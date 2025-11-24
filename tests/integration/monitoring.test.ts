import { describe, it, expect } from 'vitest';
import { metrics } from '../../utils/metrics';

describe('Monitoring and Metrics Tests', () => {
  describe('Metrics Collection', () => {
    it('should record duration metrics', () => {
      metrics.recordDuration('test_operation', 100);
      metrics.recordDuration('test_operation', 200);
      
      const metric = metrics.getMetric('test_operation');
      expect(metric).toBeDefined();
      expect(metric!.count).toBe(2);
      expect(metric!.sum).toBe(300);
      expect(metric!.min).toBe(100);
      expect(metric!.max).toBe(200);
    });

    it('should calculate average duration', () => {
      const metricName = 'avg_test_' + Date.now();
      metrics.recordDuration(metricName, 100);
      metrics.recordDuration(metricName, 200);
      metrics.recordDuration(metricName, 300);
      
      const avg = metrics.getAverageDuration(metricName);
      expect(avg).toBe(200);
    });

    it('should increment counters', () => {
      const counterName = 'test_counter_' + Date.now();
      metrics.incrementCounter(counterName, 5);
      metrics.incrementCounter(counterName, 3);
      
      const count = metrics.getCounter(counterName);
      expect(count).toBe(8);
    });

    it('should update health status', () => {
      metrics.updateHealthStatus('test_service', 'healthy', 'All good', 100);
      
      const status = metrics.getHealthStatus('test_service');
      expect(status).toBeDefined();
      expect(status!.status).toBe('healthy');
      expect(status!.message).toBe('All good');
      expect(status!.responseTime).toBe(100);
    });

    it('should get all health statuses', () => {
      metrics.updateHealthStatus('service1', 'healthy');
      metrics.updateHealthStatus('service2', 'degraded');
      
      const statuses = metrics.getAllHealthStatuses();
      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Prometheus Metrics Format', () => {
    it('should generate Prometheus-formatted output', () => {
      const testMetric = 'prom_test_' + Date.now();
      metrics.recordDuration(testMetric, 150);
      
      const prometheusOutput = metrics.getPrometheusMetrics();
      expect(typeof prometheusOutput).toBe('string');
      expect(prometheusOutput.length).toBeGreaterThan(0);
    });

    it('should include metric metadata', () => {
      const testMetric = 'prom_meta_test_' + Date.now();
      metrics.recordDuration(testMetric, 250);
      
      const output = metrics.getPrometheusMetrics();
      expect(output).toContain('# HELP');
      expect(output).toContain('# TYPE');
    });
  });

  describe('Metrics Summary', () => {
    it('should return all metrics summary', () => {
      const testMetric = 'summary_test_' + Date.now();
      metrics.recordDuration(testMetric, 100);
      metrics.recordDuration(testMetric, 200);
      
      const summary = metrics.getAllMetrics();
      expect(summary).toBeDefined();
      expect(summary[testMetric]).toBeDefined();
      expect(summary[testMetric].count).toBe(2);
      expect(summary[testMetric].avg).toBe(150);
    });
  });
});
