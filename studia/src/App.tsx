import { useState } from 'react';
import { WindowFrame } from './components/layout/WindowFrame';
import { GNB } from './components/layout/GNB';
import { LNB } from './components/layout/LNB';
import { TweaksPanel } from './components/layout/TweaksPanel';
import { Toast } from './components/ui/Toast';
import { Dashboard } from './screens/Dashboard';
import { MaterialsList, SubjectDetail } from './screens/MaterialsList';
import { QuizSetup } from './screens/quiz/QuizSetup';
import { QuizRunner } from './screens/quiz/QuizRunner';
import { QuizResult } from './screens/quiz/QuizResult';
import { StatsScreen } from './screens/Stats';
import { AddMaterialModal } from './screens/add-modal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTotals, useTodayReview, mutateSubject } from './hooks/useSubjects';
import { DEFAULT_SUBJECTS, DEFAULT_STREAK_DAYS, DEFAULT_ACTIVITY } from './data/subjects';
import type { Subject, AppSection, QuizState, Tweaks, QuizResult as QR, QuizPoolEntry } from './types';

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
    phase: 'idle', config: null, results: [], pool: [],
  });

  const totals = useTotals(subjects);
  const todayReview = useTodayReview(subjects);

  function showToast(text: string, kind: 'success' | 'error' = 'success') {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 2400);
  }

  function handleCreate(payload: {
    target: 'new' | 'existing'; targetSub?: string;
    subjectName: string; chapterName: string; emoji?: string;
    items: { term: string; def: string }[];
  }) {
    const newItems = payload.items.map(i => ({
      id: Math.random().toString(36).slice(2, 10),
      term: i.term, def: i.def,
      starred: false, mastered: 0 as const, correct: 0, wrong: 0,
      lastReviewedAt: null, nextReviewAt: Date.now(), note: '',
    }));
    if (payload.target === 'existing' && payload.targetSub) {
      setSubjects(prev => prev.map(s => {
        if (s.id !== payload.targetSub) return s;
        return { ...s, chapters: [...s.chapters, {
          id: Math.random().toString(36).slice(2, 10),
          name: payload.chapterName, items: newItems,
        }]};
      }));
      showToast(`'${payload.chapterName}' 챕터에 ${newItems.length}개 항목을 추가했어요`);
    } else {
      const newSubj: Subject = {
        id: Math.random().toString(36).slice(2, 10),
        name: payload.subjectName, emoji: payload.emoji || '📚',
        accent: 'purple', category: '사용자 추가',
        description: '방금 생성한 학습 자료예요.',
        color: 'var(--purple-600)',
        chapters: [{ id: Math.random().toString(36).slice(2, 10), name: payload.chapterName, items: newItems }],
      };
      setSubjects(prev => [newSubj, ...prev]);
      showToast(`'${payload.subjectName}' 과목이 추가되었어요`);
    }
  }

  function updateSubject(id: string, mutator: (draft: Subject) => void) {
    setSubjects(prev => mutateSubject(prev, id, mutator));
  }

  function startQuiz(subjectId: string, chapterId?: string) {
    if (subjectId === 'today') {
      setQuizState({ phase: 'running', config: { mode: 'multiple-choice' }, pool: todayReview, results: [] });
    } else if (subjectId === 'random') {
      const all: QuizPoolEntry[] = subjects.flatMap(s => s.chapters.flatMap(c => c.items.map(i => ({ item: i, chapter: c, subject: s }))));
      const pool = [...all].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuizState({ phase: 'running', config: { mode: 'multiple-choice' }, pool, results: [] });
    } else {
      setQuizState({ phase: 'setup', config: null, pool: [], results: [], presetSubjectId: subjectId, presetChapterId: chapterId });
      setSection('quiz');
    }
  }

  function handleQuizFinish(results: QR[]) {
    setSubjects(prev => prev.map(s => {
      const draft = JSON.parse(JSON.stringify(s)) as Subject;
      for (const c of draft.chapters) {
        for (const it of c.items) {
          const r = results.find(rr => rr.itemId === it.id);
          if (r) {
            if (r.correct) {
              it.correct = (it.correct || 0) + 1;
              if (it.mastered < 2 && it.correct >= 2) it.mastered = Math.min(2, it.mastered + 1) as 0|1|2;
              else if (it.mastered < 1) it.mastered = 1;
            } else {
              it.wrong = (it.wrong || 0) + 1;
            }
            it.lastReviewedAt = Date.now();
          }
        }
      }
      return draft;
    }));
    setQuizState(q => ({ ...q, phase: 'result', results }));
  }

  function goSection(id: AppSection) {
    setOpenSubject(null);
    setSection(id);
    setQuizState({ phase: 'idle', config: null, pool: [], results: [] });
  }

  const lnbActive = openSubject ? `subject:${openSubject}` : section;
  const counts = { materials: subjects.length, today: todayReview.length, starred: totals.starred };
  const filteredSubjects = section === 'starred'
    ? subjects.filter(s => s.chapters.some(c => c.items.some(i => i.starred)))
    : subjects;

  let mainContent: React.ReactNode;

  if (quizState.phase === 'setup') {
    mainContent = (
      <QuizSetup subjects={subjects}
        presetSubjectId={quizState.presetSubjectId}
        presetChapterId={quizState.presetChapterId}
        onStart={({ pool, mode }) => setQuizState({ phase: 'running', config: { mode }, pool, results: [] })}
        onCancel={() => { setQuizState({ phase: 'idle', config: null, pool: [], results: [] }); setSection('dashboard'); }}
      />
    );
  } else if (quizState.phase === 'running') {
    mainContent = (
      <QuizRunner pool={quizState.pool} mode={quizState.config!.mode}
        onFinish={handleQuizFinish}
        onCancel={() => setQuizState({ phase: 'idle', config: null, pool: [], results: [] })}
      />
    );
  } else if (quizState.phase === 'result') {
    mainContent = (
      <QuizResult results={quizState.results} pool={quizState.pool}
        onRetry={() => setQuizState(q => ({ ...q, phase: 'running', results: [] }))}
        onReviewWrong={ids => {
          const wrongPool = quizState.pool.filter(p => ids.includes(p.item.id));
          setQuizState({ phase: 'running', config: quizState.config, pool: wrongPool, results: [] });
        }}
        onDone={() => { setQuizState({ phase: 'idle', config: null, pool: [], results: [] }); setSection('dashboard'); }}
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
        todayReview={todayReview} activity={DEFAULT_ACTIVITY} streakData={DEFAULT_STREAK_DAYS}
        onOpenSubject={id => { setOpenSubject(id); setSection('materials'); }}
        onStartQuiz={startQuiz} onAddClick={() => setAddOpen(true)}
        onGoMaterials={() => setSection('materials')}
      />
    );
  } else if (section === 'materials' || section === 'today' || section === 'starred') {
    mainContent = (
      <MaterialsList subjects={filteredSubjects} filter={filter} setFilter={setFilter}
        view={view} setView={setView} query={query}
        onOpenSubject={id => setOpenSubject(id)}
        onStartQuiz={startQuiz} onAddClick={() => setAddOpen(true)}
      />
    );
  } else if (section === 'quiz') {
    mainContent = (
      <QuizSetup subjects={subjects}
        onStart={({ pool, mode }) => setQuizState({ phase: 'running', config: { mode }, pool, results: [] })}
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
             setQuizState({ phase: 'idle', config: null, pool: [], results: [] });
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
