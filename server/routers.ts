import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getLatestArticles, getArticlesByCategory, getArticlesBySource, getActiveSources, getRecentAlerts } from "./db";
import { createNotification, getUserNotifications, markNotificationAsRead, dismissNotification, updateNotificationPreferences, getUserNotificationPreferences } from "./notificationService";
import { z } from "zod";

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

  // Notification routers
  notifications: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        unreadOnly: z.boolean().default(false),
      }).optional())
      .query(async ({ ctx, input }) => {
        const limit = input?.limit || 20;
        const unreadOnly = input?.unreadOnly || false;
        return getUserNotifications(ctx.user.id, limit, unreadOnly);
      }),

    markAsRead: protectedProcedure
      .input(z.object({
        notificationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return markNotificationAsRead(input.notificationId);
      }),

    dismiss: protectedProcedure
      .input(z.object({
        notificationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return dismissNotification(input.notificationId);
      }),

    getPreferences: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserNotificationPreferences(ctx.user.id);
      }),

    updatePreferences: protectedProcedure
      .input(z.object({
        enableToastNotifications: z.boolean().optional(),
        enableNotificationCenter: z.boolean().optional(),
        toastDuration: z.number().optional(),
        enableNewArticles: z.boolean().optional(),
        enableAlerts: z.boolean().optional(),
        enableContradictions: z.boolean().optional(),
        enableSourceUpdates: z.boolean().optional(),
        filterByCategory: z.string().optional(),
        filterBySeverity: z.string().optional(),
        doNotDisturbEnabled: z.boolean().optional(),
        doNotDisturbStart: z.string().optional(),
        doNotDisturbEnd: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return updateNotificationPreferences(ctx.user.id, input);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string().optional(),
        type: z.enum(['info', 'success', 'warning', 'error', 'article_new', 'alert_triggered', 'contradiction_found', 'source_update']),
        category: z.enum(['trajectory', 'composition', 'activity', 'government_statement', 'scientific_discovery', 'speculation', 'debunking', 'international_perspective', 'other']).optional(),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        sourceId: z.number().optional(),
        articleId: z.number().optional(),
        actionUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createNotification({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
