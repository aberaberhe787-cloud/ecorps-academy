import React from "react";
import { GraduationCap, User, Calendar, BookOpen } from "lucide-react";

export interface PrintableLessonHeaderProps {
  /** Title of the lesson being printed */
  title: string;
  /** Optional author name. Defaults to "ECORP Academy Faculty" */
  author?: string;
  /** Optional date string. Defaults to today's date formatted (e.g. "September 19, 2026") */
  date?: string;
  /** Optional parent module or category title */
  moduleTitle?: string;
  /** Optional subtitle or tagline */
  subtitle?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * PrintableLessonHeader
 *
 * A specialized React component that renders ONLY when the browser triggers a `@media print` query
 * (e.g., via `window.print()` or Ctrl/Cmd + P).
 *
 * Displays:
 * - Institutional branding header (ECORP Academy Study Guide)
 * - Lesson Title and Subtitle
 * - Author metadata
 * - Date of print generation
 */
export const PrintableLessonHeader: React.FC<PrintableLessonHeaderProps> = ({
  title,
  author = "ECORP Academy Faculty",
  date,
  moduleTitle,
  subtitle,
  className = "",
}) => {
  const formattedDate =
    date ||
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div
      className={`printable-lesson-header hidden print:block border-b-2 border-slate-900 pb-4 mb-6 ${className}`}
      data-testid="printable-lesson-header"
    >
      {/* Top Branding Bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-slate-900" />
          <span className="font-mono text-xs font-black tracking-widest uppercase text-slate-900">
            ECORP ACADEMY • OFFICIAL STUDY GUIDE
          </span>
        </div>
        {moduleTitle && (
          <span className="font-mono text-xs text-slate-700 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-slate-700" />
            <span>Module: {moduleTitle}</span>
          </span>
        )}
      </div>

      {/* Main Title Header */}
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
        {title}
      </h1>

      {subtitle && (
        <p className="text-sm text-slate-600 mb-3 italic leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Metadata Bar: Author & Date */}
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-800 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-slate-800" />
          <span>
            Author: <strong className="font-bold text-slate-900">{author}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-800" />
          <span>
            Date: <strong className="font-bold text-slate-900">{formattedDate}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrintableLessonHeader;
