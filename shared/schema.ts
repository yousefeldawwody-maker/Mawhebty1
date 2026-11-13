import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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

export const talents = mysqlTable("talents", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  nameAr: varchar("nameAr", { length: 120 }).notNull(),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  icon: varchar("icon", { length: 32 }).notNull(),
  accent: varchar("accent", { length: 32 }).notNull(),
  totalLessons: int("totalLessons").default(8).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const assessmentQuestions = mysqlTable("assessment_questions", {
  id: int("id").autoincrement().primaryKey(),
  prompt: text("prompt").notNull(),
  promptAr: text("promptAr").notNull(),
  dimension: varchar("dimension", { length: 64 }).notNull(),
  optionsJson: text("optionsJson").notNull(),
  orderIndex: int("orderIndex").notNull(),
});

export const childProfiles = mysqlTable("child_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  childName: varchar("childName", { length: 120 }).notNull(),
  age: int("age").notNull(),
  guardianName: varchar("guardianName", { length: 120 }),
  locale: varchar("locale", { length: 8 }).default("en").notNull(),
  points: int("points").default(0).notNull(),
  streak: int("streak").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const assessmentAttempts = mysqlTable("assessment_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  answersJson: text("answersJson").notNull(),
  primaryTalent: varchar("primaryTalent", { length: 64 }).notNull(),
  score: int("score").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const progressRecords = mysqlTable("progress_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  talentSlug: varchar("talentSlug", { length: 64 }).notNull(),
  completedLessons: int("completedLessons").default(0).notNull(),
  totalLessons: int("totalLessons").default(8).notNull(),
  percent: int("percent").default(0).notNull(),
  status: mysqlEnum("status", ["active", "complete"]).default("active").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  userTalentUnique: uniqueIndex("progress_user_talent_unique").on(table.userId, table.talentSlug),
}));

export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 32 }).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  body: text("body").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Talent = typeof talents.$inferSelect;
export type ChildProfile = typeof childProfiles.$inferSelect;
