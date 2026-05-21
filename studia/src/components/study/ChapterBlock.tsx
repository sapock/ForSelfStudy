import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { StarToggle } from '../ui/StarToggle';
import type { Chapter } from '../../types';

interface ChapterBlockProps {
  chapter: Chapter;
  onToggleStar: (itemId: string) => void;
  onCycleMastered: (itemId: string) => void;
  onQuiz: () => void;
}

export function ChapterBlock({ chapter, onToggleStar, onCycleMastered, onQuiz }: ChapterBlockProps) {
  const [open, setOpen] = useState(true);
  const total = chapter.items.length;
  const done = chapter.items.filter(i => i.mastered === 2).length;

  return (
    <div className="ch-block">
      <div className="ch-head" onClick={() => setOpen(o => !o)}>
        <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
          <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} />
          <div className="ch-name">{chapter.name}</div>
          <Badge tone="neutral">{done}/{total}</Badge>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div style={{ width: 120 }}>
            <ProgressBar value={done} total={total} tone="primary" showLabel={false} height={6} />
          </div>
          <button className="btn sm outline" onClick={e => { e.stopPropagation(); onQuiz(); }}>
            <Icon name="zap" size={12} />챕터 퀴즈
          </button>
        </div>
      </div>
      {open && (
        <div className="ch-items">
          {chapter.items.map(item => (
            <div key={item.id} className="item-row">
              <StarToggle on={item.starred} onClick={() => onToggleStar(item.id)} />
              <button
                className={`item-state s${item.mastered}`}
                onClick={() => onCycleMastered(item.id)}
                title={['미학습', '학습중', '완료'][item.mastered]}
              >
                {item.mastered === 2 && <Icon name="check" size={12} />}
                {item.mastered === 1 && <span className="dot-half" />}
              </button>
              <div className="item-main">
                <div className="item-term">{item.term}</div>
                <div className="item-def">{item.def}</div>
              </div>
              <div className="item-stats">
                {item.correct > 0 && <span className="stat ok">정 {item.correct}</span>}
                {item.wrong > 0 && <span className="stat ng">오 {item.wrong}</span>}
              </div>
            </div>
          ))}
          <button className="add-item-row">
            <Icon name="plus" size={14} />이 챕터에 항목 추가
          </button>
        </div>
      )}
    </div>
  );
}
