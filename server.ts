import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema';
import { apiRouter } from './src/server/routes';

dotenv.config();

// Supported text models for resilience and fallback
const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

// Lazy database initialization
let dbClient: any = null;
function getDb() {
  if (!dbClient) {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, database features disabled");
      return null;
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    dbClient = drizzle(pool, { schema });
  }
  return dbClient;
}

async function generateWithRetry(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    model?: string;
  },
  maxRetries = 2
) {
  let lastError: any = null;
  const modelsToTry = params.model
    ? [params.model, ...CANDIDATE_MODELS.filter((m) => m !== params.model)]
    : CANDIDATE_MODELS;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        return { response, usedModel: modelName };
      } catch (err: any) {
        lastError = err;
        const errMessage = String(err?.message || "");
        const statusCode =
          err?.status ||
          err?.code ||
          err?.statusCode ||
          (errMessage.includes("503") ? 503 : errMessage.includes("429") ? 429 : 0);

        const isQuotaExhausted =
          statusCode === 429 ||
          errMessage.includes("Quota exceeded") ||
          errMessage.includes("RESOURCE_EXHAUSTED") ||
          errMessage.includes("rate-limits");

        if (isQuotaExhausted) {
          console.warn(
            `[Gemini Fallback] Model ${modelName} reached quota limit (${statusCode}). Switching immediately to next candidate model.`
          );
          // Don't retry the exhausted model, immediately advance to next candidate model
          break;
        }

        const isRetryable =
          statusCode === 503 ||
          errMessage.includes("high demand") ||
          errMessage.includes("UNAVAILABLE") ||
          errMessage.includes("temporarily unavailable") ||
          errMessage.includes("overloaded");

        console.warn(
          `[Gemini Attempt ${attempt + 1}/${maxRetries}] Model ${modelName} encountered: ${errMessage}. Retryable: ${isRetryable}`
        );

        if (isRetryable && attempt < maxRetries - 1) {
          const delayMs = Math.min(800, (attempt + 1) * 300 + Math.floor(Math.random() * 200));
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // If not retryable or retries exhausted for this model, break to attempt next candidate model
        break;
      }
    }
  }

  throw lastError || new Error("All Gemini API attempts and candidate models exhausted");
}

