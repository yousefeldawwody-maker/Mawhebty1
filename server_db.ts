import { and, asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  assessmentAttempts,
  assessmentQuestions,
  childProfiles,
  InsertUser,
  progressRecords,
  talents,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getChildProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(childProfiles).where(eq(childProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function listTalents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(talents).orderBy(asc(talents.id));
}

export async function listAssessmentQuestions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessmentQuestions).orderBy(asc(assessmentQuestions.orderIndex));
}

export async function upsertChildProfile(input: {
  userId: number;
  childName: string;
  age: number;
  guardianName?: string;
  locale: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await getChildProfile(input.userId);
  if (existing) {
    await db.update(childProfiles).set(input).where(eq(childProfiles.userId, input.userId));
  } else {
    await db.insert(childProfiles).values(input);
  }
  return getChildProfile(input.userId);
}

export async function saveAssessmentAttempt(input: {
  userId: number;
  answersJson: string;
  primaryTalent: string;
  score: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(assessmentAttempts).values(input);
  return result;
}

export async function listProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(progressRecords).where(eq(progressRecords.userId, userId)).orderBy(desc(progressRecords.updatedAt));
}

export async function upsertProgress(input: {
  userId: number;
  talentSlug: string;
  completedLessons: number;
  totalLessons: number;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const percent = Math.min(100, Math.round((input.completedLessons / Math.max(1, input.totalLessons)) * 100));
  const status = percent >= 100 ? "complete" : "active";
  const existing = await db
    .select()
    .from(progressRecords)
    .where(and(eq(progressRecords.userId, input.userId), eq(progressRecords.talentSlug, input.talentSlug)))
    .limit(1);
  if (existing[0]) {
    await db.update(progressRecords).set({ ...input, percent, status }).where(eq(progressRecords.id, existing[0].id));
  } else {
    await db.insert(progressRecords).values({ ...input, percent, status });
  }
  return db
    .select()
    .from(progressRecords)
    .where(and(eq(progressRecords.userId, input.userId), eq(progressRecords.talentSlug, input.talentSlug)))
    .limit(1);
}
