import { useState, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Icon } from '../../components/ui/Icon';
import type { QuizQuestion, QuizResult } from '../../types';

interface QuizRunnerProps {
  questions: QuizQuestion[];
  onFinish: (results: QuizResult[]) => void;
  onCancel: () => void;
}

export function QuizRunner({ questions, onFinish, onCancel }: QuizRunnerProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const startRef = useRef(Date.now());

  const current = questions[idx];

  if (!current) {
    return (
      <div className="quiz-shell">
        <div className="card-surface" style={{ padding: 48, textAlign: 'center' }}>
          <Icon name="info" size={28} style={{ color: 'var(--gray-400)' }} />
          <p style={{ marginTop: 8 }}>출제할 문제가 없어요. 다른 챕터로 시도해보세요.</p>
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
    const correct = i === current.answerIndex;
    setResults(r => [...r, {
      questionId: current.id,
      correct,
      ms,
      subjectId: current.subjectId,
      chapterId: current.chapterId,
    }]);
  }

  function next() {
    if (idx + 1 >= questions.length) {
      const finalResults = results;
      onFinish(finalResults);
    } else {
      setIdx(idx + 1);
      setSelected(null);
      setRevealed(false);
      startRef.current = Date.now();
    }
  }

  const correctCount = results.filter(r => r.correct).length;
  const wrongCount = results.filter(r => !r.correct).length;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <Button variant="ghost" size="md" leadingIcon="x" onClick={onCancel}>중단</Button>
        <div className="quiz-progress-line">
          <ProgressBar value={idx + (revealed ? 1 : 0)} total={questions.length} tone="primary" showLabel={false} height={6} />
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--gray-500)' }}>{idx + 1} / {questions.length}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--green-700)' }}>
              정 {correctCount} · 오 {wrongCount}
            </span>
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div className="quiz-card">
        <div className="quiz-kicker">
          문제 {idx + 1}
        </div>
        <div className="quiz-question">{current.question}</div>
        <div className="quiz-choices">
          {current.options.map((opt, i) => {
            let cls = 'quiz-choice';
            if (revealed && i === current.answerIndex) cls += ' correct';
            else if (revealed && i === selected) cls += ' wrong';
            if (revealed) cls += ' disabled';
            return (
              <button key={i} className={cls} onClick={() => pick(i)} disabled={revealed}>
                <span className="letter">{letters[i]}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="quiz-feedback">
            <b>{selected === current.answerIndex ? '✓ 정답이에요!' : '✗ 오답이에요.'}</b>
            {selected !== current.answerIndex && (
              <div style={{ marginTop: 4 }}>정답: {current.options[current.answerIndex]}</div>
            )}
            {current.explanation && (
              <div style={{ marginTop: 8, color: 'var(--gray-600)', fontSize: 13 }}>{current.explanation}</div>
            )}
          </div>
        )}

        <div className="quiz-foot">
          <div />
          <Button variant="solid-primary" size="lg"
                  trailingIcon={idx + 1 >= questions.length ? 'check' : 'arrow-right'}
                  disabled={!revealed} onClick={next}>
            {idx + 1 >= questions.length ? '결과 보기' : '다음 문제'}
          </Button>
        </div>
      </div>
    </div>
  );
}
