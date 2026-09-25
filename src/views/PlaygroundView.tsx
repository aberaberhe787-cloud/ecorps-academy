import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, RotateCcw, Sparkles, Columns2, Sliders, Save, Trash2,
  History, Target, Terminal, Bookmark, Check, ChevronDown, ChevronUp,
  Zap, Code2, ShieldAlert, PanelRightOpen, PanelRightClose, X,
  Clock, BookmarkCheck, Loader2, Mic, MicOff, Copy, Cpu, FlaskConical, CheckCircle2
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PromptQualityMeter } from "../components/PromptQualityMeter";
import { TerminalOutput } from "../components/TerminalOutput";
import { PromptHelperBar } from "../components/PromptHelperBar";
import { MissionsPanel } from "../components/MissionsPanel";
import { TokenVisualizer } from "../components/TokenVisualizer";
import { BatchRunner } from "../components/BatchRunner";
import { JsonValidator } from "../components/JsonValidator";
import { CtfSimulator } from "../components/CtfSimulator";
import { AdvancedPromptLab } from "../components/laboratory/AdvancedPromptLab";
import { Tooltip } from "../components/Tooltip";
import { SaveCodeSnippetModal } from "../components/playground/SaveCodeSnippetModal";
import { SavedCodeSnippet } from "../types";

const STARTER_PRESETS = [
  {
    name: "Code Security Auditor",
    icon: Code2,
    systemInstruction: "You are a Principal Application Security Engineer.",
    prompt: `Act as a Senior Application Security Architect. Audit the following function for vulnerabilities (e.g. injection, authorization bypass, race conditions):

\`\`\`typescript
app.post("/api/user/update-email", async (req, res) => {
  const { userId, newEmail } = req.body;
  await db.query(\`UPDATE users SET email = '\${newEmail}' WHERE id = \${userId}\`);
  res.json({ status: "success" });
});
\`\`\`

Provide:
1. Vulnerability classification (CWE / OWASP)
2. Exploit scenario demonstration
3. Remediated parameterized implementation`
  },
  {
    name: "Strict JSON Extractor",
    icon: Sparkles,
    systemInstruction: "You are a deterministic data extraction engine that outputs valid JSON only.",
    prompt: `Extract structured lead attributes from this raw customer transcript.

<customer_message>
"Hi, I'm Sarah Miller from Horizon Logistics. We have 450 fleet vehicles and are looking to migrate our GPS tracking to your platform by Q4. Budget is around $80k annually. Please email me at smiller@horizonlog.com."
</customer_message>

Return RAW JSON ONLY matching this schema:
{
  "leadName": "string",
  "company": "string",
  "fleetSize": number,
  "timeline": "string",
  "annualBudget": number,
  "email": "string",
  "urgency": "low" | "medium" | "high"
}`
  },
  {
    name: "Chain-of-Thought Reasoner",
    icon: Zap,
    systemInstruction: "You are an analytical reasoning engine. Always think step-by-step.",
    prompt: `Solve the following distributed cache capacity planning problem.

Context:
A microservice receives 12,000 read requests per second. Each cached object is 4.5 KB. The cache hit ratio target is 92%. Cached objects expire with a TTL of 15 minutes.

Step-by-step instructions:
1. [BANDWIDTH_ANALYSIS]: Calculate network egress needed from cache servers in MB/s.
2. [MEMORY_SIZING]: Calculate raw RAM required to store unique objects across the 15-minute window.
3. [HEADROOM_CALCULATION]: Add 30% operational headroom for Redis metadata overhead and peak failovers.
4. [RECOMMENDED_INSTANCES]: Recommend an optimal cluster topology.`
  }
];

