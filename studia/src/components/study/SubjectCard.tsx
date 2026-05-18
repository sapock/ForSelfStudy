
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
  const total = subject.chapters.reduce((s, c) => s + c.items.length, 0);
  const done = subject.chapters.reduce((s, c) => s + c.items.filter(i => i.mastered === 2).length, 0);
  const starred = subject.chapters.reduce((s, c) => s + c.items.filter(i => i.starred).length, 0);
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
        <Badge tone={tone}>{subject.chapters.length}챕터</Badge>
      </div>
      <div className="subj-desc">{subject.description}</div>
      <ProgressBar value={done} total={total} tone={subject.accent} />
      <div className="subj-foot">
        <div className="row" style={{ gap: 14 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            <Icon name="star" size={12} style={{ verticalAlign: '-2px', marginRight: 3, color: 'var(--yellow-600)' }} />
            {starred}
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            <Icon name="list" size={12} style={{ verticalAlign: '-2px', marginRight: 3 }} />
            {total}개
          </span>
        </div>
        <button className="btn sm ghost" onClick={e => { e.stopPropagation(); onStartQuiz(); }}>
          <Icon name="play" size={12} />퀴즈
        </button>
      </div>
    </div>
  );
}
