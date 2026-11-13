import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getChildProfile,
  listAssessmentQuestions,
  listProgress,
  listTalents,
  saveAssessmentAttempt,
  upsertChildProfile,
  upsertProgress,
} from "./db";

const demoTalents = [
  {
    slug: "creative-arts",
    name: "Creative Arts",
    nameAr: "الفنون الإبداعية",
    description: "Turn big feelings into bold colors, stories, and beautiful ideas.",
    descriptionAr: "حوّل مشاعرك وأفكارك إلى ألوان وقصص وابتكارات جميلة.",
    category: "Expression",
    categoryAr: "تعبير",
    icon: "✦",
    accent: "coral",
    totalLessons: 8,
    progress: 68,
  },
  {
    slug: "young-inventors",
    name: "Young Inventors",
    nameAr: "المخترعون الصغار",
    description: "Ask why, build prototypes, and make everyday things smarter.",
    descriptionAr: "اسأل لماذا، ابنِ نماذج أولية، واجعل الأشياء اليومية أذكى.",
    category: "Build & solve",
    categoryAr: "ابتكار وحل",
    icon: "⌁",
    accent: "cyan",
    totalLessons: 10,
    progress: 24,
  },
  {
    slug: "story-lab",
    name: "Story Lab",
    nameAr: "مختبر الحكايات",
    description: "Find your voice through characters, words, and curious worlds.",
    descriptionAr: "اكتشف صوتك من خلال الشخصيات والكلمات والعوالم المدهشة.",
    category: "Communication",
    categoryAr: "تواصل",
    icon: "◌",
    accent: "lime",
    totalLessons: 6,
    progress: 0,
  },
  {
    slug: "move-and-groove",
    name: "Move & Groove",
    nameAr: "الحركة والإيقاع",
    description: "Explore rhythm, coordination, and the joy of moving your way.",
    descriptionAr: "استكشف الإيقاع والتناسق ومتعة الحركة بطريقتك.",
    category: "Energy",
    categoryAr: "طاقة",
    icon: "↗",
    accent: "violet",
    totalLessons: 7,
    progress: 0,
  },
];

const demoQuestions = [
  {
    id: 1,
    prompt: "When you have a free afternoon, what sounds most exciting?",
    promptAr: "عندما يكون لديك وقت فراغ، ما الشيء الأكثر إثارة؟",
    options: [
      { label: "Making something colorful", labelAr: "صنع شيء مليء بالألوان", talent: "creative-arts" },
      { label: "Building a clever solution", labelAr: "بناء حل ذكي", talent: "young-inventors" },
      { label: "Writing a mini adventure", labelAr: "كتابة مغامرة صغيرة", talent: "story-lab" },
      { label: "Trying a new movement", labelAr: "تجربة حركة جديدة", talent: "move-and-groove" },
    ],
  },
  {
    id: 2,
    prompt: "A tricky challenge makes you want to…",
    promptAr: "التحدي الصعب يجعلك تريد أن…",
    options: [
      { label: "Sketch a few possibilities", labelAr: "ترسم بعض الاحتمالات", talent: "creative-arts" },
      { label: "Test how it works", labelAr: "تختبر كيف يعمل", talent: "young-inventors" },
      { label: "Explain it with a story", labelAr: "تشرحه من خلال قصة", talent: "story-lab" },
      { label: "Act it out", labelAr: "تمثله بحركة", talent: "move-and-groove" },
    ],
  },
  {
    id: 3,
    prompt: "Which compliment feels most like you?",
    promptAr: "أي مجاملة تشبهك أكثر؟",
    options: [
      { label: "You notice beautiful details", labelAr: "تلاحظ التفاصيل الجميلة", talent: "creative-arts" },
      { label: "You never give up on a puzzle", labelAr: "لا تستسلم أمام الألغاز", talent: "young-inventors" },
      { label: "You make ideas easy to understand", labelAr: "تجعل الأفكار سهلة الفهم", talent: "story-lab" },
      { label: "You bring energy to the room", labelAr: "تضيف طاقة للمكان", talent: "move-and-groove" },
    ],
  },
  {
    id: 4,
    prompt: "What would you add to your dream clubhouse?",
    promptAr: "ماذا ستضيف إلى نادي أحلامك؟",
    options: [
      { label: "A giant art wall", labelAr: "حائط فنون كبير", talent: "creative-arts" },
      { label: "A gadget workshop", labelAr: "ورشة أدوات ذكية", talent: "young-inventors" },
      { label: "A shelf of magical books", labelAr: "رف كتب سحرية", talent: "story-lab" },
      { label: "A music and movement floor", labelAr: "مساحة موسيقى وحركة", talent: "move-and-groove" },
    ],
  },
  {
    id: 5,
    prompt: "When you learn something new, you prefer to…",
    promptAr: "عندما تتعلم شيئًا جديدًا، تفضّل أن…",
    options: [
      { label: "See it and make it", labelAr: "تراه وتصنعه", talent: "creative-arts" },
      { label: "Take it apart and rebuild it", labelAr: "تفككه وتعيد بناءه", talent: "young-inventors" },
      { label: "Talk it through", labelAr: "تتحدث عنه", talent: "story-lab" },
      { label: "Practice it with your body", labelAr: "تتدرب عليه بجسمك", talent: "move-and-groove" },
    ],
  },
];

