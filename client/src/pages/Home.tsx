import { useMemo, useState } from "react";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CircleHelp,
  Flame,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  LogIn,
  Menu,
  Moon,
  PanelLeft,
  Play,
  Plus,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

const NORI_IMAGE = "/manus-storage/async-images/3v3wVokRYXPlmNbwFk8Mpi/image-1.webp";

type Language = "en" | "ar";
type Talent = {
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr?: string;
  icon: string;
  accent: string;
  totalLessons: number;
  progress: number;
};
type Question = {
  id: number;
  prompt: string;
  promptAr: string;
  options: { label: string; labelAr: string; talent: string }[];
};

const DEMO_TALENTS: Talent[] = [
  { slug: "creative-arts", name: "Creative Arts", nameAr: "الفنون الإبداعية", description: "Turn big feelings into bold colors, stories, and beautiful ideas.", descriptionAr: "حوّل مشاعرك وأفكارك إلى ألوان وقصص وابتكارات جميلة.", category: "Expression", categoryAr: "تعبير", icon: "✦", accent: "coral", totalLessons: 8, progress: 68 },
  { slug: "young-inventors", name: "Young Inventors", nameAr: "المخترعون الصغار", description: "Ask why, build prototypes, and make everyday things smarter.", descriptionAr: "اسأل لماذا، ابنِ نماذج أولية، واجعل الأشياء اليومية أذكى.", category: "Build & solve", categoryAr: "ابتكار وحل", icon: "⌁", accent: "cyan", totalLessons: 10, progress: 24 },
  { slug: "story-lab", name: "Story Lab", nameAr: "مختبر الحكايات", description: "Find your voice through characters, words, and curious worlds.", descriptionAr: "اكتشف صوتك من خلال الشخصيات والكلمات والعوالم المدهشة.", category: "Communication", categoryAr: "تواصل", icon: "◌", accent: "lime", totalLessons: 6, progress: 0 },
  { slug: "move-and-groove", name: "Move & Groove", nameAr: "الحركة والإيقاع", description: "Explore rhythm, coordination, and the joy of moving your way.", descriptionAr: "استكشف الإيقاع والتناسق ومتعة الحركة بطريقتك.", category: "Energy", categoryAr: "طاقة", icon: "↗", accent: "violet", totalLessons: 7, progress: 0 },
];

const DEMO_QUESTIONS: Question[] = [
  { id: 1, prompt: "When you have a free afternoon, what sounds most exciting?", promptAr: "عندما يكون لديك وقت فراغ، ما الشيء الأكثر إثارة؟", options: [{ label: "Making something colorful", labelAr: "صنع شيء مليء بالألوان", talent: "creative-arts" }, { label: "Building a clever solution", labelAr: "بناء حل ذكي", talent: "young-inventors" }, { label: "Writing a mini adventure", labelAr: "كتابة مغامرة صغيرة", talent: "story-lab" }, { label: "Trying a new movement", labelAr: "تجربة حركة جديدة", talent: "move-and-groove" }] },
  { id: 2, prompt: "A tricky challenge makes you want to…", promptAr: "التحدي الصعب يجعلك تريد أن…", options: [{ label: "Sketch a few possibilities", labelAr: "ترسم بعض الاحتمالات", talent: "creative-arts" }, { label: "Test how it works", labelAr: "تختبر كيف يعمل", talent: "young-inventors" }, { label: "Explain it with a story", labelAr: "تشرحه من خلال قصة", talent: "story-lab" }, { label: "Act it out", labelAr: "تمثله بحركة", talent: "move-and-groove" }] },
  { id: 3, prompt: "Which compliment feels most like you?", promptAr: "أي مجاملة تشبهك أكثر؟", options: [{ label: "You notice beautiful details", labelAr: "تلاحظ التفاصيل الجميلة", talent: "creative-arts" }, { label: "You never give up on a puzzle", labelAr: "لا تستسلم أمام الألغاز", talent: "young-inventors" }, { label: "You make ideas easy to understand", labelAr: "تجعل الأفكار سهلة الفهم", talent: "story-lab" }, { label: "You bring energy to the room", labelAr: "تضيف طاقة للمكان", talent: "move-and-groove" }] },
  { id: 4, prompt: "What would you add to your dream clubhouse?", promptAr: "ماذا ستضيف إلى نادي أحلامك؟", options: [{ label: "A giant art wall", labelAr: "حائط فنون كبير", talent: "creative-arts" }, { label: "A gadget workshop", labelAr: "ورشة أدوات ذكية", talent: "young-inventors" }, { label: "A shelf of magical books", labelAr: "رف كتب سحرية", talent: "story-lab" }, { label: "A music and movement floor", labelAr: "مساحة موسيقى وحركة", talent: "move-and-groove" }] },
  { id: 5, prompt: "When you learn something new, you prefer to…", promptAr: "عندما تتعلم شيئًا جديدًا، تفضّل أن…", options: [{ label: "See it and make it", labelAr: "تراه وتصنعه", talent: "creative-arts" }, { label: "Take it apart and rebuild it", labelAr: "تفككه وتعيد بناءه", talent: "young-inventors" }, { label: "Talk it through", labelAr: "تتحدث عنه", talent: "story-lab" }, { label: "Practice it with your body", labelAr: "تتدرب عليه بجسمك", talent: "move-and-groove" }] },
];

