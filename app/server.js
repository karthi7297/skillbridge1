// server.js — SkillBridge AI backend + static frontend
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, logAgent } from './db.js';
import {
  agentRouter, profileAgent, skillAnalyst, roadmapPlanner,
  progressEvaluator, mentorAgent, analysis, getRoadmap, profile
} from './agents/agents.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const u = () => db.prepare('SELECT * FROM users LIMIT 1').get();

// ---- profile ----
app.get('/api/profile', (req, res) => {
  const p = profile();
  res.json({ user: p.user, role: p.role, skills: p.skills });
});

app.post('/api/profile', async (req, res) => {
  const out = await agentRouter.dispatch('profile.update', req.body);
  res.json(out);
});

app.get('/api/roles', (req, res) => {
  res.json(db.prepare('SELECT * FROM roles ORDER BY id').all());
});

// ---- analysis ----
app.get('/api/analysis', async (req, res) => {
  const out = await agentRouter.dispatch('skills.analyze');
  res.json(out);
});

// ---- roadmap ----
app.get('/api/roadmap', (req, res) => {
  res.json(getRoadmap());
});

app.post('/api/roadmap/generate', async (req, res) => {
  const out = await agentRouter.dispatch('roadmap.generate', { reason: req.body?.reason || 'Initial roadmap from skill gap analysis' });
  res.json(out);
});

app.post('/api/tasks/:id/toggle', (req, res) => {
  db.prepare('UPDATE tasks SET done = 1 - done WHERE id=?').run(req.params.id);
  res.json(getRoadmap());
});

// goal change → full re-plan
app.post('/api/goal', async (req, res) => {
  const { goal } = req.body;
  await profileAgent.run({ goal });
  const before = getRoadmap();
  const kept = analysis().met.map(s => s.name);
  const out = await roadmapPlanner.run({ reason: `Goal changed to "${goal}" — roadmap regenerated` });
  logAgent('ROADMAP PLANNER', `Transferable skills kept: ${kept.join(', ') || 'none'}; irrelevant tasks dropped.`);
  res.json({ kept, roadmap: out, previous_version: before?.version || null });
});

// ---- quiz ----
app.post('/api/quiz', async (req, res) => {
  const { skill, answers, questions } = req.body;
  if (answers && questions) return res.json(await progressEvaluator.run({ skillName: skill, answers, questions }));
  const out = await agentRouter.dispatch('quiz.generate', { skillName: skill || 'JavaScript' });
  res.json(out);
});

// ---- mentor chat ----
app.get('/api/chat', (req, res) => {
  res.json(db.prepare('SELECT * FROM chat_log ORDER BY id DESC LIMIT 30').all().reverse());
});
app.post('/api/chat', async (req, res) => {
  const out = await agentRouter.dispatch('mentor.chat', { message: req.body.message || '' });
  res.json(out);
});

// ---- resources ----
app.get('/api/resources', (req, res) => {
  const rows = req.query.skill
    ? db.prepare(`SELECT r.*, s.name AS skill_name FROM resources r JOIN skills s ON s.id=r.skill_id
                  WHERE s.name LIKE ? ORDER BY r.id`).all(`%${req.query.skill}%`)
    : db.prepare(`SELECT r.*, s.name AS skill_name FROM resources r JOIN skills s ON s.id=r.skill_id ORDER BY r.id`).all();
  res.json(rows);
});

// ---- agent feed ----
app.get('/api/agents', (req, res) => {
  res.json(db.prepare('SELECT * FROM agent_logs ORDER BY id DESC LIMIT 50').all().reverse());
});

// ---- progress summary ----
app.get('/api/progress', (req, res) => {
  const uid = u().id;
  const a = analysis();
  const rm = getRoadmap();
  const quizzes = db.prepare('SELECT * FROM assessments WHERE user_id=? ORDER BY id DESC LIMIT 5').all(uid);
  const avg = quizzes.length ? Math.round(quizzes.reduce((x, q) => x + q.score / q.total * 100, 0) / quizzes.length) : null;
  res.json({ readiness: a.readiness, mastered: a.met.length, total: a.skills.length, roadmap: rm?.progress || 0, avgQuiz: avg, gaps: a.gaps, met: a.met, skills: a.skills });
});

// ---- demo reset ----
app.post('/api/demo/reset', async (req, res) => {
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM roadmaps').run();
  db.prepare('DELETE FROM assessments').run();
  db.prepare('DELETE FROM chat_log').run();
  await roadmapPlanner.run({ reason: 'Demo reset — fresh roadmap' });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`⚡ SkillBridge AI running → http://localhost:${PORT}`));