const demoProgress = [
  { talentSlug: "creative-arts", completedLessons: 5, totalLessons: 8, percent: 68, status: "active" },
  { talentSlug: "young-inventors", completedLessons: 2, totalLessons: 10, percent: 24, status: "active" },
];

const dbTalentToClient = (talent: Awaited<ReturnType<typeof listTalents>>[number]) => ({
  ...talent,
  categoryAr: talent.category,
  progress: demoProgress.find(item => item.talentSlug === talent.slug)?.percent ?? 0,
});

const dbQuestionToClient = (question: Awaited<ReturnType<typeof listAssessmentQuestions>>[number]) => ({
  id: question.id,
  prompt: question.prompt,
  promptAr: question.promptAr,
  options: JSON.parse(question.optionsJson) as typeof demoQuestions[number]["options"],
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    talents: publicProcedure.query(async () => {
      const rows = await listTalents();
      return rows.length ? rows.map(dbTalentToClient) : demoTalents;
    }),
    questions: publicProcedure.query(async () => {
      const rows = await listAssessmentQuestions();
      return rows.length ? rows.map(dbQuestionToClient) : demoQuestions;
    }),
    snapshot: publicProcedure.query(async () => {
      const [talentRows, questionRows] = await Promise.all([listTalents(), listAssessmentQuestions()]);
      return {
        talents: talentRows.length ? talentRows.map(dbTalentToClient) : demoTalents,
        questions: questionRows.length ? questionRows.map(dbQuestionToClient) : demoQuestions,
        progress: demoProgress,
        stats: { points: 1240, streak: 7, lessons: 12, badges: 4 },
      };
    }),
  }),
  profile: router({
    me: protectedProcedure.query(({ ctx }) => getChildProfile(ctx.user.id)),
    save: protectedProcedure
      .input(z.object({ childName: z.string().min(1).max(120), age: z.number().int().min(3).max(18), guardianName: z.string().max(120).optional(), locale: z.enum(["en", "ar"]) }))
      .mutation(({ ctx, input }) => upsertChildProfile({ ...input, userId: ctx.user.id })),
  }),
  assessment: router({
    save: protectedProcedure
      .input(z.object({ answers: z.array(z.string()), primaryTalent: z.string(), score: z.number().int().min(0).max(100) }))
      .mutation(({ ctx, input }) => saveAssessmentAttempt({ userId: ctx.user.id, answersJson: JSON.stringify(input.answers), primaryTalent: input.primaryTalent, score: input.score })),
  }),
  progress: router({
    list: protectedProcedure.query(({ ctx }) => listProgress(ctx.user.id)),
    completeLesson: protectedProcedure
      .input(z.object({ talentSlug: z.string(), completedLessons: z.number().int().min(0), totalLessons: z.number().int().min(1) }))
      .mutation(({ ctx, input }) => upsertProgress({ ...input, userId: ctx.user.id })),
  }),
  admin: router({
    stats: adminProcedure.query(() => ({
      activeLearners: 284,
      assessmentStarts: 913,
      completionRate: 72,
      contentReview: 6,
      demoMode: true,
    })),
  }),
});

export type AppRouter = typeof appRouter;
