
import { AiProvider, GenerationRequest, AiResponse, EvaluationRequest, EvaluationResponse } from "./types";
import { GeminiProvider } from "./providers/geminiProvider";
import { generateMockAiResponse } from "../mockAiEngine";

class MockAiProvider implements AiProvider {
  async generate(request: GenerationRequest): Promise<AiResponse> {
    const mock = generateMockAiResponse(request.prompt, request.systemInstruction, request.temperature);
    return {
      success: true,
      text: mock.text,
      metadata: {
        provider: "Ecorp Simulated AI",
        model: "ecorp-local-simulator",
        latencyMs: mock.latencyMs,
        usage: {
          promptTokens: Math.max(5, Math.round(request.prompt.length / 4)),
          candidatesTokenCount: mock.simulatedTokens,
          totalTokens: Math.max(5, Math.round(request.prompt.length / 4)) + mock.simulatedTokens,
        }
      }
    };
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    const prompt = request.prompt || "";
    const minPassingScore = typeof request.rubric?.minPassingScore === "number" ? request.rubric.minPassingScore : 70;
    const hasRole = /act as|role|you are a|expert/i.test(prompt);
    const hasFormat = /json|table|markdown|list|bullet/i.test(prompt);
    const hasConstraints = /do not|never|must|only|limit/i.test(prompt);
    const isDetailed = prompt.length > 50;

    let score = 50;
    if (hasRole) score += 15;
    if (hasFormat) score += 15;
    if (hasConstraints) score += 10;
    if (isDetailed) score += 10;
    score = Math.min(100, Math.max(0, score));

    const passed = score >= minPassingScore;
    const grade = score >= 90 ? "S" : score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";

    return {
      success: true,
      score,
      grade,
      passed,
      feedback: passed
        ? "Excellent prompt structure! Clear instructions and constraints were detected."
        : "Prompt could be enhanced with explicit persona, output schema constraints, and edge case guidance.",
      criteria: [
        { criteria: "Role & Persona Specification", passed: hasRole, feedback: hasRole ? "Persona defined" : "Missing explicit persona" },
        { criteria: "Format Specification", passed: hasFormat, feedback: hasFormat ? "Output format specified" : "Format unspecified" },
        { criteria: "Negative Constraints & Boundaries", passed: hasConstraints, feedback: hasConstraints ? "Clear boundaries" : "Add negative constraints" }
      ],
      suggestions: [
        "Include concrete input/output few-shot examples for deterministic formatting.",
        "Add explicit delimiter tags around input variables."
      ],
      metadata: {
        provider: "Ecorp Simulated AI",
        model: "ecorp-local-simulator",
        latencyMs: 320,
      }
    };
  }
}

export class EcorpAiGateway {
  private provider: AiProvider;

  constructor(apiKey: string | undefined) {
    if (apiKey && apiKey.trim().length > 0) {
      this.provider = new GeminiProvider(apiKey);
    } else {
      this.provider = new MockAiProvider();
    }
  }

  async generate(request: GenerationRequest): Promise<AiResponse> {
    return this.provider.generate(request);
  }

  async evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    return this.provider.evaluate(request);
  }
}

// Singleton helper to get the gateway
let gatewayInstance: EcorpAiGateway | null = null;

export function getEcorpAiGateway(): EcorpAiGateway {
  if (!gatewayInstance) {
    gatewayInstance = new EcorpAiGateway(process.env.GEMINI_API_KEY);
  }
  return gatewayInstance;
}
