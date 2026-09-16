import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Code2,
  Bookmark,
  Check,
  X,
  FileCode,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Copy,
  ExternalLink,
  Tag,
  AlignLeft,
  Settings2
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export interface SaveCodeSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  topP?: number;
}

export const generateSdkCode = (
  language: string,
  prompt: string,
  systemInstruction: string = "",
  temperature: number = 0.7,
  topP: number = 0.95
): string => {
  const safePrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const safeSys = systemInstruction.replace(/"/g, '\\"').replace(/\n/g, "\\n");

  switch (language) {
    case "python":
      return `"""
Google GenAI SDK - Python Integration
Model: gemini-2.5-flash
"""
import os
from google import genai
from google.genai import types

def generate():
    client = genai.Client()
    
    config = types.GenerateContentConfig(
        ${systemInstruction ? `system_instruction="""${systemInstruction}""",\n        ` : ""}temperature=${temperature.toFixed(2)},
        top_p=${topP.toFixed(2)}
    )
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="""${prompt}""",
        config=config
    )
    
    print(response.text)
    return response.text

if __name__ == "__main__":
    generate()`;

    case "typescript":
      return `/**
 * Google GenAI SDK - TypeScript / Node.js
 * Model: gemini-2.5-flash
 */
import { GoogleGenAI } from "@google/genai";

async function main() {
  const ai = new GoogleGenAI({});
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: ${JSON.stringify(prompt)},
    config: {
      ${systemInstruction ? `systemInstruction: ${JSON.stringify(systemInstruction)},\n      ` : ""}temperature: ${temperature},
      topP: ${topP},
    }
  });

  console.log(response.text);
  return response.text;
}

main().catch(console.error);`;

    case "curl":
      return `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${GEMINI_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    ${systemInstruction ? `"system_instruction": {"parts": [{"text": ${JSON.stringify(systemInstruction)}}]},\n    ` : ""}"contents": [
      {
        "parts": [
          {"text": ${JSON.stringify(prompt)}}
        ]
      }
    ],
    "generationConfig": {
      "temperature": ${temperature},
      "topP": ${topP}
    }
  }'`;

    case "json":
      return JSON.stringify(
        {
          model: "gemini-2.5-flash",
          systemInstruction: systemInstruction || undefined,
          prompt: prompt,
          parameters: {
            temperature: temperature,
            topP: topP
          },
          timestamp: new Date().toISOString()
        },
        null,
        2
      );

    case "prompt":
    default:
      if (systemInstruction) {
        return `## SYSTEM INSTRUCTION:\n${systemInstruction}\n\n## PROMPT:\n${prompt}`;
      }
      return prompt;
  }
};

export const SaveCodeSnippetModal: React.FC<SaveCodeSnippetModalProps> = ({
  isOpen,
  onClose,
  prompt,
  systemInstruction = "",
  temperature = 0.7,
  topP = 0.95
}) => {
  const { saveCodeSnippet, setActiveTab, t } = useApp();

  const [language, setLanguage] = useState<"python" | "typescript" | "curl" | "json" | "prompt">("python");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("gemini-2.5-flash");
  const [customCode, setCustomCode] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate title suggestion on open
  useEffect(() => {
    if (isOpen) {
      setSavedSuccess(false);
      setIsCustomMode(false);
      if (!title) {
        const firstLine = prompt.split("\n")[0].replace(/^[#\-* ]+/, "").trim();
        const autoTitle = firstLine ? firstLine.slice(0, 45) + (firstLine.length > 45 ? "..." : "") : "Gemini Prompt Snippet";
        setTitle(autoTitle);
      }
    }
  }, [isOpen, prompt]);

  const generatedCode = isCustomMode ? customCode : generateSdkCode(language, prompt, systemInstruction, temperature, topP);

  const handleLanguageChange = (lang: "python" | "typescript" | "curl" | "json" | "prompt") => {
    setLanguage(lang);
    if (isCustomMode) {
      setCustomCode(generateSdkCode(lang, prompt, systemInstruction, temperature, topP));
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    saveCodeSnippet({
      title: title.trim(),
      language: language,
      code: generatedCode,
      systemInstruction: systemInstruction || undefined,
      temperature: temperature,
      topP: topP,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : [language, "prompt-lab"]
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
      setSavedSuccess(false);
    }, 1200);
  };

  const handleSaveAndViewProfile = () => {
    handleSave();
    setTimeout(() => {
      setActiveTab("profile");
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl rounded-2xl border border-blue-900/60 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Save Code Snippet to Account
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium">
                    +20 XP
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Save this executable code & prompt to your profile library for later retrieval.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Snippet Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Snippet Title *</span>
                <span className="text-slate-500 font-normal">Identifies your snippet in the profile library</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Production SQL Optimizer (Gemini Flash SDK)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {/* Target Language / Format Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Code Format / Target SDK
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "python", label: "Python (GenAI)", icon: "🐍" },
                  { id: "typescript", label: "TypeScript", icon: "🔷" },
                  { id: "curl", label: "cURL / REST", icon: "🌐" },
                  { id: "prompt", label: "Prompt Only", icon: "📝" },
                  { id: "json", label: "JSON Schema", icon: "📦" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLanguageChange(item.id as any)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 px-2.5 font-medium transition-all text-center ${
                      language === item.id
                        ? "border-blue-500 bg-blue-600/20 text-white font-semibold shadow-sm"
                        : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Preview & Edit */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-blue-400" />
                  <span>Code Preview ({language.toUpperCase()})</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isCustomMode) {
                        setCustomCode(generatedCode);
                        setIsCustomMode(true);
                      } else {
                        setIsCustomMode(false);
                      }
                    }}
                    className="text-slate-400 hover:text-blue-400 font-mono text-[11px] underline"
                  >
                    {isCustomMode ? "Reset to Auto-Generated SDK" : "Customize Code"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {isCustomMode ? (
                <textarea
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              ) : (
                <pre className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 overflow-x-auto max-h-48 leading-relaxed whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              )}
            </div>

            {/* Tags & Documentation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-slate-400" />
                  <span>Tags (comma separated)</span>
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="gemini-flash, few-shot, extraction"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <AlignLeft className="h-3 w-3 text-slate-400" />
                  <span>Notes / Description (optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions for production rollout..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/90 px-5 py-3.5">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <Settings2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Temp: {temperature.toFixed(2)} · TopP: {topP.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || savedSuccess}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-md ${
                  savedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50"
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved to Account!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    <span>Save Snippet</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSaveAndViewProfile}
                disabled={!title.trim() || savedSuccess}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 px-3.5 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 hover:text-white transition-colors"
                title="Save and view in User Profile"
              >
                <span>Save & View in Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
