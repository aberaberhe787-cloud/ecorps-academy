import { jsPDF } from "jspdf";
import { Lesson } from "../types";

/**
 * Generates a clean, print-friendly offline study guide PDF for any Curriculum Lesson.
 */
export function exportLessonToPdf(lesson: Lesson): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
      renderHeaderSmall();
    }
  };

  const renderHeaderSmall = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`ECORP ACADEMY • OFFLINE STUDY GUIDE • ${lesson.moduleTitle}`, margin, y);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 8;
  };

  // 1. Cover Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(96, 165, 250); // blue-400
  doc.text("ECORP ACADEMY OF ADVANCED PROMPT ENGINEERING", margin + 6, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Module: ${lesson.moduleTitle}  |  Difficulty: ${lesson.difficulty}  |  Bloom Level: ${lesson.bloomTaxonomyFocus || "Application"}  |  Est: ${lesson.estimatedMinutes} mins`,
    margin + 6,
    y + 14
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(lesson.title, margin + 6, y + 23);

  y += 34;

  // 2. Subtitle
  if (lesson.subtitle) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const subLines = doc.splitTextToSize(lesson.subtitle, contentWidth);
    doc.text(subLines, margin, y);
    y += subLines.length * 5 + 3;
  }

  // 3. Primary Learning Objective Box
  checkPageBreak(25);
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);

  const objectiveText = lesson.objective || lesson.conceptSummary;
  const objectiveLines = doc.splitTextToSize(objectiveText, contentWidth - 8);
  const boxHeight = 12 + objectiveLines.length * 4.5;
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text("PRIMARY LEARNING OBJECTIVE", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(objectiveLines, margin + 4, y + 11);

  y += boxHeight + 6;

  // 4. Theoretical Foundations & Concept Summary
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Theoretical Foundation", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(lesson.conceptSummary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 4.5 + 4;

  // Deep dive points
  if (lesson.deepDive && lesson.deepDive.length > 0) {
    lesson.deepDive.forEach((point) => {
      checkPageBreak(12);
      const bulletLines = doc.splitTextToSize(`• ${point}`, contentWidth - 4);
      doc.text(bulletLines, margin + 2, y);
      y += bulletLines.length * 4.2 + 2;
    });
    y += 3;
  }

  // 5. Microlearning Concepts
  if (lesson.concepts && lesson.concepts.length > 0) {
    checkPageBreak(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Key Architectural Concepts", margin, y);
    y += 6;

    lesson.concepts.forEach((concept, index) => {
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(14, 116, 144); // cyan-700
      doc.text(`${index + 1}. ${concept.title}`, margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const expLines = doc.splitTextToSize(concept.content || "", contentWidth);
      doc.text(expLines, margin, y);
      y += expLines.length * 4 + 2;

      if (concept.keyTakeaway) {
        checkPageBreak(12);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const takeawayLines = doc.splitTextToSize(`Takeaway: ${concept.keyTakeaway}`, contentWidth);
        doc.text(takeawayLines, margin, y);
        y += takeawayLines.length * 3.8 + 2;
      }

      if (concept.codeSnippet?.code) {
        checkPageBreak(20);
        const codeLines = doc.splitTextToSize(concept.codeSnippet.code, contentWidth - 8);
        const codeBoxHeight = codeLines.length * 3.8 + 6;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, y, contentWidth, codeBoxHeight, "FD");

        doc.setFont("courier", "normal");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(codeLines, margin + 4, y + 4.5);
        y += codeBoxHeight + 4;
      }
    });
  }

  // 6. Good vs Bad Pattern Comparison
  if (lesson.badPrompt || lesson.goodPrompt) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Prompt Architectural Comparison", margin, y);
    y += 6;

    // Bad prompt
    if (lesson.badPrompt) {
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(185, 28, 28); // red-700
      doc.text("❌ Anti-Pattern (Vulnerable / Ambiguous):", margin, y);
      y += 4.5;

      const badLines = doc.splitTextToSize(lesson.badPrompt.prompt, contentWidth - 6);
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(69, 10, 10);
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      const badBoxHeight = badLines.length * 3.8 + 6;
      doc.rect(margin, y, contentWidth, badBoxHeight, "FD");
      doc.text(badLines, margin + 3, y + 4.5);
      y += badBoxHeight + 3;

      if (lesson.badPrompt.explanation) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(127, 29, 29);
        const whyLines = doc.splitTextToSize(`Why it fails: ${lesson.badPrompt.explanation}`, contentWidth);
        doc.text(whyLines, margin, y);
        y += whyLines.length * 3.8 + 4;
      }
    }

    // Good prompt
    if (lesson.goodPrompt) {
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(21, 128, 61); // green-700
      doc.text("✓ Recommended Pattern (Enterprise Robust):", margin, y);
      y += 4.5;

      const goodLines = doc.splitTextToSize(lesson.goodPrompt.prompt, contentWidth - 6);
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(20, 83, 45);
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      const goodBoxHeight = goodLines.length * 3.8 + 6;
      doc.rect(margin, y, contentWidth, goodBoxHeight, "FD");
      doc.text(goodLines, margin + 3, y + 4.5);
      y += goodBoxHeight + 3;

      if (lesson.goodPrompt.explanation) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        const whyGoodLines = doc.splitTextToSize(`Why it succeeds: ${lesson.goodPrompt.explanation}`, contentWidth);
        doc.text(whyGoodLines, margin, y);
        y += whyGoodLines.length * 3.8 + 4;
      }
    }
  }

  // 7. Key Governance Rules
  if (lesson.keyRules && lesson.keyRules.length > 0) {
    checkPageBreak(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("4. Governance & Production Rules", margin, y);
    y += 5;

    lesson.keyRules.forEach((rule) => {
      checkPageBreak(10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const ruleLines = doc.splitTextToSize(`[RULE] ${rule}`, contentWidth - 4);
      doc.text(ruleLines, margin + 2, y);
      y += ruleLines.length * 4 + 2;
    });
    y += 4;
  }

  // 8. Self-Assessment Questions (Checkpoints)
  if (lesson.checkpoints && lesson.checkpoints.length > 0) {
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("5. Self-Assessment Study Questions", margin, y);
    y += 6;

    lesson.checkpoints.forEach((quiz, i) => {
      checkPageBreak(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      const qLines = doc.splitTextToSize(`Q${i + 1}: ${quiz.question}`, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 4 + 2;

      if (quiz.options) {
        quiz.options.forEach((opt) => {
          checkPageBreak(8);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          const optLines = doc.splitTextToSize(`• ${opt.text}`, contentWidth - 6);
          doc.text(optLines, margin + 4, y);
          y += optLines.length * 3.8 + 1;
        });
      }
      y += 3;
    });
  }

  // 9. Add Page Numbers in Footer for all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Ecorp Academy © 2026 • Offline Study Guide: ${lesson.title} • Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 10
    );
  }

  // Save the PDF
  const sanitizedTitle = lesson.title.replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`Ecorp_Lesson_${lesson.id}_${sanitizedTitle}.pdf`);
}
