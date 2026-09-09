
export interface AiResponseMetadata {
  provider: string;
  model: string;
  latencyMs: number;
  usage?: {
    promptTokens: number;
    candidatesTokenCount: number;
    totalTokens: number;
  };
}

export interface AiResponse {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: AiResponseMetadata;
}

export interface GenerationRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  model?: string;
}

export interface EvaluationRequest {
  prompt: string;
  rubric: any;
  missionContext?: string;
  type?: string;
}

export interface EvaluationResponse {
  success: boolean;
  error?: string;
  score?: number;
  grade?: string;
  passed?: boolean;
  feedback?: string;
  criteria?: any[];
  suggestions?: string[];
  metadata?: AiResponseMetadata;
}

export interface AiProvider {
  generate(request: GenerationRequest): Promise<AiResponse>;
  evaluate(request: EvaluationRequest): Promise<EvaluationResponse>;
}
