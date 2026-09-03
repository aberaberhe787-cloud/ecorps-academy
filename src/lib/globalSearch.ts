import { curriculumModules } from '../data/lessonsData';
import { amharicCurriculumModules } from '../i18n/amharicLessons';
import { promptPatterns } from '../data/patternsData';
import { glossaryTerms, promptOfTheDayList, externalLearningResources } from '../data/resourcesData';
import { missions } from '../data/missionsData';
import { FOUNDATION_LESSONS } from '../views/PromptEngineeringPath';
import { NavTab } from '../types';

export type SearchItemType = 'lesson' | 'foundation' | 'pattern' | 'resource' | 'mission';

export interface GlobalSearchItem {
  id: string;
  title: string;
  subtitle?: string;
  type: SearchItemType;
  tab: NavTab;
  category: string;
  tags?: string[];
  lessonId?: string;
  patternId?: string;
  missionId?: string;
  resourceTerm?: string;
  externalUrl?: string;
  difficulty?: string;
  content: string; // Used for search indexing
}

/**
 * Builds a single unified index of all academy content:
 * - Lessons (Curriculum)
 * - Foundations
 * - Patterns
 * - Resources & Glossary
 * - Interactive Missions
 */
export function buildGlobalSearchIndex(language: 'en' | 'am' = 'en'): GlobalSearchItem[] {
  const items: GlobalSearchItem[] = [];
  const seenIds = new Set<string>();

  // 1. Foundations Lessons
  FOUNDATION_LESSONS.forEach((lesson) => {
    const id = `foundation-${lesson.id}`;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      items.push({
        id,
        title: lesson.title,
        subtitle: lesson.summary,
        type: 'foundation',
        tab: 'foundations',
        category: 'Foundations Path',
        lessonId: lesson.id,
        content: `${lesson.title} ${lesson.summary} ${lesson.example} ${lesson.refined}`.toLowerCase(),
      });
    }
  });

  // 2. Curriculum Modules & Lessons
  const activeCurriculum = language === 'am' ? amharicCurriculumModules : curriculumModules;
  activeCurriculum.forEach((mod) => {
    // Module overview item
    const modId = `mod-${mod.id}`;
    if (!seenIds.has(modId)) {
      seenIds.add(modId);
      items.push({
        id: modId,
        title: mod.title,
        subtitle: mod.description,
        type: 'lesson',
        tab: 'curriculum',
        category: `Module · ${mod.level || 'Curriculum'}`,
        lessonId: mod.lessons[0]?.id,
        content: `${mod.title} ${mod.description} ${mod.academicTrack || ''}`.toLowerCase(),
      });
    }

    // Individual lessons
    mod.lessons.forEach((lesson) => {
      const lessonId = `lesson-${lesson.id}`;
      if (!seenIds.has(lessonId)) {
        seenIds.add(lessonId);
        const conceptsText = lesson.concepts ? lesson.concepts.map((c) => `${c.title} ${c.content} ${c.keyTakeaway}`).join(' ') : '';
        items.push({
          id: lessonId,
          title: lesson.title,
          subtitle: lesson.subtitle || lesson.conceptSummary,
          type: 'lesson',
          tab: 'curriculum',
          category: mod.title,
          lessonId: lesson.id,
          content: `${lesson.title} ${lesson.subtitle || ''} ${lesson.conceptSummary || ''} ${conceptsText}`.toLowerCase(),
        });
      }
    });
  });

  // 3. Prompt Patterns
  promptPatterns.forEach((pat) => {
    const patId = `pattern-${pat.id}`;
    if (!seenIds.has(patId)) {
      seenIds.add(patId);
      items.push({
        id: patId,
        title: pat.title,
        subtitle: pat.description,
        type: 'pattern',
        tab: 'patterns',
        category: `Pattern · ${pat.category}`,
        tags: pat.tags,
        patternId: pat.id,
        content: `${pat.title} ${pat.description} ${pat.category} ${(pat.tags || []).join(' ')} ${(pat.whyItWorks || []).join(' ')}`.toLowerCase(),
      });
    }
  });

  // 4. Resources & Glossary Terms
  glossaryTerms.forEach((term, index) => {
    const termId = `term-${index}-${term.term.toLowerCase().replace(/\s+/g, '-')}`;
    if (!seenIds.has(termId)) {
      seenIds.add(termId);
      items.push({
        id: termId,
        title: term.term,
        subtitle: term.definition,
        type: 'resource',
        tab: 'resources',
        category: `Glossary · ${term.category}`,
        resourceTerm: term.term,
        content: `${term.term} ${term.category} ${term.definition} ${term.example} ${term.proTip}`.toLowerCase(),
      });
    }
  });

  // Prompt of the Day
  promptOfTheDayList.forEach((potd, index) => {
    const potdId = `potd-${index}-${potd.date}`;
    if (!seenIds.has(potdId)) {
      seenIds.add(potdId);
      items.push({
        id: potdId,
        title: `Prompt of the Day: ${potd.title}`,
        subtitle: potd.whyItWorks,
        type: 'resource',
        tab: 'resources',
        category: `Resource · ${potd.category}`,
        tags: potd.tags,
        resourceTerm: potd.title,
        content: `${potd.title} ${potd.category} ${potd.prompt} ${potd.whyItWorks} ${potd.tags.join(' ')}`.toLowerCase(),
      });
    }
  });

  // External learning guides
  externalLearningResources.forEach((ext, index) => {
    const extId = `ext-${index}`;
    if (!seenIds.has(extId)) {
      seenIds.add(extId);
      items.push({
        id: extId,
        title: ext.title,
        subtitle: ext.description,
        type: 'resource',
        tab: 'resources',
        category: `Reference · ${ext.type}`,
        externalUrl: ext.url,
        content: `${ext.title} ${ext.description} ${ext.type}`.toLowerCase(),
      });
    }
  });

  // 5. Interactive Missions & Challenges
  missions.forEach((mission) => {
    const mId = `mission-${mission.id}`;
    if (!seenIds.has(mId)) {
      seenIds.add(mId);
      items.push({
        id: mId,
        title: mission.title,
        subtitle: mission.description,
        type: 'mission',
        tab: 'playground',
        category: `Mission · ${mission.difficulty}`,
        missionId: mission.id,
        difficulty: mission.difficulty,
        content: `${mission.title} ${mission.difficulty} ${mission.category} ${mission.description} ${mission.objective}`.toLowerCase(),
      });
    }
  });

  return items;
}

