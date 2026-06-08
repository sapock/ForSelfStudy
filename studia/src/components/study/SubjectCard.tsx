import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import type { Subject } from '../../types';

const ACCENT_TONE: Record<string, 'primary' | 'info' | 'warning' | 'success'> = {
  purple: 'primary', blue: 'info', yellow: 'warning', green: 'success',
};

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
  onStartQuiz: () => void;
}

export function SubjectCard({ subject, onClick, onStartQuiz }: SubjectCardProps) {
  const total = subject.chapters.length;
  const quizzed = subject.chapters.filter(c => c.lastQuizAt != null).length;
  const scoredChapters = subject.chapters.filter(c => c.lastQuizScore != null);
  const avgScore = scoredChapters.length > 0
    ? Math.round(scoredChapters.reduce((s, c) => s + (c.lastQuizScore ?? 0), 0) / scoredChapters.length)
    : null;
  const tone = ACCENT_TONE[subject.accent] ?? 'primary';

  return (
    <div className="subj-card" onClick={onClick}>
      <div className="subj-card-head">
        <div className="subj-emoji" style={{ background: `var(--${subject.accent}-50)`, color: `var(--${subject.accent}-700)` }}>
          {subject.emoji}
        </div>
        <div className="subj-meta">
          <div className="subj-cat">{subject.category}</div>
          <div className="subj-name">{subject.name}</div>
        </div>
        <Badge tone={tone}>{total}챕터</Badge>
      </div>
      <div className="subj-desc">{subject.description}</div>
      <ProgressBar value={quizzed} total={total} tone={subject.accent} />
      <div className="subj-foot">
        <div className="row" style={{ gap: 14 }}>
          {avgScore !== null && (
            <span className="muted" style={{ fontSize: 12 }}>
              <Icon name="target" size={12} style={{ verticalAlign: '-2px', marginRight: 3, color: `var(--${subject.accent}-600)` }} />
              평균 {avgScore}점
            </span>
          )}
          <span className="muted" style={{ fontSize: 12 }}>
            <Icon name="list-checks" size={12} style={{ verticalAlign: '-2px', marginRight: 3 }} />
            {quizzed}/{total} 퀴즈 완료
          </span>
        </div>
        <button className="btn sm ghost" onClick={e => { e.stopPropagation(); onStartQuiz(); }}>
          <Icon name="play" size={12} />퀴즈
        </button>
      </div>
    </div>
  );
}
