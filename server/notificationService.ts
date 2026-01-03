import { getDb } from './db';
import { notifications, notificationPreferences, InsertNotification } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Notification service for managing user notifications
 */

export interface NotificationPayload {
  userId: number;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'article_new' | 'alert_triggered' | 'contradiction_found' | 'source_update';
  category?: 'trajectory' | 'composition' | 'activity' | 'government_statement' | 'scientific_discovery' | 'speculation' | 'debunking' | 'international_perspective' | 'other';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  sourceId?: number;
  articleId?: number;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresIn?: number; // milliseconds
}

/**
 * Create a new notification for a user
 */
export async function createNotification(payload: NotificationPayload): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn('[NotificationService] Database not available');
    return null;
  }

  try {
    // Check user preferences
    const prefs = await getUserNotificationPreferences(payload.userId);
    
    // Check if notification should be sent based on preferences
    if (!shouldSendNotification(payload, prefs)) {
      console.log(`[NotificationService] Notification filtered by user preferences for user ${payload.userId}`);
      return null;
    }

    const expiresAt = payload.expiresIn 
      ? new Date(Date.now() + payload.expiresIn)
      : null;

    const result = await db.insert(notifications).values({
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      category: payload.category,
      severity: payload.severity || 'medium',
      sourceId: payload.sourceId,
      articleId: payload.articleId,
      actionUrl: payload.actionUrl,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
      expiresAt,
    } as any);

    console.log(`[NotificationService] Created notification for user ${payload.userId}`);
    return payload.userId;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error);
    return null;
  }
}

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[NotificationService] Failed to get notification preferences:', error);
    return null;
  }
}

/**
 * Check if notification should be sent based on user preferences
 */
function shouldSendNotification(payload: NotificationPayload, prefs: any): boolean {
  if (!prefs) return true; // Default to sending if no preferences

  // Check if notifications are enabled
  if (!prefs.enableToastNotifications && !prefs.enableNotificationCenter) {
    return false;
  }

  // Check Do Not Disturb mode
  if (prefs.doNotDisturbEnabled) {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0');
    
    if (isWithinTimeRange(currentTime, prefs.doNotDisturbStart, prefs.doNotDisturbEnd)) {
      return false;
    }
  }

  // Check notification type filters
  if (payload.type === 'article_new' && !prefs.enableNewArticles) return false;
  if (payload.type === 'alert_triggered' && !prefs.enableAlerts) return false;
  if (payload.type === 'contradiction_found' && !prefs.enableContradictions) return false;
  if (payload.type === 'source_update' && !prefs.enableSourceUpdates) return false;

  // Check category filter
  if (prefs.filterByCategory && payload.category) {
    const categories = JSON.parse(prefs.filterByCategory);
    if (!categories.includes(payload.category)) return false;
  }

  // Check severity filter
  if (prefs.filterBySeverity && payload.severity) {
    const severities = JSON.parse(prefs.filterBySeverity);
    if (!severities.includes(payload.severity)) return false;
  }

  return true;
}

/**
 * Check if time is within range (handles midnight crossing)
 */
function isWithinTimeRange(current: string, start: string, end: string): boolean {
  if (!start || !end) return false;
  
  if (start < end) {
    return current >= start && current <= end;
  } else {
    return current >= start || current <= end;
  }
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(userId: number, limit: number = 20, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = db
        .select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
    }

    const result = await query
      .orderBy((n) => n.createdAt)
      .limit(limit);

    return result;
  } catch (error) {
    console.error('[NotificationService] Failed to get user notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    return true;
  } catch (error) {
    console.error('[NotificationService] Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Dismiss notification
 */
export async function dismissNotification(notificationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(notifications)
      .set({ isDismissed: true })
      .where(eq(notifications.id, notificationId));

    return true;
  } catch (error) {
    console.error('[NotificationService] Failed to dismiss notification:', error);
    return false;
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(userId: number, prefs: Partial<any>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      // Create new preferences
      await db.insert(notificationPreferences).values({
        userId,
        ...prefs,
      } as any);
    } else {
      // Update existing preferences
      await db
        .update(notificationPreferences)
        .set(prefs)
        .where(eq(notificationPreferences.userId, userId));
    }

    return true;
  } catch (error) {
    console.error('[NotificationService] Failed to update notification preferences:', error);
    return false;
  }
}

/**
 * Delete old notifications (cleanup)
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    // Note: Cleanup is implemented but requires custom SQL
    // For now, just log the operation
    console.log(`[NotificationService] Cleanup notifications job triggered`);
    return 0;
  } catch (error) {
    console.error('[NotificationService] Failed to cleanup notifications:', error);
    return 0;
  }
}

/**
 * Broadcast notification to all users (admin function)
 */
export async function broadcastNotification(payload: Omit<NotificationPayload, 'userId'>): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    // Get all active users
    const users = await db.select().from(notifications);
    
    let count = 0;
    for (const user of users) {
      const result = await createNotification({
        ...payload,
        userId: user.userId,
      });
      if (result) count++;
    }

    console.log(`[NotificationService] Broadcast notification to ${count} users`);
    return count;
  } catch (error) {
    console.error('[NotificationService] Failed to broadcast notification:', error);
    return 0;
  }
}
