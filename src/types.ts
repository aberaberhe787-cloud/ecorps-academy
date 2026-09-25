export interface ProgressModel {
  completed: number;
  total: number;
  percentage: number;
  current: number;
  remaining: number;
  weeklyCompleted: number;
  weeklyGoal: number;
  foundations: {
    completed: number;
    total: number;
    percentage: number;
  };
  curriculum: {
    completed: number;
    total: number;
    percentage: number;
  };
  missions: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export type CheckpointStatus = "locked" | "available" | "passed";
export type QuizInteractionState = "idle" | "selected" | "submitted" | "retrying";

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
  competencies?: CompetencyId[];
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
  competencies?: CompetencyId[];
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

export type PatternType = "pattern" | "workflow" | "evaluation";

export interface PatternAnatomyItem {
  name: string;
  technique: string;
  explanation: string;
  purpose: string;
}

export interface WeakExample {
  prompt: string;
  problems: string[];
}

export interface ImprovedExample {
  prompt: string;
  changes: string[];
  explanation: string;
}

export interface PromptPattern {
  id: string;
  title: string;
  category: "Coding" | "Writing" | "Analysis" | "Architecture" | "Reasoning";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  concept: string;
  supportingTechniques?: string[];
  competencies?: CompetencyId[];
  learningObjective: string;
  whenToUse: string[];
  whenNotToUse: string[];
  limitations: string[];
  patternType?: PatternType;
  anatomy?: PatternAnatomyItem[];
  weakExample?: WeakExample;
  improvedExample?: ImprovedExample;
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
  executionMode?: "real" | "mock" | "error";
  provider?: string;
  requestId?: string;
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

export interface LessonFeedback {
  id: string;
  lessonId: string;
  lessonTitle: string;
  rating: number; // 1 to 5
  clarityRating?: number; // 1 to 5
  practicalityRating?: number; // 1 to 5
  pacing?: "too-slow" | "just-right" | "too-fast";
  comment: string;
  tags?: string[];
  submittedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  icon: string;
  earnedAt: number;
}

export interface SavedCodeSnippet {
  id: string;
  title: string;
  language: "python" | "typescript" | "javascript" | "json" | "curl" | "prompt" | string;
  code: string;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface ReviewScheduleItem {
  lessonId: string;
  dueAt: number;
  intervalDays: number;
  completedAt?: number;
}

export interface WorkplaceProject {
  id: string;
  title: string;
  problem: string;
  successMetric: string;
  status: "planned" | "in_progress" | "complete";
  linkedMissionIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProgress {
  completedLessons: string[];
  completedMissions: string[];
  completedAssessments?: string[];
  missionEvidence?: Record<string, string>;
  missionScores: Record<string, number>;
  bookmarkedPatterns: string[];
  bookmarkedLessons?: string[];
  lessonFeedbacks?: Record<string, LessonFeedback>;
  savedCustomPrompts: { id: string; title: string; prompt: string; createdAt: number }[];
  savedCodeSnippets?: SavedCodeSnippet[];
  xp: number;
  streakDays: number;
  lastActivityDate: string;
  loginHistory?: string[];
  achievements: Achievement[];
  lastLessonId?: string;
  lastModuleId?: string;
  curriculumProgressPercent?: number;
  promptsEngineeredCount?: number;
  experiments?: PromptExperiment[];
  reviewSchedule?: ReviewScheduleItem[];
  workplaceProjects?: WorkplaceProject[];
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

// ---------------------------------------------------------------------------
// Unified Learning & Competency Architecture (P2)
// ---------------------------------------------------------------------------

export type CompetencyId =
  | "prompt-foundations"
  | "context-engineering"
  | "role-persona-design"
  | "cognitive-reasoning"
  | "structured-output"
  | "adversarial-defense"
  | "evaluation-orchestration";

export type CompetencyLevel =
  | "Not Started"
  | "Introduced"
  | "Practicing"
  | "Proficient"
  | "Mastered";

export const levelMap: Record<CompetencyLevel, number> = {
  "Not Started": 0,
  "Introduced": 1,
  "Practicing": 2,
  "Proficient": 3,
  "Mastered": 4,
};

export type EvidenceWeight = "exposure" | "practice" | "demonstration" | "assessment";

export type EvidenceType =
  | "lesson_completed"
  | "checkpoint_passed"
  | "sandbox_completed"
  | "pattern_practice"
  | "mission_completed"
  | "ctf_completed"
  | "assessment_passed"
  | "validated_prompt"
  | "prompt_comparison"
  | "batch_evaluation"
  | "experiment_completed"
  | "regression_detected";

export interface CompetencyEvidence {
  id: string;
  type: EvidenceType;
  competencyId: CompetencyId;
  sourceId: string;
  title: string;
  timestamp: number;
  weight: EvidenceWeight;
  summary: string;
}

export interface CompetencyDefinition {
  id: CompetencyId;
  title: string;
  domain: string;
  description: string;
  level: "Foundations" | "Intermediate" | "Advanced";
  relatedTechniques: string[];
  evidenceSources: {
    lessons?: string[];
    patterns?: string[];
    missions?: string[];
    ctfChallenges?: string[];
    assessments?: string[];
  };
}

export interface CompetencyState {
  competency: CompetencyDefinition;
  level: CompetencyLevel;
  evidence: CompetencyEvidence[];
  explanation: string;
  nextMilestone: string;
}

export type TestCaseExpectationType = "exact" | "json" | "contains" | "no_forbidden";

export interface TestCase {
  id: string;
  input: string;
  expectedType: TestCaseExpectationType;
  expectedValue?: string;
  requiredKeywords?: string[];
  forbiddenKeywords?: string[];
}

export interface VariantResult {
  testResults: { testCaseId: string; passed: boolean; details: string }[];
  passedCount: number;
  totalCount: number;
  regressionsCount: number;
  outputSample?: string;
  tokenCount?: number;
  status: "Passed" | "Improved" | "Regressed" | "Mixed" | "Needs Review" | "Draft";
}

export interface PromptVariant {
  id: string;
  name: string;
  prompt: string;
  systemInstruction?: string;
  mutationRationale: string;
  hypothesis: string;
  results?: VariantResult;
}

export interface PromptExperiment {
  id: string;
  title: string;
  description: string;
  baselinePrompt: string;
  baselineSystemInstruction?: string;
  baselineResults?: VariantResult;
  variants: PromptVariant[];
  testCases: TestCase[];
  createdAt: number;
  updatedAt: number;
}



