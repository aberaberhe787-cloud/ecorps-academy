export interface MockAiResponse {
  text: string;
  detectedKeywords: string[];
  latencyMs: number;
  simulatedTokens: number;
}

export function generateMockAiResponse(
  userPrompt: string,
  systemInstruction?: string,
  temperature: number = 0.7
): MockAiResponse {
  const prompt = userPrompt.trim();
  const lower = prompt.toLowerCase();
  const detectedKeywords: string[] = [];

  // Check for techniques
  const isJson = /json|schema|key-value|serialize/i.test(lower);
  const isSecurity = /security|cve|iam|privilege|vulnerability/i.test(lower);
  const isDeployment = /harbor|node|deployment|nginx|reverse proxy/i.test(lower);
  const isCoT = /step[- ]by[- ]step|reasoning|scratchpad|deduce|algebraic|calculate/i.test(lower);
  const isRole = /act as|you are a|you are an|persona|expert/i.test(lower);
  const isDelimited = /(<{1,2}[a-z_-]+>{1,2}|"{3}|`{3}|---)/i.test(prompt);
  const isFewShot = /example \d+:|input:[\s\S]*output:/i.test(lower);
  const isSelfReflection = /critique|rubric|stage 1|phase 1|self-reflection|refined/i.test(lower);
  const isTreeOfThoughts = /tree of thoughts|branch a|branch b|heuristic|decision matrix/i.test(lower);
  const isReAct = /thought:|action:|observation:|react protocol/i.test(lower);

  if (isJson) detectedKeywords.push("JSON Formatting");
  if (isSecurity) detectedKeywords.push("Security Audit");
  if (isDeployment) detectedKeywords.push("Deployment");
  if (isCoT) detectedKeywords.push("Chain-of-Thought");
  if (isRole) detectedKeywords.push("Role & Persona");
  if (isDelimited) detectedKeywords.push("Delimiters");
  if (isFewShot) detectedKeywords.push("Few-Shot");
  if (isSelfReflection) detectedKeywords.push("Self-Reflection");
  if (isTreeOfThoughts) detectedKeywords.push("Tree of Thoughts");
  if (isReAct) detectedKeywords.push("ReAct Agent");

  // Specialized scenario matches
  if (isTreeOfThoughts || lower.includes("european market") || lower.includes("kafka")) {
    return {
      text: `### 1. Strategic Branch Exploration

- **Branch A (Self-Serve Digital Fast-Path):** Low initial CAPEX, localized multi-currency checkouts, asynchronous regional support.
- **Branch B (Channel Partner Ecosystem):** 25% revenue-share agreements with certified regional system integrators.
- **Branch C (Direct Subsidiary In-Country):** Direct regional entity incorporation with local engineering and executive headcount.

---

### 2. Heuristic Evaluation Matrix

| Strategy Option | Capital Efficiency (1-10) | Time-to-Value (1-10) | Regulatory Ease (1-10) | Total Score |
| :--- | :--- | :--- | :--- | :--- |
| **Branch A (Self-Serve)** | 9/10 | 9/10 | 8/10 | **26/30** |
| **Branch B (Partnerships)** | 8/10 | 7/10 | 8/10 | **23/30** |
| **Branch C (Direct Hub)** | 4/10 | 3/10 | 4/10 | **11/30** |

**Strategic Synthesis:**
Prioritize Branch A for immediate low-risk validation, followed by Branch B partnerships once monthly regional volume passes $50,000 ARR.`,
      detectedKeywords,
      latencyMs: 380,
      simulatedTokens: 185
    };
  }

  if (isSelfReflection || lower.includes("critique")) {
    return {
      text: `### [STAGE 1: INITIAL DRAFT]
Subject: Automated Database Migrations with Zero Downtime
Hi [First Name],
Are you struggling with legacy database migrations? CloudShift provides real-time CDC replication. We would love to book 15 minutes to demo our tool.

---

### [STAGE 2: CRITIQUE AGAINST RUBRIC]
1. Hook Quality: **FAIL** - Relies on generic question format instead of citing quantifiable operational pain (e.g., replication lag or lock contention).
2. Social Proof: **FAIL** - Missing concrete data points, enterprise customer validation, or SLA guarantees.
3. Friction of Call-to-Action: **FAIL** - Asks for a high-commitment 15-minute calendar booking rather than a low-friction resource check.

---

### [STAGE 3: REFINED FINAL OUTPUT]
**Subject:** Zero-downtime Postgres cutovers at 10TB+ scale

Hi [First Name],

Most infrastructure teams delay database migrations because standard pg_dump table locks and CDC replication lag risk dropped transactions during cutover.

CloudShift uses continuous byte-level replication with automated dual-write reconciliation. We recently helped FinTech Corp migrate 42TB from Oracle to AWS Aurora with zero seconds of application downtime.

Open to taking a quick look at our 2-minute architectural benchmark diagram?`,
      detectedKeywords,
      latencyMs: 420,
      simulatedTokens: 240
    };
  }

  if (isReAct || lower.includes("observation:")) {
    return {
      text: `Thought: I need to retrieve the latest incident logs and error frequency from the metrics API.
Action: query_metrics_service
Action Input: {"service": "billing-api", "timeRange": "last_1h", "metric": "http_5xx_rate"}
Observation: HTTP 500 error rate spiked from 0.01% to 14.2% starting at 14:02 UTC following deployment v2.4.1.

Thought: The spike correlates directly with release v2.4.1. Now I will inspect git commits in this release.
Action: inspect_git_diff
Action Input: {"repo": "billing-service", "commit": "v2.4.1"}
Observation: Commit 8f2a1b9 added unhandled null assertion on user.stripeCustomerId in webhook handler.

Thought: I have identified the root cause and reproduction path.
Final Answer: The billing service outage is caused by commit 8f2a1b9 in release v2.4.1, which fails to guard against missing stripeCustomerId on legacy webhook payloads. Recommended action: rollback to v2.4.0 immediately and deploy patch.`,
      detectedKeywords,
      latencyMs: 360,
      simulatedTokens: 190
    };
  }

  if (isSecurity) {
    return {
      text: `### Vulnerability Assessment: IAM Policy
Verified findings based on provided policy snippet:
- [CRITICAL] Wildcard resource grant "s3:*" found in Statement[0]. Remediation: Apply least privilege by scoping to specific ARN prefixes.
- [HIGH] Privilege escalation risk via "iam:PassRole" on "*" resources. Remediation: Restrict to authorized EC2/Lambda execution roles only.

No conversational filler included as requested.`,
      detectedKeywords,
      latencyMs: 250,
      simulatedTokens: 120
    };
  }

  if (isDeployment) {
    return {
      text: `### Production Deployment: Harbor Node
Step-by-step production deployment guidance:
1. Initialize node: Ensure harbor-init is configured with persistent volume claims.
2. Configure ingress: Apply helm chart with appropriate TLS certificate references.
3. Verify readiness: Perform health checks on the core service endpoints.
4. Scale: Deploy to targeted worker nodes using labels.

Ensure configuration is reviewed in staging before production rollout.`,
      detectedKeywords,
      latencyMs: 300,
      simulatedTokens: 150
    };
  }

  if (isJson && !isSecurity) {
    return {
      text: `{
  "status": "success",
  "analyzedAt": "2026-08-19T13:30:00Z",
  "sentiment": "NEGATIVE",
  "urgencyScore": 4,
  "issueCategory": "BILLING_AND_PAYMENTS",
  "customerActionItems": [
    "Reverse unauthorized duplicate charge of $49.00",
    "Send updated transaction receipt via email",
    "Escalate chat support disconnection incident to QA"
  ],
  "assignedDepartment": "BILLING",
  "requiresManagerEscalation": false
}`,
      detectedKeywords,
      latencyMs: 250,
      simulatedTokens: 110
    };
  }

  if ((isCoT && (lower.includes("lines") || lower.includes("equation") || lower.includes("sum"))) || lower.includes("bat and a ball")) {
    return {
      text: `### Step 1: Define Variables
Let $A$ = Number of lines written by Dev A
Let $B$ = Number of lines written by Dev B
Let $C$ = Number of lines written by Dev C

### Step 2: Formulate System of Equations
1. $A = 2B$ (Dev A codes twice as fast as Dev B, so $B = \\frac{A}{2}$)
2. $C = A - 50$ (Dev C codes 50 lines less than Dev A)
3. $A + B + C = 700$ (Total written across all 3 developers is 700 lines)

### Step 3: Step-by-Step Algebraic Substitution
Substitute (1) and (2) into (3):
$$A + \\frac{A}{2} + (A - 50) = 700$$
$$2.5A - 50 = 700$$
$$2.5A = 750$$
$$A = \\frac{750}{2.5} = 300$$

### Step 4: Verify Values
- Dev A ($A$): **300 lines**
- Dev B ($B = \\frac{300}{2}$): **150 lines**
- Dev C ($C = 300 - 50$): **250 lines**
- Total Check: $300 + 150 + 250 = 700$ (Exact Match)

### Final Answer:
Dev A wrote **300 lines** of code.`,
      detectedKeywords,
      latencyMs: 340,
      simulatedTokens: 210
    };
  }

  if (isFewShot) {
    return {
      text: `PrimaryCategory: BILLING
SecondaryCategory: SALES
ActionPlan: Route ticket to billing operations to reconcile $20 invoice discrepancy immediately; notify assigned enterprise account executive to finalize enterprise contract upgrade upon resolution.`,
      detectedKeywords,
      latencyMs: 220,
      simulatedTokens: 60
    };
  }

  if (lower.includes("kubernetes") || lower.includes("10-year-old") || lower.includes("lego")) {
    return {
      text: `Imagine you have a gigantic playroom with millions of LEGO sets. Every video game or website you love is made out of little magical LEGO boxes that do different jobs—one box plays the sound effects, another saves your high score, and another draws the dragons!

Now imagine you are building a giant LEGO castle city that millions of kids want to visit at the exact same time. If one little LEGO dragon keeper gets too tired and falls over, who replaces it?

That's where **Kubernetes** comes in! Think of Kubernetes as the Ultimate Super-Smart Robot Captain of the playroom. The captain holds a master blueprint. If a thousand new kids suddenly visit your castle, BEEP BOOP! The captain instantly builds 50 new dragon keepers. If one box breaks, the captain recycles it and puts a fresh one in place before anyone even notices.

If you had a super-smart robot captain for your own room, what crazy magical game would you ask it to build first?`,
      detectedKeywords,
      latencyMs: 310,
      simulatedTokens: 180
    };
  }

  if (isRole || lower.includes("act as")) {
    return {
      text: `### Expert Assessment & Strategic Execution

**1. Architectural Diagnosis:**
Based on your constraints, direct decoupling of the ingestion tier from the write path prevents thread starvation under high concurrency.

**2. Key Action Items:**
- Implement token-bucket rate limiting at the ingress edge.
- Shift asynchronous telemetry events to a partition-keyed message log.
- Enforce schema validation on payload boundaries before committing to storage.

**3. Verified Output:**
All criteria and operational parameters have been incorporated into the execution pipeline with zero unhandled exceptions.`,
      detectedKeywords,
      latencyMs: 290,
      simulatedTokens: 140
    };
  }

  // General high-quality prompt response
  return {
    text: `### Analysis & Comprehensive Response

Thank you for your prompt. Here is a clear, structured response adhering to your requirements:

1. **Core Concept:**
   Direct, structured communication with language models eliminates latent ambiguity and guarantees deterministic, high-fidelity outputs.

2. **Key Implementation Guidelines:**
   - **Clarity & Context:** State the specific goal, target audience, and explicit boundaries upfront.
   - **Delimiters & Structure:** Use container tags (like XML or Markdown headers) to separate instructions from raw data.
   - **Output Format:** Specify the exact schema (e.g. JSON, Markdown table, bulleted hierarchy) to ensure programmatic reliability.

3. **Next Steps:**
   You can experiment with adding Chain-of-Thought reasoning steps or Few-Shot examples in the Prompt Editor to further refine deterministic model outputs!`,
    detectedKeywords: detectedKeywords.length > 0 ? detectedKeywords : ["Direct Synthesis"],
    latencyMs: 260,
    simulatedTokens: 150
  };
}
