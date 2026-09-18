/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CompetencyLevel =
  | "Not Started"
  | "Introduced"
  | "Practicing"
  | "Proficient"
  | "Mastered";

export type EvidenceWeight = "exposure" | "practice" | "demonstration" | "assessment";

export type CompetencyId =
  | "prompt-foundations"
  | "context-engineering"
  | "role-persona-design"
  | "cognitive-reasoning"
  | "structured-output"
  | "adversarial-defense"
  | "evaluation-orchestration";

export interface CompetencyEvidence {
  id: string;
  competencyId: CompetencyId;
  type:
    | "lesson_completed"
    | "active_recall_completed"
    | "sandbox_completed"
    | "pattern_practice"
    | "mission_completed"
    | "ctf_completed"
    | "assessment_passed"
    | "validated_prompt"
    | "prompt_comparison"
    | "batch_evaluation";
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
    lessons: string[];
    patterns: string[];
    missions: string[];
    ctfChallenges?: string[];
    assessments: string[];
  };
}

export interface CompetencyState {
  competency: CompetencyDefinition;
  level: CompetencyLevel;
  evidence: CompetencyEvidence[];
  explanation: string;
  nextMilestone: string;
}

/**
 * UID-scoped Firestore document schema mapping for user competency state.
 */
export interface UserCompetenciesDocument {
  uid: string;
  competencyLevels: Record<CompetencyId, CompetencyLevel>;
  evidenceRecords: CompetencyEvidence[];
  updatedAt: string;
}
