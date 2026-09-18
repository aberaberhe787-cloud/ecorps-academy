import {
  CompetencyDefinition,
  CompetencyEvidence,
  CompetencyId,
  CompetencyLevel,
  CompetencyState,
  EvidenceWeight,
  UserProgress,
} from "../types";

export const COMPETENCIES: CompetencyDefinition[] = [
  {
    id: "prompt-foundations",
    title: "Core Prompt Mechanics & Clarity",
    domain: "Foundations",
    description:
      "Controlling causal next-token probability, eliminating ambiguity entropy, applying unambiguous operational verbs, strict token budgeting, and disciplined iterative refinement.",
    level: "Foundations",
    relatedTechniques: [
      "Clarity & Specificity",
      "Token Budgeting",
      "Negative Constraints",
      "Iterative Refinement",
    ],
    evidenceSources: {
      lessons: ["foundation-clarity", "foundation-iteration", "m1-l1"],
      patterns: ["pat-write-cold-outreach"],
      missions: ["mission-1"],
      assessments: ["prompt-foundations-final"],
    },
  },
  {
    id: "context-engineering",
    title: "Context Delimitation & In-Context Calibration",
    domain: "In-Context Architecture",
    description:
      "Structuring prompt perimeters using explicit XML delimiters, strictly isolating payload data from instruction boundaries, and calibrating few-shot demonstration exemplars.",
    level: "Foundations",
    relatedTechniques: [
      "XML Delimiters",
      "Few-Shot Calibration",
      "Context Boundary Defense",
      "In-Context Exemplars",
    ],
    evidenceSources: {
      lessons: ["foundation-context", "m1-l2", "m1-l4"],
      patterns: ["pat-code-debug", "pat-code-review"],
      missions: ["mission-5"],
      assessments: ["prompt-foundations-final"],
    },
  },
  {
    id: "role-persona-design",
    title: "Role Specification & Persona Steering",
    domain: "Latent Steering",
    description:
      "Steering latent model representations via expert role definitions, persona framing, lexical density calibration, and tailored audience conditioning.",
    level: "Intermediate",
    relatedTechniques: [
      "Role Specification",
      "Lexical Density",
      "Audience Conditioning",
      "Persona Demeanor",
    ],
    evidenceSources: {
      lessons: ["foundation-role", "m1-l3"],
      patterns: ["pat-write-cold-outreach", "pat-write-exec-summary"],
      missions: ["mission-4"],
      ctfChallenges: ["ctf-challenge-2"],
      assessments: ["prompt-foundations-final"],
    },
  },
  {
    id: "cognitive-reasoning",
    title: "Decomposition & Cognitive Reasoning",
    domain: "Cognitive Architecture",
    description:
      "Allocating computational tokens across multi-step deduction chains: Chain-of-Thought, explicit intermediate scratchpads, Self-Consistency majority voting, and Tree-of-Thoughts algorithmic search.",
    level: "Intermediate",
    relatedTechniques: [
      "Chain-of-Thought",
      "Task Decomposition",
      "Self-Consistency (CoT-SC)",
      "Tree-of-Thoughts (ToT)",
    ],
    evidenceSources: {
      lessons: ["m2-l1", "m2-l2", "m2-l3"],
      patterns: ["pat-code-debug", "pat-arch-5whys"],
      missions: ["mission-3"],
      assessments: ["prompt-foundations-final"],
    },
  },
  {
    id: "structured-output",
    title: "Structured Schemas & Format Constraints",
    domain: "Serialization & Contracts",
    description:
      "Guiding token generation into strict schemas (JSON, Markdown tables, typed records), CFG grammar masking, and enforcing the zero-preamble invariant.",
    level: "Intermediate",
    relatedTechniques: [
      "JSON Schema",
      "Grammar Constraints",
      "Zero-Preamble Invariant",
      "Table Formatting",
    ],
    evidenceSources: {
      lessons: ["foundation-constraints", "m3-l1", "m3-l2"],
      patterns: ["pat-code-review", "pat-analysis-swot"],
      missions: ["mission-2"],
      assessments: ["prompt-foundations-final"],
    },
  },
  {
    id: "adversarial-defense",
    title: "System Alignment & Adversarial Robustness",
    domain: "Security & Alignment",
    description:
      "Hardening system prompts against injection vectors, jailbreak framing, data exfiltration, privilege escalation, and instruction overrides.",
    level: "Advanced",
    relatedTechniques: [
      "Prompt Injection Defense",
      "Dual-LLM Sandboxing",
      "Secret Containment",
      "Adversarial Fuzzing",
    ],
    evidenceSources: {
      lessons: ["m2-l4", "m4-l1", "m4-l2", "m4-l3", "m4-l4"],
      patterns: [],
      missions: [],
      ctfChallenges: ["ctf-challenge-1", "ctf-challenge-2", "ctf-challenge-3"],
      assessments: [],
    },
  },
  {
    id: "evaluation-orchestration",
    title: "Evaluation, Tool Calling & Agentic Orchestration",
    domain: "Autonomous Systems",
    description:
      "Autonomous ReAct loops, function calling schema binding, quantitative prompt evaluation, benchmark grading, and systematic prompt iteration.",
    level: "Advanced",
    relatedTechniques: [
      "ReAct Loops",
      "Tool Calling",
      "Automated Rubric Evaluation",
      "Pedagogical Graders",
    ],
    evidenceSources: {
      lessons: ["m3-l3", "m3-l4"],
      patterns: ["pat-write-exec-summary"],
      missions: [],
      ctfChallenges: [],
      assessments: ["prompt-foundations-final"],
    },
  },
];

