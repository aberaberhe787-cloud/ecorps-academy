import { PromptAnalysis } from "../types";

export function analyzePrompt(promptText: string): PromptAnalysis {
  const text = promptText.trim();
  const lower = text.toLowerCase();

  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const charCount = text.length;
  const wordCount = words.length;
  const tokenEstimate = Math.max(1, Math.round(charCount / 4));

  if (!text) {
    return {
      score: 0,
      grade: "D",
      tokenEstimate: 0,
      wordCount: 0,
      charCount: 0,
      detectedFeatures: {
        hasRole: false,
        hasDelimiters: false,
        hasFormattingConstraints: false,
        hasChainOfThought: false,
        hasFewShot: false,
        hasNegativeConstraints: false,
        hasVariablePlaceholders: false
      },
      strengths: [],
      suggestions: ["Start typing your prompt to receive real-time quality feedback."],
      techniqueBadges: []
    };
  }

  // Feature detection
  const hasRole = /(act as|you are a|you are an|persona|assume the role of|expert in|specialist)/i.test(text);
  const hasDelimiters = /(<{1,2}[a-z_-]+>{1,2}|"{3}|`{3}|---|\n### )/i.test(text);
  const hasFormattingConstraints = /(json|schema|bullet|table|markdown|numbered|max words|under \d+ words|\d+ sentences|raw json|format:)/i.test(text);
  const hasChainOfThought = /(step[- ]by[- ]step|think|reasoning|scratchpad|deduction|first,|stage 1|calculate|verify)/i.test(text);
  const hasFewShot = /(example \d+:|input:.*output:|exemplar|---[\s\S]*---)/i.test(text);
  const hasNegativeConstraints = /(do not|don't|forbidden|never|avoid|prohibited|without using)/i.test(text);
  const hasVariablePlaceholders = /{{[a-zA-Z0-9_-]+}}/.test(text);

  let score = 30; // base score for entering text

  // Length scoring
  if (wordCount >= 20) score += 10;
  if (wordCount >= 45) score += 10;
  if (wordCount >= 90) score += 5;

  // Feature bonuses
  if (hasRole) score += 12;
  if (hasDelimiters) score += 12;
  if (hasFormattingConstraints) score += 12;
  if (hasChainOfThought) score += 10;
  if (hasFewShot) score += 12;
  if (hasNegativeConstraints) score += 6;
  if (hasVariablePlaceholders) score += 4;

  // Cap at 100
  score = Math.min(100, Math.max(10, score));

  // ... (feature detection logic remains the same)

  // Determine Grade
  let grade: PromptAnalysis["grade"] = "D";
  if (score >= 90) grade = "S";
  else if (score >= 80) grade = "A";
  else if (score >= 65) grade = "B";
  else if (score >= 50) grade = "C";

  const strengths: string[] = [];
  const suggestions: string[] = [];
  const techniqueBadges: string[] = [];

  // Context-aware pedagogical feedback
  if (hasRole) {
    strengths.push("Role & Persona Defined: Directs model domain expertise.");
    techniqueBadges.push("Role Prompting");
  } else {
    suggestions.push("Pedagogical Tip: Add a specific role persona (e.g., 'Act as a Senior SRE...') to set tone, lexical density, and domain depth.");
  }

  if (hasDelimiters) {
    strengths.push("Structural Delimiters Present: Protects payload integrity and organizes context.");
    techniqueBadges.push("Delimiters (XML/Quotes)");
  } else {
    suggestions.push("Pedagogical Tip: Use XML tags (e.g., <context>...</context>) to isolate developer instructions from raw input data.");
  }

  if (hasFormattingConstraints) {
    strengths.push("Structured Output Constraint: Enforces explicit schemas, tables, or word limits.");
    techniqueBadges.push("Output Formatting");
  } else if (hasRole || hasDelimiters) {
    suggestions.push("Pedagogical Tip: To complete your prompt, specify the output format (e.g., 'Return JSON schema', '3 bullet points') to minimize output variance.");
  }

  if (hasChainOfThought) {
    strengths.push("Reasoning Steps Triggered: Chain-of-Thought minimizes cognitive shortcuts.");
    techniqueBadges.push("Chain-of-Thought (CoT)");
  } else if (score > 60) {
    suggestions.push("Pedagogical Tip: For complex tasks, add 'Think step-by-step' to enable reasoning tokens, which drastically improves accuracy on multi-step problems.");
  }

  if (hasFewShot) {
    strengths.push("Few-Shot Exemplars Provided: Calibrates edge cases and syntax through demonstration.");
    techniqueBadges.push("Few-Shot Exemplars");
  }

  if (hasNegativeConstraints) {
    strengths.push("Guardrails & Negative Constraints: Restricts unwanted buzzwords or behaviors.");
    techniqueBadges.push("Negative Constraints");
  } else if (hasRole) {
    suggestions.push("Pedagogical Tip: Combine your role persona with negative constraints to forbid conversational filler and keep the model focused.");
  }

  if (wordCount < 15) {
    suggestions.push("Pedagogical Tip: Prompt is very short. Add background context and explicit task scope to allow the model to fully utilize its latent knowledge.");
  }

  return {
    score,
    grade,
    tokenEstimate,
    wordCount,
    charCount,
    detectedFeatures: {
      hasRole,
      hasDelimiters,
      hasFormattingConstraints,
      hasChainOfThought,
      hasFewShot,
      hasNegativeConstraints,
      hasVariablePlaceholders
    },
    strengths,
    suggestions: suggestions.slice(0, 3),
    techniqueBadges
  };
}
