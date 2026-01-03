import cron from 'node-cron';
import { collectData, initializeDefaultSources } from './dataCollector';
import { invokeLLM } from './_core/llm';

/**
 * Data Collection Scheduler
 * 
 * Automatically fetches 3I/ATLAS data from multiple sources at regular intervals
 * and stores them in the database with AI analysis.
 */

let scheduledJobs: ReturnType<typeof cron.schedule>[] = [];

/**
 * Initialize the data collection scheduler
 * Runs on app startup to begin automatic data collection
 */
export function initializeScheduler() {
  console.log('[DataCollectionScheduler] Initializing...');

  // Run every 4 hours
  const mainCollectionJob = cron.schedule('0 */4 * * *', async () => {
    console.log('[DataCollectionScheduler] Starting main data collection job...');
    try {
      await runDataCollection();
    } catch (error) {
      console.error('[DataCollectionScheduler] Error in main collection job:', error);
    }
  });

  // Run every 2 hours for quick RSS feed updates
  const rssUpdateJob = cron.schedule('0 */2 * * *', async () => {
    console.log('[DataCollectionScheduler] Starting RSS feed update job...');
    try {
      await runRSSCollection();
    } catch (error) {
      console.error('[DataCollectionScheduler] Error in RSS collection job:', error);
    }
  });

  // Run once daily at 2 AM for deep analysis
  const analysisJob = cron.schedule('0 2 * * *', async () => {
    console.log('[DataCollectionScheduler] Starting deep analysis job...');
    try {
      await runDeepAnalysis();
    } catch (error) {
      console.error('[DataCollectionScheduler] Error in analysis job:', error);
    }
  });

  // Run immediately on startup (with delay to let server initialize)
  setTimeout(() => {
    console.log('[DataCollectionScheduler] Running initial data collection...');
    runDataCollection().catch(error => {
      console.error('[DataCollectionScheduler] Error in initial collection:', error);
    });
  }, 5000);

  scheduledJobs = [mainCollectionJob, rssUpdateJob, analysisJob];
  console.log('[DataCollectionScheduler] Scheduler initialized with 3 jobs');
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler() {
  console.log('[DataCollectionScheduler] Stopping scheduler...');
  scheduledJobs.forEach(job => job.stop());
  scheduledJobs = [];
}

/**
 * Main data collection from all sources
 */
async function runDataCollection() {
  console.log('[DataCollectionScheduler] Running main data collection...');
  try {
    await collectData();
    console.log('[DataCollectionScheduler] Main data collection completed');
  } catch (error) {
    console.error('[DataCollectionScheduler] Error in main data collection:', error);
  }
}

/**
 * RSS feed collection for quick updates
 */
async function runRSSCollection() {
  console.log('[DataCollectionScheduler] Running RSS feed updates...');
  try {
    // Initialize sources which includes RSS feed processing
    await initializeDefaultSources();
    console.log('[DataCollectionScheduler] RSS feed update completed');
  } catch (error) {
    console.error('[DataCollectionScheduler] Error in RSS collection:', error);
  }
}

/**
 * Deep analysis of collected articles
 * Uses LLM to extract claims and identify contradictions
 */
async function runDeepAnalysis() {
  console.log('[DataCollectionScheduler] Starting deep analysis of collected articles...');

  try {
    // This would fetch recent articles and run analysis
    // Implementation details depend on database structure
    const analysisPrompt = `
      Analyze the latest 3I/ATLAS information collected from NASA, ESA, SETI, and news sources.
      
      Identify:
      1. Key claims about 3I/ATLAS (trajectory, composition, origin, etc.)
      2. Contradictions between sources
      3. Consensus points among authoritative sources
      4. Speculation vs. confirmed facts
      5. Significant changes from previous reports
      
      Provide a summary of findings.
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an expert analyst specializing in 3I/ATLAS comet data. Analyze collected information and identify probable truths.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    });

    console.log('[DataCollectionScheduler] Deep analysis completed');
    console.log('[DataCollectionScheduler] Analysis results:', response.choices[0]?.message.content);
  } catch (error) {
    console.error('[DataCollectionScheduler] Error in deep analysis:', error);
  }
}

/**
 * Get scheduler status
 */
export function getSchedulerStatus() {
  return {
    isRunning: scheduledJobs.length > 0,
    jobCount: scheduledJobs.length,
    jobs: [
      'Main collection (every 4 hours)',
      'RSS updates (every 2 hours)',
      'Deep analysis (daily at 2 AM)',
    ],
  };
}