const copy = {
  en: {
    nav: ["Overview", "Discover", "My journey", "Nori guide"],
    greeting: "Good afternoon",
    learner: "Maya's learning space",
    heroTitle: "Your next spark is waiting.",
    heroBody: "A tiny step today can reveal a talent you did not know was yours.",
    assessment: "Take the talent check",
    continue: "Continue learning",
    explore: "Explore talents",
    weekly: "Weekly focus",
    weeklyBody: "You are one lesson away from your next badge.",
    points: "points",
    streak: "day streak",
    lessons: "lessons done",
    badges: "badges",
    journey: "Your learning journey",
    journeySub: "Small progress, made visible.",
    seeAll: "See all paths",
    assistant: "Ask Nori",
    assistantBody: "Your curious guide is ready when you are.",
    signIn: "Sign in to save progress",
    language: "العربية",
    light: "Light mode",
    dark: "Dark mode",
    assessmentTitle: "Let’s find your spark",
    assessmentSub: "Five quick questions. No right answers — just your way of seeing the world.",
    question: "Question",
    of: "of",
    back: "Back",
    next: "Next question",
    finish: "Show my result",
    resultTitle: "Your strongest spark is",
    resultBody: "Nori spotted a pattern in the way you choose, create, and solve.",
    startPath: "Start this path",
    close: "Close",
    demo: "Demo data",
    saveNote: "Sign in to sync this journey across devices.",
  },
  ar: {
    nav: ["نظرة عامة", "اكتشف", "رحلتي", "مساعد نوري"],
    greeting: "مساء الإبداع",
    learner: "مساحة تعلّم مايا",
    heroTitle: "موهبتك القادمة في انتظارك.",
    heroBody: "خطوة صغيرة اليوم قد تكشف موهبة لم تكن تعرف أنها بداخلك.",
    assessment: "ابدأ اختبار المواهب",
    continue: "تابع التعلّم",
    explore: "اكتشف المواهب",
    weekly: "تركيز الأسبوع",
    weeklyBody: "باقي درس واحد على شارتك القادمة.",
    points: "نقطة",
    streak: "أيام متتالية",
    lessons: "درس مكتمل",
    badges: "شارات",
    journey: "رحلة التعلّم",
    journeySub: "اجعل التقدم الصغير مرئيًا.",
    seeAll: "عرض كل المسارات",
    assistant: "اسأل نوري",
    assistantBody: "مرشدك الفضولي جاهز عندما تكون مستعدًا.",
    signIn: "سجّل الدخول لحفظ تقدمك",
    language: "English",
    light: "الوضع الفاتح",
    dark: "الوضع الداكن",
    assessmentTitle: "لنكتشف شرارتك",
    assessmentSub: "خمسة أسئلة سريعة. لا توجد إجابات صحيحة أو خاطئة، فقط طريقتك في رؤية العالم.",
    question: "السؤال",
    of: "من",
    back: "رجوع",
    next: "السؤال التالي",
    finish: "اعرض نتيجتي",
    resultTitle: "أقوى شرارة لديك هي",
    resultBody: "لاحظ نوري نمطًا في طريقة اختيارك وابتكارك وحلّك للمشكلات.",
    startPath: "ابدأ المسار",
    close: "إغلاق",
    demo: "بيانات تجريبية",
    saveNote: "سجّل الدخول لمزامنة رحلتك عبر الأجهزة.",
  },
};

