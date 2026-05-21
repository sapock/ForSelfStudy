import { useMemo } from 'react';
import type { Subject, Totals, ReviewEntry } from '../types';

export function useTotals(subjects: Subject[]): Totals {
  return useMemo(() => {
    let items = 0, mastered = 0, learning = 0, starred = 0, totalCorrect = 0, totalWrong = 0;
    for (const s of subjects) {
      for (const c of s.chapters) {
        for (const i of c.items) {
          items++;
          if (i.mastered === 2) mastered++;
          if (i.mastered === 1) learning++;
          if (i.starred) starred++;
          totalCorrect += i.correct;
          totalWrong   += i.wrong;
        }
      }
    }
    return { items, mastered, learning, starred, totalCorrect, totalWrong, totalAttempts: totalCorrect + totalWrong };
  }, [subjects]);
}

export function useTodayReview(subjects: Subject[], limit = 10): ReviewEntry[] {
  return useMemo(() => {
    const list: ReviewEntry[] = [];
    const NOW = Date.now();
    for (const s of subjects) {
      for (const c of s.chapters) {
        for (const i of c.items) {
          if (i.mastered !== 2 && (i.nextReviewAt == null || i.nextReviewAt <= NOW)) {
            list.push({ item: i, chapter: c, subject: s });
          }
        }
      }
    }
    return list.slice(0, limit);
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
