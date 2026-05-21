import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Icon } from '../../components/ui/Icon';
import type { Subject } from '../../types';

interface CreatePayload {
  target: 'new' | 'existing';
  targetSub?: string;
  subjectName: string;
  chapterName: string;
  emoji?: string;
  items: { term: string; def: string }[];
}

interface ManualFormProps {
  onCreate: (payload: CreatePayload) => void;
  onClose: () => void;
  subjects: Subject[];
}

export function ManualForm({ onCreate, onClose, subjects }: ManualFormProps) {
  const [target, setTarget] = useState<'new'|'existing'>('new');
  const [targetSub, setTargetSub] = useState(subjects[0]?.id || '');
  const [subjName, setSubjName] = useState('');
  const [chName, setChName] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [items, setItems] = useState([{ term: '', def: '' }]);

  function add() { setItems([...items, { term: '', def: '' }]); }
  function setItem(i: number, key: 'term'|'def', v: string) {
    const next = [...items]; next[i] = { ...next[i], [key]: v }; setItems(next);
  }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)); }

  function commit() {
    const validItems = items.filter(x => x.term.trim());
    if (validItems.length === 0) return;
    onCreate({ target, targetSub, subjectName: subjName || '새 과목', chapterName: chName || '새 챕터', emoji, items: validItems });
    onClose();
  }

  return (
    <div>
      <label className="field-label">어디에 추가할까요?</label>
      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <Chip active={target === 'new'} onClick={() => setTarget('new')}>새 과목</Chip>
        <Chip active={target === 'existing'} onClick={() => setTarget('existing')}>기존 과목에 챕터 추가</Chip>
      </div>

      {target === 'new' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 10, marginBottom: 14 }}>
          <div>
            <label className="field-label">이모지</label>
            <input className="text-input" value={emoji} onChange={e => setEmoji(e.target.value)}
                   style={{ textAlign: 'center', fontSize: 20 }} />
          </div>
          <div>
            <label className="field-label">과목 이름</label>
            <input className="text-input" value={subjName} onChange={e => setSubjName(e.target.value)}
                   placeholder="예: SQLD · SQL 개발자" />
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">기존 과목</label>
          <select className="mini-select" style={{ width: '100%', height: 40 }}
                  value={targetSub} onChange={e => setTargetSub(e.target.value)}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
        </div>
      )}

      <label className="field-label">챕터 이름</label>
      <input className="text-input" value={chName} onChange={e => setChName(e.target.value)}
             placeholder="예: 1과목 · 데이터 모델링" />

      <div className="row between" style={{ marginTop: 18, marginBottom: 8 }}>
        <label className="field-label" style={{ margin: 0 }}>항목 · {items.length}개</label>
        <Button variant="ghost" size="sm" leadingIcon="plus" onClick={add}>항목 추가</Button>
      </div>

      <div style={{ maxHeight: 280, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 28px', gap: 6, alignItems: 'start' }}>
            <input className="text-input" placeholder="용어/문제" value={it.term}
                   onChange={e => setItem(i, 'term', e.target.value)} />
            <input className="text-input" placeholder="정의/답" value={it.def}
                   onChange={e => setItem(i, 'def', e.target.value)} />
            <button className="icon-btn" onClick={() => removeItem(i)} aria-label="삭제">
              <Icon name="trash-2" size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Button variant="outline" size="md" onClick={onClose}>취소</Button>
        <Button variant="solid-primary" size="md" leadingIcon="check" onClick={commit}>저장</Button>
      </div>
    </div>
  );
}
