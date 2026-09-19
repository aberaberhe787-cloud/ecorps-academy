# Ecorp Academy — Competency & Mastery Model

## 1. Overview & Core Philosophy

The Ecorp Academy Competency Model establishes an evidence-driven, deterministic, and pedagogical framework for tracking learner capabilities. Traditional learning platforms often measure progress solely through superficial engagement metrics—such as total XP accrued, daily streak length, or total video/lesson completion counters. These counters indicate *activity*, but they do not prove *capability*.

The Competency Model answers the fundamental question:
> **"What specific prompt engineering capabilities has this learner demonstrated, and what concrete evidence supports that claim?"**

```
┌─────────────────┐       ┌──────────────────────┐       ┌───────────────────┐
│ LEARNING OBJECT │ ----> │ CONCRETE EVIDENCE    │ ----> │ COMPETENCY STATE  │
│ (Lesson, CTF,   │       │ (Exposure, Practice, │       │ (Introduced,      │
│  Mission, Lab,  │       │  Demonstration, Pass,│       │  Practicing,      │
│  Experiment)    │       │  Regression Detection│       │  Proficient,      │
└─────────────────┘       └──────────────────────┘       │  Mastered)        │
                                                         └───────────────────┘
```

---

## 2. Canonical Competency Taxonomy

The system defines seven core competencies derived directly from the curriculum, engineering sandbox, and mutation laboratory:

| Competency ID | Domain & Title | Pedagogical Focus | Core Techniques |
|---|---|---|---|
| `prompt-foundations` | **Core Prompt Mechanics & Clarity** | Controlling causal next-token probabilities, eliminating ambiguity entropy, and token budgeting. | Clarity & Specificity, Token Budgeting, Negative Constraints, Iterative Refinement |
| `context-engineering` | **Context Delimitation & In-Context Calibration** | Structuring prompt perimeters with XML tags, isolating user payload from instructions, and few-shot exemplar calibration. | XML Delimiters, Few-Shot Calibration, Boundary Defense, In-Context Exemplars |
| `role-persona-design` | **Role Specification & Persona Steering** | Steering latent representations via expert role definitions, persona framing, and lexical density calibration. | Role Specification, Lexical Density, Audience Conditioning, Persona Demeanor |
| `cognitive-reasoning` | **Decomposition & Cognitive Reasoning** | Allocating token budgets across multi-step deduction chains, scratchpads, and structured reasoning. | Chain-of-Thought (CoT), Task Decomposition, Self-Consistency (CoT-SC), Tree-of-Thoughts |
| `structured-output` | **Structured Schemas & Format Constraints** | Enforcing strict serializations (JSON, YAML, tables) and zero-preamble guarantees. | JSON Schema, Grammar Constraints, Zero-Preamble Invariant, Table Formatting |
| `adversarial-defense` | **System Alignment & Adversarial Robustness** | Hardening system prompts against injection vectors, jailbreaks, data leaks, instruction overrides, and test regressions. | Prompt Injection Defense, Dual-LLM Sandboxing, Secret Containment, Adversarial Fuzzing, Regression Detection |
| `evaluation-orchestration` | **Evaluation, Tool Calling & Agentic Orchestration** | ReAct execution loops, function-calling schema binding, automated benchmark grading, batch test suites, and mutation experimentation. | ReAct Loops, Tool Calling, Automated Rubric Evaluation, Pedagogical Graders, Experiment Suites, Mutation Testing |

---

## 3. Four-Tier Evidence Hierarchy

Evidence units are logged with immutable IDs, timestamps, source activity references, and evidentiary weights:

```
                  ┌────────────────────────────────────────┐
                  │       ASSESSMENT (Weight: High)        │
                  │ Authoritative Capstone Evaluation Pass │
                  └───────────────────┬────────────────────┘
                                      │
                  ┌───────────────────▼────────────────────┐
                  │     DEMONSTRATION (Weight: Strong)     │
                  │ Solved Missions, CTF Defenses, &       │
                  │ Executed Lab Experiments / Regressions │
                  └───────────────────┬────────────────────┘
                                      │
                  ┌───────────────────▼────────────────────┐
                  │       PRACTICE (Weight: Medium)        │
                  │ Sandbox Challenges & Variable Testing  │
                  └───────────────────┬────────────────────┘
                                      │
                  ┌───────────────────▼────────────────────┐
                  │       EXPOSURE (Weight: Foundational)  │
                  │ Curriculum Lessons & Concept Reading   │
                  └────────────────────────────────────────┘
```

