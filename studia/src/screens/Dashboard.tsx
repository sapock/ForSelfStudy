import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { KPICard } from '../components/ui/KPICard';
import { Ring } from '../components/ui/Ring';
import { SparkBars } from '../components/ui/SparkBars';
import { SubjectCard } from '../components/study/SubjectCard';
import type { Subject, Totals, DueChapter, ActivityEntry, StreakDay } from '../types';

interface DashboardProps {
  subjects: Subject[];
  streakDays: number;
  totals: Totals;
  dueChapters: DueChapter[];
  activity: ActivityEntry[];
  streakData: StreakDay[];
  onOpenSubject: (id: string) => void;
  onStartQuiz: (subjectId: string, chapterId?: string) => void;
  onAddClick: () => void;
  onGoMaterials: () => void;
}

export function Dashboard({ subjects, streakDays, totals, dueChapters, activity, streakData, onOpenSubject, onStartQuiz, onAddClick, onGoMaterials }: DashboardProps) {
  const hour = new Date().getHours();
  const greet = hour < 6 ? '새벽이에요' : hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요';
  const quizPct = totals.chapters > 0 ? Math.round((totals.quizzed / totals.chapters) * 100) : 0;
  const weekTotal = streakData.reduce((s, d) => s + d.count, 0);
  const weekAvg = Math.round(weekTotal / 7);

  return (
    <div className="main-inner">
      {/* Hero */}
      <div className="hero">
        <div>
          <div className="hero-greet">{greet}</div>
          <div className="hero-title">오늘도 {streakDays}일째 학습 중이에요 🔥</div>
          <div className="hero-sub">
            복습이 필요한 챕터가 <b style={{ color: '#fff' }}>{totals.dueForReview}개</b> 있어요.
            AI 퀴즈로 실력을 점검해보세요!
          </div>
        </div>
        <div className="hero-actions">
          <Button variant="solid-neutral" size="lg" leadingIcon="shuffle" onClick={() => onStartQuiz('all')}>
            랜덤 퀴즈
          </Button>
          <Button variant="solid-primary" size="lg" leadingIcon="zap" onClick={() => dueChapters[0] && onStartQuiz(dueChapters[0].subject.id, dueChapters[0].chapter.id)}>
            복습 퀴즈 시작
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="전체 챕터" value={String(totals.chapters)} delta={`${subjects.length}개 과목`} deltaDir="up" />
        <KPICard label="연속 학습" value={`${streakDays}일`} delta="이번 주 6/7" deltaDir="up" />
        <KPICard label="퀴즈 완료" value={`${quizPct}%`} delta={`${totals.quizzed}챕터 완료`} deltaDir="up" />
        <KPICard label="복습 필요" value={String(totals.dueForReview)} delta="7일 이상 경과" deltaDir="down" />
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Continue learning */}
          <div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <h3 className="section-title">이어서 학습하기</h3>
              <Button variant="ghost" size="md" trailingIcon="arrow-right" onClick={onGoMaterials}>모든 자료</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {subjects.slice(0, 4).map(s => (
                <SubjectCard key={s.id} subject={s} onClick={() => onOpenSubject(s.id)} onStartQuiz={() => onStartQuiz(s.id)} />
              ))}
            </div>
          </div>

          {/* Due chapters */}
          <div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div>
                <h3 className="section-title" style={{ marginBottom: 2 }}>복습이 필요한 챕터</h3>
                <div className="muted" style={{ font: '400 12px/18px var(--font-sans)' }}>
                  7일 이상 경과했거나 아직 퀴즈를 풀지 않은 챕터
                </div>
              </div>
              <Button variant="outline" size="md" leadingIcon="zap" onClick={() => onStartQuiz('all')}>
                전체 퀴즈
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dueChapters.slice(0, 5).map(({ chapter, subject }) => {
                const daysSince = chapter.lastQuizAt
                  ? Math.floor((Date.now() - chapter.lastQuizAt) / 86400000)
                  : null;
                return (
                  <div key={chapter.id} className="review-card">
                    <div className="review-thumb" style={{ background: `var(--${subject.accent}-50)`, color: `var(--${subject.accent}-700)` }}>
                      {subject.emoji}
                    </div>
                    <div className="review-info">
                      <div className="l1">{subject.name}</div>
                      <div className="l2">{chapter.name}</div>
                      <div className="l3">
                        {daysSince !== null ? `${daysSince}일 전 마지막 퀴즈` : '아직 퀴즈를 풀지 않았어요'}
                        {chapter.lastQuizScore != null && ` · 지난 점수 ${chapter.lastQuizScore}점`}
                      </div>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      {chapter.lastQuizScore != null && (
                        <Badge tone={chapter.lastQuizScore >= 80 ? 'success' : chapter.lastQuizScore >= 60 ? 'warning' : 'error'}>
                          {chapter.lastQuizScore}점
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" leadingIcon="zap" onClick={() => onStartQuiz(subject.id, chapter.id)}>퀴즈</Button>
                    </div>
                  </div>
                );
              })}
              {dueChapters.length === 0 && (
                <div className="card-surface" style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
                  <Icon name="check-circle" size={28} style={{ color: 'var(--green-400)', marginBottom: 8 }} />
                  <div style={{ font: '600 14px/20px var(--font-sans)', color: 'var(--gray-700)' }}>모든 챕터를 복습했어요!</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="tile">
            <div className="row between">
              <div className="tile-title">이번 주 학습 활동</div>
              <span className="muted" style={{ font: '500 11px/16px var(--font-mono)' }}>{weekTotal}회</span>
            </div>
            <SparkBars data={streakData} />
            <div className="muted" style={{ font: '400 12px/18px var(--font-sans)' }}>
              하루 평균 {weekAvg}회 · 꾸준히 학습 중이에요
            </div>
          </div>

          <div className="tile">
            <div className="tile-title">전체 퀴즈 진도</div>
            <div className="row" style={{ gap: 16, marginTop: 4 }}>
              <Ring value={totals.quizzed} total={totals.chapters} size={92} stroke={10}
                    color="var(--purple-600)"
                    label={`${quizPct}%`}
                    sub={`${totals.quizzed}/${totals.chapters}`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--purple-600)', display: 'inline-block' }} />
                  퀴즈 완료 <b style={{ color: 'var(--gray-900)' }}>{totals.quizzed}</b>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--gray-200)', display: 'inline-block' }} />
                  미완료 <b style={{ color: 'var(--gray-900)' }}>{totals.chapters - totals.quizzed}</b>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--yellow-400)', display: 'inline-block' }} />
                  복습 필요 <b style={{ color: 'var(--gray-900)' }}>{totals.dueForReview}</b>
                </div>
              </div>
            </div>
          </div>

          <div className="tile">
            <div className="tile-title">최근 활동</div>
            <div>
              {activity.slice(0, 5).map((a, i) => (
                <div key={i} className="act">
                  <div className="body">{a.text}</div>
                  <div className="when">{a.when}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="tile" style={{ background: 'linear-gradient(135deg, var(--purple-50), #fff)', border: '1px solid var(--purple-200)' }}>
            <div className="row" style={{ gap: 8 }}>
              <Icon name="sparkles" size={16} style={{ color: 'var(--purple-600)' }} />
              <div className="tile-title" style={{ color: 'var(--purple-800)' }}>AI로 자료 만들기</div>
            </div>
            <div className="tile-sub">주제만 입력하면 AI가 학습 내용을 자동으로 작성해드려요.</div>
            <Button variant="solid-primary" size="md" leadingIcon="sparkles" onClick={onAddClick}>AI 자료 생성</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
