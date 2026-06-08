import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Icon } from '../../components/ui/Icon';
import { MarkdownViewer } from '../../components/ui/MarkdownViewer';
import type { Subject } from '../../types';

interface CreatePayload {
  target: 'new' | 'existing';
  targetSub?: string;
  subjectName: string;
  chapterName: string;
  emoji?: string;
  description: string;
}

interface AIGenFormProps {
  onCreate: (payload: CreatePayload) => void;
  onClose: () => void;
  subjects: Subject[];
}

export function AIGenForm({ onCreate, onClose, subjects }: AIGenFormProps) {
  const [topic, setTopic]     = useState('');
  const [level, setLevel]     = useState<'easy'|'medium'|'hard'>('medium');
  const [target, setTarget]   = useState<'new'|'existing'>('new');
  const [targetSub, setTargetSub] = useState(subjects[0]?.id || '');
  const [phase, setPhase]     = useState<'idle'|'thinking'|'preview'>('idle');
  const [preview, setPreview] = useState<{ subject: string; chapter: string; description: string } | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function generate() {
    if (!topic.trim()) return;
    setPhase('thinking');
    setError(null);
    try {
      const prompt = `당신은 학습 자료 전문 작성자입니다. 다음 주제에 대한 상세한 학습 내용을 한국어 Markdown 형식으로 작성해주세요.

주제: ${topic}
난이도: ${level === 'easy' ? '입문' : level === 'medium' ? '중급' : '심화'}

다음 JSON 형식으로 출력하세요 (마크다운 펜스 없이):
{
  "subject": "과목명 (한국어)",
  "chapter": "챕터명 (한국어)",
  "description": "Markdown 형식의 상세 학습 내용"
}

description에는 다음을 포함하세요:
- 핵심 개념 설명
- 주요 용어 정의
- 적절한 경우 표(table) 사용
- 관련된 경우 코드 예시
- 요약 정리`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const { text } = await res.json();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      let data: { subject?: string; chapter?: string; description?: string };
      try { data = JSON.parse(cleaned); }
      catch {
        const m = cleaned.match(/\{[\s\S]*\}/);
        data = m ? JSON.parse(m[0]) : null;
      }
      if (!data?.description) throw new Error('AI 응답을 해석하지 못했어요.');
      setPreview({ subject: data.subject || topic, chapter: data.chapter || '기본 챕터', description: data.description });
      setPhase('preview');
    } catch (e) {
      setError((e as Error).message || '오류가 발생했어요.');
      setPhase('idle');
    }
  }

  function commit() {
    if (!preview) return;
    onCreate({ target, targetSub, subjectName: preview.subject, chapterName: preview.chapter, description: preview.description });
    onClose();
  }

  if (phase === 'preview' && preview) {
    return (
      <div>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="muted" style={{ font: '500 11px/14px var(--font-mono)', textTransform: 'uppercase' }}>
              생성 결과 미리보기
            </div>
            <div className="h-md" style={{ marginTop: 4 }}>{preview.subject} · {preview.chapter}</div>
          </div>
          <Button variant="ghost" size="md" leadingIcon="rotate-cw" onClick={generate}>다시 생성</Button>
        </div>
        <div style={{ maxHeight: 320, overflow: 'auto', padding: '4px 8px', border: '1px solid var(--gray-200)', borderRadius: 8, background: '#fff' }}>
          <MarkdownViewer content={preview.description} />
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
          <Button variant="solid-primary" size="md" leadingIcon="check" onClick={commit}>챕터 추가</Button>
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
          AI가 주제를 분석해서 챕터 학습 내용(Markdown)을 자동으로 작성해드려요.
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label className="field-label">난이도</label>
        <div className="row" style={{ gap: 6 }}>
          <Chip active={level === 'easy'} onClick={() => setLevel('easy')}>입문</Chip>
          <Chip active={level === 'medium'} onClick={() => setLevel('medium')}>중간</Chip>
          <Chip active={level === 'hard'} onClick={() => setLevel('hard')}>심화</Chip>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 10, background: 'var(--red-50)', color: 'var(--red-700)', borderRadius: 8, fontSize: 13 }}>
          <Icon name="alert-triangle" size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} />
          {error}
        </div>
      )}

      {phase === 'thinking' && (
        <div className="ai-thinking" style={{ marginTop: 16 }}>
          <div className="ai-spinner" />
          AI가 학습 내용을 작성하고 있어요… 잠시만 기다려주세요.
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
