import { Lesson, CurriculumModule } from "../types";

export const generateLessonJsonLd = (lesson: Lesson, module: CurriculumModule) => {
  return {
    "@context": "https://schema.org",
    "@type": "Lesson",
    "name": lesson.title,
    "description": lesson.conceptSummary || `A lesson on ${lesson.title} in the ${module.title} course.`,
    "isPartOf": {
      "@type": "Course",
      "name": module.title,
      "provider": {
        "@type": "Organization",
        "name": "ECORP Academy"
      }
    }
  };
};

export const generateCourseJsonLd = (module: CurriculumModule) => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": module.title,
    "description": module.description || `Course module: ${module.title}`,
    "provider": {
      "@type": "Organization",
      "name": "ECORP Academy"
    }
  };
};