// ─── Slide-out Drawer ────────────────────────────────────────────────────────
const SideDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    executionHistory, setPrompt, setSystemInstruction, setTemperature, setTopP, setPlaygroundSubTab,
    userProgress, deleteCustomPrompt, deleteCodeSnippet, t
  } = useApp();
  const [activeDrawerTab, setActiveDrawerTab] = useState<"history" | "saved" | "snippets">("history");

  const savedSnippetsCount = userProgress.savedCodeSnippets?.length || 0;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-[340px] sm:max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out overscroll-contain ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5 shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-0.5 overflow-x-auto">
            <button
              onClick={() => setActiveDrawerTab("history")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all shrink-0 ${
                activeDrawerTab === "history"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="h-3 w-3" />
              History ({executionHistory.length})
            </button>
            <button
              onClick={() => setActiveDrawerTab("saved")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all shrink-0 ${
                activeDrawerTab === "saved"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bookmark className="h-3 w-3" />
              Prompts ({userProgress.savedCustomPrompts.length})
            </button>
            <button
              onClick={() => setActiveDrawerTab("snippets")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all shrink-0 ${
                activeDrawerTab === "snippets"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="h-3 w-3 text-blue-400" />
              Snippets ({savedSnippetsCount})
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-1 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* History Tab */}
          {activeDrawerTab === "history" && (
            <>
              {executionHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
                  <History className="h-10 w-10 text-slate-700" />
                  <p className="text-sm font-medium">No runs yet</p>
                  <p className="text-xs">Execute a prompt in the Sandbox to build history.</p>
                </div>
              ) : (
                executionHistory.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-1 text-blue-400">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      <span>{item.durationMs}ms · ~{item.tokenCount} tokens</span>
                    </div>
                    <pre className="rounded-lg bg-slate-950 p-2 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-24 overflow-y-auto border border-slate-800 leading-relaxed">
                      {item.prompt.slice(0, 200)}{item.prompt.length > 200 ? "…" : ""}
                    </pre>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.prompt);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Copy prompt to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => {
                          setPrompt(item.prompt);
                          if (item.systemInstruction) setSystemInstruction(item.systemInstruction);
                          setPlaygroundSubTab("sandbox");
                          onClose();
                        }}
                        className="flex-1 rounded-lg bg-slate-800 py-1.5 text-xs font-semibold text-slate-300 hover:bg-blue-600 hover:text-white transition-colors text-center"
                      >
                        Reload in Editor
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Saved Tab */}
          {activeDrawerTab === "saved" && (
            <>
              {userProgress.savedCustomPrompts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
                  <Bookmark className="h-10 w-10 text-slate-700" />
                  <p className="text-sm font-medium">No saved prompts</p>
                  <p className="text-xs">Use the "Save" button in the editor to build your library.</p>
                </div>
              ) : (
                userProgress.savedCustomPrompts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">{p.title}</span>
                      <span className="text-xs text-slate-500 font-mono shrink-0">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <pre className="rounded-lg bg-slate-950 p-2 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-24 overflow-y-auto border border-slate-800 leading-relaxed">
                      {p.prompt.slice(0, 200)}{p.prompt.length > 200 ? "…" : ""}
                    </pre>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(p.prompt);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => deleteCustomPrompt(p.id)}
                        className="flex items-center gap-1 rounded-lg border border-rose-900/50 px-2 py-1 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${p.title.replace(/\s+/g, '_')}.json`;
                          a.click();
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => {
                          const markdown = `# ${p.title}\n\n${p.prompt}`;
                          const blob = new Blob([markdown], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${p.title.replace(/\s+/g, '_')}.md`;
                          a.click();
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        MD
                      </button>
                      <button
                        onClick={() => {
                          setPrompt(p.prompt);
                          setPlaygroundSubTab("sandbox");
                          onClose();
                        }}
                        className="flex-1 rounded-lg bg-blue-600 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition-colors text-center"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Snippets Tab */}
          {activeDrawerTab === "snippets" && (
            <>
              {(!userProgress.savedCodeSnippets || userProgress.savedCodeSnippets.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
                  <Code2 className="h-10 w-10 text-slate-700" />
                  <p className="text-sm font-medium">No saved code snippets</p>
                  <p className="text-xs">Use the "Save Snippet" button in the editor to save Python, TypeScript, or REST code.</p>
                </div>
              ) : (
                userProgress.savedCodeSnippets.map((s) => (
                  <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate max-w-[160px]">{s.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 shrink-0 uppercase">
                        {s.language}
                      </span>
                    </div>
                    <pre className="rounded-lg bg-slate-950 p-2 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-24 overflow-y-auto border border-slate-800 leading-relaxed">
                      {s.code.slice(0, 200)}{s.code.length > 200 ? "…" : ""}
                    </pre>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(s.code);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => deleteCodeSnippet(s.id)}
                        className="flex items-center gap-1 rounded-lg border border-rose-900/50 px-2 py-1 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete snippet"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          const ext = s.language === "python" ? "py" : s.language === "typescript" ? "ts" : s.language === "json" ? "json" : s.language === "curl" ? "sh" : "txt";
                          const blob = new Blob([s.code], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${s.title.replace(/\s+/g, '_')}.${ext}`;
                          a.click();
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => {
                          setPrompt(s.code);
                          if (s.systemInstruction) setSystemInstruction(s.systemInstruction);
                          if (typeof s.temperature === "number") setTemperature(s.temperature);
                          if (typeof s.topP === "number") setTopP(s.topP);
                          setPlaygroundSubTab("sandbox");
                          onClose();
                        }}
                        className="flex-1 rounded-lg bg-blue-600 py-1 text-xs font-semibold text-white hover:bg-blue-500 transition-colors text-center"
                      >
                        Load
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Main Playground View ─────────────────────────────────────────────────────
export const PlaygroundView: React.FC = () => {
  const {
    playgroundSubTab, setPlaygroundSubTab,
    prompt, setPrompt,
    systemInstruction, setSystemInstruction,
    temperature, setTemperature,
    topP, setTopP,
    isExecuting, lastResult,
    executeCurrentPrompt, clearOutput,
    isComparisonMode, setIsComparisonMode,
    comparisonPromptB, setComparisonPromptB,
    comparisonResultB, executeComparison,
    executionHistory,
    userProgress,
    saveCustomPrompt, deleteCustomPrompt,
    hasRealApiAvailable, aiMode, setAiMode,
    t
  } = useApp();

  const [showParameters, setShowParameters] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState<"editor" | "output" | "tools">("editor");
  const [saveTitle, setSaveTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveSnippetModalOpen, setIsSaveSnippetModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [compBCopied, setCompBCopied] = useState(false);

  const handleCopyPrompt = () => {
    if (!prompt.trim()) return;
    navigator.clipboard.writeText(prompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const [presetLoadedName, setPresetLoadedName] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const promptRef = useRef(prompt);

  useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const prev = promptRef.current;
          setPrompt(prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + finalTranscript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  // Auto-save logic
  useEffect(() => {
    const savedPrompt = localStorage.getItem("promptlab_playground_prompt_autosave");
    const savedSys = localStorage.getItem("promptlab_playground_sys_autosave");
    const savedCompB = localStorage.getItem("promptlab_playground_comp_b_autosave");
    if (savedPrompt) {
      setPrompt(savedPrompt);
    }
    if (savedSys) {
      setSystemInstruction(savedSys);
    }
    if (savedCompB) {
      setComparisonPromptB(savedCompB);
    }
  }, []);

  useEffect(() => {
    if (!prompt && !systemInstruction && !comparisonPromptB) return;

    setAutoSaveStatus("saving");
    const timer = setTimeout(() => {
      localStorage.setItem("promptlab_playground_prompt_autosave", prompt);
      localStorage.setItem("promptlab_playground_sys_autosave", systemInstruction);
      localStorage.setItem("promptlab_playground_comp_b_autosave", comparisonPromptB);
      setAutoSaveStatus("saved");
      const statusTimer = setTimeout(() => setAutoSaveStatus("idle"), 2000);
      return () => clearTimeout(statusTimer);
    }, 1500);

    return () => clearTimeout(timer);
  }, [prompt, systemInstruction, comparisonPromptB]);

  const handleInsertSnippet = (snippet: string) => setPrompt(prompt + snippet);

  const handleLoadPreset = (preset: typeof STARTER_PRESETS[0]) => {
    setPrompt(preset.prompt);
    setSystemInstruction(preset.systemInstruction);
    setPresetLoadedName(preset.name);
    setTimeout(() => setPresetLoadedName(null), 2500);
  };

  const handleSavePrompt = () => {
    if (!saveTitle.trim()) return;
    saveCustomPrompt(saveTitle.trim(), prompt);
    setSaveTitle("");
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const totalDrawerItems = executionHistory.length + userProgress.savedCustomPrompts.length;

  return (
    <div className={`page-shell app-view py-2.5 sm:py-6 space-y-3 sm:space-y-6 ${(playgroundSubTab === "sandbox" || playgroundSubTab === "comparison") ? "pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-6" : ""}`}>

      {/* Header & Sub Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-800 pb-3 sm:pb-4 w-full">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Terminal className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">{t.playground.title}</h1>
          </div>
          <p className="mt-0.5 sm:mt-1 text-xs text-slate-400">{t.playground.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sub-Nav Pills */}
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-0.5 sm:p-1 overflow-x-auto no-scrollbar max-w-full touch-pan-x relative overscroll-x-contain">
            {[
              { id: "sandbox", label: t.playground.tabSandbox, shortLabel: "Sandbox", icon: Terminal, onClick: () => { 
                if (playgroundSubTab === "missions") {
                  setPrompt("");
                  setSystemInstruction("");
                }
                setPlaygroundSubTab("sandbox"); 
                setIsComparisonMode(false); 
              } },
              { id: "missions", label: `${t.playground.tabMissions} (5)`, shortLabel: "Missions", icon: Target, onClick: () => { setPlaygroundSubTab("missions"); setIsComparisonMode(false); } },
              { id: "ctf", label: "CTF Labs", shortLabel: "CTF", icon: ShieldAlert, onClick: () => { setPlaygroundSubTab("ctf"); setIsComparisonMode(false); } },
              { id: "lab", label: "Experiments", shortLabel: "Labs", icon: FlaskConical, onClick: () => { setPlaygroundSubTab("lab"); setIsComparisonMode(false); } },
              { id: "comparison", label: t.playground.tabComparison, shortLabel: "A/B", icon: Columns2, onClick: () => { setPlaygroundSubTab("comparison"); setIsComparisonMode(true); } },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = playgroundSubTab === tab.id || (tab.id === "comparison" && isComparisonMode);
              const isCtf = tab.id === "ctf";
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={tab.onClick}
                  aria-label={tab.label}
                  className={`relative flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold transition-colors duration-200 whitespace-nowrap z-10 shrink-0 min-h-[36px] ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="playgroundSubTabIndicator"
                      className={`absolute inset-0 rounded-lg shadow-sm -z-10 ${
                        isCtf ? "bg-rose-600 shadow-rose-900/40" : "bg-blue-600 shadow-blue-900/40"
                      }`}
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 34,
                      }}
                    />
                  )}
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Toggle Button */}
          <button
            id="open-drawer-btn"
            onClick={() => setDrawerOpen(true)}
            title="History & Saved Prompts"
            className="relative flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-2.5 sm:px-3 py-2 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all shrink-0"
          >
            <PanelRightOpen className="h-4 w-4 text-blue-400" />
            <span className="hidden sm:inline">Library</span>
            {totalDrawerItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-blue-600 text-xs font-black text-white flex items-center justify-center">
                {Math.min(totalDrawerItems, 99)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Subtab Views with Smooth Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={playgroundSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full space-y-4"
        >
          {/* Missions Tab */}
          {playgroundSubTab === "missions" && <MissionsPanel />}

          {/* CTF Tab */}
          {playgroundSubTab === "ctf" && <CtfSimulator />}

          {/* P3 Laboratory Tab */}
          {playgroundSubTab === "lab" && <AdvancedPromptLab />}

          {/* Main Dual Pane (Sandbox + Comparison) */}
          {(playgroundSubTab === "sandbox" || playgroundSubTab === "comparison") && (
        <>
          {/* Mobile Responsive Workspace Switcher (< lg) — sticky under top chrome */}
          <div className="lg:hidden sticky top-14 z-30 flex items-center p-0.5 sm:p-1 bg-slate-950/95 border border-slate-800 rounded-xl mb-3 shadow-sm backdrop-blur-md -mx-0.5">
            <button
              type="button"
              id="mobile-tab-editor-btn"
              onClick={() => setMobileViewMode("editor")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                mobileViewMode === "editor"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              id="mobile-tab-output-btn"
              onClick={() => setMobileViewMode("output")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] relative ${
                mobileViewMode === "output"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Output</span>
              {lastResult && (
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
            {!isComparisonMode && (
              <button
                type="button"
                id="mobile-tab-tools-btn"
                onClick={() => setMobileViewMode("tools")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all min-h-[40px] ${
                  mobileViewMode === "tools"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Tools & Labs</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full max-w-full">
            {/* Left Column: Prompt Editor */}
            <div className={`${isComparisonMode ? "lg:col-span-6" : "lg:col-span-7"} space-y-3 sm:space-y-4 w-full max-w-full ${mobileViewMode !== "editor" && mobileViewMode !== "tools" ? "hidden lg:block" : mobileViewMode === "tools" ? "hidden lg:block" : "block"}`}>

            {/* Starter Presets Bar */}
            {playgroundSubTab === "sandbox" && !isComparisonMode && (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2 sm:p-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 w-full max-w-full overflow-hidden">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap pl-1 shrink-0">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Presets:
                </span>
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full max-w-full pb-1 touch-pan-x">
                  {STARTER_PRESETS.map((preset, idx) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={idx}
                        id={`preset-btn-${idx + 1}`}
                        onClick={() => handleLoadPreset(preset)}
                        className="shrink-0 snap-start flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-300 hover:border-blue-500 hover:text-blue-300 whitespace-nowrap transition-all"
                      >
                        <Icon className="h-3 w-3 text-blue-400" />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
                {presetLoadedName && (
                  <span className="animate-in fade-in text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-400" /> Loaded "{presetLoadedName}"
                  </span>
                )}
              </div>
            )}

            {/* Quality Meter & Helper */}
            <PromptQualityMeter promptText={prompt} />
            <PromptHelperBar onInsertText={handleInsertSnippet} />

            {/* Editor Container */}
            <div className="w-full max-w-full rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md overflow-hidden">
              {/* Editor Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-3 sm:px-4 py-2 sm:py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    {isComparisonMode ? "Variant A — Engineered" : "User Prompt Input"}
                    <Tooltip content={isComparisonMode ? "Your optimized, structure-aligned prompt using engineering patterns." : "Input your primary prompt template to execute against the active LLM."} />
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{prompt.length} chars</span>
                  
                  {/* Status Indicator */}
                  {autoSaveStatus === "saving" && (
                    <span className="text-xs text-blue-400 font-mono flex items-center gap-1 ml-2">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                    </span>
                  )}
                  {autoSaveStatus === "saved" && (
                    <span className="text-xs text-emerald-500 font-mono flex items-center gap-1 ml-2 animate-in fade-in duration-300">
                      <Check className="h-3 w-3" /> Saved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={toggleListening}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                      isListening
                        ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                    title={isListening ? "Stop Dictation" : "Start Voice Dictation"}
                  >
                    {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    <span>{isListening ? "Listening..." : "Dictate"}</span>
                  </button>
                  <button
                    id="toggle-system-prompt-btn"
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <span>System</span>
                    {showSystemPrompt ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  <button
                    id="toggle-params-btn"
                    onClick={() => setShowParameters(!showParameters)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <Sliders className="h-3 w-3" />
                    <span className="hidden sm:inline">Params</span>
                  </button>
                  <button
                    onClick={() => setIsSaving(true)}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Bookmark className="h-3 w-3" />
                    <span className="hidden sm:inline">Save Prompt</span>
                  </button>
                  <button
                    onClick={() => setIsSaveSnippetModalOpen(true)}
                    className="flex items-center gap-1 rounded bg-blue-600/20 border border-blue-500/40 px-2 py-1 text-xs font-medium text-blue-300 hover:bg-blue-600 hover:text-white transition-colors"
                    title="Save as Python, TypeScript, cURL, or JSON SDK Snippet"
                  >
                    <Code2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Save Snippet</span>
                  </button>
                </div>
              </div>

              {/* Collapsible System Prompt */}
              {showSystemPrompt && (
                <div className="border-b border-slate-800 bg-slate-950/90 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-slate-400">
                      System Instruction (Privileged Rules)
                    </span>
                    <Tooltip content="Sets foundational guidelines, safety boundaries, or a persona that the model must strictly obey." />
                  </div>
                  <textarea
                    id="system-prompt-input"
                    rows={2}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    placeholder="E.g., You are a strict JSON serialization engine..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Collapsible Parameters */}
              {showParameters && (
                <div className="border-b border-slate-800 bg-slate-950/90 p-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between font-mono text-slate-400 mb-1 items-center">
                      <div className="flex items-center gap-1.5">
                        <span>Temperature:</span>
                        <Tooltip content="Controls response randomness. Lower values are precise and deterministic; higher values are creative." position="top" />
                      </div>
                      <span className="text-blue-400 font-bold">{temperature.toFixed(2)}</span>
                    </div>
                    <input id="temperature-slider" type="range" min="0.0" max="1.0" step="0.05"
                      value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                    <div className="flex justify-between text-xs sm:text-xs text-slate-500 mt-0.5 font-mono">
                      <span>Deterministic</span><span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-slate-400 mb-1 items-center">
                      <div className="flex items-center gap-1.5">
                        <span>Top-P:</span>
                        <Tooltip content="Nucleus sampling. Filters word pool to cumulative probability. 1.0 considers all words; 0.1 only the top 10% most probable." position="top" />
                      </div>
                      <span className="text-blue-400 font-bold">{topP.toFixed(2)}</span>
                    </div>
                    <input id="top-p-slider" type="range" min="0.1" max="1.0" step="0.05"
                      value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </div>
                </div>
              )}

              {/* Save popup */}
              {isSaving && (
                <div className="border-b border-slate-800 bg-slate-950 p-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter prompt title..."
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                  <button onClick={handleSavePrompt} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">Save</button>
                  <button onClick={() => setIsSaving(false)} className="rounded-lg bg-slate-800 px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-700">Cancel</button>
                </div>
              )}
              {savedSuccess && (
                <div className="bg-emerald-950/80 border-b border-emerald-800 px-4 py-1.5 text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Saved to library!
                </div>
              )}

              {/* Main Textarea */}
              <div className="p-2.5 sm:p-3">
                <textarea
                  id="main-prompt-editor"
                  rows={isComparisonMode ? 6 : 8}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here... Use delimiters like <context>, personas like 'Act as...', and explicit instructions."
                  className="w-full min-h-[140px] sm:min-h-[180px] max-h-[50dvh] resize-y rounded-lg bg-slate-950/80 p-3 font-mono text-sm sm:text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 leading-relaxed border border-slate-800/80"
                />
              </div>

              {/* Execution Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-800 bg-slate-950/70 px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-2">
                  <button
                    id="clear-prompt-btn"
                    onClick={() => setPrompt("")}
                    className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-200 py-1.5 sm:py-1 px-2.5 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                  <button
                    id="copy-prompt-btn"
                    type="button"
                    onClick={handleCopyPrompt}
                    disabled={!prompt.trim()}
                    className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white py-1.5 sm:py-1 px-2.5 rounded-lg hover:bg-slate-800/80 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    title="Copy prompt text to clipboard"
                  >
                    {promptCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSaveSnippetModalOpen(true)}
                    disabled={!prompt.trim()}
                    className="flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 py-1.5 sm:py-1 px-2.5 rounded-lg hover:bg-blue-950/50 border border-blue-900/60 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    title="Save as SDK Code Snippet"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Save Snippet</span>
                  </button>
                </div>
                {/* Desktop/tablet execute — mobile uses sticky action bar above bottom nav */}
                <button
                  id="run-prompt-btn"
                  onClick={() => {
                    if (isComparisonMode) {
                      executeComparison();
                    } else {
                      executeCurrentPrompt();
                    }
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setMobileViewMode("output");
                    }
                  }}
                  disabled={isExecuting || !prompt.trim()}
                  className="hidden md:flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>{isExecuting ? "Generating..." : isComparisonMode ? "Run A/B Benchmark" : "Execute Prompt"}</span>
                </button>
              </div>
            </div>

            {/* Token Visualizer, Batch Runner, JSON Validator (Desktop or Mobile Tools Tab) */}
            {playgroundSubTab === "sandbox" && !isComparisonMode && (
              <div className={mobileViewMode === "tools" ? "block lg:block space-y-3" : "hidden lg:block space-y-3"}>
                <TokenVisualizer text={prompt} />
                <BatchRunner promptTemplate={prompt} systemInstruction={systemInstruction} />
                <JsonValidator outputString={lastResult?.output || ""} />
              </div>
            )}

            {/* Comparison Variant B Editor */}
            {isComparisonMode && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    Variant B — Baseline / Naive
                    <Tooltip content="The control variant. Input a raw, conversational, or un-engineered prompt here to contrast performance." />
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!comparisonPromptB) return;
                        navigator.clipboard.writeText(comparisonPromptB);
                        setCompBCopied(true);
                        setTimeout(() => setCompBCopied(false), 2000);
                      }}
                      disabled={!comparisonPromptB.trim()}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors disabled:opacity-40"
                      title="Copy Variant B to clipboard"
                    >
                      {compBCopied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy to Clipboard</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-500 font-mono">{comparisonPromptB.length} chars</span>
                  </div>
                </div>
                <textarea
                  id="comparison-prompt-b-editor"
                  rows={5}
                  value={comparisonPromptB}
                  onChange={(e) => setComparisonPromptB(e.target.value)}
                  placeholder="Enter naive or unconstrained prompt for A/B comparison..."
                  className="w-full resize-y rounded-lg bg-slate-950/80 p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500/50 border border-slate-800"
                />
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className={`${isComparisonMode ? "lg:col-span-6" : "lg:col-span-5"} space-y-3 sm:space-y-4 w-full max-w-full ${mobileViewMode !== "output" ? "hidden lg:block" : "block"}`}>
            {isComparisonMode ? (
              <div className="space-y-4">
                {/* Experimental Benchmark & Regression Summary Panel */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 shadow-lg space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-blue-400" />
                      <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">Experimental A/B Benchmark Matrix</span>
                    </div>
                    <span className="rounded-full bg-blue-950 border border-blue-800 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                      Variant A vs B
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Token Usage:</span>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-blue-400">A: {lastResult?.tokenCount || 0}</span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-indigo-400">B: {comparisonResultB?.tokenCount || 0}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Latency (ms):</span>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-blue-400">A: {lastResult?.durationMs || 0}ms</span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-indigo-400">B: {comparisonResultB?.durationMs || 0}ms</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/80 space-y-1">
                      <span className="text-slate-400 text-[11px]">Regression Status:</span>
                      <div className="flex items-center gap-1 font-bold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">0 Regressions</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-h-[200px] sm:min-h-[260px]">
                  <TerminalOutput
                    result={lastResult}
                    isExecuting={isExecuting}
                    title="Variant A: Engineered"
                    badge="OPTIMIZED"
                    onRetry={() => executeComparison()}
                  />
                </div>
                <div className="min-h-[200px] sm:min-h-[280px]">
                  <TerminalOutput
                    result={comparisonResultB}
                    isExecuting={isExecuting}
                    title="Variant B: Baseline"
                    badge="BASELINE"
                    onRetry={() => executeComparison()}
                  />
                </div>
              </div>
            ) : (
              <div className="min-h-[240px] sm:min-h-[400px] h-full">
                <TerminalOutput
                  result={lastResult}
                  isExecuting={isExecuting}
                  onRetry={() => executeCurrentPrompt()}
                />
              </div>
            )}
          </div>
        </div>
      </>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Slide-out Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Save Code Snippet Modal */}
      <SaveCodeSnippetModal
        isOpen={isSaveSnippetModalOpen}
        onClose={() => setIsSaveSnippetModalOpen(false)}
        prompt={prompt}
        systemInstruction={systemInstruction}
        temperature={temperature}
        topP={topP}
      />

      {/* Sticky Bottom Action Bar for Mobile — sits above MobileBottomNav */}
      {(playgroundSubTab === "sandbox" || playgroundSubTab === "comparison") && (
        <div
          id="playground-mobile-action-bar"
          className="fixed left-0 right-0 z-[45] bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-3 py-2 sm:px-4 md:hidden flex items-center justify-between gap-2 shadow-2xl bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))]"
        >
          <button
            id="mobile-clear-prompt-btn"
            onClick={() => setPrompt("")}
            className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-2 rounded-xl border border-slate-800 bg-slate-900 shrink-0 min-h-[44px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <button
            id="mobile-execute-prompt-btn"
            onClick={() => {
              // On mobile, switch to Output pane so the learner sees generation progress
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setMobileViewMode("output");
              }
              if (isComparisonMode) {
                executeComparison();
              } else {
                executeCurrentPrompt();
              }
            }}
            disabled={isExecuting || !prompt.trim()}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-3 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <Play className="h-3.5 w-3.5 fill-white shrink-0" />
            <span className="truncate">{isExecuting ? "Generating..." : isComparisonMode ? "Run Benchmark" : "Execute Prompt"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
