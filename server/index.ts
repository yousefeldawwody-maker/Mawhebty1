import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const app = express();
app.use(cors());
app.use(express.json());
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;
const demo = { user: { id: 1, name: "Maya", age: 9, points: 1240, streak: 7 }, talents: [], questions: [], progress: [], achievements: [], notifications: [] };

app.get("/api/health", async (_req, res) => { try { if (pool) await pool.query("select 1"); res.json({ status: "ok", database: Boolean(pool) }); } catch { res.status(503).json({ status: "error", database: false }); } });
app.get("/api/demo", async (_req, res) => {
  if (!pool) return res.json(demo);
  try {
    const [talents, questions, progress, achievements, notifications, users] = await Promise.all([
      pool.query("select * from talents order by id"), pool.query("select * from assessment_questions order by id"), pool.query("select * from progress_records order by id"), pool.query("select * from achievements order by id"), pool.query("select * from notifications order by id"), pool.query("select * from users where id=1")
    ]);
    res.json({ user: users.rows[0] ?? demo.user, talents: talents.rows, questions: questions.rows, progress: progress.rows, achievements: achievements.rows, notifications: notifications.rows });
  } catch { res.status(500).json({ error: "database_error" }); }
});
app.post("/api/assessment/attempts", async (req, res) => { if (!pool) return res.status(201).json({ id: Date.now(), ...req.body }); try { const r = await pool.query("insert into assessment_attempts(user_id, answers, primary_talent, score) values ($1,$2,$3,$4) returning *", [1, JSON.stringify(req.body.answers ?? []), req.body.primaryTalent, req.body.score]); res.status(201).json(r.rows[0]); } catch { res.status(500).json({ error: "database_error" }); } });
app.post("/api/progress", async (req, res) => { if (!pool) return res.status(200).json({ ok: true, ...req.body }); try { const r = await pool.query("insert into progress_records(user_id,talent_slug,completed_lessons,total_lessons) values ($1,$2,$3,$4) on conflict (user_id,talent_slug) do update set completed_lessons=excluded.completed_lessons returning *", [1, req.body.talentSlug, req.body.completedLessons, req.body.totalLessons]); res.json(r.rows[0]); } catch { res.status(500).json({ error: "database_error" }); } });

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
app.use(express.static(publicDir));
app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
const port = Number(process.env.PORT || 3000); app.listen(port, "0.0.0.0", () => console.log(`Mawhebty server listening on ${port}`));
