import { PromptPattern } from "../types";

export const promptPatterns: PromptPattern[] = [
  {
    id: "pat-code-debug",
    title: "Root Cause Code Debugger",
    category: "Coding",
    difficulty: "Intermediate",
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
      "Enforces a strict 2-sentence TL;DR to guarantee immediate executive comprehension."
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
    description: "Generates high-converting cold outreach using the Problem-Agitation-Solution (PAS) framework with hyper-personalized hooks.",
    template: `Act as a world-class B2B Sales Development Representative (SDR) with a 28% cold email reply rate.

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
    description: "Conducts an blameless post-mortem using the 5-Whys methodology to identify systemic organizational and architectural vulnerabilities.",
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
