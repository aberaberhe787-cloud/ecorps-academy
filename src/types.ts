export type NavTab = "home" | "curriculum" | "foundations" | "playground" | "patterns" | "resources" | "ctf" | "certification" | "profile";

export type BloomsTaxonomyLevel =
  | "Remembering"
  | "Understanding"
  | "Applying"
  | "Analyzing"
  | "Evaluating"
  | "Creating";

export interface ConceptBlock {
  id: string;
  title: string;
  bloomLevel: BloomsTaxonomyLevel;
  type: "theory" | "code-anatomy" | "empirical-rule" | "case-study";
  readMinutes: number;
  content: string; // Markdown supported with theoretical depth
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  keyTakeaway: string;
  academicCitation?: string; // e.g. "Wei et al., 2022 (NeurIPS)", "Yao et al., 2023 (ICLR)"
}

export type ChallengeType = "quiz" | "spot-error" | "complete-pattern" | "sandbox-fix";

export interface InteractiveChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  bloomLevel: BloomsTaxonomyLevel;
  instructions: string;
  question?: string;
  options?: { id: string; text: string; code?: string }[];
  correctAnswer?: string | string[]; // Option ID or exact token match
  brokenPrompt?: string;
  targetRequirement?: string;
  initialPrompt?: string;
  taskGoal?: string;
  expectedOutputPreview?: string;
  validationRule?: {
    requiredKeywords: string[];
    forbiddenKeywords?: string[];
    requiresDelimiters?: boolean;
    requiresCoT?: boolean;
    requiresJsonFormat?: boolean;
    minCharLength?: number;
  };
  feedback: {
    success: string;
    failure: string; // Specific hint
    theoreticalRationale: string;
  };
  xpReward: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  subtitle: string;
  objective?: string; // "By the end of this module, you will be able to..."
  estimatedMinutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  bloomTaxonomyFocus?: BloomsTaxonomyLevel;
  prerequisites?: string[];
  xpReward?: number;
  conceptSummary: string;
  deepDive: string[];
  keyRules: string[];
  concepts?: ConceptBlock[];
  checkpoints?: InteractiveChallenge[];
  badPrompt: {
    prompt: string;
    explanation: string;
    sampleOutput: string;
  };
  goodPrompt: {
    prompt: string;
    explanation: string;
    sampleOutput: string;
  };
  playgroundPreset: {
    systemInstruction?: string;
    prompt: string;
    temperature: number;
    description: string;
  };
}

export interface CurriculumModule {
  id: string;
  code?: string;
  title: string;
  level?: "Foundations" | "Intermediate Patterns" | "Advanced System Architectures" | "Safety & Alignment";
  academicTrack?: string;
  description: string;
  badge: string;
  iconName: string;
  estimatedTotalHours?: number;
  lessons: Lesson[];
}

export interface Mission {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
  description: string;
  objective: string;
  targetCriteria: string[];
  initialPrompt: string;
  systemInstruction?: string;
  hints: string[];
  solutionExample: string;
  validator: {
    requiredKeywords: string[];
    forbiddenKeywords?: string[];
    requiresRole?: boolean;
    requiresDelimiters?: boolean;
    requiresOutputFormat?: boolean;
    requiresFewShot?: boolean;
    requiresCoT?: boolean;
    minCharLength: number;
  };
}

export interface PromptPattern {
  id: string;
  title: string;
  category: "Coding" | "Writing" | "Analysis" | "Architecture" | "Reasoning";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  template: string;
  variables: { name: string; label: string; placeholder: string; defaultValue: string }[];
  whyItWorks: string[];
  sampleOutput: string;
  tags: string[];
}

export interface PromptAnalysis {
  score: number; // 0 to 100
  grade: "S" | "A" | "B" | "C" | "D";
  tokenEstimate: number;
  wordCount: number;
  charCount: number;
  detectedFeatures: {
    hasRole: boolean;
    hasDelimiters: boolean;
    hasFormattingConstraints: boolean;
    hasChainOfThought: boolean;
    hasFewShot: boolean;
    hasNegativeConstraints: boolean;
    hasVariablePlaceholders: boolean;
  };
  strengths: string[];
  suggestions: string[];
  techniqueBadges: string[];
}

export interface ExecutionResult {
  id: string;
  prompt: string;
  systemInstruction?: string;
  output: string;
  timestamp: number;
  durationMs: number;
  tokenCount: number;
  isMock: boolean;
  model: string;
  status: "idle" | "loading" | "success" | "error";
  errorMessage?: string;
  detectedTechniques?: string[];
}

export interface MissionEvaluationResult {
  missionId: string;
  score: number;
  grade: "S" | "A" | "B" | "C" | "D";
  passed: boolean;
  criteriaChecks: { criteria: string; passed: boolean; feedback: string }[];
  generalFeedback: string;
  xpEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  earnedAt: number;
}

export interface UserProgress {
  completedLessons: string[];
  completedMissions: string[];
  missionScores: Record<string, number>;
  bookmarkedPatterns: string[];
  savedCustomPrompts: { id: string; title: string; prompt: string; createdAt: number }[];
  xp: number;
  streakDays: number;
  lastActivityDate: string;
  achievements: Achievement[];
}

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  example: string;
  proTip: string;
}

export interface TokenChunk {
  id: number;
  text: string;
  charStart: number;
  charEnd: number;
  byteLength: number;
  category: "directive" | "delimiter" | "variable" | "syntax" | "content" | "whitespace";
  colorClass: string;
}

export interface BatchTestCase {
  id: string;
  name: string;
  variables: Record<string, string>;
  status: "idle" | "running" | "success" | "error";
  output?: string;
  durationMs?: number;
  tokenCount?: number;
  error?: string;
}

export interface JsonSchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "enum";
  description: string;
  required: boolean;
  enumValues?: string[];
}

export interface JsonValidationReport {
  isValidJson: boolean;
  isMarkdownFree: boolean;
  hasRequiredKeys: boolean;
  typeCheckPassed: boolean;
  noHallucinatedKeys: boolean;
  score: number; // 0 - 100
  parsedData: any | null;
  rawOutput: string;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface CtfLevel {
  id: number;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  systemPrompt: string;
  secretFlag: string;
  objective: string;
  defenseMechanism: string;
  hints: string[];
  xpReward: number;
}

