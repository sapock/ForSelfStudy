import { useMemo } from 'react';
import type { Subject, Totals, DueChapter } from '../types';

const REVIEW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useTotals(subjects: Subject[]): Totals {
  return useMemo(() => {
    let chapters = 0, quizzed = 0, dueForReview = 0;
    const NOW = Date.now();
    for (const s of subjects) {
      for (const c of s.chapters) {
        chapters++;
        if (c.lastQuizAt) {
          quizzed++;
          if (NOW - c.lastQuizAt >= REVIEW_MS) dueForReview++;
        } else {
          dueForReview++;
        }
      }
    }
    return { chapters, quizzed, dueForReview };
  }, [subjects]);
}

export function useDueChapters(subjects: Subject[], limit = 10): DueChapter[] {
  return useMemo(() => {
    const NOW = Date.now();
    const result: DueChapter[] = [];
    for (const s of subjects) {
      for (const c of s.chapters) {
        const due = !c.lastQuizAt || (NOW - c.lastQuizAt >= REVIEW_MS);
        if (due) result.push({ chapter: c, subject: s });
      }
    }
    return result.slice(0, limit);
  }, [subjects, limit]);
}

export function mutateSubject(
  subjects: Subject[],
  subjectId: string,
  mutator: (draft: Subject) => void
): Subject[] {
  return subjects.map(s => {
    if (s.id !== subjectId) return s;
    const draft = JSON.parse(JSON.stringify(s)) as Subject;
    mutator(draft);
    return draft;
  });
}
