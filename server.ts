import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cors from "cors";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './src/db/schema';
import { apiRouter } from './src/server/routes';
import { getEcorpAiGateway } from "./src/lib/ai/gateway";

dotenv.config();

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

export const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",").map((origin) => origin.trim()) || true, credentials: false }));
app.use('/api', apiRouter);

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
    const requestId = "req_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      const { prompt, systemInstruction, temperature, topP, model } = req.body || {};
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ success: false, error: "Prompt is required", requestId });
      }

      const gateway = getEcorpAiGateway();
      const response = await gateway.generate({
        prompt,
        systemInstruction,
        temperature,
        topP,
        model
      });

      if (!response.success) {
        return res.status(500).json({ success: false, error: response.error, requestId });
      }

      return res.json({
        success: true,
        text: response.text || "",
        executionMode: "real",
        provider: response.metadata?.provider,
        model: response.metadata?.model,
        latencyMs: response.metadata?.latencyMs,
        requestId,
        usage: response.metadata?.usage
      });
    } catch (error: any) {
      console.error("Gateway Generate Error:", error?.message || error);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: error?.message || "Generation failed.",
          requestId,
        });
      }
    }
  });

  app.post("/api/gemini/evaluate", async (req, res) => {
    const requestId = "eval_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    try {
      const { prompt, rubric, missionContext, type } = req.body || {};
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ success: false, error: "Prompt is required", requestId });
      }

      const gateway = getEcorpAiGateway();
      const response = await gateway.evaluate({
        prompt,
        rubric,
        missionContext,
        type
      });

      if (!response.success) {
        return res.status(500).json({ success: false, error: response.error, requestId });
      }

      return res.json({
        success: true,
        executionMode: "real",
        provider: response.metadata?.provider,
        model: response.metadata?.model,
        score: response.score,
        grade: response.grade,
        passed: response.passed,
        feedback: response.feedback,
        criteria: response.criteria,
        suggestions: response.suggestions,
        latencyMs: response.metadata?.latencyMs,
        requestId,
      });
    } catch (error: any) {
      console.error("Gateway Evaluate Error:", error?.message || error);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: error?.message || "Evaluation failed.",
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
    const viteName = "vite";
    const { createServer: createViteServer } = await import(/* @vite-ignore */ viteName);
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