1. **Exposure (`exposure`)**: Formative foundation. The learner completed reading modules or foundational theory lessons.
2. **Practice (`practice`)**: Active application. The learner engaged in interactive pattern variable adjustments, sandbox trials, or active-recall exercises.
3. **Demonstration (`demonstration`)**: Verified problem-solving and rigorous evaluation. The learner satisfied deterministic constraints in multi-step missions, defeated adversarial attacks in the CTF arena, or designed and evaluated prompt mutation test suites in the Advanced Prompt Lab.
4. **Assessment (`assessment`)**: Summative evaluation. The learner achieved a passing grade (≥70%) on an authoritative capstone certification examination.

### Supported Evidence Types

- `lesson_completed`: Standard curriculum lesson exposure.
- `active_recall_completed`: Formative active-recall challenge verification.
- `sandbox_completed`: Executed sandbox trial.
- `pattern_practice`: Interactive parameter and template modification.
- `mission_completed`: Mission constraint satisfaction.
- `ctf_completed`: Successful defense or vulnerability discovery in CTF labs.
- `assessment_passed`: Authoritative assessment verification.
- `validated_prompt`: Output validated against strict JSON/syntax schemas.
- `prompt_comparison`: Side-by-side comparative benchmarking.
- `batch_evaluation`: Batch runner execution across variable sets.
- `experiment_completed`: Executed controlled mutation experiments across test suites.
- `regression_detected`: Isolated and analyzed test-suite regressions under prompt mutations.

---

## 4. Deterministic Mastery State Transition Rules

The engine evaluates evidence deterministically via `calculateCompetencyLevel()`. The state progression is:

$$\text{Not Started} \longrightarrow \text{Introduced} \longrightarrow \text{Practicing} \longrightarrow \text{Proficient} \longrightarrow \text{Mastered}$$

### Transition Criteria & Rules

#### 1. `Not Started` $\rightarrow$ `Introduced`
* **Trigger**: Learner completes at least $1$ curriculum lesson or foundation guide in the competency domain ($\ge 1\text{ exposure}$).
* **Pedagogical Meaning**: The learner has been introduced to the vocabulary, concepts, and architectural patterns of this domain.
* **Explanation**: *"Foundational concepts and theory introduced through completed curriculum lessons."*
* **Next Directive**: *"Complete lesson checkpoints and pattern exercises to advance to Practicing."*

#### 2. `Introduced` $\rightarrow$ `Practicing`
* **Trigger**: Learner completes at least $1$ structured practice exercise ($\ge 1\text{ practice}$) OR finishes multiple lessons ($\ge 2\text{ exposures}$) in the domain.
* **Pedagogical Meaning**: The learner is not merely reading; they are actively testing parameters, modifying variables, and completing sandbox prompts.
* **Explanation**: *"Active engagement established across lesson(s) and structured practical exercises."*
* **Next Directive**: *"Solve a hands-on mission or sandbox challenge in this domain to achieve Proficient."*

#### 3. `Practicing` $\rightarrow$ `Proficient`
* **Trigger**: Learner completes at least $1$ hands-on demonstration challenge ($\ge 1\text{ demonstration}$) in a mission, CTF level, or Prompt Lab experiment, OR demonstrates deep practice ($\ge 3\text{ practice units}$).
* **Pedagogical Meaning**: The learner has proven they can generate functional prompts that satisfy strict external constraints (e.g., regex checks, zero-preamble JSON parsing, prompt injection defense, or test suite validation).
* **Explanation**: *"Demonstrated technical capability through hands-on challenge completion in this domain."*
* **Next Directive**: *"Complete the Capstone Assessment or additional interactive missions to verify Mastered status."*

