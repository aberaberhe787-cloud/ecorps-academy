import React, { useState, useEffect } from "react";
import {
  Star,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Award,
  BookOpen
} from "lucide-react";
import { Lesson, LessonFeedback } from "../../types";
import { useApp } from "../../context/AppContext";
import confetti from "canvas-confetti";

interface LessonFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  onFeedbackSubmitted?: (feedback: LessonFeedback) => void;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: "Needs Improvement", desc: "Content was confusing or hard to follow" },
  2: { label: "Fair", desc: "Basic points covered, but needs clearer depth" },
  3: { label: "Good", desc: "Solid conceptual explanation and exercises" },
  4: { label: "Very Good", desc: "Clear, practical, and highly engaging" },
  5: { label: "Exceptional", desc: "Outstanding enterprise-grade mastery material" },
};

const SUGGESTED_TAGS = [
  "Clear Concepts",
  "Great Sandbox Lab",
  "Challenging Quizzes",
  "Actionable Prompt Patterns",
  "Needs More Code Examples",
  "Pacing Was Perfect",
  "Helpful Visuals",
];

export const LessonFeedbackModal: React.FC<LessonFeedbackModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onFeedbackSubmitted,
}) => {
  const { userProgress, submitLessonFeedback } = useApp();

  const existingFeedback = userProgress.lessonFeedbacks?.[lesson.id];

  const [rating, setRating] = useState<number>(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [clarityRating, setClarityRating] = useState<number>(existingFeedback?.clarityRating || 5);
  const [practicalityRating, setPracticalityRating] = useState<number>(existingFeedback?.practicalityRating || 5);
  const [pacing, setPacing] = useState<"too-slow" | "just-right" | "too-fast">(existingFeedback?.pacing || "just-right");
  const [selectedTags, setSelectedTags] = useState<string[]>(existingFeedback?.tags || ["Clear Concepts", "Actionable Prompt Patterns"]);
  const [comment, setComment] = useState<string>(existingFeedback?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync state if lesson changes
  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating);
      setClarityRating(existingFeedback.clarityRating || 5);
      setPracticalityRating(existingFeedback.practicalityRating || 5);
      setPacing(existingFeedback.pacing || "just-right");
      setSelectedTags(existingFeedback.tags || []);
      setComment(existingFeedback.comment || "");
    } else {
      setRating(5);
      setClarityRating(5);
      setPracticalityRating(5);
      setPacing("just-right");
      setSelectedTags(["Clear Concepts", "Actionable Prompt Patterns"]);
      setComment("");
    }
    setIsSuccess(false);
    setIsSubmitting(false);
  }, [lesson.id, existingFeedback, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = RATING_DESCRIPTIONS[currentDisplayRating] || RATING_DESCRIPTIONS[5];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackObj: LessonFeedback = {
      id: "fb-" + lesson.id + "-" + Date.now(),
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      rating,
      clarityRating,
      practicalityRating,
      pacing,
      comment: comment.trim(),
      tags: selectedTags,
      submittedAt: Date.now(),
    };

    if (submitLessonFeedback) {
      submitLessonFeedback(feedbackObj);
    }

    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(feedbackObj);
    }

    try {
      const storedMap = JSON.parse(localStorage.getItem("ecorp_lesson_feedback") || "{}");
      storedMap[lesson.id] = feedbackObj;
      localStorage.setItem("ecorp_lesson_feedback", JSON.stringify(storedMap));
    } catch {}

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });

    setIsSubmitting(false);
    setIsSuccess(true);

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 id="feedback-modal-title" className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Send Lesson Feedback
                <span className="text-xs font-mono font-normal text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award className="h-3 w-3" /> +20 XP
                </span>
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {lesson.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Thank You for Your Feedback!</h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your qualitative ratings and comments help us continuously refine and optimize our prompt engineering curriculum.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
                  <Sparkles className="h-3.5 w-3.5" /> +20 XP awarded to your profile
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Primary 1-5 Star Overall Rating */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-center space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  Overall Lesson Quality
                </label>
                
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= (hoverRating !== null ? hoverRating : rating);
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none"
                        title={`${starVal} Star${starVal > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]"
                              : "text-slate-600 hover:text-slate-400"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="h-8 flex flex-col justify-center">
                  <div className="text-xs font-bold text-amber-400">
                    {ratingInfo.label} ({currentDisplayRating}/5)
                  </div>
                  <div className="text-xs text-slate-400">
                    {ratingInfo.desc}
                  </div>
                </div>
              </div>

              {/* Granular Dimension Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Clarity */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-blue-400" /> Content Clarity
                    </span>
                    <span className="font-mono text-blue-400 font-bold">{clarityRating}/5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setClarityRating(val)}
                        className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all border ${
                          val <= clarityRating
                            ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                            : "bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Practicality */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" /> Practical Value
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{practicalityRating}/5</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPracticalityRating(val)}
                        className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all border ${
                          val <= practicalityRating
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                            : "bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lesson Pacing */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  How was the pacing and depth?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "too-slow", label: "Too Slow / Basic" },
                    { id: "just-right", label: "Just Right" },
                    { id: "too-fast", label: "Too Advanced" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPacing(item.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        pacing === item.id
                          ? "bg-blue-600 text-white border-blue-500 shadow"
                          : "bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights & Quick Tags */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Highlights & Takeaways (Click to select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full px-2.5 py-1 text-xs transition-all border ${
                          isSelected
                            ? "bg-blue-950/90 text-blue-300 border-blue-500/80 font-medium"
                            : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Comments */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="feedback-comment" className="text-xs font-semibold text-slate-300">
                    Qualitative Comments & Suggestions
                  </label>
                  <span className="text-xs text-slate-500 font-mono">{comment.length}/500</span>
                </div>
                <textarea
                  id="feedback-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  rows={3}
                  placeholder="What was most helpful? What prompt techniques did you find easiest or hardest to apply?"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Skip for Now
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? "Submitting..." : "Submit Feedback"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
