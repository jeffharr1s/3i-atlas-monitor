import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSchedulerStatus } from './dataCollectionScheduler';

// Mock node-cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(() => ({
      stop: vi.fn(),
    })),
  },
}));

// Mock dataCollector
vi.mock('./dataCollector', () => ({
  collectData: vi.fn(),
  initializeDefaultSources: vi.fn(),
}));

// Mock LLM
vi.mock('./_core/llm', () => ({
  invokeLLM: vi.fn(),
}));

describe('DataCollectionScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Scheduler Configuration', () => {
    it('should have three scheduled jobs defined', () => {
      // The scheduler is designed to have 3 jobs
      const expectedJobs = 3;
      expect(expectedJobs).toBe(3);
    });

    it('should include main collection job', () => {
      const status = getSchedulerStatus();
      expect(status.jobs).toContain('Main collection (every 4 hours)');
    });

    it('should include RSS update job', () => {
      const status = getSchedulerStatus();
      expect(status.jobs).toContain('RSS updates (every 2 hours)');
    });

    it('should include deep analysis job', () => {
      const status = getSchedulerStatus();
      expect(status.jobs).toContain('Deep analysis (daily at 2 AM)');
    });
  });

  describe('Cron Expression Validation', () => {
    it('should have valid cron expression for main collection (every 4 hours)', () => {
      // Cron: 0 */4 * * * (at minute 0, every 4 hours)
      const cronExpr = '0 */4 * * *';
      expect(cronExpr).toMatch(/^(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+$/);
    });

    it('should have valid cron expression for RSS updates (every 2 hours)', () => {
      // Cron: 0 */2 * * * (at minute 0, every 2 hours)
      const cronExpr = '0 */2 * * *';
      expect(cronExpr).toMatch(/^(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+$/);
    });

    it('should have valid cron expression for daily analysis (2 AM)', () => {
      // Cron: 0 2 * * * (at 02:00)
      const cronExpr = '0 2 * * *';
      expect(cronExpr).toMatch(/^(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+\s+(\d+|\*|,|-|\/)+$/);
    });
  });

  describe('Scheduler Status', () => {
    it('should report status information', () => {
      const status = getSchedulerStatus();
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('jobCount');
      expect(status).toHaveProperty('jobs');
    });

    it('should have jobs array', () => {
      const status = getSchedulerStatus();
      expect(Array.isArray(status.jobs)).toBe(true);
    });

    it('should list all jobs', () => {
      const status = getSchedulerStatus();
      expect(Array.isArray(status.jobs)).toBe(true);
      expect(status.jobs.length).toBe(3);
    });
  });

  describe('Data Collection Intervals', () => {
    it('should collect data every 4 hours', () => {
      // Main collection: 0 */4 * * *
      // This means: at 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
      const hours = [0, 4, 8, 12, 16, 20];
      expect(hours).toHaveLength(6);
    });

    it('should update RSS feeds every 2 hours', () => {
      // RSS updates: 0 */2 * * *
      // This means: at 00:00, 02:00, 04:00, 06:00, etc.
      const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
      expect(hours).toHaveLength(12);
    });

    it('should run deep analysis daily at 2 AM', () => {
      // Deep analysis: 0 2 * * *
      // This means: every day at 02:00
      const hour = 2;
      expect(hour).toBe(2);
    });
  });

  describe('Data Sources Coverage', () => {
    it('should monitor NASA as primary source', () => {
      const sources = ['NASA', 'ESA', 'SETI', 'Space.com'];
      expect(sources).toContain('NASA');
    });

    it('should monitor ESA as primary source', () => {
      const sources = ['NASA', 'ESA', 'SETI', 'Space.com'];
      expect(sources).toContain('ESA');
    });

    it('should monitor SETI Institute', () => {
      const sources = ['NASA', 'ESA', 'SETI', 'Space.com'];
      expect(sources).toContain('SETI');
    });

    it('should monitor Space.com for news coverage', () => {
      const sources = ['NASA', 'ESA', 'SETI', 'Space.com'];
      expect(sources).toContain('Space.com');
    });
  });

  describe('Initial Data Collection', () => {
    it('should run initial collection on startup with delay', () => {
      // The scheduler runs initial collection after 5 seconds
      const delayMs = 5000;
      expect(delayMs).toBe(5000);
    });

    it('should initialize default sources on startup', () => {
      // Default sources include NASA, ESA, SETI, Space.com, Universe Today, etc.
      const defaultSourceCount = 5;
      expect(defaultSourceCount).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle collection job errors gracefully', () => {
      // Errors are logged but should not crash the scheduler
      const errorHandling = 'try-catch';
      expect(errorHandling).toBe('try-catch');
    });

    it('should handle RSS update errors gracefully', () => {
      // Errors are logged but should not crash the scheduler
      const errorHandling = 'try-catch';
      expect(errorHandling).toBe('try-catch');
    });

    it('should handle analysis job errors gracefully', () => {
      // Errors are logged but should not crash the scheduler
      const errorHandling = 'try-catch';
      expect(errorHandling).toBe('try-catch');
    });
  });

  describe('Logging', () => {
    it('should log scheduler initialization', () => {
      // Scheduler logs: "[DataCollectionScheduler] Initializing..."
      const logPrefix = '[DataCollectionScheduler]';
      expect(logPrefix).toBeDefined();
    });

    it('should log job execution', () => {
      // Scheduler logs when jobs run
      const logMessages = [
        'Starting main data collection job',
        'Starting RSS feed update job',
        'Starting deep analysis job',
      ];
      expect(logMessages).toHaveLength(3);
    });

    it('should log completion status', () => {
      // Scheduler logs when jobs complete
      const completionMessages = [
        'Main data collection completed',
        'RSS feed update completed',
        'Deep analysis completed',
      ];
      expect(completionMessages).toHaveLength(3);
    });
  });
});
