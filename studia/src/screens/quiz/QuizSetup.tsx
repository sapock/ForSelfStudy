import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Icon } from '../../components/ui/Icon';
import type { Subject, QuizPoolEntry } from '../../types';

interface QuizSetupProps {
  subjects: Subject[];
  onStart: (opts: { pool: QuizPoolEntry[]; mode: 'multiple-choice' | 'flashcard' }) => void;
  onCancel: () => void;
  presetSubjectId?: string;
  presetChapterId?: string;
}

export function QuizSetup({ subjects, onStart, onCancel, presetSubjectId, presetChapterId }: QuizSetupProps) {
  const [subjectId, setSubjectId] = useState(presetSubjectId || 'all');
  const [chapterId, setChapterId] = useState(presetChapterId || 'all');
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<'multiple-choice' | 'flashcard'>('multiple-choice');
  const [scope, setScope] = useState<'all' | 'starred' | 'wrong' | 'unlearned'>('all');

  const currentSubject = subjects.find(s => s.id === subjectId);

  function start() {
    let pool: QuizPoolEntry[] = [];
    const scopedSubjects = subjectId === 'all' ? subjects : (currentSubject ? [currentSubject] : []);
    for (const s of scopedSubjects) {
      const chapters = chapterId === 'all' ? s.chapters : s.chapters.filter(c => c.id === chapterId);
      for (const c of chapters) for (const i of c.items) pool.push({ item: i, chapter: c, subject: s });
    }
    if (scope === 'starred')   pool = pool.filter(p => p.item.starred);
    if (scope === 'wrong')     pool = pool.filter(p => p.item.wrong > 0);
    if (scope === 'unlearned') pool = pool.filter(p => p.item.mastered === 0);
    pool = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    onStart({ pool, mode });
  }

  return (
    <div className="quiz-shell">
      <div className="row between" style={{ marginBottom: 12 }}>
        <h1 className="studia-page-title">퀴즈 시작</h1>
        <Button variant="ghost" size="md" onClick={onCancel} leadingIcon="x">취소</Button>
      </div>
      <p className="studia-page-sub" style={{ marginBottom: 24 }}>
        랜덤 출제 · 객관식 또는 플래시카드 · 결과는 정답률과 다음 복습일에 반영돼요.
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
              {currentSubject.chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="field-label">출제 범위</label>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Chip active={scope === 'all'} onClick={() => setScope('all')}>전체</Chip>
            <Chip active={scope === 'starred'} onClick={() => setScope('starred')}>⭐ 별표</Chip>
            <Chip active={scope === 'wrong'} onClick={() => setScope('wrong')}>틀린 적 있음</Chip>
            <Chip active={scope === 'unlearned'} onClick={() => setScope('unlearned')}>미학습</Chip>
          </div>
        </div>

        <div>
          <label className="field-label">문항 수 · {count}개</label>
          <input type="range" min={5} max={30} step={5} value={count}
                 onChange={e => setCount(+e.target.value)} style={{ width: '100%' }} />
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono muted" style={{ fontSize: 11 }}>5개</span>
            <span className="mono muted" style={{ fontSize: 11 }}>30개</span>
          </div>
        </div>

        <div>
          <label className="field-label">퀴즈 형식</label>
          <div className="row" style={{ gap: 8 }}>
            <Chip active={mode === 'multiple-choice'} onClick={() => setMode('multiple-choice')}>
              <Icon name="list-checks" size={12} style={{ marginRight: 4 }} />객관식 4지선다
            </Chip>
            <Chip active={mode === 'flashcard'} onClick={() => setMode('flashcard')}>
              <Icon name="layers" size={12} style={{ marginRight: 4 }} />플래시카드
            </Chip>
          </div>
        </div>
      </div>

      <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <Button variant="outline" size="lg" onClick={onCancel}>취소</Button>
        <Button variant="solid-primary" size="lg" leadingIcon="play" onClick={start}>시작하기</Button>
      </div>
    </div>
  );
}