/**
 * Searches items with score ranking
 */
export function queryGlobalSearch(
  items: GlobalSearchItem[],
  query: string,
  filterType: 'all' | SearchItemType = 'all',
  limit = 8
): GlobalSearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const terms = q.split(/\s+/).filter(Boolean);

  const scored = items
    .filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      // All search terms must appear in content or title
      return terms.every((term) => item.content.includes(term));
    })
    .map((item) => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const catLower = item.category.toLowerCase();

      // Exact title match gets huge boost
      if (titleLower === q) score += 100;
      else if (titleLower.startsWith(q)) score += 60;
      else if (titleLower.includes(q)) score += 40;

      // Category matches
      if (catLower.includes(q)) score += 20;

      // Tags matches
      if (item.tags?.some((t) => t.toLowerCase().includes(q))) score += 25;

      // Subtitle matches
      if (item.subtitle && item.subtitle.toLowerCase().includes(q)) score += 15;

      // Earlier matches in title
      const titleIndex = titleLower.indexOf(q);
      if (titleIndex >= 0) {
        score += Math.max(0, 20 - titleIndex);
      }

      return { item, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}

/**
 * Curated suggestions when search query is empty
 */
export const POPULAR_QUICK_SEARCHES = [
  { label: 'Chain-of-Thought', query: 'Chain-of-Thought', type: 'resource' as const },
  { label: 'Few-Shot Prompting', query: 'Few-Shot', type: 'pattern' as const },
  { label: 'XML Delimiters', query: 'Delimiters', type: 'lesson' as const },
  { label: 'ReAct Agent', query: 'ReAct', type: 'resource' as const },
  { label: 'JSON Schema Extraction', query: 'JSON', type: 'mission' as const },
  { label: 'System Prompts', query: 'System Instruction', type: 'resource' as const },
];
