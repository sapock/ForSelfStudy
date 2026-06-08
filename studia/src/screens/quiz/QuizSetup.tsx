import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import type { Subject } from '../../types';

interface QuizSetupProps {
  subjects: Subject[];
  onStart: (opts: { subjectId: string; chapterId?: string; count: number }) => void;
  onCancel: () => void;
  presetSubjectId?: string;
  presetChapterId?: string;
}

export function QuizSetup({ subjects, onStart, onCancel, presetSubjectId, presetChapterId }: QuizSetupProps) {
  const [subjectId, setSubjectId] = useState(presetSubjectId || 'all');
  const [chapterId, setChapterId] = useState(presetChapterId || 'all');
  const [count, setCount] = useState(10);

  const currentSubject = subjects.find(s => s.id === subjectId);

  const availableChapters = currentSubject?.chapters ?? [];
  const hasContent = subjectId === 'all'
    ? subjects.some(s => s.chapters.some(c => c.description))
    : (currentSubject?.chapters.some(c =>
        chapterId === 'all' ? c.description : (c.id === chapterId && c.description)
      ) ?? false);

  function start() {
    onStart({ subjectId, chapterId: chapterId !== 'all' ? chapterId : undefined, count });
  }

  return (
    <div className="quiz-shell">
      <div className="row between" style={{ marginBottom: 12 }}>
        <h1 className="studia-page-title">AI 퀴즈 시작</h1>
        <Button variant="ghost" size="md" onClick={onCancel} leadingIcon="x">취소</Button>
      </div>
      <p className="studia-page-sub" style={{ marginBottom: 24 }}>
        챕터의 학습 내용을 바탕으로 AI가 객관식 문제를 자동 생성해드려요.
      </p>

      <div className="card-surface" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label className="field-label">과목</label>
          <select className="mini-select" style={{ width: '100%', height: 40 }}
                  value={subjectId} onChange={e => { setSubjectId(e.target.value); setChapterId('all'); }}>
            <option value="all">전체 과목</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
        </div>

        {currentSubject && (
          <div>
            <label className="field-label">챕터</label>
            <select className="mini-select" style={{ width: '100%', height: 40 }}
                    value={chapterId} onChange={e => setChapterId(e.target.value)}>
              <option value="all">전체 챕터</option>
              {availableChapters.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}{!c.description ? ' (내용 없음)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="field-label">문항 수 · {count}개</label>
          <input type="range" min={5} max={20} step={5} value={count}
                 onChange={e => setCount(+e.target.value)} style={{ width: '100%' }} />
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono muted" style={{ fontSize: 11 }}>5개</span>
            <span className="mono muted" style={{ fontSize: 11 }}>20개</span>
          </div>
        </div>

        {!hasContent && (
          <div style={{ padding: '10px 14px', background: 'var(--yellow-50)', border: '1px solid var(--yellow-200)', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Icon name="alert-triangle" size={14} style={{ color: 'var(--yellow-700)', marginTop: 2, flexShrink: 0 }} />
            <span style={{ font: '400 13px/20px var(--font-sans)', color: 'var(--yellow-800)' }}>
              선택한 챕터에 학습 내용이 없어요. 학습 자료 탭에서 내용을 작성하거나 AI로 생성하세요.
            </span>
          </div>
        )}
      </div>

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Button variant="outline" size="lg" onClick={onCancel}>취소</Button>
        <Button variant="solid-primary" size="lg" leadingIcon="sparkles" onClick={start} disabled={!hasContent}>
          AI 문제 생성 & 시작
        </Button>
      </div>
    </div>
  );
}
