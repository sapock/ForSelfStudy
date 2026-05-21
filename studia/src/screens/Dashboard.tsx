
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { KPICard } from '../components/ui/KPICard';
import { Ring } from '../components/ui/Ring';
import { SparkBars } from '../components/ui/SparkBars';
import { SubjectCard } from '../components/study/SubjectCard';
import type { Subject, Totals, ReviewEntry, ActivityEntry, StreakDay } from '../types';

interface DashboardProps {
  subjects: Subject[];
  streakDays: number;
  totals: Totals;
  todayReview: ReviewEntry[];
  activity: ActivityEntry[];
  streakData: StreakDay[];
  onOpenSubject: (id: string) => void;
  onStartQuiz: (subjectId: string, chapterId?: string) => void;
  onAddClick: () => void;
  onGoMaterials: () => void;
}

export function Dashboard({ subjects, streakDays, totals, todayReview, activity, streakData, onOpenSubject, onStartQuiz, onAddClick, onGoMaterials }: DashboardProps) {
  const hour = new Date().getHours();
  const greet = hour < 6 ? '새벽이에요' : hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요';
  const accuracy = totals.totalAttempts > 0 ? Math.round((totals.totalCorrect / totals.totalAttempts) * 100) : 0;
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
            오늘 복습할 항목은 <b style={{ color: '#fff' }}>{todayReview.length}개</b>예요.
            10분이면 끝낼 수 있어요. 바로 시작해볼까요?
          </div>
        </div>
        <div className="hero-actions">
          <Button variant="solid-neutral" size="lg" leadingIcon="play" onClick={() => onStartQuiz('random')}>
            랜덤 퀴즈
          </Button>
          <Button variant="solid-primary" size="lg" leadingIcon="calendar-check" onClick={() => onStartQuiz('today')}>
            오늘 복습 시작
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="총 학습 항목" value={String(totals.items)} delta={`완료 ${totals.mastered}개`} deltaDir="up" />
        <KPICard label="연속 학습" value={`${streakDays}일`} delta="이번 주 6/7" deltaDir="up" />
        <KPICard label="평균 정답률" value={`${accuracy}%`} delta={`정답 ${totals.totalCorrect}회`} deltaDir="up" />
        <KPICard label="별표 항목" value={String(totals.starred)} delta="우선 복습 대상" deltaDir="up" />
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

          {/* Today review */}
          <div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div>
                <h3 className="section-title" style={{ marginBottom: 2 }}>오늘 복습할 항목</h3>
                <div className="muted" style={{ font: '400 12px/18px var(--font-sans)' }}>
                  망각곡선 기반 · 마지막 학습일과 정답률을 고려해 자동 선정
                </div>
              </div>
              <Button variant="outline" size="md" leadingIcon="zap" onClick={() => onStartQuiz('today')}>
                모두 퀴즈로 풀기
              </Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayReview.slice(0, 5).map(({ item, subject, chapter }) => (
                <div key={item.id} className="review-card">
                  <div className="review-thumb" style={{ background: `var(--${subject.accent}-50)`, color: `var(--${subject.accent}-700)` }}>
                    {subject.emoji}
                  </div>
                  <div className="review-info">
                    <div className="l1">{subject.name} · {chapter.name}</div>
                    <div className="l2">{item.term}</div>
                    <div className="l3">{item.def.slice(0, 80)}{item.def.length > 80 ? '…' : ''}</div>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    {item.starred && <Icon name="star" size={16} style={{ color: 'var(--yellow-500)' }} />}
                    <Badge tone={item.mastered === 2 ? 'success' : item.mastered === 1 ? 'warning' : 'neutral'}>
                      {['미학습', '학습중', '완료'][item.mastered]}
                    </Badge>
                    <Button variant="outline" size="sm" leadingIcon="play" onClick={() => onStartQuiz(subject.id)}>퀴즈</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="tile">
            <div className="row between">
              <div className="tile-title">이번 주 학습 활동</div>
              <span className="muted" style={{ font: '500 11px/16px var(--font-mono)' }}>{weekTotal}개</span>
            </div>
            <SparkBars data={streakData} />
            <div className="muted" style={{ font: '400 12px/18px var(--font-sans)' }}>
              하루 평균 {weekAvg}개 · 목요일에 한 번 빠졌어요
            </div>
          </div>

          <div className="tile">
            <div className="tile-title">전체 마스터리</div>
            <div className="row" style={{ gap: 16, marginTop: 4 }}>
              <Ring value={totals.mastered} total={totals.items} size={92} stroke={10}
                    color="var(--purple-600)"
                    label={`${Math.round((totals.mastered / totals.items) * 100)}%`}
                    sub={`${totals.mastered}/${totals.items}`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--purple-600)', display: 'inline-block' }} />
                  완료 <b style={{ color: 'var(--gray-900)' }}>{totals.mastered}</b>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--yellow-500)', display: 'inline-block' }} />
                  학습 중 <b style={{ color: 'var(--gray-900)' }}>{totals.learning}</b>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--gray-200)', display: 'inline-block' }} />
                  미학습 <b style={{ color: 'var(--gray-900)' }}>{totals.items - totals.mastered - totals.learning}</b>
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
            <div className="tile-sub">주제만 적으면 챕터·항목·예문까지 자동 생성해드려요.</div>
            <Button variant="solid-primary" size="md" leadingIcon="sparkles" onClick={onAddClick}>AI 자료 생성</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
