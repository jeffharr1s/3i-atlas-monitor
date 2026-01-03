import { getDb } from './db';
import { articles, sources, InsertArticle, InsertSource } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

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
    name: 'Universe Today',
    url: 'https://www.universetoday.com',
    sourceType: 'scientific_blog',
    country: 'United States',
    credibilityScore: '0.80' as any,
    description: 'Universe Today astronomy news and analysis',
    isActive: true,
  },
  {
    name: 'Sky & Telescope',
    url: 'https://www.skyandtelescope.org',
    sourceType: 'news_outlet',
    country: 'United States',
    credibilityScore: '0.85' as any,
    description: 'Sky & Telescope astronomy magazine',
    isActive: true,
  },
];

/**
 * Initialize default sources in the database
 */
export async function initializeDefaultSources() {
  const db = await getDb();
  if (!db) {
    console.warn('[DataCollector] Database not available');
    return;
  }

  try {
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
  } catch (error) {
    console.error('[DataCollector] Failed to initialize sources:', error);
  }
}

/**
 * Add a new article to the database
 */
export async function addArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) {
    console.warn('[DataCollector] Database not available');
    return null;
  }

  try {
    const result = await db.insert(articles).values(article);
    return result;
  } catch (error) {
    console.error('[DataCollector] Failed to add article:', error);
    return null;
  }
}

/**
 * Check if article URL already exists in database
 */
export async function articleExists(url: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const result = await db
      .select()
      .from(articles)
      .where(eq(articles.url, url))
      .limit(1);
    return result.length > 0;
  } catch (error) {
    console.error('[DataCollector] Failed to check article existence:', error);
    return false;
  }
}

/**
 * Fetch and parse RSS feed
 */
export async function fetchRSSFeed(feedUrl: string): Promise<any[]> {
  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      const itemContent = match[1];
      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
      const descriptionMatch = /<description>([\s\S]*?)<\/description>/.exec(itemContent);
      const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);

      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1].replace(/<[^>]*>/g, ''),
          description: descriptionMatch ? descriptionMatch[1].replace(/<[^>]*>/g, '') : '',
          link: linkMatch[1],
          pubDate: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`[DataCollector] Failed to fetch RSS feed ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Categorize article based on content - with priority ordering
 */
export function categorizeArticle(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();

  if (text.includes('debunk') || text.includes('false') || text.includes('incorrect')) {
    return 'debunking';
  }
  
  if (text.includes('timeline') || text.includes('chronology') || text.includes('sequence')) {
    return 'timeline_event';
  }
  
  if (text.includes('china') || text.includes('russia') || text.includes('japan') || text.includes('india') || text.includes('international')) {
    return 'international_perspective';
  }
  
  if (text.includes('trajectory') || text.includes('orbit') || text.includes('path')) {
    return 'trajectory';
  }
  
  if (text.includes('composition') || text.includes('chemical') || text.includes('element')) {
    return 'composition';
  }
  
  if (text.includes('activity') || text.includes('outgassing') || text.includes('tail')) {
    return 'activity';
  }
  
  if (text.includes('government') || text.includes('statement') || text.includes('official')) {
    return 'government_statement';
  }
  
  if (text.includes('speculation') || text.includes('theory') || text.includes('claim')) {
    return 'speculation';
  }
  
  if (text.includes('discovery') || text.includes('observation') || text.includes('telescope')) {
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
 * Main data collection job - should be called periodically
 */
export async function collectData() {
  console.log('[DataCollector] Starting data collection cycle...');
  
  try {
    await initializeDefaultSources();

    console.log('[DataCollector] Data collection cycle completed');
  } catch (error) {
    console.error('[DataCollector] Data collection failed:', error);
  }
}
