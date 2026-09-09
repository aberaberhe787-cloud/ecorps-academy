import React, { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, Square, FastForward, RotateCcw, Sparkles } from "lucide-react";
import { Lesson } from "../../types";

interface LessonAudioPlayerProps {
  lesson: Lesson;
}

export const LessonAudioPlayer: React.FC<LessonAudioPlayerProps> = ({ lesson }) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1.0);
  const [currentSectionTitle, setCurrentSectionTitle] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const currentIdxRef = useRef<number>(0);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      const updateVoices = () => {
        if (!synthRef.current) return;
        const available = synthRef.current.getVoices();
        setVoices(available);
        if (available.length > 0 && !selectedVoiceURI) {
          // Prefer English voice by default
          const defaultEn = available.find(
            (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
          ) || available.find((v) => v.lang.startsWith("en")) || available[0];
          if (defaultEn) setSelectedVoiceURI(defaultEn.voiceURI);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      stopPlayback();
    };
  }, []);

  // Stop playback when lesson changes
  useEffect(() => {
    stopPlayback();
  }, [lesson.id]);

  // Stop playback
  const stopPlayback = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    utteranceQueueRef.current = [];
    currentIdxRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSectionTitle("");
  };

  // Compile narrative script sections from lesson
  const buildSpeechSections = (): { title: string; text: string }[] => {
    const sections: { title: string; text: string }[] = [];

    // Title & Objective
    sections.push({
      title: "Introduction & Objective",
      text: `Lesson: ${lesson.title}. ${lesson.subtitle || ""}. Primary objective: ${
        lesson.objective || lesson.conceptSummary
      }`,
    });

    // Foundations
    sections.push({
      title: "Theoretical Foundation",
      text: `Theoretical foundation: ${lesson.conceptSummary}. ${
        lesson.deepDive ? lesson.deepDive.join(". ") : ""
      }`,
    });

    // Microlearning Concepts
    if (lesson.concepts && lesson.concepts.length > 0) {
      lesson.concepts.forEach((concept, i) => {
        sections.push({
          title: `Concept ${i + 1}: ${concept.title}`,
          text: `Concept ${i + 1}: ${concept.title}. ${concept.content || ""}. Key takeaway: ${concept.keyTakeaway || ""}.`,
        });
      });
    }

    // Good vs Bad
    if (lesson.badPrompt && lesson.goodPrompt) {
      sections.push({
        title: "Architectural Comparison",
        text: `Consider the anti-pattern: ${lesson.badPrompt.explanation}. Compare with the recommended enterprise pattern: ${lesson.goodPrompt.explanation}.`,
      });
    }

    // Key Rules
    if (lesson.keyRules && lesson.keyRules.length > 0) {
      sections.push({
        title: "Key Governance Rules",
        text: `Key rules to remember: ${lesson.keyRules.join(". ")}.`,
      });
    }

    return sections;
  };

  // Start reading
  const startPlayback = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const sections = buildSpeechSections();
    if (sections.length === 0) return;

    const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI) || null;

    const utterances = sections.map((sec, idx) => {
      const u = new SpeechSynthesisUtterance(sec.text);
      u.rate = rate;
      if (chosenVoice) u.voice = chosenVoice;

      u.onstart = () => {
        currentIdxRef.current = idx;
        setCurrentSectionTitle(sec.title);
        setIsPlaying(true);
        setIsPaused(false);
      };

      u.onend = () => {
        if (idx === sections.length - 1) {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentSectionTitle("");
        }
      };

      u.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      return u;
    });

    utteranceQueueRef.current = utterances;
    currentIdxRef.current = 0;
    setIsPlaying(true);
    setIsPaused(false);

    // Speak all utterances sequentially
    utterances.forEach((u) => synthRef.current?.speak(u));
  };

  const handlePauseResume = () => {
    if (!synthRef.current) return;
    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else if (isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } else {
      startPlayback();
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.8, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(rate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setRate(nextSpeed);

    if (isPlaying || isPaused) {
      // Restart at current section with new speed
      stopPlayback();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="rounded-xl border border-blue-900/40 bg-slate-900/90 p-3 shadow-md backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
      {/* Playback Status & Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={isPlaying || isPaused ? handlePauseResume : startPlayback}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            isPlaying
              ? "bg-amber-600 text-white shadow-md shadow-amber-900/30 hover:bg-amber-500"
              : isPaused
              ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-500"
              : "bg-blue-600/90 text-white hover:bg-blue-500"
          }`}
          title={isPlaying ? "Pause audio narration" : "Listen to this lesson via Web Speech"}
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>Pause Audio</span>
            </>
          ) : isPaused ? (
            <>
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Resume Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5" />
              <span>Audio Playback</span>
            </>
          )}
        </button>

        {(isPlaying || isPaused) && (
          <button
            onClick={stopPlayback}
            className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
            title="Stop narration"
          >
            <Square className="h-3 w-3 fill-slate-300" />
            <span>Stop</span>
          </button>
        )}

        {/* Speed button */}
        <button
          onClick={cycleSpeed}
          className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-[11px] font-mono font-bold text-slate-300 hover:text-blue-400 hover:border-slate-700 transition-all"
          title="Change playback speed"
        >
          {rate}x
        </button>
      </div>

      {/* Currently Playing Section or Info */}
      <div className="flex items-center gap-2 text-xs">
        {isPlaying ? (
          <div className="flex items-center gap-2">
            {/* Animated sound wave bars */}
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-1 bg-blue-400 rounded-full animate-pulse h-2" />
              <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-3.5 delay-75" />
              <span className="w-1 bg-cyan-400 rounded-full animate-pulse h-2.5 delay-150" />
              <span className="w-1 bg-blue-500 rounded-full animate-pulse h-1.5 delay-100" />
            </div>
            <span className="font-mono text-[11px] text-blue-300 font-medium">
              Narrating: <strong className="text-white">{currentSectionTitle}</strong>
            </span>
          </div>
        ) : isPaused ? (
          <span className="font-mono text-[11px] text-amber-300">
            Narration paused at: {currentSectionTitle}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-blue-400" />
            Web Speech Audio Narration available
          </span>
        )}
      </div>
    </div>
  );
};
