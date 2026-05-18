import { useState, useMemo, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StarToggle } from '../../components/ui/StarToggle';
import { Icon } from '../../components/ui/Icon';
import type { QuizPoolEntry, QuizResult } from '../../types';

interface QuizRunnerProps {
  pool: QuizPoolEntry[];
  mode: 'multiple-choice' | 'flashcard';
  onFinish: (results: QuizResult[]) => void;
  onCancel: () => void;
}

export function QuizRunner({ pool, mode, onFinish, onCancel }: QuizRunnerProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [flipped, setFlipped] = useState(false);
  const startRef = useRef(Date.now());

  const current = pool[idx];

  const choices = useMemo(() => {
    if (mode !== 'multiple-choice' || !current) return [];
    const wrong = pool.filter((_, i) => i !== idx).map(p => p.item.def).sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [current.item.def, ...wrong].sort(() => Math.random() - 0.5);
    return all.map(d => ({ def: d, isCorrect: d === current.item.def }));
  }, [idx, mode]);

  if (!current) {
    return (
      <div className="quiz-shell">
        <div className="card-surface" style={{ padding: 48, textAlign: 'center' }}>
          <Icon name="info" size={28} style={{ color: 'var(--gray-400)' }} />
          <p style={{ marginTop: 8 }}>출제할 항목이 없어요. 다른 범위로 시도해보세요.</p>
          <Button variant="outline" size="md" onClick={onCancel} style={{ marginTop: 12 }}>돌아가기</Button>
        </div>
      </div>
    );
  }

  function pick(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    const ms = Date.now() - startRef.current;
    const correct = choices[i].isCorrect;
    setResults(r => [...r, { itemId: current.item.id, correct, ms, subjectId: current.subject.id }]);
  }

  function next() {
    if (idx + 1 >= pool.length) {
      onFinish(results);
    } else {
      setIdx(idx + 1);
      setSelected(null);
      setRevealed(false);
      setFlipped(false);
      startRef.current = Date.now();
    }
  }

  function flashGrade(grade: 'wrong' | 'hard' | 'good') {
    const correct = grade !== 'wrong';
    const ms = Date.now() - startRef.current;
    const newResult: QuizResult = { itemId: current.item.id, correct, ms, subjectId: current.subject.id, grade };
    const newResults = [...results, newResult];
    if (idx + 1 >= pool.length) {
      onFinish(newResults);
    } else {
      setResults(newResults);
      setIdx(idx + 1);
      setFlipped(false);
      startRef.current = Date.now();
    }
  }

  const correctCount = results.filter(r => r.correct).length;
  const wrongCount = results.filter(r => !r.correct).length;

  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <Button variant="ghost" size="md" leadingIcon="x" onClick={onCancel}>중단</Button>
        <div className="quiz-progress-line">
          <ProgressBar value={idx + (revealed ? 1 : 0)} total={pool.length} tone="primary" showLabel={false} height={6} />
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--gray-500)' }}>{idx + 1} / {pool.length}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--green-700)' }}>
              정 {correctCount} · 오 {wrongCount}
            </span>
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {mode === 'multiple-choice' ? (
        <div className="quiz-card">
          <div className="quiz-kicker">
            {current.subject.emoji} {current.subject.name} · {current.chapter.name}
          </div>
          <div className="quiz-question">{current.item.term}</div>
          <div className="quiz-choices">
            {choices.map((c, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              let cls = 'quiz-choice';
              if (revealed && c.isCorrect) cls += ' correct';
              else if (revealed && i === selected) cls += ' wrong';
              if (revealed) cls += ' disabled';
              return (
                <button key={i} className={cls} onClick={() => pick(i)} disabled={revealed}>
                  <span className="letter">{letter}</span>
                  <span>{c.def}</span>
                </button>
              );
            })}
          </div>
          {revealed && (
            <div className="quiz-feedback">
              <b>{choices[selected!]?.isCorrect ? '✓ 정답이에요!' : '✗ 오답이에요.'}</b>
              {!choices[selected!]?.isCorrect && <div style={{ marginTop: 4 }}>정답: {current.item.def}</div>}
            </div>
          )}
          <div className="quiz-foot">
            <div className="row" style={{ gap: 8 }}>
              <StarToggle on={current.item.starred} onClick={() => {}} />
              <span className="muted" style={{ fontSize: 12 }}>중요 표시</span>
            </div>
            <Button variant="solid-primary" size="lg"
                    trailingIcon={idx + 1 >= pool.length ? 'check' : 'arrow-right'}
                    disabled={!revealed} onClick={next}>
              {idx + 1 >= pool.length ? '결과 보기' : '다음 문제'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="quiz-card">
          <div className="quiz-kicker">
            {current.subject.emoji} {current.subject.name} · {current.chapter.name}
          </div>
          <div className={`flash-card ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)} style={{ marginTop: 20 }}>
            <div className="flash-inner">
              <div className="flash-face front">
                <div className="ft">{current.item.term}</div>
                <div className="flash-hint">클릭하면 뒷면 ↻</div>
              </div>
              <div className="flash-face back">
                <div className="fd">{current.item.def}</div>
                <div className="flash-hint">기억나셨나요? ↻</div>
              </div>
            </div>
          </div>
          <div className="quiz-foot">
            {!flipped ? (
              <>
                <div className="muted" style={{ fontSize: 13 }}>카드를 클릭하면 뒷면이 보여요</div>
                <Button variant="outline" size="lg" onClick={() => setFlipped(true)}>뒷면 보기</Button>
              </>
            ) : (
              <div className="row" style={{ gap: 8, width: '100%', justifyContent: 'space-between' }}>
                <span className="muted" style={{ fontSize: 13 }}>스스로 채점해주세요</span>
                <div className="row" style={{ gap: 8 }}>
                  <Button variant="outline" size="md" onClick={() => flashGrade('wrong')}
                          style={{ color: 'var(--red-700)', borderColor: 'var(--red-300)' }}>
                    <Icon name="x" size={14} /> 모름
                  </Button>
                  <Button variant="outline" size="md" onClick={() => flashGrade('hard')}
                          style={{ color: 'var(--yellow-700)', borderColor: 'var(--yellow-300)' }}>
                    <Icon name="meh" size={14} /> 애매
                  </Button>
                  <Button variant="solid-primary" size="md" onClick={() => flashGrade('good')}>
                    <Icon name="check" size={14} /> 알았음
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