export interface SourceMetadata {
  id: string;
  title: string;
  primaryCompetency: CompetencyId;
  secondaryCompetencies?: CompetencyId[];
}

export const LESSON_COMPETENCY_REGISTRY: Record<string, SourceMetadata> = {
  "foundation-clarity": {
    id: "foundation-clarity",
    title: "Clarity & Specificity",
    primaryCompetency: "prompt-foundations",
  },
  "foundation-role": {
    id: "foundation-role",
    title: "Role Assignment",
    primaryCompetency: "role-persona-design",
  },
  "foundation-constraints": {
    id: "foundation-constraints",
    title: "Constraints & Formatting",
    primaryCompetency: "structured-output",
  },
  "foundation-iteration": {
    id: "foundation-iteration",
    title: "Iterative Refinement",
    primaryCompetency: "prompt-foundations",
  },
  "foundation-context": {
    id: "foundation-context",
    title: "Context Injection",
    primaryCompetency: "context-engineering",
  },
  "m1-l1": {
    id: "m1-l1",
    title: "Clarity, Specificity & Constraint Bounding",
    primaryCompetency: "prompt-foundations",
  },
  "m1-l2": {
    id: "m1-l2",
    title: "Context Delimitation & XML Tagging Perimeters",
    primaryCompetency: "context-engineering",
  },
  "m1-l3": {
    id: "m1-l3",
    title: "Persona Adoption, Lexical Density & Tone Calibration",
    primaryCompetency: "role-persona-design",
  },
  "m1-l4": {
    id: "m1-l4",
    title: "In-Context Learning Dynamics & Few-Shot Demonstration",
    primaryCompetency: "context-engineering",
  },
  "m2-l1": {
    id: "m2-l1",
    title: "Chain-of-Thought (CoT) & Reasoning Tokens",
    primaryCompetency: "cognitive-reasoning",
  },
  "m2-l2": {
    id: "m2-l2",
    title: "Self-Consistency Sampling & Majority Voting (CoT-SC)",
    primaryCompetency: "cognitive-reasoning",
  },
  "m2-l3": {
    id: "m2-l3",
    title: "Tree-of-Thoughts (ToT) Multi-Branch Algorithmic Search",
    primaryCompetency: "cognitive-reasoning",
  },
  "m2-l4": {
    id: "m2-l4",
    title: "Guardrails, Negative Constraints & Instruction Masking",
    primaryCompetency: "adversarial-defense",
    secondaryCompetencies: ["prompt-foundations"],
  },
  "m3-l1": {
    id: "m3-l1",
    title: "JSON Schema & Grammar-Constrained Decoding",
    primaryCompetency: "structured-output",
  },
  "m3-l2": {
    id: "m3-l2",
    title: "Context Window Budgeting & Information Density Optimization",
    primaryCompetency: "structured-output",
    secondaryCompetencies: ["context-engineering"],
  },
  "m3-l3": {
    id: "m3-l3",
    title: "Autonomous Tool Calling & ReAct Orchestration",
    primaryCompetency: "evaluation-orchestration",
  },
  "m3-l4": {
    id: "m3-l4",
    title: "Automated Prompt Evaluation & Pedagogical Graders",
    primaryCompetency: "evaluation-orchestration",
  },
  "m4-l1": {
    id: "m4-l1",
    title: "Prompt Injection Vectors & Jailbreak Taxonomy",
    primaryCompetency: "adversarial-defense",
  },
  "m4-l2": {
    id: "m4-l2",
    title: "Dual-LLM Sandboxing & Privilege Separation",
    primaryCompetency: "adversarial-defense",
  },
  "m4-l3": {
    id: "m4-l3",
    title: "Information Leakage & Secret Exfiltration Hardening",
    primaryCompetency: "adversarial-defense",
  },
  "m4-l4": {
    id: "m4-l4",
    title: "Automated Adversarial Fuzzing & Red-Teaming",
    primaryCompetency: "adversarial-defense",
  },
};

