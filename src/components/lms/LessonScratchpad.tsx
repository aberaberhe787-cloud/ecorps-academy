import React, { useEffect, useState, useRef } from "react";
import { Edit3, Save, Trash2, Download, Check, HardDrive, ChevronDown, ChevronUp } from "lucide-react";
import { getLessonNote, saveLessonNote, deleteLessonNote } from "../../lib/indexedDbNotes";

interface LessonScratchpadProps {
  lessonId: string;
  lessonTitle: string;
}

export const LessonScratchpad: React.FC<LessonScratchpadProps> = ({ lessonId, lessonTitle }) => {
  const [noteText, setNoteText] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing note from IndexedDB on lessonId change
  useEffect(() => {
    let isMounted = true;
    getLessonNote(lessonId).then((text) => {
      if (isMounted) {
        setNoteText(text);
        if (text) {
          setSaveStatus("saved");
        } else {
          setSaveStatus("idle");
        }
      }
    });

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [lessonId]);

  // Handle text change with debounced save to IndexedDB
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteText(val);
    setSaveStatus("saving");

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await saveLessonNote(lessonId, val);
        setSaveStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch (err) {
        console.error("Failed to save note to IndexedDB", err);
        setSaveStatus("idle");
      }
    }, 600);
  };

  const handleManualSave = async () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSaveStatus("saving");
    try {
      await saveLessonNote(lessonId, noteText);
      setSaveStatus("saved");
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Failed to save note to IndexedDB", err);
      setSaveStatus("idle");
    }
  };

  const handleClearNote = async () => {
    if (window.confirm("Are you sure you want to clear your local notes for this lesson?")) {
      await deleteLessonNote(lessonId);
      setNoteText("");
      setSaveStatus("idle");
      setLastSavedTime(null);
    }
  };

  const handleDownloadNote = () => {
    if (!noteText.trim()) return;
    const blob = new Blob([`# Study Notes: ${lessonTitle}\nDate: ${new Date().toISOString()}\n\n${noteText}`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ecorp_Notes_${lessonId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = noteText.trim() ? noteText.trim().split(/\s+/).length : 0;
  const charCount = noteText.length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Edit3 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Lesson Study Scratchpad
              </h3>
              <span className="flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-700">
                <HardDrive className="h-2.5 w-2.5" />
                IndexedDB Local
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Private notes stored offline in your browser's IndexedDB engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-[10px] text-amber-400 font-mono animate-pulse">
              Saving to IndexedDB...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Check className="h-3 w-3" />
              Saved locally {lastSavedTime ? `at ${lastSavedTime}` : ""}
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <span className="text-xs font-semibold">{isExpanded ? "Collapse" : "Open Scratchpad"}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Scratchpad Editor */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-slate-950/40">
          <textarea
            value={noteText}
            onChange={handleTextChange}
            placeholder="Write your personal observations, prompt experiments, prompt formulas, or edge case ideas for this lesson..."
            rows={5}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono leading-relaxed resize-y transition-all"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-3 font-mono">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSave}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                title="Save immediately to IndexedDB"
              >
                <Save className="h-3 w-3" />
                <span>Save</span>
              </button>

              <button
                onClick={handleDownloadNote}
                disabled={!noteText.trim()}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Download note as text file"
              >
                <Download className="h-3 w-3" />
                <span>Download .txt</span>
              </button>

              <button
                onClick={handleClearNote}
                disabled={!noteText.trim()}
                className="flex items-center gap-1 rounded-lg border border-rose-900/40 bg-rose-950/30 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Delete note for this lesson from IndexedDB"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
