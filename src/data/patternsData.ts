import { PromptPattern } from "../types";

export const promptPatterns: PromptPattern[] = [
  {
    id: "pat-code-debug",
    title: "Root Cause Code Debugger",
    category: "Coding",
    difficulty: "Intermediate",
    patternType: "workflow",
    concept: "Hypothesis-Driven Task Decomposition & Regression Isolation",
    supportingTechniques: [
      "Role Specification",
      "Context Delimitation",
      "Task Decomposition",
      "Automated Regression Testing",
      "Minimal Patch Constraints"
    ],
    competencies: ["cognitive-reasoning", "context-engineering"],
    learningObjective:
      "Learn how to decompose an ambiguous code failure into root-cause hypothesis generation, minimal surgical remediation, and automated regression verification rather than blindly rewriting functional code.",
    whenToUse: [
      "Investigating ambiguous runtime exceptions or intermittent race conditions in existing codebases.",
      "Refactoring sensitive legacy code where unverified fixes risk introducing collateral regressions.",
      "Scenarios requiring an automated reproduction test alongside the suggested minimal patch."
    ],
    whenNotToUse: [
      "Trivial syntax errors or typographical issues immediately flagged by the compiler or linter.",
      "Greenfield feature development where no existing implementation or regression baseline exists.",
      "Full system rewrites where existing component logic is intentionally discarded."
    ],
    limitations: [
      "The diagnostic hypothesis is based solely on provided snippets and cannot inspect live runtime heap state or unshared dependencies.",
      "Generated regression tests must be executed locally in your test runner to verify reproduction and pass conditions.",
      "The suggested minimal fix does not guarantee the absence of edge cases outside the provided error context."
    ],
    anatomy: [
      {
        name: "Role & Language Framing",
        technique: "Role Specification",
        explanation: "Conditions the model to reason as a Principal Staff Engineer specialized in the target programming language.",
        purpose: "Primes deep execution semantics (concurrency, typing, memory lifecycle) over superficial cosmetic syntax changes."
      },
      {
        name: "Delimited Error Context",
        technique: "Context Delimitation",
        explanation: "Encapsulates error message, observed behavior, and expected behavior inside `<error_context>` tags.",
        purpose: "Explicitly separates the symptoms and expected baseline from the code payload, preventing prompt-leak confusion."
      },
      {
        name: "Isolated Code Payload",
        technique: "Context Delimitation",
        explanation: "Wraps raw source code in `<code_snippet>` tags.",
        purpose: "Defines the exact operational boundary so the model does not guess surrounding architectural assumptions."
      },
      {
        name: "4-Step Diagnostic Protocol",
        technique: "Task Decomposition & Chain-of-Thought",
        explanation: "Forces a sequential pipeline: Hypothesis → Minimal Fix → Regression Test → Edge Cases.",
        purpose: "Prevents the model from jumping straight to code generation before articulating the underlying mechanical failure."
      },
      {
        name: "Regression Test Verification",
        technique: "Output Verification",
        explanation: "Demands an automated unit test reproducing the exact failure using the developer's test framework.",
        purpose: "Provides an automated reproduction test to verify the fix and protect against regressions in CI/CD pipelines."
      }
    ],
    weakExample: {
      prompt: "Fix this code: `async function getUserList(req, res) { const users = await db.findUsers(req.query.tenantId); return res.json(users.data.map(u => u.name)); }`",
      problems: [
        "No runtime error message, stack trace, or environment version provided.",
        "No distinction between actual observed failure and intended expected output.",
        "Encourages the model to rewrite the entire function arbitrarily, often altering APIs or introducing unnecessary libraries.",
        "No verification or regression test requested, leaving the fix unverified."
      ]
    },
    improvedExample: {
      prompt: `Act as a Principal Staff Software Engineer specializing in TypeScript.

Analyze the following bug report, stack trace, and code snippet:

<error_context>
Error / Symptoms: TypeError: Cannot read properties of undefined (reading 'map')
Observed Behavior: API crashes with 500 when database returns empty array or null
Expected Behavior: Should return 200 OK with empty array []
</error_context>

<code_snippet>
async function getUserList(req, res) {
  const users = await db.findUsers(req.query.tenantId);
  return res.json(users.data.map(u => u.name));
}
</code_snippet>

Execute the following 4-step diagnostic protocol:
1. Root Cause Hypothesis: Explain the underlying failure mechanism.
2. Minimal Surgical Fix: Provide ONLY the corrected code diff with minimal disturbance.
3. Regression Prevention: Provide a unit test using Vitest that reproduces the issue.
4. Edge Case Warning: Identify any ancillary risks this fix might introduce.`,
      changes: [
        "Delimited error symptoms, observed failure, and expected behavior inside XML tags.",
        "Enforced diagnostic hypothesis formulation prior to diff proposal.",
        "Constrained modification to a minimal surgical patch instead of a full rewrite.",
        "Mandated an automated Vitest regression test to reproduce and verify the fix."
      ],
      explanation:
        "By enforcing hypothesis formulation before code changes and requiring an automated unit test, the model is constrained to isolate the true failure mechanic rather than applying a superficial patch that masks downstream bugs."
    },
    description: "Systematically diagnoses tricky runtime errors, race conditions, and memory bugs by formulating hypotheses before proposing minimal surgical diffs.",
    template: `Act as a Principal Staff Software Engineer specializing in {{language}}.

Analyze the following bug report, stack trace, and code snippet:

<error_context>
Error / Symptoms: {{errorMessage}}
Observed Behavior: {{observedBehavior}}
Expected Behavior: {{expectedBehavior}}
</error_context>

<code_snippet>
{{codeSnippet}}
</code_snippet>

Execute the following 4-step diagnostic protocol:
1. Root Cause Hypothesis: Explain the underlying failure mechanism (memory, async race condition, state mutation, typing).
2. Minimal Surgical Fix: Provide ONLY the corrected code diff with minimal disturbance to surrounding logic.
3. Regression Prevention: Provide a unit test using {{testFramework}} that reproduces the issue and verifies the fix.
4. Edge Case Warning: Identify any ancillary risks this fix might introduce.`,
    variables: [
      { name: "language", label: "Programming Language", placeholder: "TypeScript / Node.js", defaultValue: "TypeScript" },
      { name: "errorMessage", label: "Error Message", placeholder: "UnhandledPromiseRejection: Cannot read properties of undefined", defaultValue: "TypeError: Cannot read properties of undefined (reading 'map')" },
      { name: "observedBehavior", label: "Observed Behavior", placeholder: "Crashes on empty user collection", defaultValue: "API crashes with 500 when database returns empty array or null" },
      { name: "expectedBehavior", label: "Expected Behavior", placeholder: "Return clean empty array []", defaultValue: "Should return 200 OK with empty array []" },
      { name: "codeSnippet", label: "Code Snippet", placeholder: "function render(data) { ... }", defaultValue: "async function getUserList(req, res) {\n  const users = await db.findUsers(req.query.tenantId);\n  return res.json(users.data.map(u => u.name));\n}" },
      { name: "testFramework", label: "Test Framework", placeholder: "Jest / Vitest", defaultValue: "Vitest" }
    ],
    whyItWorks: [
      "Separates root-cause analysis from code output, preventing superficial patches that mask deeper defects.",
      "Requires an automated regression test, enforcing test-driven verification.",
      "Delimited XML blocks isolate the error logs from the code payload."
    ],
    sampleOutput: `### 1. Root Cause Hypothesis
The issue stems from unsafe property chaining on \`users.data\`. When \`db.findUsers\` returns \`null\` or an object without a \`data\` property, attempting to read \`.map\` throws an unhandled TypeError, terminating the Express request cycle.

### 2. Minimal Surgical Fix
\`\`\`typescript
async function getUserList(req, res) {
  try {
    const tenantId = req.query?.tenantId as string;
    if (!tenantId) {
      return res.status(400).json({ error: "tenantId is required" });
    }
    const users = await db.findUsers(tenantId);
    const userNames = Array.isArray(users?.data) ? users.data.map(u => u.name) : [];
    return res.status(200).json(userNames);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
\`\`\`

### 3. Regression Prevention Test (Vitest)
\`\`\`typescript
it('returns empty array when users.data is undefined', async () => {
  vi.spyOn(db, 'findUsers').mockResolvedValueOnce(null);
  const res = await request(app).get('/users?tenantId=t1');
  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});
\`\`\``,
    tags: ["Debugging", "Refactoring", "Testing", "AppSec"]
  },
  {
    id: "pat-code-review",
    title: "Rigorous Pull Request Code Reviewer",
    category: "Coding",
    difficulty: "Advanced",
    patternType: "evaluation",
    concept: "Severity-Tiers Rubric & Grounded Code Remediation",
    supportingTechniques: [
      "Role Specification",
      "Severity Classification",
      "Grounded Diffs",
      "Rubric Evaluation"
    ],
    competencies: ["structured-output", "context-engineering"],
    learningObjective:
      "Learn how to constrain a code review prompt with an explicit severity taxonomy (Critical, Performance, Clean Code, Highlights) and mandate concrete line-level diffs to eliminate vague or subjective feedback.",
    whenToUse: [
      "Pre-merge pull request reviews to audit against security vulnerabilities, unbounded resource usage, and clean code conventions.",
      "Establishing automated secondary reviewer passes in CI/CD developer workflows.",
      "Auditing diffs for framework-specific anti-patterns (e.g. missing TTLs, unindexed queries, re-render cascades)."
    ],
    whenNotToUse: [
      "Initial exploratory brainstorming or rapid whiteboard prototyping.",
      "Replacing formal static application security testing (SAST) or automated dependency vulnerability scanners.",
      "Reviewing massive multi-thousand-line diffs that exceed the model's effective context attention window."
    ],
    limitations: [
      "The model may hallucinate API signatures for internal private libraries unless provided in context.",
      "Cannot verify runtime performance under realistic distributed load without benchmark profiling.",
      "Presence of clean code recommendations does not guarantee compliance with organization-specific legal or regulatory policies."
    ],
    anatomy: [
      {
        name: "Architect Stance Framing",
        technique: "Role Specification",
        explanation: "Directs the model to evaluate code as an uncompromising yet constructive Principal Architect.",
        purpose: "Discourages casual approval and biases the model toward systemic durability and clean boundaries."
      },
      {
        name: "Feature Context & Stack Injection",
        technique: "Context Engineering",
        explanation: "Supplies the PR intent, ticket goal, and specific framework before the diff.",
        purpose: "Allows the model to catch framework-specific concurrency and caching traps rather than generic syntax flaws."
      },
      {
        name: "4-Tier Severity Taxonomy",
        technique: "Rubric Evaluation",
        explanation: "Structures critique into Critical/Blockers, Performance, Clean Code, and Positive Highlights.",
        purpose: "Prevents style preferences from overshadowing production-blocking security or data-loss hazards."
      },
      {
        name: "Grounded Code Replacement Mandate",
        technique: "Explicit Output Constraints",
        explanation: "Demands line references, problem definitions, and ready-to-paste replacement code diffs.",
        purpose: "Replaces vague platitudes ('make this faster') with actionable, peer-reviewed engineering diffs."
      }
    ],
    weakExample: {
      prompt: "Review this Git diff and tell me what you think:\n`+ const profile = await redis.get('user:' + id);`",
      problems: [
        "Unstructured output mixes minor stylistic nits with critical caching bugs.",
        "Provides abstract feedback without concrete code corrections.",
        "Fails to provide stack context or operational constraints.",
        "No distinction between merge blockers and optional suggestions."
      ]
    },
    improvedExample: {
      prompt: `You are a Principal Software Architect conducting an uncompromising yet constructive pull request code review.

Pull Request Context:
- Feature / Ticket: Implement Redis caching layer for high-traffic user profile endpoint
- Target Framework: Express + ioredis + TypeScript

Review the following Git diff:
\`\`\`
+ const profile = await redis.get(\`user:\${id}\`);
+ if (profile) return JSON.parse(profile);
+ const dbUser = await db.getUser(id);
+ await redis.set(\`user:\${id}\`, JSON.stringify(dbUser));
+ return dbUser;
\`\`\`

Structure your review into the following four distinct sections:
1. 🚨 Critical / Blocker (Security vulnerabilities, memory leaks, data loss hazards, breaking API changes)
2. ⚡ Performance & Scalability (Unindexed DB queries, N+1 queries, unmemoized rerenders, O(N^2) loops)
3. 🧹 Clean Code & Maintainability (SOLID principles, naming conventions, DRY, typing improvements)
4. 🌟 Positive Highlights (Good patterns or tests observed)

Format every issue with: Line Reference, Problem Description, Concrete Code Suggestion.`,
      changes: [
        "Injected feature intent and framework runtime environment context.",
        "Defined 4 explicit severity tiers with clear merge criteria.",
        "Enforced concrete code diffs for all identified problems.",
        "Included positive reinforcement to validate sound architecture."
      ],
      explanation:
        "The severity taxonomy eliminates subjective debates by clearly separating merge blockers from optional improvements, while grounded code suggestions make feedback directly actionable."
    },
    description: "Performs senior-level PR reviews with categorized findings: Security, Performance, Clean Code, and Architectural impact.",
    template: `You are a Principal Software Architect conducting an uncompromising yet constructive pull request code review.

Pull Request Context:
- Feature / Ticket: {{prDescription}}
- Target Framework: {{framework}}

Review the following Git diff:
\`\`\`
{{gitDiff}}
\`\`\`

Structure your review into the following four distinct sections:
1. 🚨 Critical / Blocker (Security vulnerabilities, memory leaks, data loss hazards, breaking API changes)
2. ⚡ Performance & Scalability (Unindexed DB queries, N+1 queries, unmemoized rerenders, O(N^2) loops)
3. 🧹 Clean Code & Maintainability (SOLID principles, naming conventions, DRY, typing improvements)
4. 🌟 Positive Highlights (Good patterns or tests observed)

Format every issue with:
- Line or Block Reference
- Problem Description
- Concrete Code Suggestion`,
    variables: [
      { name: "prDescription", label: "PR Description", placeholder: "Add user profile caching in Redis", defaultValue: "Implement Redis caching layer for high-traffic user profile endpoint" },
      { name: "framework", label: "Framework / Stack", placeholder: "Express + Redis + TypeScript", defaultValue: "Express + ioredis + TypeScript" },
      { name: "gitDiff", label: "Git Diff / Code", placeholder: "+ const cached = await redis.get(key);", defaultValue: "+ const profile = await redis.get(`user:${id}`);\n+ if (profile) return JSON.parse(profile);\n+ const dbUser = await db.getUser(id);\n+ await redis.set(`user:${id}`, JSON.stringify(dbUser));\n+ return dbUser;" }
    ],
    whyItWorks: [
      "Prioritizes findings by severity so developers know what blocks merge vs what is optional style.",
      "Requires concrete replacement code snippets rather than vague advice ('make this faster')."
    ],
    sampleOutput: `### Pull Request Code Review

**1. 🚨 Critical / Blocker:**
- **Issue:** Unbounded Cache Expiration (Cache Stampede & Memory Leak)
  \`await redis.set(\`user:\${id}\`, JSON.stringify(dbUser));\`
  **Fix:** Always set an explicit TTL (Time-To-Live). Without TTL, stale profiles remain indefinitely and Redis memory will exhaust under high user volume.
  \`\`\`typescript
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(dbUser)); // 1 hour TTL
  \`\`\`

**2. ⚡ Performance & Scalability:**
- **Issue:** JSON Serialization Overhead on Large User Objects
  Consider using Redis Hashes (\`HSET\` / \`HGETALL\`) if only specific profile fields are needed.

**3. 🌟 Positive Highlights:**
- Clean fallback logic to DB when cache misses.`,
    tags: ["Code Review", "Architecture", "Best Practices"]
  },
  {
    id: "pat-write-exec-summary",
    title: "C-Level Executive Briefing Memo",
    category: "Writing",
    difficulty: "Beginner",
    patternType: "pattern",
    concept: "Hierarchical Information Compression & Negative Constraints",
    supportingTechniques: [
      "Role Specification",
      "Context Delimitation",
      "Negative Constraints",
      "Structured Output Schemas"
    ],
    competencies: ["role-persona-design", "evaluation-orchestration"],
    learningObjective:
      "Learn how to apply strict length budgets, role framing, and fixed output sections to compress detailed technical narratives into decisive executive decision memos.",
    whenToUse: [
      "Distilling technical post-mortems, incident reports, or architecture proposals for executive stakeholders.",
      "Preparing board meeting or steering committee briefings where high-level ROI and risks dictate decision-making.",
      "Synthesizing lengthy research papers or quarterly metrics into immediate, actionable next steps."
    ],
    whenNotToUse: [
      "Drafting deep engineering documentation or implementation-level runbooks where granular technical details are essential.",
      "Situations where the underlying data or financial numbers have not yet been validated.",
      "Creative, exploratory, or persuasive brand storytelling."
    ],
    limitations: [
      "Compressing complex trade-offs may omit nuanced secondary engineering considerations.",
      "Financial and metric summaries reflect only the accuracy of the provided source text; the model cannot audit source ledger fidelity.",
      "Tight word-count constraints can cause the model to abbreviate rationale if the source text contains too many competing priorities."
    ],
    anatomy: [
      {
        name: "Chief of Staff Persona",
        technique: "Role Specification",
        explanation: "Instructs the model to write as a Chief of Staff to the CEO and Board.",
        purpose: "Aligns vocabulary and perspective with fiduciary duty, risk management, and capital allocation."
      },
      {
        name: "Source Text Delimitation",
        technique: "Context Delimitation",
        explanation: "Wraps raw financial reports or post-mortems in `<source_text>` tags.",
        purpose: "Forces the summary to stay grounded purely in the provided document without hallucinating outside facts."
      },
      {
        name: "Fixed 4-Part Memo Schema",
        technique: "Structured Output Schema",
        explanation: "Mandates TL;DR, Key Metrics, Strategic Implications, and Action Items.",
        purpose: "Provides high-density readability formatted for rapid comprehension by executive decision-makers."
      },
      {
        name: "Word Budget & Tone Constraints",
        technique: "Negative Constraints",
        explanation: "Enforces a strict <250-word cap and eliminates conversational greetings or filler.",
        purpose: "Penalizes verbosity and forces the model to distill complex multi-variable issues into essential takeaways."
      }
    ],
    weakExample: {
      prompt: "Summarize this cloud infrastructure billing report for the CEO so they know why AWS costs increased.",
      problems: [
        "Unbounded length causes the model to generate 600+ words of repetitive narrative.",
        "Fails to identify concrete financial impact figures or ROI payback windows.",
        "Leaves recommendations ambiguous without named owners or completion deadlines.",
        "Includes conversational preamble ('Sure! Here is a summary...') that degrades professionalism."
      ]
    },
    improvedExample: {
      prompt: `Act as a Chief of Staff writing an executive briefing memo for the CEO and Board of Directors.

Source Information:
<source_text>
Over Q2, cloud infrastructure bills surged by 45% ($120k to $174k/month) driven by unoptimized vector queries and idle staging clusters...
</source_text>

Write a concise briefing formatted as follows:
1. Executive TL;DR (Exactly 2 sentences summarizing the core takeaway and recommended action)
2. High-Impact Metrics & Facts (3-4 bullet points highlighting financial, customer, or operational figures)
3. Strategic Implications & Risks (What happens if we act vs if we do not act)
4. Recommended Next Steps (Numbered sequence with assigned owners and 30-day timelines)

Constraints:
- Word count: Under 250 words total.
- Tone: Crisp, decisive, objective, free of conversational pleasantries.`,
      changes: [
        "Isolated source document inside `<source_text>` XML tags.",
        "Restricted executive TL;DR to exactly two sentences.",
        "Mandated assigned owners and 30-day deadlines for next steps.",
        "Enforced hard 250-word limit and prohibited pleasantries."
      ],
      explanation:
        "By enforcing a strict word budget and requiring named owners on next steps, the prompt converts a passive reading exercise into an actionable executive briefing memo."
    },
    description: "Compresses lengthy reports, technical post-mortems, or market studies into a high-density, scannable executive memo.",
    template: `Act as a Chief of Staff writing an executive briefing memo for the CEO and Board of Directors.

Source Information:
<source_text>
{{sourceText}}
</source_text>

Write a concise briefing formatted as follows:
1. Executive TL;DR (Exactly 2 sentences summarizing the core takeaway and recommended action)
2. High-Impact Metrics & Facts (3-4 bullet points highlighting financial, customer, or operational figures)
3. Strategic Implications & Risks (What happens if we act vs if we do not act)
4. Recommended Next Steps (Numbered sequence with assigned owners and 30-day timelines)

Constraints:
- Word count: Under 250 words total.
- Tone: Crisp, decisive, objective, free of conversational pleasantries.`,
    variables: [
      { name: "sourceText", label: "Source Text / Report", placeholder: "Paste your report here...", defaultValue: "Over Q2, our cloud infrastructure bills surged by 45% ($120k to $174k/month) driven by unoptimized vector database queries and idle staging clusters. Engineering has drafted a plan to implement query caching and automated shutdown for dev environments, projecting a 35% reduction in monthly spend by September with an initial engineering investment of 2 weeks (1 senior engineer)." }
    ],
    whyItWorks: [
      "Separates high-level decision factors from operational minutiae.",
      "Enforces a strict 2-sentence TL;DR to prioritize immediate executive clarity."
    ],
    sampleOutput: `### Executive Briefing Memo

**1. Executive TL;DR**
Q2 cloud infrastructure spend surged 45% ($174k/mo) due to unoptimized vector queries and idle dev environments. We recommend authorizing a 2-week engineering sprint in July to deploy query caching and automated instance scheduling, projected to save $60,000/month recurring.

**2. Key Metrics & Impact**
- Current monthly run rate: **$174,000** (+$54,000 over budget).
- Projected monthly savings: **$60,900/month** (35% reduction).
- ROI timeline: Payback period achieved within 14 days of deployment.

**3. Strategic Implications**
- *Action taken:* Extends runway by 4 months with zero product slowdown.
- *Inaction risk:* Projected annual waste of $720,000 by year-end.

**4. Recommended Next Steps**
1. Authorize 1 Senior SRE for July 1–15 optimization sprint. *(Owner: VP Eng)*
2. Establish automated AWS budget alert triggers at $115k threshold. *(Owner: FinOps Lead)*`,
    tags: ["Leadership", "Executive", "Summarization", "Management"]
  },
  {
    id: "pat-write-cold-outreach",
    title: "High-Response B2B Cold Email",
    category: "Writing",
    difficulty: "Intermediate",
    patternType: "pattern",
    concept: "Cognitive Friction Reduction & Framework Conditioning (PAS)",
    supportingTechniques: [
      "Role Specification",
      "Cognitive Framework (PAS)",
      "A/B Variant Generation",
      "Friction Reduction Constraints"
    ],
    competencies: ["role-persona-design", "prompt-foundations"],
    learningObjective:
      "Learn how to structure persuasive copy using an established cognitive framework (Problem-Agitate-Solve) combined with negative constraints that eliminate conversational fluff and high-friction calendar requests.",
    whenToUse: [
      "Drafting initial outreach messages focused on a single validated prospect pain point.",
      "Generating A/B message variants to test different narrative angles (e.g. pain-first vs insight-first).",
      "Shortening verbose sales pitches into mobile-friendly, low-friction inquiries."
    ],
    whenNotToUse: [
      "Nurturing existing warm client relationships or negotiating contractual terms.",
      "Automating mass generic outreach without prospect-specific research or verified role context.",
      "Complex multi-product enterprise proposals that require formal RFP documentation."
    ],
    limitations: [
      "A well-structured email prompt cannot overcome poor audience targeting, invalid contact data, or an uncompetitive value proposition.",
      "The model cannot verify the current operational priorities or budget cycles of the target recipient.",
      "Open and reply rates depend on deliverability, domain reputation, and timing far more than prompt phrasing alone."
    ],
    anatomy: [
      {
        name: "Specialist SDR Role",
        technique: "Role Specification",
        explanation: "Frames the role as an enterprise B2B SDR specialized in concise, problem-focused outreach.",
        purpose: "Instills an objective, peer-level perspective without using misleading or fabricated authority claims."
      },
      {
        name: "Prospect Dossier Parameters",
        technique: "Parameter Delimitation",
        explanation: "Supplies target role, pain point, value proposition, and concrete proof metrics.",
        purpose: "Anchors the pitch in measurable evidence rather than generic, exaggerated marketing slogans."
      },
      {
        name: "Multi-Angle Variant Generation",
        technique: "Comparative Prompting",
        explanation: "Requires two distinct perspectives: Problem-Agitate-Solve vs Curiosity/Data Hook.",
        purpose: "Gives the marketer multiple psychographic hooks to test in outbound campaigns."
      },
      {
        name: "Anti-Friction Negative Constraints",
        technique: "Negative Constraints",
        explanation: "Caps length at <80 words, restricts subject lines to 3-5 words, and strictly bans 30-minute calendar requests.",
        purpose: "Drastically lowers the cognitive hurdle for a prospect reading on a mobile device."
      }
    ],
    weakExample: {
      prompt: "Write a cold sales email to a VP of QA selling our AI test suite so they book a meeting with me.",
      problems: [
        "Produces self-centered copy loaded with corporate clichés ('I hope this email finds you well').",
        "Demands high commitment ('Can I have 30 minutes on your calendar next Tuesday?'), driving immediate rejection.",
        "Lists feature bullets rather than solving a specific, acute prospect problem.",
        "Exceeds 150 words, rendering it unreadable on mobile screens."
      ]
    },
    improvedExample: {
      prompt: `Act as an enterprise B2B Sales Development Representative specializing in concise, problem-focused email outreach.

Prospect Information:
- Target Prospect: VP of QA at FinTech Payments Scaleup
- Relevant Industry Pain Point: Flaky end-to-end Cypress tests causing 2-hour CI pipeline delays
- Our Solution / Value Prop: Automated test auto-healing that eliminates 90% of false-positive CI failures
- Proof Metric / Case Study: Cut CI build times by 48 minutes for Brex with zero flaky retries

Generate 2 alternative cold email variants:
- Variant A: Direct Problem-Agitate-Solve (PAS)
- Variant B: Curious Insight / Data-First Hook

Rules for both variants:
1. Subject line: 3-5 words, lowercase or sentence case, looking like an internal email (no spammy emojis).
2. Word count: Under 80 words total.
3. Call to Action: Low-friction (e.g., "Worth exploring?", "Open to taking a peek at the 2-minute video?") - NEVER ask for 30 minutes on their calendar.`,
      changes: [
        "Replaced invented authority stats with grounded role positioning.",
        "Supplied concrete enterprise proof metric (48 min saved for Brex).",
        "Generated two psychological variants (PAS vs Data Hook).",
        "Capped length at 80 words and strictly forbade high-friction calendar requests."
      ],
      explanation:
        "Banning high-commitment meeting asks and enforcing under-80-word PAS structures transforms spam into a polite, relevant peer inquiry that respects recipient time and reduces friction for higher response potential."
    },
    description: "Generates concise, low-friction cold outreach using the Problem-Agitate-Solve (PAS) framework with targeted hooks.",
    template: `Act as an enterprise B2B Sales Development Representative specializing in concise, problem-focused email outreach.

Prospect Information:
- Target Prospect: {{prospectRole}} at {{prospectCompany}}
- Relevant Industry Pain Point: {{painPoint}}
- Our Solution / Value Prop: {{valueProp}}
- Proof Metric / Case Study: {{caseStudy}}

Generate 2 alternative cold email variants:
- Variant A: Direct Problem-Agitate-Solve (PAS)
- Variant B: Curious Insight / Data-First Hook

Rules for both variants:
1. Subject line: 3-5 words, lowercase or sentence case, looking like an internal email (no spammy emojis).
2. Word count: Under 80 words total.
3. Call to Action: Low-friction (e.g., "Worth exploring?", "Open to taking a peek at the 2-minute video?") - NEVER ask for 30 minutes on their calendar.`,
    variables: [
      { name: "prospectRole", label: "Prospect Role", placeholder: "Head of Engineering", defaultValue: "VP of Quality Assurance" },
      { name: "prospectCompany", label: "Prospect Company", placeholder: "FinTech Scaleup", defaultValue: "FinTech Payments Scaleup" },
      { name: "painPoint", label: "Pain Point", placeholder: "Flaky end-to-end Cypress tests delaying daily deployments", defaultValue: "Flaky end-to-end Cypress tests causing 2-hour CI pipeline delays" },
      { name: "valueProp", label: "Value Proposition", placeholder: "AI auto-healing test suite", defaultValue: "Automated test auto-healing that eliminates 90% of false-positive CI failures" },
      { name: "caseStudy", label: "Proof Metric", placeholder: "Helped Stripe cut test time by 60%", defaultValue: "Cut CI build times by 48 minutes for Brex with zero flaky retries" }
    ],
    whyItWorks: [
      "Lowers buyer friction by replacing high-commitment meetings with simple curiosity questions.",
      "Restricts length to <80 words, respecting mobile reading habits."
    ],
    sampleOutput: `### Variant A: Problem-Agitate-Solve
**Subject:** fixing CI pipeline flakiness at FinTech Scaleup

Hi {{FirstName}},

Noticed most QA teams at high-growth fintechs lose 10+ hours a week investigating false-positive Cypress failures in CI.

We built an auto-healing test layer that automatically patches brittle DOM selectors in flight. Brex used it to cut CI run times by 48 minutes and virtually eliminate flaky retries.

Open to seeing a 90-second loom of how it plugs into GitHub Actions?

---

### Variant B: Data-First Hook
**Subject:** 48 minutes saved in CI

Hi {{FirstName}},

Saw your engineering team is scaling fast. Usually when QA suites cross 500+ tests, build pipelines start timing out on flaky edge cases.

We recently helped Brex eliminate 90% of false-alarm test failures without rewriting their test suite.

Worth sending over the architectural benchmark?`,
    tags: ["Sales", "Copywriting", "Cold Email", "Growth"]
  },
  {
    id: "pat-analysis-swot",
    title: "Strategic SWOT & Moat Analysis Matrix",
    category: "Analysis",
    difficulty: "Intermediate",
    patternType: "evaluation",
    concept: "Multi-Dimensional Framework Evaluation & Quantitative Rubrics",
    supportingTechniques: [
      "Role Specification",
      "Context Delimitation",
      "Tabular Output Schemas",
      "Quantitative Rubrics",
      "Countermeasure Pairing"
    ],
    competencies: ["structured-output", "cognitive-reasoning"],
    learningObjective:
      "Learn how to guide an LLM through established strategic analysis frameworks (SWOT + Economic Moats) by enforcing structured table syntax and countermeasure pairings to prevent hand-waving generalities.",
    whenToUse: [
      "Evaluating competitive positioning before initiating major product roadmap investments.",
      "Preparing strategic landscape overviews for venture pitches, product strategy reviews, or quarterly planning.",
      "Stress-testing a product idea against recognized defensive moat categories (switching costs, network effects)."
    ],
    whenNotToUse: [
      "Evaluating markets or competitors where no reliable contextual or operational data has been provided.",
      "Replacing formal empirical market research, customer discovery interviews, or financial due diligence.",
      "Fast-moving tactical execution decisions (e.g. sprint backlog prioritization)."
    ],
    limitations: [
      "SWOT matrices produced by LLMs can skew toward conventional consensus wisdom unless novel market context is supplied.",
      "Moat ratings (1-5) are qualitative heuristic approximations and should not be treated as empirical financial valuation.",
      "The model cannot foresee emergent regulatory shifts or unannounced competitor R&D projects."
    ],
    anatomy: [
      {
        name: "VC & Strategy Partner Framing",
        technique: "Role Specification",
        explanation: "Instructs the model to evaluate the company as a Senior Venture Capital Partner and Competitive Strategist.",
        purpose: "Directs evaluation toward long-term defensive moats, unit economics, and structural market forces."
      },
      {
        name: "Context Tagging",
        technique: "Context Delimitation",
        explanation: "Isolates validated operational and market differentiators within `<context>` XML tags.",
        purpose: "Prevents the model from generating hallucinated features or confusing competitor offerings."
      },
      {
        name: "Structured SWOT Matrix",
        technique: "Tabular Output Formatting",
        explanation: "Requires a markdown comparison table with exactly 3 high-leverage points per quadrant.",
        purpose: "Stops the model from generating rambling bullet lists and enforces symmetric analytical rigor."
      },
      {
        name: "Defensive Moat Scoring Rubric",
        technique: "Quantitative Rubrics",
        explanation: "Scores defensibility (1-5 scale) across Switching Costs, Network Effects, Cost Advantages, and Intangible Brand.",
        purpose: "Anchors qualitative prose in concrete, comparable economic metrics."
      },
      {
        name: "Threat & Countermeasure Synthesis",
        technique: "Actionable Synthesis",
        explanation: "Requires the top 3 existential threats to be directly paired with strategic countermeasures.",
        purpose: "Ensures analysis concludes with actionable strategic initiatives rather than passive risk observation."
      }
    ],
    weakExample: {
      prompt: "Give me a SWOT analysis of Linear and tell me if they can beat Jira.",
      problems: [
        "Produces vague, generic platitudes ('Linear has clean UI, Jira has more features').",
        "Omits economic moat assessment like switching costs or enterprise contract inertia.",
        "Unstructured output makes comparing quadrants cumbersome.",
        "Identifies risks without pairing them with viable architectural or strategic countermeasures."
      ]
    },
    improvedExample: {
      prompt: `You are a Senior Venture Capital Partner and Competitive Strategy Consultant.

Analyze the strategic positioning of Linear in the Developer Tools & Issue Tracking market.

Known Context:
<context>
Linear is known for its ultra-fast desktop app, offline sync, keyboard-driven UI, and strong brand devotion among modern tech startups, competing directly against Jira, GitHub Projects, and Monday.com.
</context>

Provide a rigorous strategic analysis:
1. Executive Summary & Market Thesis (3 sentences)
2. Comprehensive SWOT Matrix (Structured markdown table with 3 high-leverage points per quadrant)
3. Defensive Moat Assessment (Rate each on 1-5 scale: Network Effects, Switching Costs, Cost Advantages, Intangible Brand/Patents)
4. 3 Greatest Existential Threats & Strategic Countermeasures`,
      changes: [
        "Enclosed market landscape and competitive differentiators in XML context tags.",
        "Mandated a structured markdown table with 3 high-leverage points per quadrant.",
        "Added a quantitative 1-5 defensive moat rating based on economic power frameworks.",
        "Paired identified existential threats directly with strategic countermeasures."
      ],
      explanation:
        "Constraining the model to a quantitative moat rubric and threat-countermeasure pairs turns broad market gossip into a rigorous strategic evaluation tool."
    },
    description: "Evaluates competitive moats, market positioning, and vulnerabilities for startups or enterprise product features.",
    template: `You are a Senior Venture Capital Partner and Competitive Strategy Consultant.

Analyze the strategic positioning of {{companyOrProduct}} in the {{industrySector}} market.

Known Context:
<context>
{{contextData}}
</context>

Provide a rigorous strategic analysis:
1. Executive Summary & Market Thesis (3 sentences)
2. Comprehensive SWOT Matrix (Structured markdown table with 3 high-leverage points per quadrant)
3. Defensive Moat Assessment (Rate each on 1-5 scale: Network Effects, Switching Costs, Cost Advantages, Intangible Brand/Patents)
4. 3 Greatest Existential Threats & Strategic Countermeasures`,
    variables: [
      { name: "companyOrProduct", label: "Company / Product", placeholder: "Vercel / Supabase / Notion", defaultValue: "Linear (Issue Tracking & Project Management)" },
      { name: "industrySector", label: "Industry Sector", placeholder: "Developer Tools / B2B SaaS", defaultValue: "Developer Productivity & Issue Tracking" },
      { name: "contextData", label: "Known Context / Differentiators", placeholder: "Blazing fast UI, keyboard shortcuts, opinionated workflow...", defaultValue: "Linear is known for its ultra-fast desktop app, offline sync, keyboard-driven UI, and strong brand devotion among modern tech startups, competing directly against Jira, GitHub Projects, and Monday.com." }
    ],
    whyItWorks: [
      "Quantifies competitive moats using established economic frameworks.",
      "Pairs threats directly with actionable countermeasures rather than leaving problems open-ended."
    ],
    sampleOutput: `### Strategic Assessment: Linear

**1. Market Thesis**
Linear has captured mindshare among top-tier developer startups by offering an opinionated, keyboard-first UX that makes issue tracking feel as fast as a text editor. However, to sustain high-multiple enterprise expansion, it must cross the chasm from engineering teams to cross-functional enterprise workflows without losing its speed-obsessed design purity.

**2. SWOT Matrix**

| Strengths | Weaknesses |
| :--- | :--- |
| • Sub-50ms optimistic UI rendering and offline sync<br>• Cult-like developer NPS and organic bottom-up adoption<br>• Highly opinionated workflow reducing configuration overhead | • Limited enterprise custom workflow orchestration compared to Jira<br>• Less native reporting depth for non-technical executives<br>• Narrow initial buyer persona (primarily engineering/product) |
| **Opportunities** | **Threats** |
| • Expanding into cross-company roadmap sharing and customer support triage<br>• AI-native issue auto-triage and PR dependency mapping<br>• Capturing enterprise migrations as Jira fatigue peaks | • GitHub Native Projects deeply integrated into the code host<br>• Enterprise procurement inertia favoring Atlassian bundles<br>• Fast-followers copying desktop client speed architectures |

**3. Moat Rating (1-5 Scale)**
- Switching Costs: **3.5/5**
- Network Effects: **2.5/5**
- Cost Advantage: **3.0/5**
- Brand & Design Delight: **4.8/5**`,
    tags: ["Strategy", "SWOT", "Market Analysis", "Business"]
  },
  {
    id: "pat-arch-5whys",
    title: "5-Whys Root Cause & Incident Post-Mortem",
    category: "Architecture",
    difficulty: "Advanced",
    patternType: "workflow",
    concept: "Causal Chain Decomposition & Blameless Systems Analysis",
    supportingTechniques: [
      "Role Specification",
      "Context Delimitation",
      "Causal Chain Decomposition",
      "Prioritized Action Matrix"
    ],
    competencies: ["cognitive-reasoning"],
    learningObjective:
      "Learn how to enforce causal reasoning chaining (5-Whys) that systematically traces surface technical symptoms down to organizational and infrastructure architectural root causes, paired with prioritized preventative action tables.",
    whenToUse: [
      "Conducting engineering post-mortems following production incidents, outages, or data pipeline delays.",
      "Identifying systemic process gaps, monitoring deficiencies, and latent infrastructure single points of failure.",
      "Converting raw incident chat logs and alert timelines into structured, blameless documentation for engineering leadership."
    ],
    whenNotToUse: [
      "Real-time active incident mitigation while systems are currently failing and require immediate triage.",
      "Assigning personal accountability or determining individual fault (violates blameless post-mortem principles).",
      "Trivial, non-systemic incidents that do not warrant a full post-mortem review."
    ],
    limitations: [
      "The causal chain generated by the model is only as valid as the timeline events and logs supplied in the prompt.",
      "LLMs may invent plausible-sounding systemic causes if crucial infrastructure context is omitted.",
      "Action items must be reviewed and estimated by engineering domain leads before entering the operational backlog."
    ],
    anatomy: [
      {
        name: "Blameless SRE Persona",
        technique: "Role Specification",
        explanation: "Frames the investigation under a Principal Site Reliability Engineer leading a blameless post-mortem.",
        purpose: "Prevents finger-pointing or operator blame, centering focus purely on systemic architecture and alerting."
      },
      {
        name: "Timeline & Impact Framing",
        technique: "Context Delimitation",
        explanation: "Supplies structured symptoms, customer session drops, and timestamped event sequences.",
        purpose: "Anchors the causal analysis in an objective chronological reality, preventing hallucinated sequences."
      },
      {
        name: "5-Whys Recursive Chaining",
        technique: "Causal Chain Decomposition",
        explanation: "Forces the model to step recursively down 5 successive levels of 'Why'.",
        purpose: "Breaks past surface triggers (e.g. 'disk full') down to systemic policies, pool limits, and alert gaps."
      },
      {
        name: "Prioritized Action Matrix",
        technique: "Structured Output Schemas",
        explanation: "Mandates a Prevent/Detect/Mitigate action table with assigned owners and P0-P2 priorities.",
        purpose: "Produces clear, backlog-ready engineering deliverables to ensure repeat failures are prevented."
      }
    ],
    weakExample: {
      prompt: "Our database crashed yesterday and caused a 42-minute outage. Write an incident post-mortem.",
      problems: [
        "Lacks timeline, metric data, and architecture topology, forcing the model to hallucinate details.",
        "Often stops at human error ('developer should have watched disk space') rather than systemic failure.",
        "Generates generic recommendations ('improve monitoring') with no priority or assignees.",
        "Does not investigate secondary cascading failures like connection pool starvation."
      ]
    },
    improvedExample: {
      prompt: `Act as a Principal Site Reliability Engineer (SRE) leading a blameless post-mortem investigation.

Incident Context:
- Incident Title: Production Database Failover Outage (42 min downtime)
- Symptoms & Impact: All write queries failed across all customer tenants; 14,000 active sessions dropped
- Timeline of Events: 14:00 - Master DB disk usage crossed 95%; 14:05 - Primary crashed; 14:12 - Replica auto-failover triggered but connection pool overwhelmed replica; 14:42 - Connection pool restarted with throttled limits.

Execute a comprehensive 5-Whys Systemic Analysis:
1. Executive Incident Summary (Severity Level, TTR - Time to Resolution, Total Downtime)
2. The 5-Whys Iterative Chain (Trace from surface symptom down to systemic organizational / architectural cause)
3. Contributing Factors (Technical failure, monitoring blind spot, process gap)
4. Action Items Table (Category [Prevent/Detect/Mitigate], Action, Owner, Priority P0-P2)`,
      changes: [
        "Injected timestamped chronological incident timeline and user session impact.",
        "Enforced blameless SRE framing to target systemic root causes.",
        "Mandated recursive 5-Whys causal decomposition.",
        "Required a structured Prevent/Detect/Mitigate action matrix with owners and P0-P2 priority tags."
      ],
      explanation:
        "The recursive 5-Whys chaining forces the model to uncover cascading vulnerabilities (like connection pool storms and lax alert thresholds) rather than settling on trivial surface explanations."
    },
    description: "Conducts a blameless post-mortem using the 5-Whys methodology to identify systemic organizational and architectural vulnerabilities.",
    template: `Act as a Principal Site Reliability Engineer (SRE) leading a blameless post-mortem investigation.

Incident Context:
- Incident Title: {{incidentTitle}}
- Symptoms & Impact: {{symptomsImpact}}
- Timeline of Events: {{timelineEvents}}

Execute a comprehensive 5-Whys Systemic Analysis:
1. Executive Incident Summary (Severity Level, TTR - Time to Resolution, Total Downtime)
2. The 5-Whys Iterative Chain (Trace from surface symptom down to systemic organizational / architectural cause)
3. Contributing Factors (Technical failure, monitoring blind spot, process gap)
4. Action Items Table (Category [Prevent/Detect/Mitigate], Action, Owner, Priority P0-P2)`,
    variables: [
      { name: "incidentTitle", label: "Incident Title", placeholder: "Global API Outage due to Certificate Expiration", defaultValue: "Production Database Failover Outage (42 min downtime)" },
      { name: "symptomsImpact", label: "Symptoms & Customer Impact", placeholder: "All user logins failed with 500 error", defaultValue: "All write queries failed across all customer tenants; 14,000 active sessions dropped" },
      { name: "timelineEvents", label: "Timeline of Events", placeholder: "14:02 - Alert fired...", defaultValue: "14:00 - Master DB disk usage crossed 95%; 14:05 - Primary instance ran out of disk space and crashed; 14:12 - Replica auto-failover triggered but connection pool overwhelmed replica; 14:42 - Connection pool restarted with throttled limits." }
    ],
    whyItWorks: [
      "Digs beyond human error to uncover latent process, tooling, and architectural flaws.",
      "Produces actionable P0/P1 preventative measures with explicit owners."
    ],
    sampleOutput: `### Post-Mortem: Production Database Failover Outage

**1. Incident Overview**
- Severity: **P1 - Critical**
- Total Outage Duration: **42 minutes**
- Impact: 14,000 active sessions disconnected, 100% write transaction failure rate.

**2. The 5-Whys Root Cause Chain**
1. *Why did the database crash?* -> The primary PostgreSQL database ran out of disk space on the root WAL volume.
2. *Why did WAL disk space fill up unexpectedly?* -> A batch data backfill job ran without WAL archiving limits enabled.
3. *Why did the replica not absorb traffic smoothly on failover?* -> 2,000 backend microservice containers concurrently slammed the new primary, causing a connection pool starvation storm.
4. *Why were connection limits not guarded?* -> PgBouncer was configured with \`max_client_conn = 10000\` without per-pod connection rate-limiting.
5. *Why was disk alerting not triggered prior to outage?* -> Disk capacity alerts were set at 98% threshold rather than standard 80% trend trajectory.

**3. Action Items Matrix**
| Category | Action | Priority | Owner |
| :--- | :--- | :--- | :--- |
| **Prevent** | Add auto-expanding EBS volumes for database storage | P0 | Infra Lead |
| **Prevent** | Enforce client-side connection pooling limits via PgBouncer | P0 | Backend Lead |
| **Detect** | Lower disk alerting to 80% + rate-of-growth alert | P1 | SRE Team |`,
    tags: ["SRE", "Post-Mortem", "Incident Response", "Architecture"]
  }
];
