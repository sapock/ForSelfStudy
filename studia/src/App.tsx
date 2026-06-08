import { useState } from 'react';
import { WindowFrame } from './components/layout/WindowFrame';
import { GNB } from './components/layout/GNB';
import { LNB } from './components/layout/LNB';
import { TweaksPanel } from './components/layout/TweaksPanel';
import { Toast } from './components/ui/Toast';
import { Icon } from './components/ui/Icon';
import { Button } from './components/ui/Button';
import { Dashboard } from './screens/Dashboard';
import { MaterialsList, SubjectDetail } from './screens/MaterialsList';
import { QuizSetup } from './screens/quiz/QuizSetup';
import { QuizRunner } from './screens/quiz/QuizRunner';
import { QuizResult } from './screens/quiz/QuizResult';
import { StatsScreen } from './screens/Stats';
import { AddMaterialModal } from './screens/add-modal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTotals, useDueChapters, mutateSubject } from './hooks/useSubjects';
import { DEFAULT_SUBJECTS, DEFAULT_STREAK_DAYS, DEFAULT_ACTIVITY } from './data/subjects';
import type { Subject, AppSection, QuizState, Tweaks, QuizResult as QR } from './types';

function App() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('studia-subjects', DEFAULT_SUBJECTS);
  const [section, setSection] = useState<AppSection>('dashboard');
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [tweaks, setTweaks] = useLocalStorage<Tweaks>('studia-tweaks', { density: 'comfortable', view: 'grid' });
  const [toast, setToast] = useState<{ text: string; kind: 'success' | 'error' } | null>(null);

  const [quizState, setQuizState] = useState<QuizState>({
    phase: 'idle', config: null, questions: [], results: [],
  });

  const totals = useTotals(subjects);
  const dueChapters = useDueChapters(subjects);

  function showToast(text: string, kind: 'success' | 'error' = 'success') {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2400);
  }

  function handleCreate(payload: {
    target: 'new' | 'existing'; targetSub?: string;
    subjectName: string; chapterName: string; emoji?: string;
    description: string;
  }) {
    const newChapter = {
      id: Math.random().toString(36).slice(2, 10),
      name: payload.chapterName,
      description: payload.description,
    };
    if (payload.target === 'existing' && payload.targetSub) {
      setSubjects(prev => prev.map(s => {
        if (s.id !== payload.targetSub) return s;
        return { ...s, chapters: [...s.chapters, newChapter] };
      }));
      showToast(`'${payload.chapterName}' 챕터를 추가했어요`);
    } else {
      const newSubj: Subject = {
        id: Math.random().toString(36).slice(2, 10),
        name: payload.subjectName,
        emoji: payload.emoji || '📚',
        accent: 'purple',
        category: '사용자 추가',
        description: '방금 생성한 학습 자료예요.',
        color: 'var(--purple-600)',
        chapters: [newChapter],
      };
      setSubjects(prev => [newSubj, ...prev]);
      showToast(`'${payload.subjectName}' 과목이 추가되었어요`);
    }
  }

  function updateSubject(id: string, mutator: (draft: Subject) => void) {
    setSubjects(prev => mutateSubject(prev, id, mutator));
  }

  function startQuiz(subjectId: string, chapterId?: string) {
    setQuizState({
      phase: 'setup', config: null, questions: [], results: [],
      presetSubjectId: subjectId === 'all' ? undefined : subjectId,
      presetChapterId: chapterId,
    });
    setSection('quiz');
  }

  async function handleQuizSetupStart({ subjectId, chapterId, count }: { subjectId: string; chapterId?: string; count: number }) {
    setQuizState(q => ({ ...q, phase: 'generating', config: { mode: 'multiple-choice', count } }));

    const targetSubjects = subjectId === 'all' ? subjects : subjects.filter(s => s.id === subjectId);
    const chapterPayload = targetSubjects.flatMap(s =>
      s.chapters
        .filter(c => (!chapterId || c.id === chapterId) && c.description)
        .map(c => ({
          subjectId: s.id,
          chapterId: c.id,
          subjectName: s.name,
          chapterName: c.name,
          description: c.description,
        }))
    );

    if (!chapterPayload.length) {
      showToast('학습 내용이 없어요. 챕터에 설명을 먼저 작성해주세요.', 'error');
      setQuizState(q => ({ ...q, phase: 'setup' }));
      return;
    }

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapters: chapterPayload, count }),
      });
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const { questions, error } = await res.json();
      if (error) throw new Error(error);
      if (!questions?.length) throw new Error('문제를 생성하지 못했어요.');
      setQuizState(q => ({ ...q, phase: 'running', questions }));
    } catch (e) {
      showToast((e as Error).message || 'AI 문제 생성 오류', 'error');
      setQuizState(q => ({ ...q, phase: 'setup' }));
    }
  }

  function handleQuizFinish(results: QR[]) {
    const chapterScores: Record<string, { correct: number; total: number }> = {};
    for (const r of results) {
      if (!chapterScores[r.chapterId]) chapterScores[r.chapterId] = { correct: 0, total: 0 };
      chapterScores[r.chapterId].total++;
      if (r.correct) chapterScores[r.chapterId].correct++;
    }

    setSubjects(prev => prev.map(s => {
      const draft = JSON.parse(JSON.stringify(s)) as Subject;
      for (const c of draft.chapters) {
        if (chapterScores[c.id]) {
          const { correct, total } = chapterScores[c.id];
          c.lastQuizAt = Date.now();
          c.lastQuizScore = Math.round((correct / total) * 100);
        }
      }
      return draft;
    }));

    setQuizState(q => ({ ...q, phase: 'result', results }));
  }

  function goSection(id: AppSection) {
    setOpenSubject(null);
    setSection(id);
    setQuizState({ phase: 'idle', config: null, questions: [], results: [] });
  }

  const lnbActive = openSubject ? `subject:${openSubject}` : section;
  const counts = { materials: subjects.length, today: totals.dueForReview, starred: 0 };

  let mainContent: React.ReactNode;

  if (quizState.phase === 'setup') {
    mainContent = (
      <QuizSetup subjects={subjects}
        presetSubjectId={quizState.presetSubjectId}
        presetChapterId={quizState.presetChapterId}
        onStart={handleQuizSetupStart}
        onCancel={() => { setQuizState({ phase: 'idle', config: null, questions: [], results: [] }); setSection('dashboard'); }}
      />
    );
  } else if (quizState.phase === 'generating') {
    mainContent = (
      <div className="quiz-shell">
        <div className="card-surface" style={{ padding: 64, textAlign: 'center' }}>
          <div className="ai-spinner" style={{ width: 36, height: 36, borderWidth: 3, margin: '0 auto 20px' }} />
          <div style={{ font: '700 18px/26px var(--font-sans)', color: 'var(--gray-900)', marginBottom: 8 }}>
            AI가 문제를 만들고 있어요
          </div>
          <div className="muted" style={{ font: '400 14px/22px var(--font-sans)' }}>
            학습 내용을 분석해서 {quizState.config?.count ?? 10}개의 문제를 출제하고 있어요.
            잠시만 기다려주세요…
          </div>
          <Button variant="ghost" size="md" style={{ marginTop: 24 }}
                  onClick={() => setQuizState(q => ({ ...q, phase: 'setup' }))}>
            <Icon name="x" size={14} />취소
          </Button>
        </div>
      </div>
    );
  } else if (quizState.phase === 'running') {
    mainContent = (
      <QuizRunner questions={quizState.questions}
        onFinish={handleQuizFinish}
        onCancel={() => setQuizState({ phase: 'idle', config: null, questions: [], results: [] })}
      />
    );
  } else if (quizState.phase === 'result') {
    mainContent = (
      <QuizResult results={quizState.results} questions={quizState.questions}
        onRetry={() => setQuizState(q => ({ ...q, phase: 'setup' }))}
        onDone={() => { setQuizState({ phase: 'idle', config: null, questions: [], results: [] }); setSection('dashboard'); }}
      />
    );
  } else if (openSubject) {
    const subj = subjects.find(s => s.id === openSubject);
    if (subj) {
      mainContent = (
        <SubjectDetail subject={subj} onBack={() => setOpenSubject(null)}
          onUpdate={updateSubject} onStartQuiz={startQuiz}
          onAddClick={() => setAddOpen(true)} query={query}
        />
      );
    }
  } else if (section === 'dashboard') {
    mainContent = (
      <Dashboard subjects={subjects} streakDays={6} totals={totals}
        dueChapters={dueChapters} activity={DEFAULT_ACTIVITY} streakData={DEFAULT_STREAK_DAYS}
        onOpenSubject={id => { setOpenSubject(id); setSection('materials'); }}
        onStartQuiz={startQuiz} onAddClick={() => setAddOpen(true)}
        onGoMaterials={() => setSection('materials')}
      />
    );
  } else if (section === 'materials' || section === 'today' || section === 'starred') {
    mainContent = (
      <MaterialsList subjects={subjects} filter={filter} setFilter={setFilter}
        view={view} setView={setView} query={query}
        onOpenSubject={id => setOpenSubject(id)}
        onStartQuiz={startQuiz} onAddClick={() => setAddOpen(true)}
      />
    );
  } else if (section === 'quiz') {
    mainContent = (
      <QuizSetup subjects={subjects}
        onStart={handleQuizSetupStart}
        onCancel={() => setSection('dashboard')}
      />
    );
  } else if (section === 'stats') {
    mainContent = <StatsScreen subjects={subjects} streakDays={6} totals={totals} />;
  } else {
    mainContent = (
      <div className="main-inner">
        <h1 className="studia-page-title">{section === 'settings' ? '환경설정' : '휴지통'}</h1>
        <p className="studia-page-sub">이 화면은 준비 중이에요.</p>
      </div>
    );
  }

  const shell = (
    <div className={`studia-shell${tweaks.density === 'dense' ? ' dense' : ''}`}>
      <GNB section={section} onSection={goSection} streakDays={6}
           searchValue={query} onSearch={setQuery} onAddClick={() => setAddOpen(true)} />
      <LNB active={lnbActive} subjects={subjects} counts={counts}
           onSelect={key => {
             setQuizState({ phase: 'idle', config: null, questions: [], results: [] });
             if (key.startsWith('subject:')) {
               setOpenSubject(key.slice('subject:'.length));
               setSection('materials');
             } else {
               setOpenSubject(null);
               setSection(key as AppSection);
             }
           }} />
      <main className="main">{mainContent}</main>
      <AddMaterialModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreate} subjects={subjects} />
      {toast && <Toast open kind={toast.kind}>{toast.text}</Toast>}
      <TweaksPanel tweaks={tweaks} onTweak={(k, v) => setTweaks(t => ({ ...t, [k]: v }))} view={view} onViewChange={setView} />
    </div>
  );

  return <WindowFrame>{shell}</WindowFrame>;
}

export default App;
