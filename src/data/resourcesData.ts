import { GlossaryTerm } from "../types";

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Zero-Shot Prompting",
    category: "Technique",
    definition: "Presenting a task directly to the language model without providing any preliminary examples or demonstration pairs.",
    example: `"Classify the sentiment of this headline as Positive, Negative, or Neutral: 'Company reports record Q3 earnings.'"`,
    proTip: "Use Zero-Shot for simple, well-defined tasks where standard pre-trained knowledge is sufficient."
  },
  {
    term: "Few-Shot Prompting",
    category: "Technique",
    definition: "Conditioning the model by providing 2 to 5 high-quality input-output demonstration pairs inside the prompt before the target query.",
    example: `"Input: Great product! -> Output: POSITIVE\nInput: Broke immediately -> Output: NEGATIVE\nInput: Arrived on Tuesday -> Output: NEUTRAL\nInput: {{TargetText}} -> Output:"`,
    proTip: "Always include at least one edge case in your few-shot exemplars to calibrate how the model resolves ambiguity."
  },
  {
    term: "Chain-of-Thought (CoT)",
    category: "Reasoning",
    definition: "Prompting the model to verbalize intermediate deductive or computational steps before stating its final answer.",
    example: `"Think step by step in a <reasoning> block before giving the final answer."`,
    proTip: "Increases multi-step math and logical deduction accuracy by over 30% by allocating dedicated token generation to reasoning."
  },
  {
    term: "Delimiters",
    category: "Architecture",
    definition: "Special markers (such as XML tags `<data>`, triple quotes `\"\"\"`, or markdown fences `\`\`\``) used to separate instructions from payload content.",
    example: `"Summarize the article enclosed in <source_doc> ... </source_doc>."`,
    proTip: "Delimiters are your first line of defense against prompt injection attacks."
  },
  {
    term: "Temperature",
    category: "Hyperparameter",
    definition: "A parameter that scales probability distributions before softmax sampling. Lower values (0.0–0.2) produce deterministic outputs; higher values (0.7–1.0) introduce creative variation.",
    example: "Set temperature=0.0 for structured JSON extraction or coding; use 0.7 for marketing ideation.",
    proTip: "For strict schema compliance and classifications, always set Temperature to 0.0 or 0.1."
  },
  {
    term: "Context Window",
    category: "Architecture",
    definition: "The maximum number of tokens (both input and output combined) that an LLM can hold in active memory during a single request cycle.",
    example: "Modern models like Gemini support up to 1-2 million tokens in a single context window.",
    proTip: "Place the most critical instructions at the very start or end of large contexts to prevent 'Lost in the Middle' attention degradation."
  },
  {
    term: "Hallucination",
    category: "Safety & Reliability",
    definition: "When an LLM confidently outputs plausible-sounding facts, citations, or data that are false or completely ungrounded.",
    example: "Inventing non-existent API methods or quoting legal precedents that do not exist.",
    proTip: "Prevent hallucinations by feeding grounding context and instructing the model: 'If the answer is not in the text, state that you do not know.'"
  },
  {
    term: "System Instruction / System Prompt",
    category: "Architecture",
    definition: "A privileged instruction channel that establishes the model's core personality, boundaries, and formatting rules across all conversation turns.",
    example: `"You are an empathetic, concise patient advocate. Never provide medical prescriptions."`,
    proTip: "Use system instructions for persistent guidelines and the user prompt for dynamic task payloads."
  },
  {
    term: "ReAct (Reason + Act)",
    category: "Agents",
    definition: "An agentic prompting paradigm where the model alternates between Thought (reasoning), Action (tool/API invocation), and Observation (tool output).",
    example: `"Thought: I need current weather -> Action: get_weather('NYC') -> Observation: 72°F -> Final Answer: It is 72°F in NYC."`,
    proTip: "ReAct transforms LLMs from passive text generators into autonomous workflow orchestrators."
  },
  {
    term: "Retrieval-Augmented Generation (RAG)",
    category: "Architecture",
    definition: "A framework that fetches relevant document chunks from a vector database or search index and injects them into the prompt context at runtime.",
    example: "Injecting the 3 most relevant policy paragraphs into the prompt when an employee asks an HR question.",
    proTip: "RAG solves stale knowledge without expensive model fine-tuning."
  }
];

export const promptOfTheDayList = [
  {
    date: "2026-08-19",
    title: "The Reverse Interviewer Pattern",
    category: "Discovery & Planning",
    prompt: `I want to build a high-performance web scraper in Go for e-commerce pricing.

Do not write the code yet. Instead, act as a Principal Distributed Systems Architect. Ask me the top 5 most critical technical and operational questions you need answered to design the optimal architecture. Wait for my answers before proceeding.`,
    whyItWorks: "Flips the interaction so the AI extracts required requirements before jumping into assumptions, ensuring custom-tailored solutions.",
    tags: ["Planning", "Interactive", "Architecture"]
  },
  {
    date: "2026-08-20",
    title: "The Dialectic Counter-Argument Probe",
    category: "Critical Thinking",
    prompt: `I believe our startup should migrate from a monolithic Postgres database to microservices with DynamoDB.

Assume the persona of a skeptical veteran SRE. Present the 3 strongest counter-arguments against this migration, detailing the hidden operational costs, debugging friction, and data consistency hazards we are likely underestimating.`,
    whyItWorks: "Forces the model to challenge confirmation bias and reveal blind spots through adversarial critical evaluation.",
    tags: ["Strategy", "Risk Analysis", "Debate"]
  }
];

export const externalLearningResources = [
  {
    title: "Google AI Studio Prompt Engineering Guide",
    url: "https://ai.google.dev/gemini-api/docs/prompting-strategies",
    description: "Official best practices from Google DeepMind on multimodal and structured prompting.",
    type: "Official Docs"
  },
  {
    title: "LearnPrompting.org",
    url: "https://learnprompting.org",
    description: "Comprehensive open-source course covering beginner to advanced prompt engineering.",
    type: "Course"
  },
  {
    title: "Anthropic Interactive Prompting Tutorial",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
    description: "Deep dive into XML tagging, chain-of-thought, and system prompt calibration.",
    type: "Tutorial"
  },
  {
    title: "Brex's Prompt Engineering Guide",
    url: "https://github.com/brexhq/prompt-engineering",
    description: "Production lessons and battle-tested patterns for high-scale LLM application development.",
    type: "Production Guide"
  }
];
