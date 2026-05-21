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

interface AIGenFormProps {
  onCreate: (payload: CreatePayload) => void;
  onClose: () => void;
  subjects: Subject[];
}

export function AIGenForm({ onCreate, onClose, subjects }: AIGenFormProps) {
  const [topic, setTopic]     = useState('');
  const [count, setCount]     = useState(12);
  const [level, setLevel]     = useState<'easy'|'medium'|'hard'>('medium');
  const [withEx, setWithEx]   = useState(true);
  const [target, setTarget]   = useState<'new'|'existing'>('new');
  const [targetSub, setTargetSub] = useState(subjects[0]?.id || '');
  const [phase, setPhase]     = useState<'idle'|'thinking'|'preview'>('idle');
  const [preview, setPreview] = useState<{ subject: string; chapter: string; items: { term: string; def: string }[] } | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setPhase('thinking');
    setError(null);
    try {
      const prompt = `You are a study assistant. Generate ${count} flashcards on the topic: "${topic}".
Level: ${level}. ${withEx ? 'Include a short example or mnemonic in the definition where helpful.' : ''}
Output STRICT JSON only with this schema, no markdown fences, no commentary:
{
  "subject": "한국어로 된 과목 이름",
  "chapter": "챕터 이름 (한국어)",
  "items": [
    { "term": "용어/문제 (한국어 또는 원어)", "def": "정의/답 (한국어, 2~3문장 이내)" }
  ]
}
Return Korean text where natural. Items should be concise and exam-worthy.`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const { text } = await res.json();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      let data: { subject?: string; chapter?: string; items?: { term: string; def: string }[] };
      try { data = JSON.parse(cleaned); }
      catch {
        const m = cleaned.match(/\{[\s\S]*\}/);
        data = m ? JSON.parse(m[0]) : null;
      }
      if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('AI 응답을 해석하지 못했어요.');
      }
      setPreview({ subject: data.subject || topic, chapter: data.chapter || '기본 챕터', items: data.items });
      setPhase('preview');
    } catch (e) {
      setError((e as Error).message || '오류가 발생했어요.');
      setPhase('idle');
    }
  }

  function commit() {
    if (!preview) return;
    onCreate({ target, targetSub, subjectName: preview.subject, chapterName: preview.chapter, items: preview.items });
    onClose();
  }

  if (phase === 'preview' && preview) {
    return (
      <div>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="muted" style={{ font: '500 11px/14px var(--font-mono)', textTransform: 'uppercase' }}>
              생성 결과 · {preview.items.length}개 항목
            </div>
            <div className="h-md" style={{ marginTop: 4 }}>{preview.subject} · {preview.chapter}</div>
          </div>
          <Button variant="ghost" size="md" leadingIcon="rotate-cw" onClick={generate}>다시 생성</Button>
        </div>
        <div style={{ maxHeight: 320, overflow: 'auto', padding: 4 }}>
          {preview.items.map((it, i) => (
            <div key={i} className="ai-preview-item">
              <div className="t">{i + 1}. {it.term}</div>
              <div className="d">{it.def}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16, marginTop: 12 }}>
          <label className="field-label">어디에 추가할까요?</label>
          <div className="row" style={{ gap: 8 }}>
            <Chip active={target === 'new'} onClick={() => setTarget('new')}>새 과목으로</Chip>
            <Chip active={target === 'existing'} onClick={() => setTarget('existing')}>기존 과목에</Chip>
          </div>
          {target === 'existing' && (
            <select className="mini-select" style={{ width: '100%', height: 40, marginTop: 10 }}
                    value={targetSub} onChange={e => setTargetSub(e.target.value)}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
            </select>
          )}
        </div>
        <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <Button variant="outline" size="md" onClick={onClose}>취소</Button>
          <Button variant="solid-primary" size="md" leadingIcon="check" onClick={commit}>
            {preview.items.length}개 항목 추가
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <label className="field-label">학습할 주제</label>
        <textarea className="textarea"
                  placeholder="예시: 정보처리기사 5과목 인터페이스 구현 핵심 개념 / TOEIC Part 5 빈출 동사 / 운영체제 동기화 기법"
                  value={topic} onChange={e => setTopic(e.target.value)} />
        <div className="muted" style={{ font: '400 11px/16px var(--font-sans)', marginTop: 4 }}>
          AI가 검색해서 학습 항목과 정의를 자동으로 만들어드려요.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div>
          <label className="field-label">난이도</label>
          <div className="row" style={{ gap: 6 }}>
            <Chip active={level === 'easy'} onClick={() => setLevel('easy')}>입문</Chip>
            <Chip active={level === 'medium'} onClick={() => setLevel('medium')}>중간</Chip>
            <Chip active={level === 'hard'} onClick={() => setLevel('hard')}>심화</Chip>
          </div>
        </div>
        <div>
          <label className="field-label">생성 개수 · {count}개</label>
          <input type="range" min={5} max={30} step={1} value={count}
                 onChange={e => setCount(+e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={withEx} onChange={e => setWithEx(e.target.checked)} />
        <span style={{ font: '500 13px/20px var(--font-sans)', color: 'var(--gray-700)' }}>예문·암기법 포함</span>
      </label>

      {error && (
        <div style={{ marginTop: 12, padding: 10, background: 'var(--red-50)', color: 'var(--red-700)', borderRadius: 8, fontSize: 13 }}>
          <Icon name="alert-triangle" size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          {error}
        </div>
      )}

      {phase === 'thinking' && (
        <div className="ai-thinking" style={{ marginTop: 16 }}>
          <div className="ai-spinner" />
          AI가 학습 항목을 생성하고 있어요… 잠시만 기다려주세요.
        </div>
      )}

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Button variant="outline" size="md" onClick={onClose} disabled={phase === 'thinking'}>취소</Button>
        <Button variant="solid-primary" size="md" leadingIcon="sparkles"
                onClick={generate} disabled={phase === 'thinking' || !topic.trim()}>
          AI로 생성
        </Button>
      </div>
    </div>
  );
}
