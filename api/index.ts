import type { IncomingMessage, ServerResponse } from "http";

type Req = IncomingMessage & {
  url?: string;
  method?: string;
  query?: Record<string, string | string[]>;
  body?: unknown;
};

type Res = ServerResponse & {
  status?: (code: number) => Res;
  json?: (body: unknown) => void;
  send?: (body: unknown) => void;
};

function sendJson(res: Res, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
}

function pathOf(req: Req): string {
  const raw = req.url || "";
  return raw.split("?")[0] || "";
}

/**
 * Vercel serverless entry for /api/*.
 * Health is handled here so native modules (canvas) never block status checks.
 */
export default async function handler(req: Req, res: Res) {
  const path = pathOf(req);

  if (path === "/api/health" || path.endsWith("/health") || path === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "ecorps-academy",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasDb: Boolean(process.env.DATABASE_URL),
      ts: Date.now(),
    });
    return;
  }

  try {
    const mod = await import("../server");
    const app = mod.app;
    // Express request listener signature
    return app(req as any, res as any);
  } catch (err: any) {
    console.error("[api/index] failed to load server handler", err);
    sendJson(res, 500, {
      error: "API unavailable",
      message: err?.message || String(err),
    });
  }
}
