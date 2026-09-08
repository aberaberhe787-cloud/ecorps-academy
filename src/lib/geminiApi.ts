/**
 * Resilient API client for server-side Google Gemini endpoints
 * Protects against truncated streams, empty bodies, network interruptions, and JSON parsing syntax errors.
 */

export interface GeminiGenerateResponse {
  success: boolean;
  text?: string;
  executionMode?: "real" | "mock" | "error";
  provider?: string;
  model?: string;
  latencyMs?: number;
  requestId?: string;
  usage?: {
    promptTokens?: number;
    candidatesTokenCount?: number;
    totalTokens?: number;
  };
  error?: string;
}

export interface GeminiEvaluateResponse {
  success: boolean;
  score?: number;
  grade?: "S" | "A" | "B" | "C" | "D";
  passed?: boolean;
  feedback?: string;
  criteria?: Array<{
    criteria: string;
    passed: boolean;
    feedback: string;
  }>;
  suggestions?: string[];
  executionMode?: "real" | "mock" | "error";
  provider?: string;
  model?: string;
  latencyMs?: number;
  requestId?: string;
  error?: string;
}

/**
 * Safely fetches and parses JSON responses, preventing unhandled "SyntaxError: JSON.parse: unexpected end of data"
 * when reverse proxies (nginx/Cloud Run) return 502/503/504 with an empty or HTML body.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data: T | null; error?: string; aborted?: boolean }> {
  try {
    const response = await fetch(url, options);

    // Read body text first before attempting JSON parsing
    const rawText = await response.text();
    let parsedData: T | null = null;

    if (rawText && rawText.trim().length > 0) {
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseError) {
        // Body was returned but is not valid JSON (e.g. HTML proxy error)
        console.warn(`[API] Non-JSON payload received from ${url} (status ${response.status}):`, rawText.slice(0, 150));
      }
    }

    if (!response.ok) {
      const serverErrorMessage =
        (parsedData as any)?.error ||
        (rawText && rawText.length < 160 && !rawText.includes("<html") ? rawText : undefined);

      let fallbackMessage = `Server error (${response.status}). Please retry.`;
      if (response.status === 502 || response.status === 504) {
        fallbackMessage = "Gemini gateway or server is temporarily reloading (502/504). Please retry in a moment.";
      } else if (response.status === 503) {
        fallbackMessage = "Gemini service is temporarily unavailable (503). Please retry in a moment.";
      } else if (response.status === 429) {
        fallbackMessage = "Gemini quota or rate limit temporarily reached. Please retry in a few seconds.";
      }

      return {
        ok: false,
        status: response.status,
        data: parsedData,
        error: serverErrorMessage || fallbackMessage,
      };
    }

    if (!parsedData) {
      return {
        ok: false,
        status: response.status,
        data: null,
        error: "Server returned an empty response. Please retry.",
      };
    }

    return {
      ok: true,
      status: response.status,
      data: parsedData,
    };
  } catch (err: any) {
    if (err?.name === "AbortError" || options.signal?.aborted) {
      return {
        ok: false,
        status: 0,
        data: null,
        aborted: true,
        error: "Request was cancelled.",
      };
    }

    console.error(`[API Network Error] ${url}:`, err);
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message ? `Network request failed: ${err.message}` : "Unable to reach Gemini execution server. Please check your connection and retry.",
    };
  }
}

/**
 * Call the server-side Gemini text generation endpoint with safety bounds
 */
export async function callGeminiGenerate(params: {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  signal?: AbortSignal;
}): Promise<GeminiGenerateResponse> {
  const { prompt, systemInstruction, temperature = 0.7, topP = 0.95, signal } = params;

  const result = await safeFetchJson<GeminiGenerateResponse>("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      prompt,
      systemInstruction: systemInstruction ? systemInstruction.trim() : undefined,
      temperature,
      topP,
    }),
  });

  if (result.aborted) {
    throw new DOMException("The user aborted a request.", "AbortError");
  }

  if (!result.ok || !result.data || !result.data.success) {
    const message = result.data?.error || result.error || "Gemini execution failed. Your prompt was not evaluated.";
    throw new Error(message);
  }

  return result.data;
}

/**
 * Call the server-side Gemini rubric evaluation endpoint with safety bounds
 */
export async function callGeminiEvaluate(params: {
  prompt: string;
  rubric: {
    title: string;
    objective: string;
    targetCriteria?: string[];
    criteria?: string[];
    minPassingScore?: number;
    difficulty?: string;
  };
  missionId?: string;
  missionContext?: string;
  type?: "mission" | "assessment";
  signal?: AbortSignal;
}): Promise<GeminiEvaluateResponse> {
  const { prompt, rubric, missionId, missionContext, type = "mission", signal } = params;

  const result = await safeFetchJson<GeminiEvaluateResponse>("/api/gemini/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      prompt,
      rubric,
      missionId,
      missionContext,
      type,
    }),
  });

  if (result.aborted) {
    throw new DOMException("The user aborted a request.", "AbortError");
  }

  if (!result.ok || !result.data || !result.data.success) {
    const message = result.data?.error || result.error || "Gemini evaluation unavailable. Your prompt was not evaluated.";
    throw new Error(message);
  }

  return result.data;
}
