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
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
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

        const isRetryable =
          statusCode === 503 ||
          statusCode === 429 ||
          errMessage.includes("high demand") ||
          errMessage.includes("UNAVAILABLE") ||
          errMessage.includes("RESOURCE_EXHAUSTED") ||
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

async function startServer() {
  const app = express();
  const PORT = 3000;

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
    try {
      const { prompt, systemInstruction, temperature, topP } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required", executionMode: "error", requestId });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key not configured on server",
          executionMode: "error",
          provider: "google",
          requestId,
        });
      }

      const { response, usedModel } = await generateWithRetry(ai, {
        model: "gemini-3.8-flash",
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
        text: response.text || "No response generated.",
        executionMode: "real",
        provider: "google",
        model: usedModel,
        latencyMs,
        requestId,
        usage: {
          promptTokens: usageMetadata?.promptTokenCount ?? Math.max(1, Math.round(prompt.length / 4)),
          candidatesTokenCount: usageMetadata?.candidatesTokenCount ?? (response.text ? Math.max(1, Math.round(response.text.length / 4)) : 0),
          totalTokens: usageMetadata?.totalTokenCount,
        },
      });
    } catch (error: any) {
      console.error("Gemini Generate Error:", error?.message || error);
      const latencyMs = Date.now() - startTime;
      return res.status(500).json({
        error: error.message || "Failed to generate AI response",
        executionMode: "error",
        provider: "google",
        model: "gemini-3.8-flash",
        latencyMs,
        requestId,
      });
    }
  });

  app.post("/api/gemini/evaluate", async (req, res) => {
    const startTime = Date.now();
    const requestId = "eval_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    try {
      const { prompt, missionContext } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required", executionMode: "error", requestId });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key not configured on server",
          executionMode: "error",
          provider: "google",
          requestId,
        });
      }

      const evaluationPrompt = `You are a world-class AI Prompt Engineering instructor.
Analyze the following prompt submitted by a student for the task: "${missionContext || "General prompt engineering evaluation"}".

Student Prompt:
"""
${prompt}
"""

Evaluate the prompt and return JSON strictly matching:
{
  "score": 85,
  "grade": "A",
  "detectedTechniques": ["Role Prompting", "Delimiters"],
  "strengths": ["Clear role assignment", "Includes contextual constraints"],
  "weaknesses": ["Lacks few-shot examples"],
  "improvedPrompt": "Act as an expert...",
  "explanation": "Adding few-shot examples and explicit formatting guarantees deterministic outputs."
}`;

      const { response, usedModel } = await generateWithRetry(ai, {
        model: "gemini-3.8-flash",
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      let parsed: any = null;
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch {
        parsed = { raw: response.text };
      }

      const latencyMs = Date.now() - startTime;

      return res.json({
        ...parsed,
        executionMode: "real",
        provider: "google",
        model: usedModel,
        latencyMs,
        requestId,
      });
    } catch (error: any) {
      console.error("Gemini Evaluate Error:", error?.message || error);
      const latencyMs = Date.now() - startTime;
      return res.status(500).json({
        error: error.message || "Failed to evaluate prompt",
        executionMode: "error",
        provider: "google",
        latencyMs,
        requestId,
      });
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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
