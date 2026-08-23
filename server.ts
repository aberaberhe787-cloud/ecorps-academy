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
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
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
  maxRetries = 3
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
          // Exponential backoff with jitter
          const delayMs = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
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
    try {
      const { prompt, systemInstruction, temperature, topP } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key not configured on server",
          useMock: true,
        });
      }

      const { response, usedModel } = await generateWithRetry(ai, {
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: typeof temperature === "number" ? temperature : 0.7,
          topP: typeof topP === "number" ? topP : 0.95,
        },
      });

      return res.json({
        text: response.text || "No response generated.",
        usage: {
          promptTokens: Math.round(prompt.length / 4),
          candidatesTokenCount: Math.round((response.text?.length || 0) / 4),
        },
        model: usedModel,
      });
    } catch (error: any) {
      console.error("Gemini Generate Error:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate AI response",
        useMock: true,
      });
    }
  });

  app.post("/api/gemini/evaluate", async (req, res) => {
    try {
      const { prompt, missionContext } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key not configured on server",
          useMock: true,
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

      const { response } = await generateWithRetry(ai, {
        model: "gemini-3.7-flash",
        contents: evaluationPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      let parsed = null;
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch {
        parsed = { raw: response.text };
      }

      return res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Evaluate Error:", error);
      return res.status(500).json({
        error: error.message || "Failed to evaluate prompt",
        useMock: true,
      });
    }
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