export const PATTERN_COMPETENCY_REGISTRY: Record<string, SourceMetadata> = {
  "pat-code-debug": {
    id: "pat-code-debug",
    title: "Root Cause Code Debugger",
    primaryCompetency: "cognitive-reasoning",
    secondaryCompetencies: ["context-engineering"],
  },
  "pat-code-review": {
    id: "pat-code-review",
    title: "Comprehensive Code Reviewer",
    primaryCompetency: "structured-output",
    secondaryCompetencies: ["context-engineering"],
  },
  "pat-write-exec-summary": {
    id: "pat-write-exec-summary",
    title: "Executive Summary Synthesizer",
    primaryCompetency: "role-persona-design",
    secondaryCompetencies: ["evaluation-orchestration"],
  },
  "pat-write-cold-outreach": {
    id: "pat-write-cold-outreach",
    title: "High-Conversion Cold Outreach",
    primaryCompetency: "role-persona-design",
    secondaryCompetencies: ["prompt-foundations"],
  },
  "pat-analysis-swot": {
    id: "pat-analysis-swot",
    title: "Strategic SWOT Analysis Framework",
    primaryCompetency: "structured-output",
    secondaryCompetencies: ["cognitive-reasoning"],
  },
  "pat-arch-5whys": {
    id: "pat-arch-5whys",
    title: "5-Whys Root Cause Failure Analysis",
    primaryCompetency: "cognitive-reasoning",
  },
};

export const MISSION_COMPETENCY_REGISTRY: Record<string, SourceMetadata> = {
  "mission-1": {
    id: "mission-1",
    title: "Mission 1: The Vague Request Overhaul",
    primaryCompetency: "prompt-foundations",
  },
  "mission-2": {
    id: "mission-2",
    title: "Mission 2: Strict JSON Data Extractor",
    primaryCompetency: "structured-output",
  },
  "mission-3": {
    id: "mission-3",
    title: "Mission 3: Chain-of-Thought Logic Solver",
    primaryCompetency: "cognitive-reasoning",
  },
  "mission-4": {
    id: "mission-4",
    title: "Mission 4: Role & Persona Calibration",
    primaryCompetency: "role-persona-design",
  },
  "mission-5": {
    id: "mission-5",
    title: "Mission 5: Zero-Shot to Few-Shot Refactor",
    primaryCompetency: "context-engineering",
  },
};

