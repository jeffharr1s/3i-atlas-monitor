import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Sources table: Tracks news sources, space agencies, and media outlets
 */
export const sources = mysqlTable("sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  sourceType: mysqlEnum("sourceType", ["official_agency", "peer_reviewed", "news_outlet", "scientific_blog", "social_media", "skeptic_analysis", "government", "other"]).notNull(),
  country: varchar("country", { length: 100 }),
  credibilityScore: decimal("credibilityScore", { precision: 3, scale: 2 }).default("0.50"),
  description: text("description"),
  rssUrl: varchar("rssUrl", { length: 500 }),
  apiUrl: varchar("apiUrl", { length: 500 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;

/**
 * Articles table: Stores news articles and information about 3I ATLAS
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  summary: text("summary"),
  url: varchar("url", { length: 500 }).notNull().unique(),
  publishedAt: timestamp("publishedAt"),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
  category: mysqlEnum("category", ["trajectory", "composition", "activity", "government_statement", "scientific_discovery", "speculation", "debunking", "international_perspective", "timeline_event", "other"]).default("other"),
  credibilityScore: decimal("credibilityScore", { precision: 3, scale: 2 }).default("0.50"),
  isAnalyzed: boolean("isAnalyzed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Claims table: Extracted claims from articles for analysis
 */
export const claims = mysqlTable("claims", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  claimText: text("claimText").notNull(),
  claimType: mysqlEnum("claimType", ["trajectory", "composition", "activity", "danger", "origin", "observation", "speculation", "other"]).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.50"),
  isVerified: boolean("isVerified").default(false),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "supported", "contradicted", "debunked", "inconclusive"]).default("unverified"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Claim = typeof claims.$inferSelect;
export type InsertClaim = typeof claims.$inferInsert;

/**
 * Analysis results table: AI-generated analysis and cross-references
 */
export const analysisResults = mysqlTable("analysisResults", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId").notNull(),
  analysisType: mysqlEnum("analysisType", ["claim_extraction", "cross_reference", "contradiction_detection", "credibility_assessment", "summary_generation"]).notNull(),
  result: json("result"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.50"),
  relatedArticleIds: text("relatedArticleIds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;

/**
 * Contradictions table: Tracks conflicting claims across sources
 */
export const contradictions = mysqlTable("contradictions", {
  id: int("id").autoincrement().primaryKey(),
  claimId1: int("claimId1").notNull(),
  claimId2: int("claimId2").notNull(),
  contradictionLevel: mysqlEnum("contradictionLevel", ["minor", "moderate", "major", "critical"]).notNull(),
  description: text("description"),
  resolutionStatus: mysqlEnum("resolutionStatus", ["unresolved", "resolved", "inconclusive"]).default("unresolved"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contradiction = typeof contradictions.$inferSelect;
export type InsertContradiction = typeof contradictions.$inferInsert;

/**
 * Alerts table: Significant changes and important updates
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  articleId: int("articleId"),
  alertType: mysqlEnum("alertType", ["major_discovery", "trajectory_change", "composition_update", "government_statement", "contradiction_detected", "significant_change", "verification_update"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  isNotified: boolean("isNotified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * User preferences table: Track user alert and notification settings
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  enableAlerts: boolean("enableAlerts").default(true),
  alertTypes: text("alertTypes"),
  preferredCategories: text("preferredCategories"),
  doNotDisturbMode: boolean("doNotDisturbMode").default(false),
  doNotDisturbStart: varchar("doNotDisturbStart", { length: 5 }),
  doNotDisturbEnd: varchar("doNotDisturbEnd", { length: 5 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Notifications table: User notifications with persistence
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["info", "success", "warning", "error", "article_new", "alert_triggered", "contradiction_found", "source_update"]).default("info"),
  category: mysqlEnum("category", ["trajectory", "composition", "activity", "government_statement", "scientific_discovery", "speculation", "debunking", "international_perspective", "other"]),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  sourceId: int("sourceId"),
  articleId: int("articleId"),
  isRead: boolean("isRead").default(false),
  isDismissed: boolean("isDismissed").default(false),
  actionUrl: varchar("actionUrl", { length: 500 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification preferences table: Per-user notification settings
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enableToastNotifications: boolean("enableToastNotifications").default(true),
  enableNotificationCenter: boolean("enableNotificationCenter").default(true),
  toastDuration: int("toastDuration").default(5000),
  enableNewArticles: boolean("enableNewArticles").default(true),
  enableAlerts: boolean("enableAlerts").default(true),
  enableContradictions: boolean("enableContradictions").default(true),
  enableSourceUpdates: boolean("enableSourceUpdates").default(true),
  filterByCategory: text("filterByCategory"),
  filterBySeverity: text("filterBySeverity"),
  doNotDisturbEnabled: boolean("doNotDisturbEnabled").default(false),
  doNotDisturbStart: varchar("doNotDisturbStart", { length: 5 }),
  doNotDisturbEnd: varchar("doNotDisturbEnd", { length: 5 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;
