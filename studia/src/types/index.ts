export interface StudyItem {
  id: string;
  term: string;
  def: string;
  starred: boolean;
  mastered: 0 | 1 | 2; // 0=미학습 1=학습중 2=완료
  correct: number;
  wrong: number;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  note: string;
}

export interface Chapter {
  id: string;
  name: string;
  items: StudyItem[];
}

export type AccentColor = 'purple' | 'blue' | 'green' | 'yellow' | 'red';

export interface Subject {
  id: string;
  name: string;
  emoji: string;
  accent: AccentColor;
  category: string;
  description: string;
  color: string;
  chapters: Chapter[];
}

export interface StreakDay {
  d: string;
  count: number;
  ok: boolean;
}

export interface ActivityEntry {
  when: string;
  text: string;
}

export interface Totals {
  items: number;
  mastered: number;
  learning: number;
  starred: number;
  totalCorrect: number;
  totalWrong: number;
  totalAttempts: number;
}

export interface ReviewEntry {
  item: StudyItem;
  chapter: Chapter;
  subject: Subject;
}

export interface QuizResult {
  itemId: string;
  correct: boolean;
  ms: number;
  subjectId: string;
  grade?: 'wrong' | 'hard' | 'good';
}

export interface QuizPoolEntry {
  item: StudyItem;
  chapter: Chapter;
  subject: Subject;
}

export type QuizPhase = 'idle' | 'setup' | 'running' | 'result';

export interface QuizState {
  phase: QuizPhase;
  config: { mode: 'multiple-choice' | 'flashcard' } | null;
  results: QuizResult[];
  pool: QuizPoolEntry[];
  presetSubjectId?: string;
  presetChapterId?: string;
}

export type AppSection = 'dashboard' | 'materials' | 'today' | 'starred' | 'quiz' | 'stats' | 'settings' | 'trash';

export interface Tweaks {
  density: 'comfortable' | 'dense';
  view: 'grid' | 'list';
}
