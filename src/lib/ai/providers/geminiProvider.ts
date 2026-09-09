
import { GoogleGenAI } from "@google/genai";
import { AiProvider, GenerationRequest, AiResponse, EvaluationRequest, EvaluationResponse } from "../types";

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

export class GeminiProvider implements AiProvider {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  private async generateWithRetry(
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
          const response = await this.ai.models.generateContent({
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
            console.warn(`[Gemini Fallback] Model ${modelName} reached quota limit (${statusCode}).`);
            break;
          }

          const isRetryable =
            statusCode === 503 ||
            errMessage.includes("high demand") ||
            errMessage.includes("UNAVAILABLE") ||
            errMessage.includes("temporarily unavailable") ||
            errMessage.includes("overloaded");

          if (isRetryable && attempt < maxRetries - 1) {
            const delayMs = Math.min(800, (attempt + 1) * 300 + Math.floor(Math.random() * 200));
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          break;
        }
      }
    }
    throw lastError || new Error("All Gemini API attempts and candidate models exhausted");
  }

  async generate(request: GenerationRequest): Promise<AiResponse> {
    const startTime = Date.now();
    try {
      const { response, usedModel } = await this.generateWithRetry({
        contents: request.prompt,
        config: {
          systemInstruction: request.systemInstruction || undefined,
          temperature: typeof request.temperature === "number" ? request.temperature : 0.7,
          topP: typeof request.topP === "number" ? request.topP : 0.95,
        },
        model: request.model,
      });

      const usageMetadata = (response as any).usageMetadata;

      return {
        success: true,
        text: response.text || "",
        metadata: {
          provider: "Google Gemini",
          model: usedModel,
          latencyMs: Date.now() - startTime,
          ...(usageMetadata ? {
            usage: {
              promptTokens: usageMetadata.promptTokenCount,
              candidatesTokenCount: usageMetadata.candidatesTokenCount,
              totalTokens: usageMetadata.totalTokenCount,
            }
          } : {})
        }
      };
    } catch (error: any) {
      return { success: false, error: error?.message || "Gemini generation failed" };
    }
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    const startTime = Date.now();
    try {
      // Re-use logic for prompt construction from server.ts
      const taskTitle = request.rubric?.title || request.missionContext || "Prompt Engineering Assessment";
      const taskObjective = request.rubric?.objective || "Construct an enterprise-grade prompt meeting all required criteria";
      let criteriaList = "";
      if (Array.isArray(request.rubric?.targetCriteria)) {
        criteriaList = request.rubric.targetCriteria.map((c: string, idx: number) => `${idx + 1}. ${c}`).join("\n");
      } else if (Array.isArray(request.rubric?.criteria)) {
        criteriaList = request.rubric.criteria.map((c: string, idx: number) => `${idx + 1}. ${c}`).join("\n");
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
${request.prompt}
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

      const { response, usedModel } = await this.generateWithRetry({
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

      const minPassingScore = typeof request.rubric?.minPassingScore === "number" ? request.rubric.minPassingScore : 70;
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

      return {
        success: true,
        score,
        grade,
        passed,
        feedback: typeof parsed.feedback === "string" ? parsed.feedback : "Prompt evaluated against rubric.",
        criteria: Array.isArray(parsed.criteria) ? parsed.criteria : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        metadata: {
          provider: "Google Gemini",
          model: usedModel,
          latencyMs: Date.now() - startTime,
        }
      };
    } catch (error: any) {
      return { success: false, error: error?.message || "Gemini evaluation failed" };
    }
  }
}
