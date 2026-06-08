export interface Chapter {
  id: string;
  name: string;
  description: string;          // Markdown 형식 학습 내용 (핵심 데이터)
  lastQuizAt?: number | null;
  lastQuizScore?: number | null; // 0~100
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
  chapters: number;
  quizzed: number;
  dueForReview: number;
}

export interface DueChapter {
  chapter: Chapter;
  subject: Subject;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];     // 4지선다 보기
  answerIndex: number;   // 0~3
  explanation?: string;
  chapterId: string;
  subjectId: string;
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  ms: number;
  subjectId: string;
  chapterId: string;
}

export type QuizPhase = 'idle' | 'setup' | 'generating' | 'running' | 'result';

export interface QuizState {
  phase: QuizPhase;
  config: { mode: 'multiple-choice'; count: number } | null;
  questions: QuizQuestion[];
  results: QuizResult[];
  presetSubjectId?: string;
  presetChapterId?: string;
}

export type AppSection = 'dashboard' | 'materials' | 'today' | 'starred' | 'quiz' | 'stats' | 'settings' | 'trash';

export interface Tweaks {
  density: 'comfortable' | 'dense';
  view: 'grid' | 'list';
}
