import React from "react";

export interface PrintableLessonFooterProps {
  /** Optional module or document title to include in the footer */
  moduleTitle?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * PrintableLessonFooter
 *
 * A specialized React component that renders ONLY during browser print media execution (`@media print`).
 * Features:
 * - Fixed footer positioning at the bottom of printed pages
 * - Document branding metadata
 * - CSS-driven auto-generated page numbers ('Page X of Y')
 */
export const PrintableLessonFooter: React.FC<PrintableLessonFooterProps> = ({
  moduleTitle,
  className = "",
}) => {
  return (
    <div
      className={`printable-footer hidden print:flex fixed bottom-0 left-0 right-0 justify-between items-center text-[8.5pt] font-mono text-slate-600 border-t border-slate-300 pt-2 pb-1 bg-white z-50 ${className}`}
      data-testid="printable-lesson-footer"
    >
      <span className="truncate">
        ECORP Academy • Official Study Guide{moduleTitle ? ` • ${moduleTitle}` : ""}
      </span>
      <span className="printable-footer-page-number font-semibold whitespace-nowrap ml-4"></span>
    </div>
  );
};

export default PrintableLessonFooter;
