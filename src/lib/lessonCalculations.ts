import { Lesson } from "../types";

export interface LessonReadingStats {
  minutes: number;
  wordCount: number;
  charCount: number;
  display: string;
}

/**
 * Calculates estimated read time for a lesson based on actual content length
 * across theoretical summaries, deep-dive items, key rules, concept blocks,
 * code snippets, and interactive checkpoint questions.
 *
 * Uses calibrated technical reading speed: ~180 words per minute
 * (reflecting the increased cognitive load of syntax, formulas, and schema contracts).
 */
export function calculateLessonReadingStats(lesson: Lesson): LessonReadingStats {
  if (!lesson) {
    return {
      minutes: 5,
      wordCount: 900,
      charCount: 5400,
      display: "5 min read",
    };
  }

  let textPieces: string[] = [];

  // Title and objectives
  if (lesson.title) textPieces.push(lesson.title);
  if (lesson.subtitle) textPieces.push(lesson.subtitle);
  if (lesson.objective) textPieces.push(lesson.objective);
  if (lesson.conceptSummary) textPieces.push(lesson.conceptSummary);

  // Deep dive & Key rules
  if (Array.isArray(lesson.deepDive)) {
    textPieces.push(...lesson.deepDive);
  }
  if (Array.isArray(lesson.keyRules)) {
    textPieces.push(...lesson.keyRules);
  }

  // Concepts blocks & code anatomy
  if (Array.isArray(lesson.concepts)) {
    for (const concept of lesson.concepts) {
      if (concept.title) textPieces.push(concept.title);
      if (concept.content) textPieces.push(concept.content);
      if (concept.keyTakeaway) textPieces.push(concept.keyTakeaway);
      if (concept.codeSnippet?.code) {
        textPieces.push(concept.codeSnippet.code);
      }
    }
  }

  // Exemplar prompts and explanations
  if (lesson.badPrompt) {
    if (lesson.badPrompt.prompt) textPieces.push(lesson.badPrompt.prompt);
    if (lesson.badPrompt.explanation) textPieces.push(lesson.badPrompt.explanation);
    if (lesson.badPrompt.sampleOutput) textPieces.push(lesson.badPrompt.sampleOutput);
  }
  if (lesson.goodPrompt) {
    if (lesson.goodPrompt.prompt) textPieces.push(lesson.goodPrompt.prompt);
    if (lesson.goodPrompt.explanation) textPieces.push(lesson.goodPrompt.explanation);
    if (lesson.goodPrompt.sampleOutput) textPieces.push(lesson.goodPrompt.sampleOutput);
  }

  // Interactive challenges / checkpoints
  if (Array.isArray(lesson.checkpoints)) {
    for (const cp of lesson.checkpoints) {
      if (cp.title) textPieces.push(cp.title);
      if (cp.instructions) textPieces.push(cp.instructions);
      if (cp.question) textPieces.push(cp.question);
      if (Array.isArray(cp.options)) {
        textPieces.push(...cp.options.map((o) => `${o.text || ""} ${o.code || ""}`));
      }
      if (cp.feedback) {
        if (cp.feedback.theoreticalRationale) textPieces.push(cp.feedback.theoreticalRationale);
        if (cp.feedback.success) textPieces.push(cp.feedback.success);
        if (cp.feedback.failure) textPieces.push(cp.feedback.failure);
      }
    }
  }

  const joinedText = textPieces.join(" ");
  // Strip Markdown markers and symbols to count clean words
  const cleanText = joinedText.replace(/[#*`_~>[\]()\-+=\\|{}]/g, " ");
  const words = cleanText.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const charCount = joinedText.length;

  // Reading speed: ~180 words per minute for technical prompt architecture content
  const calculatedMinutes = Math.max(1, Math.round(wordCount / 180));

  return {
    minutes: calculatedMinutes,
    wordCount,
    charCount,
    display: `${calculatedMinutes} min read`,
  };
}

export interface DifficultyBadgeConfig {
  label: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  bg: string;
  text: string;
  border: string;
  dotBg: string;
  glowClass: string;
}

export function getDifficultyBadgeConfig(
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" | string = "Beginner"
): DifficultyBadgeConfig {
  const norm = (difficulty || "Beginner").toLowerCase().trim();

  if (norm === "beginner") {
    return {
      label: "Beginner",
      bg: "bg-emerald-950/80",
      text: "text-emerald-400",
      border: "border-emerald-700/60",
      dotBg: "bg-emerald-400",
      glowClass: "shadow-emerald-950/40",
    };
  }

  if (norm === "intermediate") {
    return {
      label: "Intermediate",
      bg: "bg-amber-950/80",
      text: "text-amber-400",
      border: "border-amber-700/60",
      dotBg: "bg-amber-400",
      glowClass: "shadow-amber-950/40",
    };
  }

  if (norm === "advanced") {
    return {
      label: "Advanced",
      bg: "bg-purple-950/80",
      text: "text-purple-400",
      border: "border-purple-700/60",
      dotBg: "bg-purple-400",
      glowClass: "shadow-purple-950/40",
    };
  }

  // Default or Expert
  return {
    label: "Expert",
    bg: "bg-rose-950/80",
    text: "text-rose-400",
    border: "border-rose-700/60",
    dotBg: "bg-rose-400",
    glowClass: "shadow-rose-950/40",
  };
}