export const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",").map((origin) => origin.trim()) || true, credentials: false }));
app.use('/api', apiRouter);

  const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasDb: Boolean(process.env.DATABASE_URL),
    });
  });

  // Learning Content Endpoints
  app.get("/api/content", async (req, res) => {
    try {
      const db = getDb();
      if (!db) return res.json([]);
      const content = await db.query.learningContent.findMany();
      res.json(content);
    } catch (error: any) {
      console.error("Fetch Content Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch content" });
    }
  });

  // User Endpoints
  app.get("/api/user/:email/certifications", async (req, res) => {
    try {
      const db = getDb();
      if (!db) return res.json([]);
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, req.params.email),
        with: { certifications: true },
      });
      res.json(user?.certifications || []);
    } catch (error: any) {
      console.error("Fetch Certs Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch certifications" });
    }
  });

  // Search Endpoint
  app.get("/api/search", async (req, res) => {
    const query = (req.query.q as string)?.toLowerCase() || "";
    if (!query) return res.json([]);
    
    // Mock data for search
    const mockData = [
      { id: "1", title: "Introduction to Prompt Engineering", type: "course" },
      { id: "2", title: "Advanced Chain-of-Thought", type: "course" },
      { id: "3", title: "Safety & Alignment Pillar", type: "pillar" },
      { id: "4", title: "Ecorp Scholar Profile", type: "profile" },
    ];
    
    const results = mockData.filter(item => 
      item.title.toLowerCase().includes(query)
    );
    
    res.json(results);
  });

  app.post("/api/gemini/generate", async (req, res) => {
    const startTime = Date.now();
    const requestId = "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      const { prompt, systemInstruction, temperature, topP } = req.body || {};
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ success: false, error: "Prompt is required", executionMode: "error", requestId });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          success: false,
          error: "Gemini execution unavailable. GEMINI_API_KEY is not configured on server.",
          executionMode: "error",
          provider: "Google Gemini",
          requestId,
        });
      }

      const { response, usedModel } = await generateWithRetry(ai, {
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: typeof temperature === "number" ? temperature : 0.7,
          topP: typeof topP === "number" ? topP : 0.95,
        },
      });

      const latencyMs = Date.now() - startTime;
      const usageMetadata = (response as any).usageMetadata;

      return res.json({
        success: true,
        text: response.text || "",
        executionMode: "real",
        provider: "Google Gemini",
        model: usedModel,
        latencyMs,
        requestId,
        ...(usageMetadata ? {
          usage: {
            promptTokens: usageMetadata.promptTokenCount,
            candidatesTokenCount: usageMetadata.candidatesTokenCount,
            totalTokens: usageMetadata.totalTokenCount,
          }
        } : {})
      });
    } catch (error: any) {
      console.error("Gemini Generate Error:", error?.message || error);
      const latencyMs = Date.now() - startTime;
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: error?.message || "Gemini execution failed. Your prompt was not evaluated.",
          executionMode: "error",
          provider: "Google Gemini",
          latencyMs,
          requestId,
        });
      }
    }
  });

  app.post("/api/gemini/evaluate", async (req, res) => {
    const startTime = Date.now();
    const requestId = "eval_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      const { prompt, rubric, missionContext, type } = req.body || {};
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ success: false, error: "Prompt is required", executionMode: "error", requestId });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          success: false,
          error: "Gemini evaluation unavailable. GEMINI_API_KEY is not configured on server.",
          executionMode: "error",
          provider: "Google Gemini",
          requestId,
        });
      }

      const taskTitle = rubric?.title || missionContext || "Prompt Engineering Assessment";
      const taskObjective = rubric?.objective || "Construct an enterprise-grade prompt meeting all required criteria";
      let criteriaList = "";
      if (Array.isArray(rubric?.targetCriteria)) {
        criteriaList = rubric.targetCriteria.map((c: string, idx: number) => `${idx + 1}. ${c}`).join("\n");
      } else if (Array.isArray(rubric?.criteria)) {
        criteriaList = rubric.criteria.map((c: string, idx: number) => `${idx + 1}. ${c}`).join("\n");
      } else {
        criteriaList = "1. Clear persona & role definition\n2. Delimiters separating context\n3. Explicit output structure\n4. Negative constraints or edge cases handled";
      }

      const evaluationPrompt = `You are an expert AI Prompt Engineering Rubric Evaluator at Ecorp Academy.
Evaluate the student's submitted prompt against the authoritative curriculum criteria.

Task: ${taskTitle}
Objective: ${taskObjective}
Target Criteria:
${criteriaList}

Student Submission:
"""
${prompt}
"""

Instructions:
1. Objectively determine if each target criterion is passed or failed based on the student submission.
2. Provide a score from 0 to 100 representing holistic compliance. An empty or weak submission must receive a low score. A well-engineered prompt meeting all criteria should receive a high score (>= 70).
3. Provide concise, constructive pedagogical feedback.

Return RAW JSON ONLY adhering strictly to this schema:
{
  "score": <number 0-100>,
  "grade": <"S" | "A" | "B" | "C" | "D">,
  "passed": <boolean>,
  "feedback": "<overall summary>",
  "criteria": [
    {
      "criteria": "<criterion description>",
      "passed": <boolean>,
      "feedback": "<brief explanation for pass or fail>"
    }
  ],
  "suggestions": ["<actionable improvement suggestion>"]
}`;

      const { response, usedModel } = await generateWithRetry(ai, {
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      let parsed: any = null;
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch {
        const jsonMatch = response.text?.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid structured evaluation format from model");
      }

      const minPassingScore = typeof rubric?.minPassingScore === "number" ? rubric.minPassingScore : 70;
      let rawScore = typeof parsed.score === "number" ? parsed.score : 0;
      const score = Math.max(0, Math.min(100, Math.round(rawScore)));
      const passed = typeof parsed.passed === "boolean" ? parsed.passed : score >= minPassingScore;

      let grade = parsed.grade;
      if (!["S", "A", "B", "C", "D"].includes(grade)) {
        if (score >= 90) grade = "S";
        else if (score >= 80) grade = "A";
        else if (score >= 65) grade = "B";
        else if (score >= 50) grade = "C";
        else grade = "D";
      }

      const latencyMs = Date.now() - startTime;

      return res.json({
        success: true,
        executionMode: "real",
        provider: "Google Gemini",
        model: usedModel,
        score,
        grade,
        passed,
        feedback: typeof parsed.feedback === "string" ? parsed.feedback : "Prompt evaluated against rubric.",
        criteria: Array.isArray(parsed.criteria) ? parsed.criteria : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        latencyMs,
        requestId,
      });
    } catch (error: any) {
      console.error("Gemini Evaluate Error:", error?.message || error);
      const latencyMs = Date.now() - startTime;
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: error?.message || "Gemini evaluation unavailable. Your prompt was not evaluated.",
          executionMode: "error",
          provider: "Google Gemini",
          latencyMs,
          requestId,
        });
      }
    }
  });

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://ecorps-academy.vercel.app/sitemap.xml\n");
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ecorps-academy.vercel.app/</loc>
    <lastmod>2026-09-03</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    res.send(sitemapContent);
  });

export async function startServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer();
}
