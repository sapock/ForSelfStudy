/* Studia — 퀴즈 모드 + 결과 화면 + 플래시카드 */

function QuizSetup({ subjects, onStart, onCancel, presetSubjectId, presetChapterId }) {
  const [subjectId, setSubjectId] = useStateS(presetSubjectId || "all");
  const [chapterId, setChapterId] = useStateS(presetChapterId || "all");
  const [count, setCount] = useStateS(10);
  const [mode, setMode] = useStateS("multiple-choice");  // multiple-choice | flashcard
  const [scope, setScope] = useStateS("all");            // all | starred | wrong | unlearned

  const currentSubject = subjects.find(s => s.id === subjectId);

  function start() {
    let pool = [];
    const subjectsInScope = subjectId === "all" ? subjects : [currentSubject];
    for (const s of subjectsInScope) {
      const chapters = chapterId === "all" ? s.chapters : s.chapters.filter(c => c.id === chapterId);
      for (const c of chapters) {
        for (const i of c.items) {
          pool.push({ item: i, chapter: c, subject: s });
        }
      }
    }
    if (scope === "starred")   pool = pool.filter(p => p.item.starred);
    if (scope === "wrong")     pool = pool.filter(p => p.item.wrong > 0);
    if (scope === "unlearned") pool = pool.filter(p => p.item.mastered === 0);

    pool = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    onStart({ pool, mode });
  }

  return (
    <div className="quiz-shell">
      <div className="row between" style={{ marginBottom: 12 }}>
        <h1 className="studia-page-title">퀴즈 시작</h1>
        <Button variant="ghost" size="md" onClick={onCancel} leadingIcon="x">취소</Button>
      </div>
      <p className="studia-page-sub" style={{ marginBottom: 24 }}>
        랜덤 출제 · 객관식 또는 플래시카드 · 결과는 정답률과 다음 복습일에 반영돼요.
      </p>

      <div className="card-surface" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label className="field-label">과목</label>
          <select className="mini-select" style={{ width: "100%", height: 40 }}
                  value={subjectId} onChange={e => { setSubjectId(e.target.value); setChapterId("all"); }}>
            <option value="all">전체 과목</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
        </div>

        {currentSubject && (
          <div>
            <label className="field-label">챕터</label>
            <select className="mini-select" style={{ width: "100%", height: 40 }}
                    value={chapterId} onChange={e => setChapterId(e.target.value)}>
              <option value="all">전체 챕터</option>
              {currentSubject.chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="field-label">출제 범위</label>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <Chip active={scope === "all"}       onClick={() => setScope("all")}>전체</Chip>
            <Chip active={scope === "starred"}   onClick={() => setScope("starred")}>⭐ 별표</Chip>
            <Chip active={scope === "wrong"}     onClick={() => setScope("wrong")}>틀린 적 있음</Chip>
            <Chip active={scope === "unlearned"} onClick={() => setScope("unlearned")}>미학습</Chip>
          </div>
        </div>

        <div>
          <label className="field-label">문항 수 · {count}개</label>
          <input type="range" min={5} max={30} step={5} value={count}
                 onChange={e => setCount(+e.target.value)}
                 style={{ width: "100%" }} />
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono muted" style={{ fontSize: 11 }}>5개</span>
            <span className="mono muted" style={{ fontSize: 11 }}>30개</span>
          </div>
        </div>

        <div>
          <label className="field-label">퀴즈 형식</label>
          <div className="row" style={{ gap: 8 }}>
            <Chip active={mode === "multiple-choice"} onClick={() => setMode("multiple-choice")}>
              <Icon name="list-checks" size={12} style={{ marginRight: 4 }} />객관식 4지선다
            </Chip>
            <Chip active={mode === "flashcard"} onClick={() => setMode("flashcard")}>
              <Icon name="layers" size={12} style={{ marginRight: 4 }} />플래시카드
            </Chip>
          </div>
        </div>
      </div>

      <div className="row" style={{ gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
        <Button variant="outline" size="lg" onClick={onCancel}>취소</Button>
        <Button variant="solid-primary" size="lg" leadingIcon="play" onClick={start}>
          시작하기
        </Button>
      </div>
    </div>
  );
}

/* ─── 객관식 퀴즈 진행 ─── */
function QuizRunner({ pool, mode, onFinish, onCancel }) {
  const [idx, setIdx] = useStateS(0);
  const [selected, setSelected] = useStateS(null);  // selected choice index
  const [revealed, setRevealed] = useStateS(false);
  const [results, setResults] = useStateS([]);      // [{itemId, correct, ms}]
  const [flipped, setFlipped] = useStateS(false);
  const startRef = useRefS(Date.now());

  const current = pool[idx];
  if (!current) {
    return (
      <div className="quiz-shell">
        <div className="card-surface" style={{ padding: 48, textAlign: "center" }}>
          <Icon name="info" size={28} style={{ color: "var(--gray-400)" }} />
          <p style={{ marginTop: 8 }}>출제할 항목이 없어요. 다른 범위로 시도해보세요.</p>
          <Button variant="outline" size="md" onClick={onCancel} style={{ marginTop: 12 }}>돌아가기</Button>
        </div>
      </div>
    );
  }

  // Build 4 choices for multiple choice
  const choices = useMemoS(() => {
    if (mode !== "multiple-choice") return [];
    const wrong = pool.filter((_, i) => i !== idx)
                      .map(p => p.item.def)
                      .sort(() => Math.random() - 0.5)
                      .slice(0, 3);
    const all = [current.item.def, ...wrong].sort(() => Math.random() - 0.5);
    return all.map(d => ({ def: d, isCorrect: d === current.item.def }));
  }, [idx]);

  function pick(i) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    const ms = Date.now() - startRef.current;
    const correct = choices[i].isCorrect;
    setResults(r => [...r, { itemId: current.item.id, correct, ms, subjectId: current.subject.id }]);
  }

  function next() {
    if (idx + 1 >= pool.length) {
      onFinish(results);
    } else {
      setIdx(idx + 1);
      setSelected(null);
      setRevealed(false);
      setFlipped(false);
      startRef.current = Date.now();
    }
  }

  function flashGrade(grade) {
    // grade: 'wrong' | 'hard' | 'good'
    const correct = grade !== "wrong";
    const ms = Date.now() - startRef.current;
    setResults(r => [...r, { itemId: current.item.id, correct, ms, subjectId: current.subject.id, grade }]);
    if (idx + 1 >= pool.length) {
      onFinish([...results, { itemId: current.item.id, correct, ms, subjectId: current.subject.id, grade }]);
    } else {
      setIdx(idx + 1);
      setFlipped(false);
      startRef.current = Date.now();
    }
  }

  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <Button variant="ghost" size="md" leadingIcon="x" onClick={onCancel}>중단</Button>
        <div className="quiz-progress-line">
          <ProgressBar value={idx + (revealed ? 1 : 0)} total={pool.length} tone="primary" showLabel={false} height={6} />
          <div className="row between" style={{ marginTop: 4 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--gray-500)" }}>{idx + 1} / {pool.length}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--green-700)" }}>
              정 {results.filter(r => r.correct).length} · 오 {results.filter(r => !r.correct).length}
            </span>
          </div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {mode === "multiple-choice" ? (
        <div className="quiz-card">
          <div className="quiz-kicker">
            {current.subject.emoji} {current.subject.name} · {current.chapter.name}
          </div>
          <div className="quiz-question">{current.item.term}</div>
          <div className="quiz-choices">
            {choices.map((c, i) => {
              const letter = ["A","B","C","D"][i];
              let cls = "quiz-choice";
              if (revealed && c.isCorrect)    cls += " correct";
              else if (revealed && i === selected) cls += " wrong";
              if (revealed) cls += " disabled";
              return (
                <button key={i} className={cls} onClick={() => pick(i)} disabled={revealed}>
                  <span className="letter">{letter}</span>
                  <span>{c.def}</span>
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="quiz-feedback">
              <b>{choices[selected]?.isCorrect ? "✓ 정답이에요!" : "✗ 오답이에요."}</b>
              {!choices[selected]?.isCorrect && (
                <div style={{ marginTop: 4 }}>정답: {current.item.def}</div>
              )}
            </div>
          )}

          <div className="quiz-foot">
            <div className="row" style={{ gap: 8 }}>
              <StarToggle on={current.item.starred} onClick={() => {}} />
              <span className="muted" style={{ fontSize: 12 }}>중요 표시</span>
            </div>
            <Button variant="solid-primary" size="lg"
                    trailingIcon={idx + 1 >= pool.length ? "check" : "arrow-right"}
                    disabled={!revealed} onClick={next}>
              {idx + 1 >= pool.length ? "결과 보기" : "다음 문제"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="quiz-card">
          <div className="quiz-kicker">
            {current.subject.emoji} {current.subject.name} · {current.chapter.name}
          </div>
          <div className={`flash-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)} style={{ marginTop: 20 }}>
            <div className="flash-inner">
              <div className="flash-face front">
                <div className="ft">{current.item.term}</div>
                <div className="flash-hint">클릭하면 뒷면 ↻</div>
              </div>
              <div className="flash-face back">
                <div className="fd">{current.item.def}</div>
                <div className="flash-hint">기억나셨나요? ↻</div>
              </div>
            </div>
          </div>

          <div className="quiz-foot">
            {!flipped ? (
              <>
                <div className="muted" style={{ fontSize: 13 }}>카드를 클릭하면 뒷면이 보여요</div>
                <Button variant="outline" size="lg" onClick={() => setFlipped(true)}>
                  뒷면 보기
                </Button>
              </>
            ) : (
              <div className="row" style={{ gap: 8, width: "100%", justifyContent: "space-between" }}>
                <span className="muted" style={{ fontSize: 13 }}>스스로 채점해주세요</span>
                <div className="row" style={{ gap: 8 }}>
                  <Button variant="outline" size="md" onClick={() => flashGrade("wrong")} style={{ color: "var(--red-700)", borderColor: "var(--red-300)" }}>
                    <Icon name="x" size={14} /> 모름
                  </Button>
                  <Button variant="outline" size="md" onClick={() => flashGrade("hard")} style={{ color: "var(--yellow-700)", borderColor: "var(--yellow-300)" }}>
                    <Icon name="meh" size={14} /> 애매
                  </Button>
                  <Button variant="solid-primary" size="md" onClick={() => flashGrade("good")}>
                    <Icon name="check" size={14} /> 알았음
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 결과 화면 ─── */
function QuizResult({ results, pool, onRetry, onDone, onReviewWrong }) {
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct = Math.round((correct / total) * 100);
  const avgMs = results.length ? Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length / 100) / 10 : 0;
  const wrong = results.filter(r => !r.correct);

  const message =
    pct === 100 ? "완벽해요! 다음 챕터로 넘어가도 좋아요." :
    pct >= 80   ? "잘 하셨어요! 틀린 문제만 다시 풀어볼까요?" :
    pct >= 60   ? "괜찮은 출발이에요. 별표로 표시하고 복습해보세요." :
                  "조금 더 익숙해질 시간이 필요해요. 플래시카드로 복습해보세요.";

  return (
    <div className="quiz-shell">
      <div className="result-card">
        <div className="result-ring">
          <Ring value={correct} total={total} size={140} stroke={14}
                color={pct >= 80 ? "var(--green-600)" : pct >= 60 ? "var(--yellow-600)" : "var(--red-600)"}
                label={`${pct}%`} sub={`${correct}/${total}`} />
        </div>
        <h2 className="studia-page-title" style={{ fontSize: 24, marginBottom: 4 }}>
          {pct === 100 ? "🎉 만점!" : "수고하셨어요"}
        </h2>
        <p className="studia-page-sub" style={{ maxWidth: 420, margin: "0 auto" }}>{message}</p>

        <div className="result-grid">
          <div className="result-stat">
            <div className="v" style={{ color: "var(--green-700)" }}>{correct}</div>
            <div className="l">정답</div>
          </div>
          <div className="result-stat">
            <div className="v" style={{ color: "var(--red-700)" }}>{total - correct}</div>
            <div className="l">오답</div>
          </div>
          <div className="result-stat">
            <div className="v">{avgMs}<span style={{ fontSize: 13 }}>초</span></div>
            <div className="l">문항 평균</div>
          </div>
        </div>

        {wrong.length > 0 && (
          <div style={{ marginTop: 16, textAlign: "left" }}>
            <h3 className="h-md" style={{ marginBottom: 8 }}>틀린 항목 ({wrong.length}개)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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

        <div className="row" style={{ gap: 8, justifyContent: "center", marginTop: 24 }}>
          {wrong.length > 0 && (
            <Button variant="outline" size="lg" leadingIcon="rotate-ccw" onClick={() => onReviewWrong(wrong.map(w => w.itemId))}>
              틀린 것만 다시
            </Button>
          )}
          <Button variant="outline" size="lg" leadingIcon="repeat" onClick={onRetry}>
            다시 풀기
          </Button>
          <Button variant="solid-primary" size="lg" leadingIcon="check" onClick={onDone}>
            완료
          </Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { QuizSetup, QuizRunner, QuizResult });
