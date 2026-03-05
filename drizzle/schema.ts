import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, longtext } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
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
 * Lecture recordings table
 * Stores metadata for audio recordings with S3 URL reference
 */
export const lectureRecordings = mysqlTable("lectureRecordings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lectureId: int("lectureId"), // 강의 ID (선택사항)
  title: text("title").notNull(),
  subject: varchar("subject", { length: 255 }),
  description: text("description"),
  audioUrl: text("audioUrl").notNull(), // S3 URL
  audioFileKey: text("audioFileKey").notNull(), // S3 file key for reference
  duration: int("duration"), // Duration in seconds
  recordedAt: timestamp("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LectureRecording = typeof lectureRecordings.$inferSelect;
export type InsertLectureRecording = typeof lectureRecordings.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  lectureRecordings: many(lectureRecordings),
  lectures: many(lectures),
  customCategories: many(customCategories),
}));

export const lectureRecordingsRelations = relations(lectureRecordings, ({ one }) => ({
  user: one(users, {
    fields: [lectureRecordings.userId],
    references: [users.id],
  }),
  lecture: one(lectures, {
    fields: [lectureRecordings.lectureId],
    references: [lectures.id],
  }),
}));

/**
 * Lectures table - 과목 관리
 */
export const lectures = mysqlTable("lectures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // 과목명 (예: AI리터러시)
  description: text("description"), // 과목 설명
  color: varchar("color", { length: 7 }).default("#3B82F6"), // 색상 코드
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lecture = typeof lectures.$inferSelect;
export type InsertLecture = typeof lectures.$inferInsert;

/**
 * Custom categories for finance tracking
 */
export const customCategories = mysqlTable("customCategories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // 카테고리명 (예: 식비, 교통비)
  type: mysqlEnum("type", ["income", "expense"]).notNull(), // 수입/지출
  icon: varchar("icon", { length: 50 }).default("tag"), // 아이콘 이름
  color: varchar("color", { length: 7 }).default("#6B7280"), // 색상 코드
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomCategory = typeof customCategories.$inferSelect;
export type InsertCustomCategory = typeof customCategories.$inferInsert;



// Relations
export const lecturesRelations = relations(lectures, ({ many, one }) => ({
  user: one(users, {
    fields: [lectures.userId],
    references: [users.id],
  }),
  recordings: many(lectureRecordings),
}));

export const customCategoriesRelations = relations(customCategories, ({ one }) => ({
  user: one(users, {
    fields: [customCategories.userId],
    references: [users.id],
  }),
}));