export const CTF_COMPETENCY_REGISTRY: Record<string, SourceMetadata> = {
  "ctf-challenge-1": {
    id: "ctf-challenge-1",
    title: "CTF Level 1: The Guard Dog",
    primaryCompetency: "adversarial-defense",
  },
  "ctf-challenge-2": {
    id: "ctf-challenge-2",
    title: "CTF Level 2: The Roleplay Trap",
    primaryCompetency: "adversarial-defense",
    secondaryCompetencies: ["role-persona-design"],
  },
  "ctf-challenge-3": {
    id: "ctf-challenge-3",
    title: "CTF Level 3: The Strict Logic Core",
    primaryCompetency: "adversarial-defense",
  },
};

export const ASSESSMENT_COMPETENCY_REGISTRY: Record<string, SourceMetadata> = {
  "prompt-foundations-final": {
    id: "prompt-foundations-final",
    title: "Prompt Engineering Capstone Assessment",
    primaryCompetency: "prompt-foundations",
    secondaryCompetencies: [
      "context-engineering",
      "role-persona-design",
      "structured-output",
    ],
  },
};

/**
 * Deterministic mastery calculation:
 * - Mastered: Evidence includes authoritative assessment OR (at least 2 demonstrations AND at least 1 practice)
 * - Proficient: Evidence includes at least 1 demonstration
 * - Practicing: Evidence includes at least 1 practice OR at least 2 exposures
 * - Introduced: Evidence includes at least 1 exposure
 * - Not Started: 0 evidence
 */
export function calculateCompetencyLevel(
  competency: CompetencyDefinition,
  evidence: CompetencyEvidence[]
): { level: CompetencyLevel; explanation: string; nextMilestone: string } {
  const hasAssessment = evidence.some((e) => e.weight === "assessment");
  const demonstrationCount = evidence.filter((e) => e.weight === "demonstration").length;
  const practiceCount = evidence.filter((e) => e.weight === "practice").length;
  const exposureCount = evidence.filter((e) => e.weight === "exposure").length;

  if (hasAssessment || (demonstrationCount >= 2 && practiceCount >= 1)) {
    return {
      level: "Mastered",
      explanation: hasAssessment
        ? `Mastery verified through authoritative Capstone Assessment with multi-point rubric verification.`
        : `Mastery demonstrated across ${demonstrationCount} verified challenges and consistent practice.`,
      nextMilestone: `Competency demonstrated. Maintain mastery through active sandbox experimentation.`,
    };
  }

  if (demonstrationCount >= 1) {
    return {
      level: "Proficient",
      explanation: `Demonstrated technical capability through hands-on challenge completion in this domain.`,
      nextMilestone: `Complete the Capstone Assessment or additional interactive missions to verify Mastered status.`,
    };
  }

  if (practiceCount >= 1 || exposureCount >= 2) {
    return {
      level: "Practicing",
      explanation: `Active engagement established across ${exposureCount} lesson(s) and structured practical exercises.`,
      nextMilestone: `Solve a hands-on mission or sandbox challenge in this domain to achieve Proficient.`,
    };
  }

  if (exposureCount >= 1) {
    return {
      level: "Introduced",
      explanation: `Foundational concepts and theory introduced through completed curriculum lessons.`,
      nextMilestone: `Complete lesson checkpoints and pattern exercises to advance to Practicing.`,
    };
  }

  return {
    level: "Not Started",
    explanation: `No learning activities completed yet in this competency domain.`,
    nextMilestone: `Start with foundational lessons in this domain to record your first evidence.`,
  };
}

/**
 * Pure, deterministic derivation of competency states from authenticated user progress.
 */
