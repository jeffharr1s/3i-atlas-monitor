import { articles, sources, InsertArticle, InsertSource } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { fetchAllArticles, checkAPIHealth } from './apiDataFetcher';

/**
 * Data collector service for aggregating 3I ATLAS information from multiple sources
 * Handles RSS feeds, APIs, and web scraping
 */

const DEFAULT_SOURCES: InsertSource[] = [
  {
    name: 'NASA - 3I/ATLAS',
    url: 'https://science.nasa.gov/solar-system/comets/3i-atlas/',
    sourceType: 'official_agency',
    country: 'United States',
    credibilityScore: '0.99' as any,
    description: 'Official NASA page for 3I/ATLAS comet observations',
    rssUrl: 'https://www.nasa.gov/rss-feeds/',
    isActive: true,
  },
  {
    name: 'ESA - 3I/ATLAS',
    url: 'https://www.esa.int/Science_Exploration/Space_Science/Comet_3I_ATLAS_frequently_asked_questions',
    sourceType: 'official_agency',
    country: 'Europe',
    credibilityScore: '0.99' as any,
    description: 'European Space Agency information about 3I/ATLAS',
    isActive: true,
  },
  {
    name: 'SETI Institute - Breakthrough Listen',
    url: 'https://www.seti.org/news/breakthrough-listen-observations-of-interstellar-object-3iatlas/',
    sourceType: 'peer_reviewed',
    country: 'United States',
    credibilityScore: '0.98' as any,
    description: 'SETI Institute technosignature observations of 3I/ATLAS',
    rssUrl: 'https://www.seti.org/news',
    isActive: true,
  },
  {
    name: 'Space.com - 3I/ATLAS News',
    url: 'https://www.space.com',
    sourceType: 'news_outlet',
    country: 'United States',
    credibilityScore: '0.85' as any,
    description: 'Space.com coverage of 3I/ATLAS',
    isActive: true,
  },
  {
    name: 'News API - Global News',
    url: 'https://newsapi.org/',
    sourceType: 'news_outlet',
    country: 'International',
    credibilityScore: '0.80' as any,
    description: 'Aggregated news from 150,000+ sources worldwide',
    isActive: true,
  },
  {
    name: 'Spaceflight News API',
    url: 'https://api.spaceflightnewsapi.net/',
    sourceType: 'news_outlet',
    country: 'International',
    credibilityScore: '0.88' as any,
    description: 'Specialized spaceflight and astronomy news API',
    isActive: true,
  },
];

/**
 * Initialize default sources in database
 */
export async function initializeDefaultSources() {
  const db = await getDb();
  if (!db) {
    console.warn('[DataCollector] Database not available');
    return;
  }

  try {
    console.log('[DataCollector] Initializing default sources...');

    for (const source of DEFAULT_SOURCES) {
      const existing = await db
        .select()
        .from(sources)
        .where(eq(sources.name, source.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(sources).values(source);
        console.log(`[DataCollector] Added source: ${source.name}`);
      }
    }

    console.log('[DataCollector] Default sources initialized');
  } catch (error) {
    console.error('[DataCollector] Error initializing sources:', error);
  }
}

/**
 * Store article in database
 */
export async function storeArticle(
  title: string,
  summary: string | undefined,
  url: string,
  sourceId: number,
  category: 'trajectory' | 'composition' | 'activity' | 'government_statement' | 'scientific_discovery' | 'speculation' | 'debunking' | 'international_perspective' | 'timeline_event' | 'other',
  credibilityScore: number
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn('[DataCollector] Database not available');
    return;
  }

  try {
    // Check if article already exists
    const existing = await db
      .select()
      .from(articles)
      .where(eq(articles.url, url))
      .limit(1);

    if (existing.length > 0) {
      console.log(`[DataCollector] Article already exists: ${title}`);
      return;
    }

    const newArticle: InsertArticle = {
      title,
      summary: summary || '',
      url,
      sourceId,
      category,
      credibilityScore: credibilityScore.toString() as any,
      publishedAt: new Date(),
      isAnalyzed: false,
    };

    await db.insert(articles).values(newArticle);
    console.log(`[DataCollector] Stored article: ${title}`);
  } catch (error) {
    console.error('[DataCollector] Error storing article:', error);
  }
}

/**
 * Categorize article based on content
 */
