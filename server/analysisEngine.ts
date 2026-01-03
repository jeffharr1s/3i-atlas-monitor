import { invokeLLM } from './_core/llm';
import { getDb } from './db';
import { claims, analysisResults, contradictions, InsertClaim, InsertAnalysisResult } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * AI-powered analysis engine for 3I ATLAS information
 * Handles claim extraction, verification, and contradiction detection
 */

interface ExtractedClaim {
  text: string;
  type: 'trajectory' | 'composition' | 'activity' | 'danger' | 'origin' | 'observation' | 'speculation' | 'other';
  confidence: number;
}

interface AnalysisResult {
  claims: ExtractedClaim[];
  summary: string;
  keyFindings: string[];
  credibilityAssessment: string;
}

/**
 * Extract claims from article content using LLM
 */
export async function extractClaims(articleId: number, title: string, content: string): Promise<ExtractedClaim[]> {
  try {
    const systemPrompt = `You are an expert at extracting factual claims from scientific articles about the 3I/ATLAS comet.
Extract all major claims from the provided article. For each claim, identify:
1. The exact claim text
2. The claim type (trajectory, composition, activity, danger, origin, observation, speculation, or other)
3. Your confidence level (0.0 to 1.0) that this is a factual claim

Return a JSON array of claims. Only include substantial claims.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Article Title: ${title}\n\nArticle Content:\n${content.substring(0, 2000)}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'claims_extraction',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              claims: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    type: {
                      type: 'string',
                      enum: ['trajectory', 'composition', 'activity', 'danger', 'origin', 'observation', 'speculation', 'other'],
                    },
                    confidence: { type: 'number', minimum: 0, maximum: 1 },
                  },
                  required: ['text', 'type', 'confidence'],
                },
              },
            },
            required: ['claims'],
            additionalProperties: false,
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (!content_text || typeof content_text !== 'string') return [];

    const parsed = JSON.parse(content_text);
    return parsed.claims || [];
  } catch (error) {
    console.error('[AnalysisEngine] Failed to extract claims:', error);
    return [];
  }
}

/**
 * Store extracted claims in database
 */
export async function storeClaimsInDatabase(articleId: number, extractedClaims: ExtractedClaim[]): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    for (const claim of extractedClaims) {
      await db.insert(claims).values({
        articleId: articleId,
        claimText: claim.text,
        claimType: claim.type as any,
        confidence: claim.confidence.toString() as any,
        isVerified: false,
        verificationStatus: 'unverified',
      });
    }
  } catch (error) {
    console.error('[AnalysisEngine] Failed to store claims:', error);
  }
}

/**
 * Analyze article for credibility and key findings
 */
export async function analyzeArticle(articleId: number, title: string, content: string): Promise<AnalysisResult> {
  try {
    const systemPrompt = `You are an expert analyst of 3I/ATLAS comet information. Analyze the article and provide:
1. A brief summary (2-3 sentences)
2. Key findings (list of 3-5 important points)
3. A credibility assessment (brief explanation of reliability)

Consider source type, evidence provided, and alignment with official NASA/ESA statements.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Article Title: ${title}\n\nArticle Content:\n${content.substring(0, 2000)}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'article_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              keyFindings: {
                type: 'array',
                items: { type: 'string' },
              },
              credibilityAssessment: { type: 'string' },
            },
            required: ['summary', 'keyFindings', 'credibilityAssessment'],
            additionalProperties: false,
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (!content_text || typeof content_text !== 'string') {
      return {
        claims: [],
        summary: '',
        keyFindings: [],
        credibilityAssessment: '',
      };
    }

    const parsed = JSON.parse(content_text);
    const extractedClaims = await extractClaims(articleId, title, content);

    return {
      claims: extractedClaims,
      summary: parsed.summary || '',
      keyFindings: parsed.keyFindings || [],
      credibilityAssessment: parsed.credibilityAssessment || '',
    };
  } catch (error) {
    console.error('[AnalysisEngine] Failed to analyze article:', error);
    return {
      claims: [],
      summary: '',
      keyFindings: [],
      credibilityAssessment: '',
    };
  }
}

/**
 * Cross-reference claims across multiple articles to find contradictions
 */
export async function detectContradictions(claimId1: number, claimId2: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const claimsList = await db
      .select()
      .from(claims)
      .where(eq(claims.id, claimId1) as any);

    const claim1 = claimsList[0];
    if (!claim1) return false;

    const claim2List = await db
      .select()
      .from(claims)
      .where(eq(claims.id, claimId2) as any);

    const claim2 = claim2List[0];
    if (!claim2) return false;

    const systemPrompt = `You are an expert at identifying contradictions between scientific claims about 3I/ATLAS.
Analyze these two claims and determine if they contradict each other.
Return a JSON object with isContradictory (boolean), contradictionLevel (minor|moderate|major|critical|none), and explanation (string).`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Claim 1: ${claim1.claimText}\n\nClaim 2: ${claim2.claimText}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'contradiction_detection',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              isContradictory: { type: 'boolean' },
              contradictionLevel: {
                type: 'string',
                enum: ['minor', 'moderate', 'major', 'critical', 'none'],
              },
              explanation: { type: 'string' },
            },
            required: ['isContradictory', 'contradictionLevel', 'explanation'],
            additionalProperties: false,
          },
        },
      },
    });

    const content_text = response.choices[0]?.message?.content;
    if (!content_text || typeof content_text !== 'string') return false;

    const parsed = JSON.parse(content_text);

    if (parsed.isContradictory && parsed.contradictionLevel !== 'none') {
      await db.insert(contradictions).values({
        claimId1: claimId1,
        claimId2: claimId2,
        contradictionLevel: parsed.contradictionLevel as any,
        description: parsed.explanation,
        resolutionStatus: 'unresolved',
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('[AnalysisEngine] Failed to detect contradictions:', error);
    return false;
  }
}

/**
 * Generate comprehensive analysis summary for an article
 */
export async function generateAnalysisSummary(articleId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const claimsList = await db
      .select()
      .from(claims)
      .where(eq(claims.articleId, articleId) as any);

    if (claimsList.length === 0) return;

    await db.insert(analysisResults).values({
      articleId,
      analysisType: 'summary_generation',
      result: JSON.stringify({
        totalClaims: claimsList.length,
        claimTypes: claimsList.reduce((acc: any, c: any) => {
          acc[c.claimType] = (acc[c.claimType] || 0) + 1;
          return acc;
        }, {}),
        averageConfidence: claimsList.length > 0
          ? claimsList.reduce((sum: number, c: any) => sum + parseFloat(c.confidence), 0) / claimsList.length
          : 0,
      }) as any,
      confidence: '0.9' as any,
    });
  } catch (error) {
    console.error('[AnalysisEngine] Failed to generate analysis summary:', error);
  }
}

/**
 * Run full analysis pipeline on an article
 */
export async function runFullAnalysisPipeline(articleId: number, title: string, content: string): Promise<void> {
  try {
    console.log(`[AnalysisEngine] Starting analysis pipeline for article ${articleId}`);

    const analysis = await analyzeArticle(articleId, title, content);
    await storeClaimsInDatabase(articleId, analysis.claims);
    await generateAnalysisSummary(articleId);

    console.log(`[AnalysisEngine] Analysis pipeline completed for article ${articleId}`);
  } catch (error) {
    console.error('[AnalysisEngine] Analysis pipeline failed:', error);
  }
}