export function deriveCompetencyStates(
  progress: UserProgress,
  ctfSolved: Record<string, boolean> = {}
): CompetencyState[] {
  const evidenceMap: Record<CompetencyId, CompetencyEvidence[]> = {
    "prompt-foundations": [],
    "context-engineering": [],
    "role-persona-design": [],
    "cognitive-reasoning": [],
    "structured-output": [],
    "adversarial-defense": [],
    "evaluation-orchestration": [],
  };

  const addEvidence = (
    competencyId: CompetencyId,
    item: Omit<CompetencyEvidence, "competencyId">
  ) => {
    if (evidenceMap[competencyId]) {
      // Prevent duplicate evidence items by ID
      if (!evidenceMap[competencyId].some((e) => e.id === item.id)) {
        evidenceMap[competencyId].push({
          ...item,
          competencyId,
        });
      }
    }
  };

  // 1. Lessons -> Exposure evidence
  const completedLessons = progress.completedLessons || [];
  completedLessons.forEach((lessonId) => {
    const meta = LESSON_COMPETENCY_REGISTRY[lessonId];
    if (meta) {
      addEvidence(meta.primaryCompetency, {
        id: `ev_lesson_${lessonId}`,
        type: "lesson_completed",
        sourceId: lessonId,
        title: meta.title,
        timestamp: Date.now(),
        weight: "exposure",
        summary: `Completed curriculum lesson: ${meta.title}`,
      });
      if (meta.secondaryCompetencies) {
        meta.secondaryCompetencies.forEach((secComp) => {
          addEvidence(secComp, {
            id: `ev_lesson_sec_${lessonId}_${secComp}`,
            type: "lesson_completed",
            sourceId: lessonId,
            title: meta.title,
            timestamp: Date.now(),
            weight: "exposure",
            summary: `Completed curriculum lesson: ${meta.title}`,
          });
        });
      }
    }
  });

  // 2. Missions -> Demonstration evidence
  const completedMissions = progress.completedMissions || [];
  completedMissions.forEach((missionId) => {
    const meta = MISSION_COMPETENCY_REGISTRY[missionId];
    if (meta) {
      addEvidence(meta.primaryCompetency, {
        id: `ev_mission_${missionId}`,
        type: "mission_completed",
        sourceId: missionId,
        title: meta.title,
        timestamp: Date.now(),
        weight: "demonstration",
        summary: `Passed mission verification challenge: ${meta.title}`,
      });
      if (meta.secondaryCompetencies) {
        meta.secondaryCompetencies.forEach((secComp) => {
          addEvidence(secComp, {
            id: `ev_mission_sec_${missionId}_${secComp}`,
            type: "mission_completed",
            sourceId: missionId,
            title: meta.title,
            timestamp: Date.now(),
            weight: "demonstration",
            summary: `Passed mission verification challenge: ${meta.title}`,
          });
        });
      }
    }
  });

  // 3. CTF Solved -> Demonstration evidence
  Object.entries(ctfSolved).forEach(([ctfId, isSolved]) => {
    if (isSolved) {
      const meta = CTF_COMPETENCY_REGISTRY[ctfId];
      if (meta) {
        addEvidence(meta.primaryCompetency, {
          id: `ev_ctf_${ctfId}`,
          type: "ctf_completed",
          sourceId: ctfId,
          title: meta.title,
          timestamp: Date.now(),
          weight: "demonstration",
          summary: `Successfully solved adversarial jailbreak challenge: ${meta.title}`,
        });
        if (meta.secondaryCompetencies) {
          meta.secondaryCompetencies.forEach((secComp) => {
            addEvidence(secComp, {
              id: `ev_ctf_sec_${ctfId}_${secComp}`,
              type: "ctf_completed",
              sourceId: ctfId,
              title: meta.title,
              timestamp: Date.now(),
              weight: "demonstration",
              summary: `Successfully solved adversarial challenge: ${meta.title}`,
            });
          });
        }
      }
    }
  });

  // 4. Capstone Assessments -> Assessment evidence
  const completedAssessments = progress.completedAssessments || [];
  completedAssessments.forEach((assessmentId) => {
    const meta = ASSESSMENT_COMPETENCY_REGISTRY[assessmentId];
    if (meta) {
      addEvidence(meta.primaryCompetency, {
        id: `ev_assessment_${assessmentId}`,
        type: "assessment_passed",
        sourceId: assessmentId,
        title: meta.title,
        timestamp: Date.now(),
        weight: "assessment",
        summary: `Verified via authoritative assessment: ${meta.title}`,
      });
      if (meta.secondaryCompetencies) {
        meta.secondaryCompetencies.forEach((secComp) => {
          addEvidence(secComp, {
            id: `ev_assessment_sec_${assessmentId}_${secComp}`,
            type: "assessment_passed",
            sourceId: assessmentId,
            title: meta.title,
            timestamp: Date.now(),
            weight: "assessment",
            summary: `Verified via authoritative assessment: ${meta.title}`,
          });
        });
      }
    }
  });

  // 5. Experiments -> Evaluation & Adversarial Defense evidence
  const experiments = progress.experiments || [];
  experiments.forEach((exp) => {
    if (exp.baselineResults || (exp.variants && exp.variants.some((v) => v.results))) {
      addEvidence("evaluation-orchestration", {
        id: `ev_exp_${exp.id}`,
        type: "experiment_completed",
        sourceId: exp.id,
        title: exp.title,
        timestamp: exp.updatedAt || exp.createdAt || Date.now(),
        weight: "demonstration",
        summary: `Executed prompt mutation experiment suite: ${exp.title}`,
      });

      const hasRegression = exp.variants.some(
        (v) => v.results && ((v.results.regressionsCount || 0) > 0 || v.results.status === "Regressed")
      );
      if (hasRegression) {
        addEvidence("adversarial-defense", {
          id: `ev_reg_${exp.id}`,
          type: "regression_detected",
          sourceId: exp.id,
          title: `Regression Analysis: ${exp.title}`,
          timestamp: exp.updatedAt || exp.createdAt || Date.now(),
          weight: "demonstration",
          summary: `Identified and isolated test-suite regression in prompt mutation variant for: ${exp.title}`,
        });
      }
    }
  });

  // 6. Build final CompetencyState array
  return COMPETENCIES.map((comp) => {
    const evidence = evidenceMap[comp.id] || [];
    const { level, explanation, nextMilestone } = calculateCompetencyLevel(comp, evidence);
    return {
      competency: comp,
      level,
      evidence,
      explanation,
      nextMilestone,
    };
  });
}

