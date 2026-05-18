/* Studia — 메인 App 컴포넌트 */

const { useState, useEffect, useMemo, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "purple",
  "density": "comfortable",
  "showStreak": true,
  "windowed": true
}/*EDITMODE-END*/;

function App() {
  const [section, setSection]   = useState("dashboard");      // dashboard | materials | quiz | stats | settings | trash
  const [openSubject, setOpenSubject] = useState(null);       // subjectId or null
  const [filter,  setFilter]    = useState("all");
  const [view,    setView]      = useState("grid");
  const [query,   setQuery]     = useState("");
  const [subjects, setSubjects] = useState(SUBJECTS);
  const [addOpen,  setAddOpen]  = useState(false);

  // Quiz state
  const [quizState, setQuizState] = useState({ phase: "idle", config: null, results: null, pool: null });
  // phase: idle | setup | running | result

  // Toast
  const [toast, setToast] = useState(null);
  function showToast(t, kind = "success") {
    setToast({ text: t, kind });
    setTimeout(() => setToast(null), 2400);
  }

  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Recreate icons after every render
  useEffect(() => { if (window.lucide) lucide.createIcons(); });

  // Apply density class
  useEffect(() => {
    document.body.classList.toggle("dense", tweaks.density === "dense");
  }, [tweaks.density]);

  // Compute totals
  const totals = useMemo(() => {
    let items = 0, mastered = 0, learning = 0, starred = 0, totalCorrect = 0, totalWrong = 0;
    for (const s of subjects) {
      for (const c of s.chapters) {
        for (const i of c.items) {
          items++;
          if (i.mastered === 2) mastered++;
          if (i.mastered === 1) learning++;
          if (i.starred) starred++;
          totalCorrect += i.correct;
          totalWrong   += i.wrong;
        }
      }
    }
    return { items, mastered, learning, starred, totalCorrect, totalWrong, totalAttempts: totalCorrect + totalWrong };
  }, [subjects]);

  const todayReview = useMemo(() => {
    const list = [];
    const NOW = Date.now();
    for (const s of subjects) {
      for (const c of s.chapters) {
        for (const i of c.items) {
          if (i.mastered !== 2 && (i.nextReviewAt == null || i.nextReviewAt <= NOW)) {
            list.push({ item: i, chapter: c, subject: s });
          }
        }
      }
    }
    return list.slice(0, 10);
  }, [subjects]);

  function updateSubject(id, mutator) {
    setSubjects(prev => prev.map(s => {
      if (s.id !== id) return s;
      const draft = JSON.parse(JSON.stringify(s));
      mutator(draft);
      return draft;
    }));
  }

  function handleCreate({ target, targetSub, subjectName, chapterName, emoji = "📚", items }) {
    const newItems = items.map(i => ({
      id: crypto.randomUUID().slice(0, 8),
      term: i.term, def: i.def,
      starred: false, mastered: 0, correct: 0, wrong: 0,
      lastReviewedAt: null, nextReviewAt: Date.now(),
    }));
    if (target === "existing" && targetSub) {
      setSubjects(prev => prev.map(s => {
        if (s.id !== targetSub) return s;
        return { ...s, chapters: [...s.chapters, { id: crypto.randomUUID().slice(0, 8), name: chapterName, items: newItems }] };
      }));
      showToast(`'${chapterName}' 챕터에 ${newItems.length}개 항목을 추가했어요`);
    } else {
      const newSubj = {
        id: crypto.randomUUID().slice(0, 8),
        name: subjectName, emoji, accent: "purple",
        category: "사용자 추가", description: "방금 생성한 학습 자료예요.",
        chapters: [{ id: crypto.randomUUID().slice(0, 8), name: chapterName, items: newItems }],
      };
      setSubjects(prev => [newSubj, ...prev]);
      showToast(`'${subjectName}' 과목이 추가되었어요`);
    }
  }

  function startQuiz(subjectId, chapterId) {
    if (subjectId === "today") {
      // Build pool from today's review
      const pool = todayReview.map(({ item, chapter, subject }) => ({ item, chapter, subject }));
      setQuizState({ phase: "running", config: { mode: "multiple-choice" }, pool, results: [] });
    } else if (subjectId === "random") {
      // 10 random items across all subjects
      const all = subjects.flatMap(s => s.chapters.flatMap(c => c.items.map(i => ({ item: i, chapter: c, subject: s }))));
      const pool = [...all].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuizState({ phase: "running", config: { mode: "multiple-choice" }, pool, results: [] });
    } else {
      setQuizState({ phase: "setup", presetSubjectId: subjectId, presetChapterId: chapterId });
      setSection("quiz");
    }
  }

  // ── Routing ────────────────────────────────────────
  let mainContent;
  if (quizState.phase === "setup") {
    mainContent = (
      <QuizSetup
        subjects={subjects}
        presetSubjectId={quizState.presetSubjectId}
        presetChapterId={quizState.presetChapterId}
        onStart={({ pool, mode }) => setQuizState({ phase: "running", config: { mode }, pool, results: [] })}
        onCancel={() => { setQuizState({ phase: "idle" }); setSection("dashboard"); }}
      />
    );
  } else if (quizState.phase === "running") {
    mainContent = (
      <QuizRunner
        pool={quizState.pool}
        mode={quizState.config.mode}
        onFinish={(results) => {
          // Apply results: increment correct/wrong and bump mastery for correct ones
          setSubjects(prev => prev.map(s => {
            const draft = JSON.parse(JSON.stringify(s));
            for (const c of draft.chapters) {
              for (const it of c.items) {
                const r = results.find(rr => rr.itemId === it.id);
                if (r) {
                  if (r.correct) {
                    it.correct = (it.correct || 0) + 1;
                    if (it.mastered < 2 && it.correct >= 2) it.mastered = Math.min(2, it.mastered + 1);
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
          setQuizState(q => ({ ...q, phase: "result", results }));
        }}
        onCancel={() => setQuizState({ phase: "idle" })}
      />
    );
  } else if (quizState.phase === "result") {
    mainContent = (
      <QuizResult
        results={quizState.results}
        pool={quizState.pool}
        onRetry={() => setQuizState(q => ({ ...q, phase: "running", results: [] }))}
        onReviewWrong={(ids) => {
          const wrongPool = quizState.pool.filter(p => ids.includes(p.item.id));
          setQuizState({ phase: "running", config: quizState.config, pool: wrongPool, results: [] });
        }}
        onDone={() => { setQuizState({ phase: "idle" }); setSection("dashboard"); }}
      />
    );
  } else if (openSubject) {
    const subj = subjects.find(s => s.id === openSubject);
    mainContent = (
      <SubjectDetail
        subject={subj}
        onBack={() => setOpenSubject(null)}
        onUpdate={updateSubject}
        onStartQuiz={startQuiz}
        onAddClick={() => setAddOpen(true)}
        query={query}
      />
    );
  } else if (section === "dashboard") {
    mainContent = (
      <Dashboard
        subjects={subjects}
        streakDays={6}
        totals={totals}
        todayReview={todayReview}
        activity={ACTIVITY}
        onOpenSubject={(id) => { setOpenSubject(id); setSection("materials"); }}
        onStartQuiz={startQuiz}
        onAddClick={() => setAddOpen(true)}
        onGoMaterials={() => setSection("materials")}
      />
    );
  } else if (section === "materials" || section === "today" || section === "starred") {
    let filtered = subjects;
    if (section === "starred") {
      filtered = subjects.filter(s => s.chapters.some(c => c.items.some(i => i.starred)));
    }
    mainContent = (
      <MaterialsList
        subjects={filtered}
        filter={filter} setFilter={setFilter}
        view={view} setView={setView}
        query={query}
        onOpenSubject={(id) => setOpenSubject(id)}
        onStartQuiz={startQuiz}
        onAddClick={() => setAddOpen(true)}
      />
    );
  } else if (section === "quiz") {
    mainContent = (
      <QuizSetup
        subjects={subjects}
        onStart={({ pool, mode }) => setQuizState({ phase: "running", config: { mode }, pool, results: [] })}
        onCancel={() => setSection("dashboard")}
      />
    );
  } else if (section === "stats") {
    mainContent = (
      <StatsScreen subjects={subjects} streakDays={6} totals={totals} />
    );
  } else {
    mainContent = (
      <div className="main-inner">
        <h1 className="studia-page-title">{section === "settings" ? "환경설정" : "휴지통"}</h1>
        <p className="studia-page-sub">이 화면은 프로토타입에서 비워둔 영역이에요.</p>
      </div>
    );
  }

  const inQuiz = quizState.phase !== "idle";

  // sidebar selection
  const lnbActive = openSubject ? `subject:${openSubject}` : section;

  const counts = {
    materials: subjects.length,
    today: todayReview.length,
    starred: totals.starred,
  };

  const shell = (
    <div className="studia-shell">
      <StudiaGNB
        section={section}
        onSection={(id) => { setOpenSubject(null); setSection(id); setQuizState({ phase: "idle" }); }}
        streakDays={6}
        searchValue={query}
        onSearch={setQuery}
        onAddClick={() => setAddOpen(true)}
      />
      <StudiaLNB
        active={lnbActive}
        subjects={subjects}
        counts={counts}
        onSelect={(key) => {
          setQuizState({ phase: "idle" });
          if (key.startsWith("subject:")) {
            setOpenSubject(key.slice("subject:".length));
            setSection("materials");
          } else {
            setOpenSubject(null);
            setSection(key);
          }
        }}
      />
      <main className="main">
        {mainContent}
      </main>

      <AddMaterialModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={handleCreate}
        subjects={subjects}
      />

      {toast && <Toast open={!!toast} kind={toast.kind}>{toast.text}</Toast>}

      <TweaksPanel title="Tweaks">
        <TweakSection label="모양새">
          <TweakRadio
            label="밀도"
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "comfortable", label: "보통" },
              { value: "dense",       label: "조밀" },
            ]}
          />
          <TweakRadio
            label="자료 보기"
            value={view}
            onChange={setView}
            options={[
              { value: "grid", label: "카드" },
              { value: "list", label: "리스트" },
            ]}
          />
        </TweakSection>
        <TweakSection label="창">
          <TweakToggle
            label="Windows 창 프레임"
            value={tweaks.windowed}
            onChange={(v) => setTweak("windowed", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );

  return tweaks.windowed ? <WindowFrame>{shell}</WindowFrame> : shell;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
