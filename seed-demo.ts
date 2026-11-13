import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { getDb, getUserByOpenId } from "../server/db";
import {
  achievements,
  assessmentAttempts,
  assessmentQuestions,
  childProfiles,
  notifications,
  progressRecords,
  talents,
  users,
} from "../drizzle/schema";

type DemoData = {
  demoUser: { openId: string; name: string; email: string; loginMethod: string; role: "user" | "admin" };
  childProfile: { childName: string; age: number; guardianName: string; locale: string; points: number; streak: number };
  talents: Array<Record<string, string | number>>;
  questions: Array<{ prompt: string; promptAr: string; dimension: string; orderIndex: number; options: unknown[] }>;
  progress: Array<{ talentSlug: string; completedLessons: number; totalLessons: number }>;
  achievements: Array<{ code: string; title: string; description: string; icon: string }>;
  notifications: Array<{ title: string; body: string }>;
  sampleAssessment: { answers: string[]; primaryTalent: string; score: number };
};

const data = JSON.parse(readFileSync(resolve(process.cwd(), "demo-data.json"), "utf8")) as DemoData;

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not available; cannot seed demo data.");

  await db.insert(users).values(data.demoUser).onDuplicateKeyUpdate({
    set: { name: data.demoUser.name, email: data.demoUser.email, loginMethod: data.demoUser.loginMethod },
  });
  const demoUser = await getUserByOpenId(data.demoUser.openId);
  if (!demoUser) throw new Error("Demo user was not created.");

  for (const talent of data.talents) {
    await db.insert(talents).values({
      slug: String(talent.slug),
      name: String(talent.name),
      nameAr: String(talent.nameAr),
      description: String(talent.description),
      descriptionAr: String(talent.descriptionAr),
      category: String(talent.category),
      icon: String(talent.icon),
      accent: String(talent.accent),
      totalLessons: Number(talent.totalLessons),
    }).onDuplicateKeyUpdate({
      set: {
        name: String(talent.name),
        nameAr: String(talent.nameAr),
        description: String(talent.description),
        descriptionAr: String(talent.descriptionAr),
        category: String(talent.category),
        icon: String(talent.icon),
        accent: String(talent.accent),
        totalLessons: Number(talent.totalLessons),
      },
    });
  }

  const existingQuestions = await db.select({ id: assessmentQuestions.id }).from(assessmentQuestions).limit(1);
  if (existingQuestions.length === 0) {
    await db.insert(assessmentQuestions).values(data.questions.map(question => ({
      prompt: question.prompt,
      promptAr: question.promptAr,
      dimension: question.dimension,
      optionsJson: JSON.stringify(question.options),
      orderIndex: question.orderIndex,
    })));
  }

  await db.insert(childProfiles).values({ userId: demoUser.id, ...data.childProfile }).onDuplicateKeyUpdate({
    set: data.childProfile,
  });

  for (const item of data.progress) {
    const percent = Math.round((item.completedLessons / item.totalLessons) * 100);
    await db.insert(progressRecords).values({
      userId: demoUser.id,
      talentSlug: item.talentSlug,
      completedLessons: item.completedLessons,
      totalLessons: item.totalLessons,
      percent,
      status: percent >= 100 ? "complete" : "active",
    }).onDuplicateKeyUpdate({
      set: { completedLessons: item.completedLessons, totalLessons: item.totalLessons, percent, status: percent >= 100 ? "complete" : "active" },
    });
  }

  for (const achievement of data.achievements) {
    const existing = await db.select({ id: achievements.id }).from(achievements)
      .where(eq(achievements.code, achievement.code)).limit(1);
    if (existing.length === 0) {
      await db.insert(achievements).values({ userId: demoUser.id, ...achievement });
    }
  }

  const existingNotifications = await db.select({ id: notifications.id }).from(notifications)
    .where(eq(notifications.userId, demoUser.id)).limit(1);
  if (existingNotifications.length === 0) {
    await db.insert(notifications).values(data.notifications.map(notification => ({
      userId: demoUser.id,
      title: notification.title,
      body: notification.body,
      isRead: 0,
    })));
  }

  const existingAttempts = await db.select({ id: assessmentAttempts.id }).from(assessmentAttempts)
    .where(eq(assessmentAttempts.userId, demoUser.id)).limit(1);
  if (existingAttempts.length === 0) {
    await db.insert(assessmentAttempts).values({
      userId: demoUser.id,
      answersJson: JSON.stringify(data.sampleAssessment.answers),
      primaryTalent: data.sampleAssessment.primaryTalent,
      score: data.sampleAssessment.score,
    });
  }

  console.log(JSON.stringify({
    seeded: true,
    demoUserId: demoUser.id,
    tables: ["users", "child_profiles", "talents", "assessment_questions", "assessment_attempts", "progress_records", "achievements", "notifications"],
    note: "Idempotent seed: rerunning updates the demo user/content and does not duplicate questions, achievements, notifications, or attempts.",
  }, null, 2));
}

main().catch(error => {
  console.error("Demo seed failed:", error);
  process.exit(1);
});