export function categorizeArticle(text: string): 'trajectory' | 'composition' | 'activity' | 'government_statement' | 'scientific_discovery' | 'speculation' | 'debunking' | 'international_perspective' | 'timeline_event' | 'other' {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('trajectory') || lowerText.includes('orbit') || lowerText.includes('path')) {
    return 'trajectory';
  }

  if (lowerText.includes('composition') || lowerText.includes('chemical') || lowerText.includes('analysis')) {
    return 'composition';
  }

  if (lowerText.includes('activity') || lowerText.includes('outgassing') || lowerText.includes('tail')) {
    return 'activity';
  }

  if (lowerText.includes('government') || lowerText.includes('statement') || lowerText.includes('official')) {
    return 'government_statement';
  }

  if (lowerText.includes('debunk') || lowerText.includes('false') || lowerText.includes('refute')) {
    return 'debunking';
  }

  if (lowerText.includes('speculation') || lowerText.includes('theory') || lowerText.includes('claim')) {
    return 'speculation';
  }

  if (lowerText.includes('discovery') || lowerText.includes('observation') || lowerText.includes('telescope')) {
    return 'scientific_discovery';
  }

  return 'other';
}

/**
 * Calculate article credibility score based on source and content
 */
export async function calculateCredibilityScore(sourceId: number, category: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0.5;

  try {
    const sourceList = await db
      .select()
      .from(sources)
      .where(eq(sources.id, sourceId))
      .limit(1);

    if (sourceList.length === 0) return 0.5;

    const source = sourceList[0];
    let score = parseFloat(source.credibilityScore as any) || 0.5;

    if (category === 'scientific_discovery') {
      score = Math.min(score * 1.1, 1.0);
    } else if (category === 'speculation') {
      score = Math.max(score * 0.7, 0.1);
    } else if (category === 'debunking') {
      score = Math.min(score * 1.05, 1.0);
    }

    return Math.round(score * 100) / 100;
  } catch (error) {
    console.error('[DataCollector] Failed to calculate credibility score:', error);
    return 0.5;
  }
}

/**
 * Main data collection job - fetches articles from all sources
 */
export async function collectData() {
  console.log('[DataCollector] Starting data collection cycle...');

  try {
    // Initialize sources first
    await initializeDefaultSources();

    // Fetch articles from all APIs
    console.log('[DataCollector] Fetching articles from all sources...');
    const allArticles = await fetchAllArticles();

    if (allArticles.length === 0) {
      console.warn('[DataCollector] No articles fetched from any source');
      return;
    }

    console.log(`[DataCollector] Processing ${allArticles.length} articles...`);

    const db = await getDb();
    if (!db) {
      console.warn('[DataCollector] Database not available');
      return;
    }

    // Get sources from database
    const sourcesList = await db.select().from(sources);
    const sourceMap = new Map(sourcesList.map(s => [s.name, s.id]));

    // Store articles
    for (const article of allArticles) {
      try {
        // Find matching source or use default
        let sourceId = sourceMap.get(article.source);

        if (!sourceId) {
          // Create new source if not found
          const result = await db.insert(sources).values({
            name: article.source,
            url: article.url,
            sourceType: 'news_outlet',
            country: 'International',
            credibilityScore: '0.75' as any,
            description: `News source: ${article.source}`,
            isActive: true,
          });

          // Get the inserted ID
          const inserted = await db
            .select()
            .from(sources)
            .where(eq(sources.name, article.source))
            .limit(1);

          sourceId = inserted[0]?.id;
        }

        if (!sourceId) {
          console.warn(`[DataCollector] Could not find or create source: ${article.source}`);
          continue;
        }

        // Categorize and calculate credibility
        const category = categorizeArticle(
          `${article.title} ${article.description || ''}`
        );
        const credibility = await calculateCredibilityScore(sourceId, category);

        // Store article
        await storeArticle(
          article.title,
          article.description || article.content,
          article.url,
          sourceId,
          category,
          credibility
        );
      } catch (error) {
        console.error(`[DataCollector] Error processing article: ${article.title}`, error);
      }
    }

    console.log('[DataCollector] Data collection cycle completed');
  } catch (error) {
    console.error('[DataCollector] Data collection failed:', error);
  }
}

/**
 * Check health of all data sources
 */
export async function checkDataSourceHealth() {
  console.log('[DataCollector] Checking data source health...');
  const health = await checkAPIHealth();
  console.log('[DataCollector] API Health:', health);
  return health;
}
