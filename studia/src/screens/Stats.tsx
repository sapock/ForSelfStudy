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
    const total = s.chapters.length;
    const quizzed = s.chapters.filter(c => c.lastQuizAt != null).length;
    const scored = s.chapters.filter(c => c.lastQuizScore != null);
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((a, c) => a + (c.lastQuizScore ?? 0), 0) / scored.length)
      : null;
    return { s, total, quizzed, avgScore };
  });

  const quizPct = totals.chapters > 0 ? Math.round(totals.quizzed / totals.chapters * 100) : 0;

  const recentChapters = subjects
    .flatMap(s => s.chapters.map(c => ({ c, s })))
    .filter(x => x.c.lastQuizAt != null)
    .sort((a, b) => (b.c.lastQuizAt ?? 0) - (a.c.lastQuizAt ?? 0))
    .slice(0, 5);

  return (
    <div className="main-inner">
      <div className="studia-page-header">
        <div>
          <h1 className="studia-page-title">학습 통계</h1>
          <p className="studia-page-sub">전체 진도, 과목별 퀴즈 점수, 학습 패턴을 한눈에 확인하세요.</p>
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
        <KPICard label="전체 챕터" value={String(totals.chapters)} delta={`${subjects.length}개 과목`} deltaDir="up" />
        <KPICard label="연속 학습" value={`${streakDays}일`} delta="최장 23일" deltaDir="up" />
        <KPICard label="퀴즈 완료율" value={`${quizPct}%`} delta={`${totals.quizzed}챕터`} deltaDir="up" />
        <KPICard label="복습 예정" value={String(totals.dueForReview)} delta="7일 이상 경과" deltaDir="down" />
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
            <div key={i} className={`heat-cell ${v > 0 ? `l${v}` : ''}`} title={v > 0 ? `${v * 2}회 학습` : '쉼'} />
          ))}
        </div>
      </div>

      {/* By subject */}
      <div className="tile" style={{ marginBottom: 20 }}>
        <h3 className="h-md" style={{ marginBottom: 12 }}>과목별 퀴즈 진도 & 점수</h3>
        <table className="kw-table" style={{ borderRadius: 0, border: 0, boxShadow: 'none' }}>
          <thead>
            <tr>
              <th>과목</th><th>챕터</th><th>퀴즈 완료</th><th>진도</th><th>평균 점수</th>
            </tr>
          </thead>
          <tbody>
            {bySubject.map(({ s, total, quizzed, avgScore }) => (
              <tr key={s.id}>
                <td>
                  <span style={{ marginRight: 8 }}>{s.emoji}</span>
                  <span className="name">{s.name}</span>
                </td>
                <td>{total}</td>
                <td>{quizzed}</td>
                <td style={{ width: 220 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <ProgressBar value={quizzed} total={total} tone={s.accent} showLabel={false} height={6} />
                    <span className="mono" style={{ fontSize: 11, color: 'var(--gray-500)' }}>{total > 0 ? Math.round(quizzed/total*100) : 0}%</span>
                  </div>
                </td>
                <td>
                  {avgScore !== null ? (
                    <span style={{ color: avgScore >= 80 ? 'var(--green-700)' : avgScore >= 60 ? 'var(--yellow-700)' : 'var(--red-700)', fontWeight: 600 }}>
                      {avgScore}점
                    </span>
                  ) : <span className="muted" style={{ fontSize: 12 }}>미응시</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Two col */}
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
        </div>

        <div className="tile">
          <h3 className="h-md" style={{ marginBottom: 12 }}>최근 퀴즈 기록</h3>
          {recentChapters.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
              아직 퀴즈를 풀지 않았어요.
            </div>
          ) : recentChapters.map(({ c, s }) => {
            const days = Math.floor((Date.now() - (c.lastQuizAt ?? 0)) / 86400000);
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px dashed var(--gray-100)' }}>
                <span style={{ fontSize: 18 }}>{s.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 13px/18px var(--font-sans)', color: 'var(--gray-900)' }}>{c.name}</div>
                  <div className="muted" style={{ font: '400 11px/16px var(--font-sans)' }}>{s.name} · {days === 0 ? '오늘' : `${days}일 전`}</div>
                </div>
                {c.lastQuizScore != null && (
                  <Badge tone={c.lastQuizScore >= 80 ? 'success' : c.lastQuizScore >= 60 ? 'warning' : 'error'}>
                    {c.lastQuizScore}점
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
