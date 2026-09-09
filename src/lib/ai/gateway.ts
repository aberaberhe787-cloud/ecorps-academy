
import { AiProvider, GenerationRequest, AiResponse, EvaluationRequest, EvaluationResponse } from "./types";
import { GeminiProvider } from "./providers/geminiProvider";

export class EcorpAiGateway {
  private provider: AiProvider;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error("AI_NOT_CONFIGURED");
    }
    // Phase 1: Only support Gemini
    this.provider = new GeminiProvider(apiKey);
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
