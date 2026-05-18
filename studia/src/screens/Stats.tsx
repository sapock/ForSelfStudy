import { useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { KPICard } from '../components/ui/KPICard';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { Subject, Totals } from '../types';

interface StatsScreenProps {
  subjects: Subject[];
  streakDays: number;
  totals: Totals;
}

export function StatsScreen({ subjects, streakDays, totals }: StatsScreenProps) {
  const heat = useMemo(() => Array.from({ length: 100 }, () => Math.floor(Math.random() * 5)), []);

  const bySubject = subjects.map(s => {
    const all = s.chapters.flatMap(c => c.items);
    const done = all.filter(i => i.mastered === 2).length;
    const total = all.length;
    const correct = all.reduce((sum, i) => sum + i.correct, 0);
    const wrong = all.reduce((sum, i) => sum + i.wrong, 0);
    const acc = correct + wrong > 0 ? Math.round(correct / (correct + wrong) * 100) : 0;
    return { s, total, done, correct, wrong, acc };
  });

  const accuracy = totals.totalAttempts > 0 ? Math.round(totals.totalCorrect / totals.totalAttempts * 100) : 0;

  return (
    <div className="main-inner">
      <div className="studia-page-header">
        <div>
          <h1 className="studia-page-title">학습 통계</h1>
          <p className="studia-page-sub">전체 진도, 과목별 정답률, 학습 패턴을 한눈에 확인하세요.</p>
        </div>
        <div className="page-actions">
          <select className="mini-select">
            <option>최근 100일</option>
            <option>최근 30일</option>
            <option>이번 달</option>
            <option>올해</option>
          </select>
          <Button variant="outline" size="md" leadingIcon="download">CSV 내보내기</Button>
        </div>
      </div>

      <div className="stats-grid">
        <KPICard label="총 학습 시간" value="42h" delta="+6h 이번 주" deltaDir="up" />
        <KPICard label="연속 학습" value={`${streakDays}일`} delta="최장 23일" deltaDir="up" />
        <KPICard label="평균 정답률" value={`${accuracy}%`} delta="+4%p" deltaDir="up" />
        <KPICard label="복습 예정" value="18개" delta="3일 내" deltaDir="down" />
      </div>

      {/* Heatmap */}
      <div className="tile" style={{ marginBottom: 20 }}>
        <div className="row between">
          <h3 className="h-md">최근 100일 학습 활동</h3>
          <div className="row" style={{ gap: 8, fontSize: 11, color: 'var(--gray-500)' }}>
            <span>적음</span>
            {[0,1,2,3,4].map(l => (
              <span key={l} className={`heat-cell${l > 0 ? ` l${l}` : ''}`} style={{ width: 12, height: 12, borderRadius: 3, display: 'inline-block' }} />
            ))}
            <span>많음</span>
          </div>
        </div>
        <div className="heatmap">
          {heat.map((v, i) => (
            <div key={i} className={`heat-cell ${v > 0 ? `l${v}` : ''}`} title={v > 0 ? `${v * 4}개 학습` : '쉼'} />
          ))}
        </div>
      </div>

      {/* By subject */}
      <div className="tile" style={{ marginBottom: 20 }}>
        <h3 className="h-md" style={{ marginBottom: 12 }}>과목별 진도 & 정답률</h3>
        <table className="kw-table" style={{ borderRadius: 0, border: 0, boxShadow: 'none' }}>
          <thead>
            <tr>
              <th>과목</th><th>항목</th><th>완료</th><th>진도</th><th>정답률</th><th>정답 / 오답</th>
            </tr>
          </thead>
          <tbody>
            {bySubject.map(({ s, total, done, correct, wrong, acc }) => (
              <tr key={s.id}>
                <td>
                  <span style={{ marginRight: 8 }}>{s.emoji}</span>
                  <span className="name">{s.name}</span>
                </td>
                <td>{total}</td>
                <td>{done}</td>
                <td style={{ width: 220 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <ProgressBar value={done} total={total} tone={s.accent} showLabel={false} height={6} />
                    <span className="mono" style={{ fontSize: 11, color: 'var(--gray-500)' }}>{Math.round(done/total*100)}%</span>
                  </div>
                </td>
                <td>
                  <span style={{ color: acc >= 80 ? 'var(--green-700)' : acc >= 60 ? 'var(--yellow-700)' : 'var(--red-700)', fontWeight: 600 }}>
                    {acc}%
                  </span>
                </td>
                <td className="mono" style={{ fontSize: 12 }}>
                  <span style={{ color: 'var(--green-700)' }}>{correct}</span>
                  <span style={{ color: 'var(--gray-400)' }}> / </span>
                  <span style={{ color: 'var(--red-700)' }}>{wrong}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Two col charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="tile">
          <h3 className="h-md" style={{ marginBottom: 12 }}>학습 시간대</h3>
          <div className="spark" style={{ height: 120, gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const v = i >= 8 && i <= 23 ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 20);
              return (
                <div key={i} className="spark-col">
                  <div className="spark-bar-wrap" style={{ padding: 1 }}>
                    <div className="spark-bar" style={{ height: `${v}%`, background: v > 50 ? 'var(--purple-600)' : 'var(--purple-300)' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono muted" style={{ fontSize: 11 }}>0시</span>
            <span className="mono muted" style={{ fontSize: 11 }}>12시</span>
            <span className="mono muted" style={{ fontSize: 11 }}>23시</span>
          </div>
          <div className="muted" style={{ font: '400 12px/18px var(--font-sans)', marginTop: 8 }}>
            저녁 9시 ~ 11시에 가장 집중도가 높아요.
          </div>
        </div>

        <div className="tile">
          <h3 className="h-md" style={{ marginBottom: 12 }}>잘 외워지지 않는 항목 Top 5</h3>
          {subjects
            .flatMap(s => s.chapters.flatMap(c => c.items.map(i => ({ i, s, c }))))
            .filter(x => x.i.wrong > 0)
            .sort((a, b) => b.i.wrong - a.i.wrong)
            .slice(0, 5)
            .map(({ i, s, c }) => (
              <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px dashed var(--gray-100)' }}>
                <span style={{ fontSize: 18 }}>{s.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 13px/18px var(--font-sans)', color: 'var(--gray-900)' }}>{i.term}</div>
                  <div className="muted" style={{ font: '400 11px/16px var(--font-sans)' }}>{s.name} · {c.name}</div>
                </div>
                <Badge tone="error">오답 {i.wrong}</Badge>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
