import React, { useState } from "react";
import {
  Play, RotateCcw, Sparkles, Columns2, Sliders, Save, Trash2,
  History, Target, Terminal, Bookmark, Check, ChevronDown, ChevronUp,
  Zap, Code2, ShieldAlert, PanelRightOpen, PanelRightClose, X,
  Clock, BookmarkCheck
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
    executionHistory, setPrompt, setSystemInstruction, setPlaygroundSubTab,
    userProgress, deleteCustomPrompt, t
  } = useApp();
  const [activeDrawerTab, setActiveDrawerTab] = useState<"history" | "saved">("history");

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
        className={`fixed top-0 right-0 z-40 h-full w-full max-w-sm bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-1">
            <button
              onClick={() => setActiveDrawerTab("history")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeDrawerTab === "history"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              History ({executionHistory.length})
            </button>
            <button
              onClick={() => setActiveDrawerTab("saved")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                activeDrawerTab === "saved"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              Saved ({userProgress.savedCustomPrompts.length})
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="flex items-center gap-1 text-blue-400">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      <span>{item.durationMs}ms · ~{item.tokenCount} tokens</span>
                    </div>
                    <pre className="rounded-lg bg-slate-950 p-2 font-mono text-[10px] text-slate-300 whitespace-pre-wrap max-h-24 overflow-y-auto border border-slate-800 leading-relaxed">
                      {item.prompt.slice(0, 200)}{item.prompt.length > 200 ? "…" : ""}
                    </pre>
                    <button
                      onClick={() => {
                        setPrompt(item.prompt);
                        if (item.systemInstruction) setSystemInstruction(item.systemInstruction);
                        setPlaygroundSubTab("sandbox");
                        onClose();
                      }}
                      className="w-full rounded-lg bg-slate-800 py-1.5 text-xs font-semibold text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Reload in Editor
                    </button>
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
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <pre className="rounded-lg bg-slate-950 p-2 font-mono text-[10px] text-slate-300 whitespace-pre-wrap max-h-24 overflow-y-auto border border-slate-800 leading-relaxed">
                      {p.prompt.slice(0, 200)}{p.prompt.length > 200 ? "…" : ""}
                    </pre>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteCustomPrompt(p.id)}
                        className="flex items-center gap-1 rounded-lg border border-rose-900/50 px-2 py-1 text-[10px] text-rose-400 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                      <button
                        onClick={() => {
                          setPrompt(p.prompt);
                          setPlaygroundSubTab("sandbox");
                          onClose();
                        }}
                        className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                      >
                        Load into Editor
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
  const [saveTitle, setSaveTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleInsertSnippet = (snippet: string) => setPrompt(prompt + snippet);

  const handleLoadPreset = (preset: typeof STARTER_PRESETS[0]) => {
    setPrompt(preset.prompt);
    setSystemInstruction(preset.systemInstruction);
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
    <div className="app-view mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">

      {/* Header & Sub Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">{t.playground.title}</h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">{t.playground.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-Nav Pills */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1 overflow-x-auto scrollbar-hide max-w-[calc(100vw-140px)] sm:max-w-none">
            {[
              { id: "sandbox", label: t.playground.tabSandbox, icon: Terminal, onClick: () => { setPlaygroundSubTab("sandbox"); setIsComparisonMode(false); } },
              { id: "missions", label: `${t.playground.tabMissions} (5)`, icon: Target, onClick: () => { setPlaygroundSubTab("missions"); setIsComparisonMode(false); } },
              { id: "ctf", label: "CTF Labs", icon: ShieldAlert, onClick: () => { setPlaygroundSubTab("ctf"); setIsComparisonMode(false); } },
              { id: "comparison", label: t.playground.tabComparison, icon: Columns2, onClick: () => { setPlaygroundSubTab("comparison"); setIsComparisonMode(true); } },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = playgroundSubTab === tab.id || (tab.id === "comparison" && isComparisonMode);
              const isCtf = tab.id === "ctf";
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={tab.onClick}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? isCtf ? "bg-rose-600 text-white shadow-sm" : "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id === "comparison" ? "A/B" : tab.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Toggle Button */}
          <button
            id="open-drawer-btn"
            onClick={() => setDrawerOpen(true)}
            title="History & Saved Prompts"
            className="relative flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:text-white transition-all shrink-0"
          >
            <PanelRightOpen className="h-4 w-4 text-blue-400" />
            <span className="hidden sm:inline">Library</span>
            {totalDrawerItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-blue-600 text-[9px] font-black text-white flex items-center justify-center">
                {Math.min(totalDrawerItems, 99)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Missions Tab */}
      {playgroundSubTab === "missions" && <MissionsPanel />}

      {/* CTF Tab */}
      {playgroundSubTab === "ctf" && <CtfSimulator />}

      {/* Main Dual Pane (Sandbox + Comparison) */}
      {(playgroundSubTab === "sandbox" || playgroundSubTab === "comparison") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Prompt Editor */}
          <div className={`${isComparisonMode ? "lg:col-span-6" : "lg:col-span-7"} space-y-4`}>

            {/* Starter Presets Bar */}
            {playgroundSubTab === "sandbox" && !isComparisonMode && (
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap pl-1 shrink-0">
                  <Zap className="h-3.5 w-3.5 text-amber-400" /> Presets:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {STARTER_PRESETS.map((preset, idx) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={idx}
                        id={`preset-btn-${idx + 1}`}
                        onClick={() => handleLoadPreset(preset)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-blue-500 hover:text-blue-300 whitespace-nowrap transition-all"
                      >
                        <Icon className="h-3 w-3 text-blue-400" />
                        <span>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quality Meter & Helper */}
            <PromptQualityMeter promptText={prompt} />
            <PromptHelperBar onInsertText={handleInsertSnippet} />

            {/* Editor Container */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md overflow-hidden">
              {/* Editor Header */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-300">
                    {isComparisonMode ? "Variant A — Engineered" : "User Prompt Input"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{prompt.length} chars</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="toggle-system-prompt-btn"
                    onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <span>System</span>
                    {showSystemPrompt ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  <button
                    id="toggle-params-btn"
                    onClick={() => setShowParameters(!showParameters)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    <Sliders className="h-3 w-3" />
                    <span className="hidden sm:inline">Params</span>
                  </button>
                  <button
                    onClick={() => setIsSaving(true)}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <Bookmark className="h-3 w-3" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </div>

              {/* Collapsible System Prompt */}
              {showSystemPrompt && (
                <div className="border-b border-slate-800 bg-slate-950/90 p-3">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    System Instruction (Privileged Rules)
                  </label>
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
                    <div className="flex justify-between font-mono text-slate-400 mb-1">
                      <span>Temperature:</span>
                      <span className="text-blue-400 font-bold">{temperature.toFixed(2)}</span>
                    </div>
                    <input id="temperature-slider" type="range" min="0.0" max="1.0" step="0.05"
                      value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                      <span>Deterministic</span><span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-slate-400 mb-1">
                      <span>Top-P:</span>
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
              <div className="p-3">
                <textarea
                  id="main-prompt-editor"
                  rows={isComparisonMode ? 10 : 12}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here... Use delimiters like <context>, personas like 'Act as...', and explicit instructions."
                  className="w-full resize-y rounded-lg bg-slate-950/80 p-3.5 font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 leading-relaxed border border-slate-800/80"
                />
              </div>

              {/* Execution Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/70 px-4 py-3">
                <button
                  id="clear-prompt-btn"
                  onClick={() => setPrompt("")}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  id="run-prompt-btn"
                  onClick={() => isComparisonMode ? executeComparison() : executeCurrentPrompt()}
                  disabled={isExecuting || !prompt.trim()}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>{isExecuting ? "Generating..." : isComparisonMode ? "Run A/B Benchmark" : "Run Prompt"}</span>
                </button>
              </div>
            </div>

            {/* Token Visualizer, Batch Runner, JSON Validator */}
            {playgroundSubTab === "sandbox" && !isComparisonMode && (
              <>
                <TokenVisualizer text={prompt} />
                <BatchRunner promptTemplate={prompt} systemInstruction={systemInstruction} />
                <JsonValidator outputString={lastResult?.output || ""} />
              </>
            )}

            {/* Comparison Variant B Editor */}
            {isComparisonMode && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-semibold text-rose-400">Variant B — Baseline / Naive</span>
                  <span className="text-[11px] text-slate-500 font-mono">{comparisonPromptB.length} chars</span>
                </div>
                <textarea
                  id="comparison-prompt-b-editor"
                  rows={6}
                  value={comparisonPromptB}
                  onChange={(e) => setComparisonPromptB(e.target.value)}
                  placeholder="Enter naive or unconstrained prompt for A/B comparison..."
                  className="w-full resize-y rounded-lg bg-slate-950/80 p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500/50 border border-slate-800"
                />
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className={`${isComparisonMode ? "lg:col-span-6" : "lg:col-span-5"} space-y-4`}>
            {isComparisonMode ? (
              <div className="space-y-4">
                <div className="h-[280px]">
                  <TerminalOutput result={lastResult} isExecuting={isExecuting} title="Variant A: Engineered" badge="OPTIMIZED" />
                </div>
                <div className="h-[280px]">
                  <TerminalOutput result={comparisonResultB} isExecuting={isExecuting} title="Variant B: Baseline" badge="BASELINE" />
                </div>
              </div>
            ) : (
              <div className="h-[580px]">
                <TerminalOutput result={lastResult} isExecuting={isExecuting} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-out Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};
