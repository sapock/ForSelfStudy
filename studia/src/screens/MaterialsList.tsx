import { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Badge } from '../components/ui/Badge';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Tabs } from '../components/ui/Tabs';
import { KPICard } from '../components/ui/KPICard';
import { ChapterBlock } from '../components/study/ChapterBlock';
import { SubjectCard } from '../components/study/SubjectCard';
import type { Subject } from '../types';

const ACCENT_TONE: Record<string, 'primary' | 'info' | 'warning' | 'success'> = {
  purple: 'primary', blue: 'info', yellow: 'warning', green: 'success',
};

/* ─── Materials List ─── */
interface MaterialsListProps {
  subjects: Subject[];
  filter: string;
  setFilter: (f: string) => void;
  view: 'grid' | 'list';
  setView: (v: 'grid' | 'list') => void;
  query: string;
  onOpenSubject: (id: string) => void;
  onStartQuiz: (subjectId: string) => void;
  onAddClick: () => void;
}

export function MaterialsList({ subjects, filter, setFilter, view, setView, query, onOpenSubject, onStartQuiz, onAddClick }: MaterialsListProps) {
  const filtered = subjects.filter(s => {
    const quizzed = s.chapters.filter(c => c.lastQuizAt != null).length;
    const total = s.chapters.length;
    if (filter === 'in-progress' && (quizzed === 0 || quizzed === total)) return false;
    if (filter === 'completed' && quizzed < total) return false;
    if (query) {
      const q = query.toLowerCase();
      const hit = s.name.toLowerCase().includes(q)
        || s.description.toLowerCase().includes(q)
        || s.chapters.some(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const filters = [
    { id: 'all', label: '전체', count: subjects.length },
    { id: 'in-progress', label: '진행 중' },
    { id: 'completed', label: '완료' },
  ];

  return (
    <div className="main-inner">
      <div className="studia-page-header">
        <div>
          <h1 className="studia-page-title">학습 자료</h1>
          <p className="studia-page-sub">총 {subjects.length}개 과목 · 챕터별 학습 내용 관리</p>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="md" leadingIcon="download">내보내기</Button>
          <Button variant="solid-primary" size="md" leadingIcon="plus" onClick={onAddClick}>자료 추가</Button>
        </div>
      </div>

      <div className="filter-bar">
        {filters.map(f => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}{typeof f.count === 'number' && <span style={{ color: 'var(--gray-400)', marginLeft: 4 }}>{f.count}</span>}
          </Chip>
        ))}
        <span style={{ flex: 1 }} />
        <select className="mini-select">
          <option>최근 학습순</option>
          <option>이름순</option>
          <option>진도 낮은 순</option>
        </select>
        <div style={{ display: 'inline-flex', border: '1px solid var(--gray-300)', borderRadius: 8, padding: 2 }}>
          <button onClick={() => setView('grid')} className="icon-btn"
                  style={{ background: view === 'grid' ? 'var(--gray-100)' : 'transparent', borderRadius: 6 }}>
            <Icon name="layout-grid" size={16} />
          </button>
          <button onClick={() => setView('list')} className="icon-btn"
                  style={{ background: view === 'list' ? 'var(--gray-100)' : 'transparent', borderRadius: 6 }}>
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(s => (
            <SubjectCard key={s.id} subject={s} onClick={() => onOpenSubject(s.id)} onStartQuiz={() => onStartQuiz(s.id)} />
          ))}
        </div>
      ) : (
        <table className="kw-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}></th>
              <th>과목명</th>
              <th>카테고리</th>
              <th>챕터</th>
              <th>퀴즈 진도</th>
              <th>평균 점수</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const total = s.chapters.length;
              const quizzed = s.chapters.filter(c => c.lastQuizAt != null).length;
              const scored = s.chapters.filter(c => c.lastQuizScore != null);
              const avg = scored.length > 0 ? Math.round(scored.reduce((a, c) => a + (c.lastQuizScore ?? 0), 0) / scored.length) : null;
              return (
                <tr key={s.id} onClick={() => onOpenSubject(s.id)}>
                  <td><span style={{ fontSize: 18 }}>{s.emoji}</span></td>
                  <td>
                    <span className="name">{s.name}</span>
                    <div className="muted" style={{ fontSize: 11 }}>{s.description}</div>
                  </td>
                  <td>{s.category}</td>
                  <td>{total}</td>
                  <td style={{ width: 200 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <ProgressBar value={quizzed} total={total} tone={s.accent} showLabel={false} height={6} />
                      <span className="mono" style={{ fontSize: 11, color: 'var(--gray-500)' }}>{quizzed}/{total}</span>
                    </div>
                  </td>
                  <td>
                    {avg !== null ? (
                      <span style={{ color: avg >= 80 ? 'var(--green-700)' : avg >= 60 ? 'var(--yellow-700)' : 'var(--red-700)', fontWeight: 600 }}>
                        {avg}점
                      </span>
                    ) : <span className="muted">-</span>}
                  </td>
                  <td>
                    <Button variant="outline" size="sm" leadingIcon="zap" onClick={e => { e.stopPropagation(); onStartQuiz(s.id); }}>퀴즈</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {filtered.length === 0 && (
        <div className="card-surface" style={{ padding: 64, textAlign: 'center', color: 'var(--gray-500)' }}>
          <Icon name="search-x" size={32} style={{ color: 'var(--gray-300)', marginBottom: 8 }} />
          <div style={{ font: '600 16px/24px var(--font-sans)', color: 'var(--gray-700)', marginBottom: 4 }}>결과가 없어요</div>
          <div>다른 필터나 키워드로 시도해보세요.</div>
        </div>
      )}
    </div>
  );
}

/* ─── Subject Detail ─── */
interface SubjectDetailProps {
  subject: Subject;
  onBack: () => void;
  onUpdate: (id: string, mutator: (draft: Subject) => void) => void;
  onStartQuiz: (subjectId: string, chapterId?: string) => void;
  onAddClick: () => void;
  query: string;
}

export function SubjectDetail({ subject, onBack, onUpdate, onStartQuiz, onAddClick }: SubjectDetailProps) {
  const [tab, setTab] = useState('chapters');

  const totalChapters = subject.chapters.length;
  const quizzedChapters = subject.chapters.filter(c => c.lastQuizAt != null).length;
  const scoredChapters = subject.chapters.filter(c => c.lastQuizScore != null);
  const avgScore = scoredChapters.length > 0
    ? Math.round(scoredChapters.reduce((s, c) => s + (c.lastQuizScore ?? 0), 0) / scoredChapters.length)
    : null;
  const hasContent = subject.chapters.filter(c => c.description).length;
  const tone = ACCENT_TONE[subject.accent] ?? 'primary';

  function updateDescription(chapterId: string, description: string) {
    onUpdate(subject.id, draft => {
      const c = draft.chapters.find(c => c.id === chapterId);
      if (c) c.description = description;
    });
  }

  return (
    <div className="main-inner">
      <Breadcrumb items={['학습 자료', subject.name]} onNavigate={onBack} />
      <div className="page-header">
        <div className="row" style={{ gap: 16, alignItems: 'center' }}>
          <div className="subj-emoji" style={{ width: 56, height: 56, fontSize: 26, background: `var(--${subject.accent}-50)`, color: `var(--${subject.accent}-700)`, borderRadius: 12 }}>
            {subject.emoji}
          </div>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <Badge tone="neutral">{subject.category}</Badge>
              <Badge tone={tone}>{totalChapters}챕터</Badge>
            </div>
            <h1 className="studia-page-title" style={{ fontSize: 30, lineHeight: '38px' }}>{subject.name}</h1>
            <p className="studia-page-sub">{subject.description}</p>
          </div>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="md" leadingIcon="plus" onClick={onAddClick}>챕터 추가</Button>
          <Button variant="solid-primary" size="md" leadingIcon="zap" onClick={() => onStartQuiz(subject.id)}>전체 퀴즈 시작</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KPICard label="전체 챕터" value={String(totalChapters)} delta="학습 단원 수" deltaDir="up" />
        <KPICard label="퀴즈 완료" value={String(quizzedChapters)} delta={`${Math.round((quizzedChapters / totalChapters) * 100)}%`} deltaDir="up" />
        <KPICard label="내용 작성" value={String(hasContent)} delta={`${totalChapters - hasContent}개 미작성`} deltaDir="up" />
        <KPICard label="평균 점수" value={avgScore !== null ? `${avgScore}점` : '-'} delta="최근 퀴즈 기준" deltaDir="up" />
      </div>

      <Tabs
        items={[
          { id: 'chapters', label: '챕터 목록', count: totalChapters },
          { id: 'notes', label: '메모' },
        ]}
        value={tab} onChange={setTab}
      />

      {tab === 'chapters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subject.chapters.map(c => (
            <ChapterBlock
              key={c.id}
              chapter={c}
              subjectName={subject.name}
              onQuiz={() => onStartQuiz(subject.id, c.id)}
              onUpdateDescription={desc => updateDescription(c.id, desc)}
            />
          ))}
          <button className="btn outline md" style={{ alignSelf: 'flex-start', marginTop: 8 }} onClick={onAddClick}>
            <Icon name="plus" size={16} />챕터 추가
          </button>
        </div>
      )}

      {tab === 'notes' && (
        <div className="card-surface" style={{ padding: 64, textAlign: 'center', color: 'var(--gray-500)' }}>
          <Icon name="notebook" size={32} style={{ color: 'var(--gray-300)', marginBottom: 8 }} />
          <div style={{ font: '600 16px/24px var(--font-sans)', color: 'var(--gray-700)', marginBottom: 4 }}>메모가 비어있어요</div>
          <div>이 과목에 대한 개인 메모를 자유롭게 작성할 수 있어요.</div>
          <Button variant="outline" size="md" leadingIcon="plus" style={{ marginTop: 16 }}>메모 작성</Button>
        </div>
      )}
    </div>
  );
}