function scoreAssessment(answers: string[]) {
  const counts = answers.reduce<Record<string, number>>((acc, value) => ({ ...acc, [value]: (acc[value] ?? 0) + 1 }), {});
  const primaryTalent = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "creative-arts";
  const score = Math.min(98, 70 + Math.max(0, (counts[primaryTalent] ?? 0) - 1) * 8);
  return { primaryTalent, score };
}

function StatCard({ icon: Icon, value, label, tone }: { icon: typeof Zap; value: string; label: string; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18} /></div><div><strong>{value}</strong><span>{label}</span></div></div>;
}

export default function Home() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("mawhebty-language") as Language) || "en");
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ primaryTalent: string; score: number } | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [activeTalent, setActiveTalent] = useState("creative-arts");
  const [completedLessons, setCompletedLessons] = useState<Record<string, number>>({ "creative-arts": 5, "young-inventors": 2 });
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const snapshot = trpc.catalog.snapshot.useQuery();
  const assessmentMutation = trpc.assessment.save.useMutation();
  const progressMutation = trpc.progress.completeLesson.useMutation();
  const c = copy[language];
  const questions = (snapshot.data?.questions as Question[] | undefined) ?? DEMO_QUESTIONS;
  const talents = (snapshot.data?.talents as Talent[] | undefined) ?? DEMO_TALENTS;
  const currentQuestion = questions[questionIndex];
  const resultTalent = result ? talents.find(item => item.slug === result.primaryTalent) ?? talents[0] : null;
  const selectedAnswer = answers[questionIndex];
  const activeTalentData = talents.find(item => item.slug === activeTalent) ?? talents[0];
  const currentProgress = completedLessons[activeTalentData.slug] ?? 0;
  const progressPercent = Math.round((currentProgress / activeTalentData.totalLessons) * 100);

  const stats = useMemo(() => [
    { icon: Zap, value: "1,240", label: c.points, tone: "coral" },
    { icon: Flame, value: "7", label: c.streak, tone: "orange" },
    { icon: BookOpen, value: "12", label: c.lessons, tone: "cyan" },
    { icon: Trophy, value: "4", label: c.badges, tone: "lime" },
  ], [c.badges, c.lessons, c.points, c.streak]);

  const setLocale = (next: Language) => {
    setLanguage(next);
    localStorage.setItem("mawhebty-language", next);
  };
  const openAssessment = () => {
    setAnswers([]);
    setQuestionIndex(0);
    setResult(null);
    setAssessmentOpen(true);
  };
  const chooseAnswer = (talent: string) => {
    setAnswers(previous => {
      const next = [...previous];
      next[questionIndex] = talent;
      return next;
    });
  };
  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) setQuestionIndex(value => value + 1);
    else {
      const finalResult = scoreAssessment(answers);
      setResult(finalResult);
      if (isAuthenticated) assessmentMutation.mutate(finalResultToPayload(finalResult, answers));
    }
  };
  const finalResultToPayload = (finalResult: { primaryTalent: string; score: number }, finalAnswers: string[]) => ({ answers: finalAnswers, primaryTalent: finalResult.primaryTalent, score: finalResult.score });
  const completeLesson = () => {
    const next = Math.min(activeTalentData.totalLessons, currentProgress + 1);
    setCompletedLessons(previous => ({ ...previous, [activeTalentData.slug]: next }));
    if (isAuthenticated) progressMutation.mutate({ talentSlug: activeTalentData.slug, completedLessons: next, totalLessons: activeTalentData.totalLessons });
  };

  return (
    <div className="app-shell" dir={language === "ar" ? "rtl" : "ltr"}>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <div className="brand-lockup"><div className="brand-mark"><Sparkles size={19} /></div><span>Mawhebty</span><span className="brand-dot">.</span></div>
        <div className="workspace-switcher"><div className="workspace-avatar">M</div><div><strong>{c.learner}</strong><span>{c.demo} · 2026</span></div><ChevronRight size={15} /></div>
        <nav className="main-nav">{c.nav.map((item, index) => <a key={item} href={["#overview", "#discover", "#journey", "#nori"][index]} className={index === 0 ? "active" : ""} onClick={() => setMobileNav(false)}><span className="nav-icon">{[<LayoutDashboard size={16} />, <Target size={16} />, <BarChart3 size={16} />, <Bot size={16} />][index]}</span>{item}{index === 1 && <span className="nav-count">4</span>}</a>)}</nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip"><div className="tip-spark"><Lightbulb size={16} /></div><strong>Little steps count.</strong><p>Every lesson makes your world a little wider.</p></div>
        <div className="sidebar-foot"><div className="avatar user-avatar">{user?.name?.slice(0, 1) ?? "M"}</div><div className="user-meta"><strong>{user?.name ?? "Maya"}</strong><span>{isAuthenticated ? "Synced account" : "Demo learner"}</span></div><button className="icon-btn" aria-label="More options"><Plus size={16} /></button></div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileNav(value => !value)}><Menu size={20} /></button><div className="breadcrumbs"><span>Mawhebty</span><ChevronRight size={14} /><strong>{c.nav[0]}</strong></div><div className="top-actions"><span className="demo-pill"><span className="pulse-dot" />{c.demo}</span><button className="language-btn" onClick={() => setLocale(language === "en" ? "ar" : "en")}><Globe2 size={16} />{c.language}</button><button className="icon-btn" onClick={toggleTheme} aria-label={theme === "light" ? c.dark : c.light}>{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button><button className="icon-btn notification-btn"><Bell size={17} /><i /></button><button className="top-avatar">{user?.name?.slice(0, 1) ?? "M"}</button></div></header>

        <div className="content-wrap">
          <section className="welcome-row"><div><p className="eyebrow"><span className="live-dot" />{c.greeting}, Maya</p><h1>{c.heroTitle}</h1><p className="hero-subtitle">{c.heroBody}</p></div><button className="outline-button" onClick={() => isAuthenticated ? window.alert(c.saveNote) : startLogin()}><LogIn size={16} />{isAuthenticated ? "Synced" : c.signIn}</button></section>

          <section className="hero-card"><div className="aurora-line" /><div className="hero-copy"><span className="mini-label">THE MAWHEBTY METHOD <span>✦</span></span><h2>Find it. <em>Feel it.</em><br />Grow with it.</h2><p>{language === "ar" ? "تعرّف على ما يضيء بداخلك، ثم حوّله إلى رحلة ممتعة." : "Discover what lights you up, then turn that feeling into a path."}</p><button className="primary-button" onClick={openAssessment}>{c.assessment}<ArrowUpRight size={17} /></button><div className="hero-meta"><span><span className="avatar-stack"><span>✦</span><span>✧</span><span>◌</span></span><b>+2.4k</b> curious learners</span><span className="hero-divider" /><span><span className="tiny-star">★</span> 4.9/5 parent-loved</span></div></div><div className="nori-stage"><div className="nori-glow" /><div className="nori-orbit orbit-one" /><div className="nori-orbit orbit-two" /><img src={NORI_IMAGE} alt="Nori, the orange cat guide" /><div className="nori-note"><span>✦</span><div><strong>Nori says</strong><p>“You’re more capable than you think.”</p></div></div></div><div className="hero-corner-stat"><span>THIS WEEK</span><strong>+28%</strong><small>learning momentum</small><div className="micro-bars"><i /><i /><i /><i /><i /><i /><i /><i /></div></div></section>

          <section className="stats-grid">{stats.map(stat => <StatCard key={stat.label} {...stat} />)}</section>

          <section className="section-heading" id="journey"><div><span className="section-kicker">KEEP THE MOMENTUM</span><h2>{c.journey}</h2><p>{c.journeySub}</p></div><button className="text-button" onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}>{c.seeAll}<ArrowUpRight size={15} /></button></section>
          <section className="journey-layout"><div className="path-card"><div className="path-card-top"><div className="talent-ident"><span className="talent-glyph coral">✦</span><div><span className="card-kicker">IN PROGRESS</span><h3>{activeTalentData.name}</h3></div></div><button className="more-btn"><PanelLeft size={16} /></button></div><p>{activeTalentData.description}</p><div className="path-progress-line"><div><span>Module {Math.min(6, currentProgress + 1)} of {activeTalentData.totalLessons}</span><strong>{progressPercent}%</strong></div><div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div></div><div className="path-footer"><span><BookOpen size={15} /> {Math.max(0, activeTalentData.totalLessons - currentProgress)} lessons left</span><button className="soft-button" onClick={completeLesson}><Play size={14} fill="currentColor" />{c.continue}</button></div></div><div className="focus-card"><div className="focus-blob" /><div><span className="card-kicker">{c.weekly}</span><h3>Color tells a story</h3><p>{c.weeklyBody}</p></div><div className="focus-icon"><Sparkles size={20} /></div><div className="focus-footer"><span><span className="mini-avatar">N</span> Nori’s pick</span><button className="circle-arrow" onClick={completeLesson}><ArrowUpRight size={17} /></button></div></div></section>

          <section className="section-heading discover-heading" id="discover"><div><span className="section-kicker">OPEN A NEW DOOR</span><h2>{c.explore}</h2><p>Four paths, one curious mind. Which one feels like you?</p></div><div className="carousel-arrows"><button className="small-round"><ChevronRight size={17} className="flip-rtl" /></button><button className="small-round"><ChevronRight size={17} /></button></div></section>
          <section className="talent-grid">{talents.map((talent, index) => <button className={`talent-card ${talent.accent} ${activeTalent === talent.slug ? "selected" : ""}`} key={talent.slug} onClick={() => setActiveTalent(talent.slug)}><div className="talent-card-head"><span className="talent-glyph">{talent.icon}</span><span className="card-index">0{index + 1}</span></div><div className="talent-card-body"><span className="talent-category">{language === "ar" ? talent.categoryAr ?? talent.category : talent.category}</span><h3>{language === "ar" ? talent.nameAr : talent.name}</h3><p>{language === "ar" ? talent.descriptionAr : talent.description}</p></div><div className="talent-card-foot"><span>{talent.progress > 0 ? `${talent.progress}% explored` : "Not started"}</span><span className="card-arrow"><ArrowUpRight size={16} /></span></div></button>)}</section>

          <section className="bottom-grid" id="nori"><div className="assistant-card"><div className="assistant-top"><div className="assistant-avatar"><img src={NORI_IMAGE} alt="Nori" /></div><div><span className="card-kicker">YOUR AI GUIDE</span><h3>{c.assistant}</h3></div><span className="online-status"><span /> online</span></div><p>{c.assistantBody}</p><div className="assistant-suggestion"><Sparkles size={15} /><span>{language === "ar" ? "ما المسار الذي يناسبني اليوم؟" : "Which path fits my mood today?"}</span><button onClick={() => setAssistantOpen(true)}><ArrowUpRight size={15} /></button></div><button className="assistant-cta" onClick={() => setAssistantOpen(true)}><Bot size={16} />{c.assistant}</button>{assistantOpen && <div className="assistant-popover"><div className="popover-title"><span>Nori</span><button onClick={() => setAssistantOpen(false)}><X size={15} /></button></div><p>{language === "ar" ? "أشعر أن لديك طاقة المخترعين اليوم. جرب درسًا صغيرًا، ثم أخبرني ماذا اكتشفت!" : "I have a feeling you have inventor energy today. Try one tiny lesson, then tell me what you discover!"}</p><span className="demo-response">{c.demo} · AI-ready response</span></div>}</div><div className="insight-card"><div className="insight-header"><div><span className="card-kicker">YOUR RHYTHM</span><h3>Learning momentum</h3></div><BarChart3 size={18} /></div><div className="chart"><div className="chart-grid"><span /><span /><span /><span /></div><svg viewBox="0 0 500 130" preserveAspectRatio="none"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#63d7d4" stopOpacity=".25" /><stop offset="100%" stopColor="#63d7d4" stopOpacity="0" /></linearGradient></defs><path d="M0,108 C36,105 46,90 75,95 S119,75 145,83 S180,50 215,66 S248,85 278,56 S322,30 350,50 S385,75 410,42 S450,21 500,14 L500,130 L0,130 Z" fill="url(#chartFill)" /><path d="M0,108 C36,105 46,90 75,95 S119,75 145,83 S180,50 215,66 S248,85 278,56 S322,30 350,50 S385,75 410,42 S450,21 500,14" fill="none" stroke="#63d7d4" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div></div><div className="insight-footer"><span><span className="trend-up">↗ 28%</span> vs last week</span><span className="streak-note"><Flame size={14} /> 7 day streak</span></div></div></section>
          <footer className="page-footer"><span>© 2026 Mawhebty · Made for curious minds.</span><span>Demo workspace · no real child data</span></footer>
        </div>
      </main>

      {assessmentOpen && <div className="modal-backdrop"><div className={`assessment-modal ${result ? "result-modal" : ""}`} role="dialog" aria-modal="true"><button className="modal-close" onClick={() => setAssessmentOpen(false)} aria-label={c.close}><X size={18} /></button>{!result ? <><div className="assessment-head"><div className="assessment-icon"><Target size={20} /></div><div><span className="card-kicker">DISCOVERY CHECK</span><h2>{c.assessmentTitle}</h2><p>{c.assessmentSub}</p></div></div><div className="question-progress"><div><span>{c.question} {questionIndex + 1} {c.of} {questions.length}</span><strong>{Math.round(((questionIndex + 1) / questions.length) * 100)}%</strong></div><div className="progress-track"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div></div><h3 className="question-prompt">{language === "ar" ? currentQuestion.promptAr : currentQuestion.prompt}</h3><div className="answer-list">{currentQuestion.options.map((option, index) => <button key={option.talent} className={`answer-option ${selectedAnswer === option.talent ? "picked" : ""}`} onClick={() => chooseAnswer(option.talent)}><span className="answer-index">{String.fromCharCode(65 + index)}</span><span>{language === "ar" ? option.labelAr : option.label}</span>{selectedAnswer === option.talent && <Check size={17} />}</button>)}</div><div className="modal-footer"><button className="text-button" disabled={questionIndex === 0} onClick={() => setQuestionIndex(value => Math.max(0, value - 1))}>{c.back}</button><button className="primary-button" disabled={!selectedAnswer} onClick={nextQuestion}>{questionIndex === questions.length - 1 ? c.finish : c.next}<ChevronRight size={16} className="flip-rtl" /></button></div></> : <div className="result-content"><div className="result-confetti">✦ ✧ ✦</div><span className="card-kicker">NORI’S READ</span><h2>{c.resultTitle}</h2><div className={`result-glyph ${resultTalent?.accent}`}>{resultTalent?.icon}</div><h3>{language === "ar" ? resultTalent?.nameAr : resultTalent?.name}</h3><div className="score-pill"><span>Match</span><strong>{result.score}%</strong></div><p>{c.resultBody}</p><div className="result-actions"><button className="primary-button" onClick={() => { setActiveTalent(result.primaryTalent); setAssessmentOpen(false); document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" }); }}>{c.startPath}<ArrowUpRight size={16} /></button><button className="text-button" onClick={openAssessment}>Retake check</button></div><small>{!isAuthenticated && c.saveNote}</small></div>}</div></div>}
    </div>
  );
}