export function getCompetencyById(id: CompetencyId): CompetencyDefinition | undefined {
  return COMPETENCIES.find((c) => c.id === id);
}

export function getCompetenciesForPattern(patternId: string): CompetencyDefinition[] {
  const meta = PATTERN_COMPETENCY_REGISTRY[patternId];
  if (!meta) return [];
  const compIds = [meta.primaryCompetency, ...(meta.secondaryCompetencies || [])];
  return compIds.map(getCompetencyById).filter(Boolean) as CompetencyDefinition[];
}

export function getCompetencyForLesson(lessonId: string): CompetencyDefinition | undefined {
  const meta = LESSON_COMPETENCY_REGISTRY[lessonId];
  return meta ? getCompetencyById(meta.primaryCompetency) : undefined;
}

export function getCompetencyForMission(missionId: string): CompetencyDefinition | undefined {
  const meta = MISSION_COMPETENCY_REGISTRY[missionId];
  return meta ? getCompetencyById(meta.primaryCompetency) : undefined;
}

export function getCompetencyForCtf(challengeId: string): CompetencyDefinition | undefined {
  const meta = CTF_COMPETENCY_REGISTRY[challengeId];
  return meta ? getCompetencyById(meta.primaryCompetency) : undefined;
}

/**
 * Analyzes existing foundation lesson and challenge identifiers in PromptEngineeringPath.tsx
 * (e.g., foundation-clarity, foundation-role, foundation-constraints, foundation-iteration, foundation-context)
 * and defines deterministic mapping rules converting completed activities into evidence objects for the competency model.
 */
export function mapPromptEngineeringPathActivityToEvidence(
  lessonId: string,
  timestamp: number = Date.now()
): CompetencyEvidence | null {
  const meta = LESSON_COMPETENCY_REGISTRY[lessonId];
  if (!meta) return null;

  return {
    id: `ev_foundation_${lessonId}_${timestamp}`,
    competencyId: meta.primaryCompetency,
    type: "lesson_completed",
    sourceId: lessonId,
    title: meta.title,
    timestamp,
    weight: "exposure",
    summary: `Completed Prompt Engineering Foundation lesson: ${meta.title}`,
  };
}

