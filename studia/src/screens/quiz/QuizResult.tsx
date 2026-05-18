
import { Button } from '../../components/ui/Button';
import { Ring } from '../../components/ui/Ring';
import type { QuizResult, QuizPoolEntry } from '../../types';

interface QuizResultProps {
  results: QuizResult[];
  pool: QuizPoolEntry[];
  onRetry: () => void;
  onDone: () => void;
  onReviewWrong: (ids: string[]) => void;
}

export function QuizResult({ results, pool, onRetry, onDone, onReviewWrong }: QuizResultProps) {
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct = Math.round((correct / total) * 100);
  const avgMs = results.length ? Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length / 100) / 10 : 0;
  const wrong = results.filter(r => !r.correct);

  const message =
    pct === 100 ? '완벽해요! 다음 챕터로 넘어가도 좋아요.' :
    pct >= 80   ? '잘 하셨어요! 틀린 문제만 다시 풀어볼까요?' :
    pct >= 60   ? '괜찮은 출발이에요. 별표로 표시하고 복습해보세요.' :
                  '조금 더 익숙해질 시간이 필요해요. 플래시카드로 복습해보세요.';

  const ringColor = pct >= 80 ? 'var(--green-600)' : pct >= 60 ? 'var(--yellow-600)' : 'var(--red-600)';

  return (
    <div className="quiz-shell">
      <div className="result-card">
        <div className="result-ring">
          <Ring value={correct} total={total} size={140} stroke={14} color={ringColor}
                label={`${pct}%`} sub={`${correct}/${total}`} />
        </div>
        <h2 className="studia-page-title" style={{ fontSize: 24, marginBottom: 4 }}>
          {pct === 100 ? '🎉 만점!' : '수고하셨어요'}
        </h2>
        <p className="studia-page-sub" style={{ maxWidth: 420, margin: '0 auto' }}>{message}</p>

        <div className="result-grid">
          <div className="result-stat">
            <div className="v" style={{ color: 'var(--green-700)' }}>{correct}</div>
            <div className="l">정답</div>
          </div>
          <div className="result-stat">
            <div className="v" style={{ color: 'var(--red-700)' }}>{total - correct}</div>
            <div className="l">오답</div>
          </div>
          <div className="result-stat">
            <div className="v">{avgMs}<span style={{ fontSize: 13 }}>초</span></div>
            <div className="l">문항 평균</div>
          </div>
        </div>

        {wrong.length > 0 && (
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <h3 className="h-md" style={{ marginBottom: 8 }}>틀린 항목 ({wrong.length}개)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {wrong.map((r, i) => {
                const found = pool.find(p => p.item.id === r.itemId);
                return found ? (
                  <div key={i} className="ai-preview-item">
                    <div className="t">{found.item.term}</div>
                    <div className="d">{found.item.def}</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        <div className="row" style={{ gap: 8, justifyContent: 'center', marginTop: 24 }}>
          {wrong.length > 0 && (
            <Button variant="outline" size="lg" leadingIcon="rotate-ccw"
                    onClick={() => onReviewWrong(wrong.map(w => w.itemId))}>
              틀린 것만 다시
            </Button>
          )}
          <Button variant="outline" size="lg" leadingIcon="repeat" onClick={onRetry}>다시 풀기</Button>
          <Button variant="solid-primary" size="lg" leadingIcon="check" onClick={onDone}>완료</Button>
        </div>
      </div>
    </div>
  );
}
