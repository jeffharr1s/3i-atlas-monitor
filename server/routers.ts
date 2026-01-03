import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getLatestArticles, getArticlesByCategory, getArticlesBySource, getActiveSources, getRecentAlerts } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Monitoring dashboard routers
  articles: router({
    latest: publicProcedure
      .input((val: unknown) => {
        const limit = typeof val === 'object' && val !== null && 'limit' in val ? (val as any).limit : 20;
        return { limit: Math.min(limit, 100) };
      })
      .query(async ({ input }) => {
        return getLatestArticles(input.limit);
      }),
    
    byCategory: publicProcedure
      .input((val: unknown) => {
        const obj = val as any;
        return { category: obj?.category || 'other', limit: Math.min(obj?.limit || 20, 100) };
      })
      .query(async ({ input }) => {
        return getArticlesByCategory(input.category, input.limit);
      }),
    
    bySource: publicProcedure
      .input((val: unknown) => {
        const obj = val as any;
        return { sourceId: obj?.sourceId || 0, limit: Math.min(obj?.limit || 20, 100) };
      })
      .query(async ({ input }) => {
        return getArticlesBySource(input.sourceId, input.limit);
      }),
  }),
  
  sources: router({
    active: publicProcedure.query(async () => {
      return getActiveSources();
    }),
  }),
  
  alerts: router({
    recent: publicProcedure
      .input((val: unknown) => {
        const limit = typeof val === 'object' && val !== null && 'limit' in val ? (val as any).limit : 10;
        return { limit: Math.min(limit, 50) };
      })
      .query(async ({ input }) => {
        return getRecentAlerts(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
