import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import type { Subject } from '../../types';

interface CreatePayload {
  target: 'new' | 'existing';
  targetSub?: string;
  subjectName: string;
  chapterName: string;
  emoji?: string;
  description: string;
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
  const [description, setDescription] = useState('');

  function commit() {
    if (!chName.trim()) return;
    onCreate({ target, targetSub, subjectName: subjName || '새 과목', chapterName: chName, emoji, description });
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

      <div style={{ marginBottom: 14 }}>
        <label className="field-label">챕터 이름</label>
        <input className="text-input" value={chName} onChange={e => setChName(e.target.value)}
               placeholder="예: 1과목 · 데이터 모델링" />
      </div>

      <div>
        <label className="field-label">학습 내용 (Markdown)</label>
        <textarea className="textarea" value={description} onChange={e => setDescription(e.target.value)}
                  placeholder={'Markdown 형식으로 학습 내용을 작성하세요.\n\n예시:\n## 핵심 개념\n- 개념 1: 설명\n\n## 주요 용어\n| 용어 | 설명 |\n|---|---|\n| 용어1 | 설명1 |'}
                  style={{ minHeight: 240, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: '20px' }} />
        <div className="muted" style={{ font: '400 11px/16px var(--font-sans)', marginTop: 4 }}>
          나중에 챕터 상세 화면에서 언제든 수정할 수 있어요.
        </div>
      </div>

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Button variant="outline" size="md" onClick={onClose}>취소</Button>
        <Button variant="solid-primary" size="md" leadingIcon="check" onClick={commit} disabled={!chName.trim()}>저장</Button>
      </div>
    </div>
  );
}
