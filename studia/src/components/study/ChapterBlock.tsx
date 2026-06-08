import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { StarToggle } from '../ui/StarToggle';
import { Button } from '../ui/Button';
import type { Chapter, StudyItem } from '../../types';

interface ChapterBlockProps {
  chapter: Chapter;
  onToggleStar: (itemId: string) => void;
  onCycleMastered: (itemId: string) => void;
  onUpdateItem: (itemId: string, changes: Partial<Pick<StudyItem, 'term' | 'def' | 'note'>>) => void;
  onQuiz: () => void;
}

interface ItemDetailModalProps {
  item: StudyItem;
  onClose: () => void;
  onToggleStar: () => void;
  onCycleMastered: () => void;
  onUpdate: (changes: Partial<Pick<StudyItem, 'term' | 'def' | 'note'>>) => void;
}

function ItemDetailModal({ item, onClose, onToggleStar, onCycleMastered, onUpdate }: ItemDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [term, setTerm] = useState(item.term);
  const [def, setDef] = useState(item.def);
  const [note, setNote] = useState(item.note || '');

  function save() {
    onUpdate({ term: term.trim(), def: def.trim(), note: note.trim() });
    setEditing(false);
  }

  function cancel() {
    setTerm(item.term);
    setDef(item.def);
    setNote(item.note || '');
    setEditing(false);
  }

  const masteryLabel = ['미학습', '학습 중', '완료'][item.mastered];
  const masteryColor = ['var(--gray-400)', 'var(--yellow-600)', 'var(--green-600)'][item.mastered];

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ width: 560 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-head">
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <StarToggle on={item.starred} onClick={onToggleStar} />
            <span style={{ font: '500 12px/16px var(--font-mono)', color: masteryColor }}>
              {masteryLabel}
            </span>
            {item.correct > 0 && <span className="stat ok" style={{ font: '600 11px/16px var(--font-mono)', padding: '1px 6px', borderRadius: 1000, background: 'var(--green-50)', color: 'var(--green-700)' }}>정 {item.correct}</span>}
            {item.wrong > 0 && <span className="stat ng" style={{ font: '600 11px/16px var(--font-mono)', padding: '1px 6px', borderRadius: 1000, background: 'var(--red-50)', color: 'var(--red-700)' }}>오 {item.wrong}</span>}
          </div>
          <div className="row" style={{ gap: 8 }}>
            {!editing && (
              <button className="btn sm outline" onClick={() => setEditing(true)}>
                <Icon name="pencil" size={13} />편집
              </button>
            )}
            <button className="icon-btn" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {editing ? (
            <>
              <div>
                <label className="field-label">용어 / 문제</label>
                <input className="text-input" value={term} onChange={e => setTerm(e.target.value)}
                       placeholder="용어 또는 문제를 입력하세요" />
              </div>
              <div>
                <label className="field-label">정의 / 답</label>
                <textarea className="textarea" value={def} onChange={e => setDef(e.target.value)}
                          placeholder="정의 또는 답을 입력하세요" style={{ minHeight: 100 }} />
              </div>
              <div>
                <label className="field-label">메모 (선택)</label>
                <textarea className="textarea" value={note} onChange={e => setNote(e.target.value)}
                          placeholder="추가 메모나 예문을 입력하세요" style={{ minHeight: 64 }} />
              </div>
              <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="outline" size="md" onClick={cancel}>취소</Button>
                <Button variant="solid-primary" size="md" leadingIcon="check" onClick={save}>저장</Button>
              </div>
            </>
          ) : (
            <>
              {/* Term */}
              <div>
                <div className="muted" style={{ font: '500 11px/14px var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>용어 / 문제</div>
                <div style={{ font: '700 20px/30px var(--font-sans)', color: 'var(--gray-900)' }}>{item.term}</div>
              </div>

              {/* Def */}
              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                <div className="muted" style={{ font: '500 11px/14px var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>정의 / 답</div>
                <div style={{ font: '400 15px/24px var(--font-sans)', color: 'var(--gray-800)', whiteSpace: 'pre-wrap' }}>{item.def}</div>
              </div>

              {/* Note */}
              {item.note && (
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                  <div className="muted" style={{ font: '500 11px/14px var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>메모</div>
                  <div style={{ font: '400 13px/22px var(--font-sans)', color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{item.note}</div>
                </div>
              )}

              {/* Mastery buttons */}
              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: 12 }}>학습 상태 변경</span>
                <button
                  className={`btn sm outline item-state-btn`}
                  onClick={onCycleMastered}
                  style={{ color: masteryColor, borderColor: masteryColor }}
                >
                  <Icon name={item.mastered === 2 ? 'check-circle' : item.mastered === 1 ? 'circle-half' : 'circle'} size={13} />
                  {masteryLabel} → {['학습 중', '완료', '미학습'][item.mastered]}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChapterBlock({ chapter, onToggleStar, onCycleMastered, onUpdateItem, onQuiz }: ChapterBlockProps) {
  const [open, setOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const total = chapter.items.length;
  const done = chapter.items.filter(i => i.mastered === 2).length;
  const selectedItem = chapter.items.find(i => i.id === selectedId);

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
            <div key={item.id} className="item-row" style={{ cursor: 'pointer' }}
                 onClick={() => setSelectedId(item.id)}>
              <StarToggle on={item.starred} onClick={e => { e?.stopPropagation(); onToggleStar(item.id); }} />
              <button
                className={`item-state s${item.mastered}`}
                onClick={e => { e.stopPropagation(); onCycleMastered(item.id); }}
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
                <Icon name="chevron-right" size={14} style={{ color: 'var(--gray-400)', marginLeft: 4 }} />
              </div>
            </div>
          ))}
          <button className="add-item-row">
            <Icon name="plus" size={14} />이 챕터에 항목 추가
          </button>
        </div>
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedId(null)}
          onToggleStar={() => onToggleStar(selectedItem.id)}
          onCycleMastered={() => { onCycleMastered(selectedItem.id); }}
          onUpdate={changes => onUpdateItem(selectedItem.id, changes)}
        />
      )}
    </div>
  );
}
