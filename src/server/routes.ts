import { Router } from 'express';
import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import { desc, eq, and, sql } from 'drizzle-orm';
import { foundationProgress, lessonProgress, lessons, promptAttempts, savedPrompts, users, certificates } from '../db/schema';
import { requireDatabase } from './db';
import { AuthRequest, issueToken, requireAuth } from './auth';

const foundations = [
  ['foundation-clarity', 'Clarity & Specificity'],
  ['foundation-role', 'Role Assignment'],
  ['foundation-constraints', 'Constraints & Formatting'],
  ['foundation-iteration', 'Iterative Refinement'],
  ['foundation-context', 'Context Injection'],
] as const;

const getUserId = (req: AuthRequest, requestedId?: string) => {
  const id = requestedId ? Number(requestedId) : req.user?.id;
  if (!id || id !== req.user?.id) throw new Error('You may only access your own account');
  return id;
};

export const apiRouter = Router();

apiRouter.post('/auth/register', async (req, res) => {
  try {
    const database = requireDatabase();
    const { email, password, name } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Email and a password of at least 8 characters are required' });
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await database.insert(users).values({ email: email.toLowerCase().trim(), name: typeof name === 'string' ? name.trim() : null, passwordHash }).returning({ id: users.id, email: users.email, name: users.name });
    return res.status(201).json({ user, token: issueToken(user) });
  } catch (error: any) {
    if (error?.code === '23505') return res.status(409).json({ error: 'An account with that email already exists' });
    return res.status(503).json({ error: error.message || 'Registration unavailable' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const database = requireDatabase();
    const email = String(req.body?.email || '').toLowerCase().trim();
    const password = String(req.body?.password || '');
    const [user] = await database.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Invalid email or password' });
    return res.json({ user: { id: user.id, email: user.email, name: user.name, xp: user.xp, streakDays: user.streakDays }, token: issueToken(user) });
  } catch (error: any) { return res.status(503).json({ error: error.message || 'Login unavailable' }); }
});

apiRouter.post('/auth/logout', requireAuth, (_req, res) => res.json({ success: true, message: 'Discard the bearer token on the client' }));

apiRouter.get('/progress/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req, String(req.params.userId));
    const [user] = await database.select({ id: users.id, email: users.email, name: users.name, xp: users.xp, streakDays: users.streakDays }).from(users).where(eq(users.id, userId)).limit(1);
    const completed = await database.select({ lessonId: lessonProgress.lessonId, completedAt: lessonProgress.completedAt }).from(lessonProgress).where(eq(lessonProgress.userId, userId));
    return res.json({ user, completedLessons: completed, completedCount: completed.length });
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.get('/recommendations/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req, String(req.params.userId));
    const weak = await database.select({ conceptId: foundationProgress.conceptId, score: foundationProgress.score }).from(foundationProgress).where(and(eq(foundationProgress.userId, userId), sql`${foundationProgress.score} < 70`)).orderBy(foundationProgress.score).limit(1);
    const completed = await database.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress).where(eq(lessonProgress.userId, userId));
    const next = foundations.find(([id]) => !completed.some((item) => item.lessonId === id));
    return res.json({ reason: weak[0] ? 'Improve your lowest-scoring concept' : 'Continue your learning path', recommendation: weak[0] || (next ? { conceptId: next[0], title: next[1] } : null) });
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.post('/savePrompt', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const title = String(req.body?.title || '').trim();
    const prompt = String(req.body?.prompt || '').trim();
    if (!title || !prompt) return res.status(400).json({ error: 'title and prompt are required' });
    const [saved] = await database.insert(savedPrompts).values({ userId: getUserId(req), title, prompt }).returning();
    return res.status(201).json(saved);
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.get('/analytics/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req, String(req.params.userId));
    const [summary] = await database.select({ attempts: sql<number>`count(*)`, averagePromptScore: sql<number>`coalesce(avg(${promptAttempts.score}), 0)`, timeSpentSeconds: sql<number>`coalesce(sum(${promptAttempts.timeSpentSeconds}), 0)` }).from(promptAttempts).where(eq(promptAttempts.userId, userId));
    const [quiz] = await database.select({ total: sql<number>`count(*)`, passed: sql<number>`coalesce(sum(case when ${lessonProgress.quizPassed} then 1 else 0 end), 0)` }).from(lessonProgress).where(eq(lessonProgress.userId, userId));
    return res.json({ quizAccuracy: quiz.total ? Number(quiz.passed) / Number(quiz.total) : 0, ...summary });
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.get('/achievements/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req, String(req.params.userId));
    const earned = await database.select().from(certificates).where(eq(certificates.userId, userId)).orderBy(desc(certificates.issuedAt));
    return res.json({ badges: [], certificates: earned });
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.get('/foundations/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req, String(req.params.userId));
    const progress = await database.select().from(foundationProgress).where(eq(foundationProgress.userId, userId));
    return res.json({ concepts: foundations.map(([id, title]) => ({ id, title, ...(progress.find((item) => item.conceptId === id) || { score: 0, completed: false }) })) });
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.post('/lesson/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req);
    const lessonId = String(req.body?.lessonId || '');
    if (!lessonId || req.body?.quizPassed !== true || req.body?.practicePassed !== true) return res.status(400).json({ error: 'A passed quiz and practice attempt are required' });
    const [completion] = await database.insert(lessonProgress).values({ userId, lessonId, quizPassed: true, practicePassed: true }).returning();
    await database.update(users).set({ xp: sql`${users.xp} + 40` }).where(eq(users.id, userId));
    return res.status(201).json(completion);
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.post('/challenge/submit', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req);
    const prompt = String(req.body?.prompt || '').trim();
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    const score = Math.min(100, Math.round((prompt.length > 40 ? 30 : 10) + (/(act as|role)/i.test(prompt) ? 25 : 0) + (/(exactly|json|table|bullets)/i.test(prompt) ? 25 : 0) + (/<context>|context:/i.test(prompt) ? 20 : 0)));
    const feedback = score >= 70 ? 'Strong prompt structure. The task includes useful control signals.' : 'Add a role, measurable output format, and relevant context.';
    const [attempt] = await database.insert(promptAttempts).values({ userId, prompt, score, feedback, timeSpentSeconds: Number(req.body?.timeSpentSeconds) || 0 }).returning();
    return res.json({ score, passed: score >= 70, feedback, baselineOutput: 'Baseline output is broad and underspecified.', improvedOutput: 'Improved output follows the requested structure.', attempt });
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.get('/certificate/:userId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const database = requireDatabase();
    const userId = getUserId(req, String(req.params.userId));
    const completed = await database.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress).where(eq(lessonProgress.userId, userId));
    if (!foundations.every(([id]) => completed.some((item) => item.lessonId === id))) return res.status(403).json({ error: 'Complete all foundations concepts first' });
    const [user] = await database.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
    const document = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="prompt-engineering-foundations.pdf"');
    document.pipe(res);
    document.fontSize(28).text('ECORP ACADEMY', { align: 'center' }).moveDown();
    document.fontSize(34).text('Certificate of Completion', { align: 'center' }).moveDown();
    document.fontSize(18).text(`This certifies that ${user?.name || 'Ecorp Scholar'}`, { align: 'center' }).moveDown();
    document.fontSize(20).text('has completed Prompt Engineering Foundations', { align: 'center' }).moveDown();
    document.fontSize(12).text(new Date().toLocaleDateString(), { align: 'center' });
    document.end();
  } catch (error: any) { return res.status(400).json({ error: error.message }); }
});

apiRouter.get('/seo/:page', (req, res) => {
  const pages: Record<string, object> = {
    home: { title: 'Ecorp Academy | Prompt Engineering', description: 'Learn prompt engineering through interactive lessons and practice.' },
    foundations: { title: 'Prompt Engineering Foundations | Ecorp Academy', description: 'Master clarity, roles, constraints, iteration, and context.' },
    curriculum: { title: 'AI Prompt Engineering Curriculum | Ecorp Academy', description: 'Research-grounded lessons, quizzes, and sandbox challenges.' },
  };
  res.json(pages[req.params.page] || pages.home);
});
