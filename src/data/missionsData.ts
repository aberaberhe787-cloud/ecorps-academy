import { Mission } from "../types";

export const missions: Mission[] = [
  {
    id: "mission-1",
    title: "Mission 1: The Vague Request Overhaul",
    difficulty: "Beginner",
    category: "Clarity & Constraints",
    description: "Transform an ambiguous, generic marketing prompt into an airtight, high-conversion prompt with clear audience parameters, length budget, and structural constraints.",
    objective: "Upgrade the starter prompt by specifying a defined role, a precise target audience, exact structural sections, and strict word or tone constraints.",
    targetCriteria: [
      "Define an expert persona (e.g., 'Senior Growth Copywriter' or 'SaaS Marketing Lead')",
      "Specify target audience (e.g. B2B founders, freelance designers, or devops engineers)",
      "Set structural requirements (e.g. headline, 3 benefit bullets, CTA)",
      "Enforce length constraint (e.g. 'under 150 words' or 'maximum 4 sentences')",
      "Include a tone guideline (e.g. 'punchy', 'urgent', or 'conversational')"
    ],
    initialPrompt: "Write a good post for LinkedIn about our new project management software. Make it sound exciting.",
    systemInstruction: "You are an AI copywriting assistant.",
    hints: [
      "Add a concrete role at the very beginning: 'Act as a Senior B2B SaaS Copywriter...'",
      "Name the product and give it a unique selling point (e.g., 'SprintFlow: AI sprint planner for remote dev teams').",
      "Explicitly list sections: 1. Hook, 2. The Core Problem, 3. Solution Bullets, 4. Call-to-Action.",
      "Specify formatting constraints: 'Use emojis sparingly, keep total length under 180 words.'"
    ],
    solutionExample: `Act as a Senior B2B SaaS Growth Marketer.

Write a high-converting LinkedIn post announcing the launch of "SprintFlow", an AI-assisted sprint planning tool for remote engineering leads.

Post Structure:
1. Hook: 1 punchy sentence highlighting the pain of 3-hour Monday backlog grooming meetings.
2. The Shift: Contrast old manual sprint estimation with automated dependency mapping.
3. Feature Bullets: 3 concise bullet points with key metrics (e.g., "50% faster planning", "zero missed blockers").
4. Call to Action: Direct readers to the free 14-day trial in comments.

Constraints:
- Length: Between 120 and 160 words.
- Tone: Empathetic to engineers, authoritative, free of corporate buzzwords.
- Formatting: Clean spacing with line breaks between sections.`,
    validator: {
      requiredKeywords: ["act as", "bullet", "words", "structure", "hook"],
      forbiddenKeywords: [],
      requiresRole: true,
      requiresDelimiters: false,
      requiresOutputFormat: true,
      minCharLength: 120
    }
  },
  {
    id: "mission-2",
    title: "Mission 2: Strict JSON Data Extractor",
    difficulty: "Intermediate",
    category: "Output Formatting & Schemas",
    description: "Extract messy, unstructured customer feedback into a valid, strongly-typed JSON schema with sentiment scores, urgency tags, and actionable departments.",
    objective: "Design a prompt that forces the model to return RAW JSON matching an exact schema without conversational backticks or preamble, handling missing fields gracefully.",
    targetCriteria: [
      "Explicitly instruct 'Output RAW JSON only' with zero intro/outro text",
      "Define a complete JSON schema with keys: 'sentiment', 'urgencyLevel', 'actionItems', 'assignedTeam'",
      "Provide instructions for missing or ambiguous fields",
      "Enclose the raw customer input within clear delimiters (e.g. <review> or triple quotes)"
    ],
    initialPrompt: "Give me the JSON data for this customer review: 'The app crashed twice when I tried to pay my bill. Your customer support chat was totally useless and didn't answer for 40 minutes.'",
    systemInstruction: "You are a headless data serialization pipeline.",
    hints: [
      "Define the schema clearly: {\"sentiment\": \"NEGATIVE\", \"urgency\": \"HIGH\", ...}",
      "Add the magic constraint: 'Do NOT include markdown formatting like ```json or any introductory text. Return only valid JSON.'",
      "Use XML tags: '<customer_review> ... </customer_review>'."
    ],
    solutionExample: `You are an automated customer ticket triage engine. Extract structured intelligence from the text in <customer_review> into valid, minified JSON.

Output JSON Schema:
{
  "ticketId": "AUTO_GEN",
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "urgencyScore": 1-5,
  "technicalIssue": "string | null",
  "serviceComplaint": "string | null",
  "assignedDepartment": "BILLING" | "TECH_SUPPORT" | "PRODUCT",
  "recommendedAction": "string"
}

Strict Rules:
1. Output RAW JSON ONLY. No markdown code blocks, no conversational preamble.
2. If a field is not present in the review, set its value to null.

<customer_review>
The app crashed twice when I tried to pay my bill. Your customer support chat was totally useless and didn't answer for 40 minutes.
</customer_review>`,
    validator: {
      requiredKeywords: ["json", "schema", "null", "sentiment", "raw"],
      requiresRole: true,
      requiresDelimiters: true,
      requiresOutputFormat: true,
      minCharLength: 150
    }
  },
  {
    id: "mission-3",
    title: "Mission 3: Chain-of-Thought Logic Solver",
    difficulty: "Intermediate",
    category: "Reasoning & CoT",
    description: "Prevent intuitive mistakes on tricky multi-step word math and logic problems by forcing the model into explicit scratchpad step-by-step reasoning.",
    objective: "Create a prompt that forces the model to define algebraic variables, write intermediate equations, self-verify results, and output a verified final answer.",
    targetCriteria: [
      "Mandate intermediate reasoning steps (e.g., 'Step 1: Identify given facts', 'Step 2: Formulate equations')",
      "Include a dedicated scratchpad or <thinking> block",
      "Require a self-verification check against original constraints",
      "Clearly separate internal reasoning from the final answer output"
    ],
    initialPrompt: "A company has 3 developers. Dev A codes twice as fast as Dev B. Dev C codes 50 lines less than Dev A. Together they wrote 700 lines in a day. How many lines did Dev A write?",
    systemInstruction: "You are a mathematical problem-solving tutor.",
    hints: [
      "Use explicit step headers: Step 1 (Variables), Step 2 (Equations), Step 3 (Calculations), Step 4 (Verification).",
      "Tell the model to show all algebraic substitution lines.",
      "Instruct it to verify total sum equals 700 before concluding."
    ],
    solutionExample: `Solve the following programming productivity word problem using explicit Chain-of-Thought reasoning.

Follow this 5-step deduction protocol:
1. [VARIABLE_DECLARATION]: Assign algebraic variables to each developer.
2. [EQUATION_FORMULATION]: Translate all word problem constraints into linear equations.
3. [STEP_BY_STEP_DERIVATION]: Solve for the primary variable with complete arithmetic steps shown.
4. [SANITY_CHECK_VERIFICATION]: Plug the computed values back into the original premises to verify the sum equals 700.
5. [FINAL_ANSWER]: Present a clean summary table showing lines written by Dev A, Dev B, and Dev C.

Problem:
A company has 3 developers. Dev A codes twice as fast as Dev B. Dev C codes 50 lines less than Dev A. Together they wrote 700 lines in a day. How many lines did Dev A write?`,
    validator: {
      requiredKeywords: ["step", "equation", "verif", "variable", "reasoning"],
      requiresRole: false,
      requiresDelimiters: false,
      requiresCoT: true,
      requiresOutputFormat: true,
      minCharLength: 140
    }
  },
  {
    id: "mission-4",
    title: "Mission 4: Role & Persona Calibration",
    difficulty: "Advanced",
    category: "Persona & Demeanor",
    description: "Calibrate an AI persona to communicate complex technical concepts (Kubernetes container orchestration) with extreme domain fidelity and audience empathy.",
    objective: "Construct a persona prompt that sets background experience, philosophical principles, forbidden vocabulary, and tailored analogies for a 10-year-old child vs. a CFO.",
    targetCriteria: [
      "Define an immersive role with background context and tone rules",
      "Specify target audience mental model",
      "Provide a relatable real-world physical analogy",
      "Include explicit negative constraints (words or jargon to avoid)",
      "Set interactive engagement questions at the end"
    ],
    initialPrompt: "Explain Kubernetes to a 10-year-old kid.",
    systemInstruction: "You are an educator.",
    hints: [
      "Give the persona an enthusiastic, warm mentor vibe.",
      "Use LEGO shipping ports or toy toy-box organizers as an analogy.",
      "Forbid terms like 'nodes', 'control plane', 'YAML', 'daemonsets'."
    ],
    solutionExample: `Act as a fun, creative science teacher who specializes in explaining how modern internet magic works to 10-year-old students.

Your Task:
Explain what "Kubernetes" is using the analogy of a giant magical LEGO toy factory.

Rules & Guidelines:
1. The LEGO Analogy: Compare software programs to LEGO sets, containers to transparent storage boxes with instructions, and Kubernetes to the smart robot ship captain who organizes everything.
2. Tone: Playful, vivid, full of wonder. Use sound effects or excitement ("BEEP BOOP!", "Imagine this!").
3. Forbidden Words (Do NOT use): "pods", "nodes", "orchestration", "YAML", "virtual machines", "cluster", "API server".
4. Interactive Element: End with one fun imaginative question asking what game they would build if they had a robot captain.
5. Length: 3 short paragraphs.`,
    validator: {
      requiredKeywords: ["act as", "analogy", "forbidden", "tone", "paragraph"],
      requiresRole: true,
      requiresDelimiters: false,
      requiresOutputFormat: true,
      minCharLength: 130
    }
  },
  {
    id: "mission-5",
    title: "Mission 5: Zero-Shot to Few-Shot Refactor",
    difficulty: "Expert",
    category: "Few-Shot Calibration",
    description: "Refactor an unpredictable zero-shot categorization prompt into a deterministic few-shot prompt that handles subtle edge cases and ambiguity with 100% precision.",
    objective: "Provide 3 high-quality input-output demonstration pairs covering positive, negative, and edge-case ambiguity before the target query.",
    targetCriteria: [
      "Include at least 3 distinct few-shot demonstration pairs (Input/Output)",
      "Cover an edge case where user intent is mixed or ambiguous",
      "Maintain identical formatting schema between exemplar pairs and target prompt",
      "Provide category definitions or taxonomy rules"
    ],
    initialPrompt: "Categorize this customer email into Sales, Billing, or Tech: 'I love your product and want to upgrade to enterprise, but my last invoice had an extra $20 charge that needs fixing before I sign.'",
    systemInstruction: "You are an email routing classifier.",
    hints: [
      "Demonstrate input/output pairs using '---' or 'Example 1:' blocks.",
      "Include: PrimaryCategory, SecondaryCategory, Urgency, RoutingNotes.",
      "Show how to handle the edge-case conflict (Upgrade vs Invoice discrepancy)."
    ],
    solutionExample: `Classify incoming customer communications into Primary and Secondary categories with routing tags.

Taxonomy:
- SALES: Inquiries about enterprise plans, custom quotes, volume licensing, demo requests.
- BILLING: Invoices, payment failures, credit card updates, refund disputes, receipts.
- TECH_SUPPORT: Bugs, error codes, login problems, API questions, latency issues.

Rules:
If an email contains both Sales and Billing, prioritize BILLING first to remove commercial blockers, with SALES as secondary.

---
Example 1:
Input: "Where can I download our VAT invoice for July 2026?"
Output:
PrimaryCategory: BILLING
SecondaryCategory: NONE
ActionPlan: Direct to self-service invoice billing portal.
---
Example 2:
Input: "We have 50 engineers and need SSO Okta integration. Can someone walk us through pricing?"
Output:
PrimaryCategory: SALES
SecondaryCategory: TECH_SUPPORT
ActionPlan: Route to Enterprise Sales Rep; attach SSO security whitepaper.
---
Example 3 (Mixed Intent / Edge Case):
Input: "Our team loves the beta, but we had a 502 error during payment checkout yesterday and need to confirm if our card was charged before we upgrade 10 seats."
Output:
PrimaryCategory: BILLING
SecondaryCategory: SALES
ActionPlan: Escalate to billing ops to confirm pending payment state; notify account executive for seat upgrade follow-up.
---
Target Input:
Input: "I love your product and want to upgrade to enterprise, but my last invoice had an extra $20 charge that needs fixing before I sign."
Output:`,
    validator: {
      requiredKeywords: ["example", "input:", "output:", "category", "primary"],
      requiresRole: false,
      requiresDelimiters: true,
      requiresFewShot: true,
      requiresOutputFormat: true,
      minCharLength: 200
    }
  }
];