#### 4. `Proficient` $\rightarrow$ `Mastered`
* **Trigger**: Learner passes the authoritative **Capstone Assessment** for the domain ($\ge 1\text{ assessment}$) OR demonstrates repeated mastery across multiple challenges ($\ge 2\text{ demonstrations}$ with $\ge 1\text{ practice}$).
* **Pedagogical Meaning**: The highest standard of achievement. Capability has been proven under formal assessment conditions or through comprehensive, multi-angle practical problem solving and regression analysis.
* **Explanation**: *"Mastery verified through authoritative Capstone Assessment with multi-point rubric verification."*
* **Next Directive**: *"Competency demonstrated. Maintain mastery through active sandbox experimentation."*

---

## 5. Integrity Guarantee: Eliminating Opaque AI Scoring

A critical design mandate of Ecorp Academy is **transparent, deterministic evaluation**. Many contemporary platforms employ opaque "LLM-as-a-judge" scorers that return unpredictable scores, hallucinate competencies, or yield to prompt flattery. 

Ecorp Academy maintains evaluation integrity through five structural pillars:

### 1. Pure, Deterministic State Computation
The function `deriveCompetencyStates(progress, ctfSolved)` is a pure TypeScript function. Given the same set of completed lesson IDs, mission IDs, CTF challenge states, and experiment suites, it will **always** compute the exact same competency level and evidence trail. No random sampling, no temperature variations, and no model drift.

### 2. Transparent Audit Trail
Every competency level is directly traceable to discrete, verifiable evidence records:
```json
{
  "id": "ev_exp_exp-1726740000000",
  "type": "experiment_completed",
  "sourceId": "exp-1726740000000",
  "title": "JSON Schema Compliance & Resilience",
  "timestamp": 1726740000000,
  "weight": "demonstration",
  "summary": "Executed prompt mutation experiment suite: JSON Schema Compliance & Resilience"
}
```
Learners can inspect exactly which missions, lessons, experiments, or exams contributed to their status.

### 3. Separation of Gamification vs. Competency
XP points and streak multipliers incentivize daily consistency, but **XP alone never unlocks competency status**. A user with 50,000 XP who has only clicked through reading material will remain at `Introduced` or `Practicing` until they solve practical challenges or run validated experiment suites.

### 4. Objective Sandbox, CTF & Experiment Validation
Challenges and experiments rely on deterministic validators:
* **JSON/Schema Invariant Checks**: Verifies valid syntax, required object keys, and zero markdown preamble.
* **Adversarial Rule Harnesses**: Verifies that protected secrets are not leaked under jailbreak attempts.
* **Rubric Checkpoints**: Evaluates character length constraints, required operational keywords, and delimiter placement.
* **Regression Detectors**: Quantifies exact pass/fail delta between baseline prompts and mutated variants across test suites.

### 5. Multi-Tenant UID Isolation
All evidence derivation and local cache storage respect strict user boundaries (`promptlab_user_progress_${uid}` and `ecorp_ctf_solved_${uid}`). Unauthenticated guest state is sandboxed to prevent false credit across accounts.

---

## 6. Developer Integration & Extension Points

To map a new lesson, mission, pattern, or experiment to a competency:

1. **Lesson Registry (`src/lib/competencyModel.ts`)**:
   ```typescript
   export const LESSON_COMPETENCY_REGISTRY: Record<string, SourceMetadata> = {
     "m5-l1": {
       id: "m5-l1",
       title: "Chain-of-Thought Prompting",
       primaryCompetency: "cognitive-reasoning",
       secondaryCompetencies: ["prompt-foundations"]
     }
   };
   ```

2. **Pattern Schema (`src/types.ts` & `src/data/patternsData.ts`)**:
   ```typescript
   {
     id: "pat-code-debug",
     title: "Root-Cause Code Debugger",
     competencies: ["cognitive-reasoning", "context-engineering"]
   }
   ```

3. **Mission Schema (`src/data/missionsData.ts`)**:
   ```typescript
   {
     id: "mission-3",
     title: "Multi-Step Math & Logic Tutor",
     competencies: ["cognitive-reasoning"]
   }
   ```

4. **Experiment Schema (`src/types.ts`)**:
   ```typescript
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
   ```
