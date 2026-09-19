# Ecorp Academy — Unified Learning & Competency Architecture (P2)

## 1. Overview & Architectural Philosophy
The Unified Learning & Competency Architecture connects all existing pedagogical surfaces in Ecorp Academy into a deterministic, explainable competency and evidence framework.

The model explicitly distinguishes:
- **Exposure (`exposure`)**: The learner encountered the foundational concepts (e.g., viewing/reading curriculum lessons or foundation guides).
- **Practice (`practice`)**: The learner actively engaged with exercises, sandbox challenges, or pattern playgrounds.
- **Demonstration (`demonstration`)**: The learner successfully solved objective mission briefs or solved adversarial CTF jailbreak challenges.
- **Assessment (`assessment`)**: The learner passed authoritative capstone assessments or comprehensive milestone evaluations.

Competency mastery is calculated dynamically from concrete evidence units rather than gamified signals (e.g., raw XP or streak counts).

---

## 2. Canonical Competency Taxonomy
The platform defines 7 core competencies derived directly from Ecorp Academy's curriculum:

| Competency ID | Domain Title | Level | Core Techniques |
|---|---|---|---|
| `prompt-fundamentals` | Prompt Fundamentals & Structure | Core | Direct Instruction, Delimiters, Explicit Constraints, Task Framing |
| `role-instruction-design` | Role & Persona Engineering | Core | Role Framing, System Directives, Persona Calibration, Behavioral Priming |
| `context-engineering` | Context Engineering & Grounding | Intermediate | XML Delimitation, Document Grounding, Multimodal Context Injection, Context Anchoring |
| `structured-output` | Structured Output & Schema Enforcement | Intermediate | JSON Schema Enforcement, XML Tagging, Output Parsing, Defensive Formatting |
| `reasoning-decomposition` | Reasoning & Task Decomposition | Advanced | Chain-of-Thought (CoT), Step-by-Step Breakdown, Few-Shot Demonstrations, Plan-and-Solve |
| `adversarial-defense` | System Alignment & Adversarial Robustness | Advanced | Prompt Injection Defense, Jailbreak Mitigation, Boundary Defense, Guardrail Hardening |
| `workflow-architecture` | Multi-Step Architecture & Optimization | Master | Prompt Chaining, Self-Refinement Loops, Batch Evaluation, Meta-Prompting |

---

## 3. Evidence Model & Weighting
Each learning activity in the system maps deterministically to an evidence weight:

```
Activity Source                Evidence Weight     Demonstrated Capability
-----------------------------------------------------------------------------
Curriculum Lesson (M1-M7)      Exposure            Encountered domain theory
Foundation Path (01-08)        Exposure            Conceptual introduction
Sandbox / Active Recall        Practice            Applied concept in sandbox
Pattern Playground Practice    Practice            Experimented with variables
Missions (1-6)                 Demonstration       Solved end-to-end task
Adversarial CTF Challenges     Demonstration       Executed defensive probe
Authoritative Assessment Pass  Assessment          Evaluated with pass mark >=70%
```

---

## 4. Mastery State Transition Rules
Mastery states are computed dynamically and deterministically by `calculateCompetencyStates`:

1. **Not Started**:
   - `0` evidence units recorded.
2. **Introduced**:
   - `≥ 1` exposure evidence unit (or 1 practice unit).
   - Learner has encountered the domain concepts.
3. **Practicing**:
   - `≥ 1` practice evidence unit OR `≥ 2` total evidence units.
   - Learner is actively applying techniques.
4. **Proficient**:
   - `≥ 1` demonstration unit OR `≥ 1` assessment unit OR `≥ 3` practice units.
   - Learner has verified practical problem-solving capability.
5. **Mastered**:
   - `≥ 1` authoritative assessment pass AND `≥ 1` demonstration unit (OR `≥ 2` demonstration units with `≥ 4` total evidence points).
   - Authoritative and repeated demonstration of competence.

---

## 5. Security & UID Isolation
- All progress and competency calculations are strictly scoped to the active Firebase authenticated `user.uid`.
- Caching follows the UID-boundary key pattern: `promptlab_user_progress_${uid}` and `ecorp_ctf_completed_${uid}`.
- Guest sessions are isolated to `promptlab_user_progress_guest`.
- No global cross-user state leaks or client-side authority spoofing is permitted.

---

## 6. Integration Points
- **User Profile (`src/views/UserProfileView.tsx`)**: Renders the `CompetencyPortfolio` component with state filters, evidence breakdowns, and deep links to source activities.
- **Pattern Library (`src/views/PatternLibraryView.tsx`)**: Visualizes associated competency badges for each engineering pattern.
- **Mission Sandbox (`src/components/MissionsPanel.tsx`)**: Exposes target competency alignment on each mission card.
- **CTF Simulator (`src/components/CtfSimulator.tsx`)**: Links adversarial challenges to the System Alignment & Adversarial Robustness competency.
