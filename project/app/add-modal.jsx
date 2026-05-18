/* Studia — 자료 추가 모달 (직접 입력 + AI 자동 생성) */

function AddMaterialModal({ open, onClose, onCreate, subjects }) {
  const [mode, setMode] = useStateS("ai");

  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} width={680}
           title="자료 추가"
           sub="새 과목을 만들거나 기존 과목에 항목을 추가할 수 있어요.">
      <div className="tabs-pill">
        <button className={mode === "ai" ? "on" : ""} onClick={() => setMode("ai")}>
          ✨ AI로 자동 생성
        </button>
        <button className={mode === "manual" ? "on" : ""} onClick={() => setMode("manual")}>
          직접 입력
        </button>
        <button className={mode === "import" ? "on" : ""} onClick={() => setMode("import")}>
          가져오기
        </button>
      </div>

      {mode === "ai"     && <AIGenForm onCreate={onCreate} onClose={onClose} subjects={subjects} />}
      {mode === "manual" && <ManualForm onCreate={onCreate} onClose={onClose} subjects={subjects} />}
      {mode === "import" && <ImportForm onClose={onClose} />}
    </Modal>
  );
}

/* ─── AI 생성 폼 ─── */
function AIGenForm({ onCreate, onClose, subjects }) {
  const [topic,     setTopic]     = useStateS("");
  const [count,     setCount]     = useStateS(12);
  const [level,     setLevel]     = useStateS("medium");
  const [withEx,    setWithEx]    = useStateS(true);
  const [target,    setTarget]    = useStateS("new");
  const [targetSub, setTargetSub] = useStateS(subjects[0]?.id);
  const [phase,     setPhase]     = useStateS("idle");  // idle | thinking | preview
  const [preview,   setPreview]   = useStateS([]);
  const [error,     setError]     = useStateS(null);

  async function generate() {
    if (!topic.trim()) return;
    setPhase("thinking");
    setError(null);
    try {
      const prompt = `You are a study assistant. Generate ${count} flashcards on the topic: "${topic}".
Level: ${level}. ${withEx ? "Include a short example or mnemonic in the definition where helpful." : ""}
Output STRICT JSON only with this schema, no markdown fences, no commentary:
{
  "subject": "한국어로 된 과목 이름",
  "chapter": "챕터 이름 (한국어)",
  "items": [
    { "term": "용어/문제 (한국어 또는 원어)", "def": "정의/답 (한국어, 2~3문장 이내)" }
  ]
}
Return Korean text where natural. Items should be concise and exam-worthy.`;

      const text = await window.claude.complete(prompt);
      // Try to parse JSON, stripping any wrapping fences just in case
      const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      let data;
      try { data = JSON.parse(cleaned); }
      catch (e) {
        const m = cleaned.match(/\{[\s\S]*\}/);
        data = m ? JSON.parse(m[0]) : null;
      }
      if (!data || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error("AI 응답을 해석하지 못했어요.");
      }
      setPreview({
        subject: data.subject || topic,
        chapter: data.chapter || "기본 챕터",
        items:   data.items,
      });
      setPhase("preview");
    } catch (e) {
      setError(e.message || "오류가 발생했어요.");
      setPhase("idle");
    }
  }

  function commit() {
    onCreate({
      target,
      targetSub,
      subjectName: preview.subject,
      chapterName: preview.chapter,
      items: preview.items,
    });
    onClose();
  }

  if (phase === "preview") {
    return (
      <div>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div>
            <div className="muted" style={{ font: "500 11px/14px var(--font-mono)", textTransform: "uppercase" }}>
              생성 결과 · {preview.items.length}개 항목
            </div>
            <div className="h-md" style={{ marginTop: 4 }}>{preview.subject} · {preview.chapter}</div>
          </div>
          <Button variant="ghost" size="md" leadingIcon="rotate-cw" onClick={generate}>다시 생성</Button>
        </div>
        <div style={{ maxHeight: 320, overflow: "auto", padding: 4 }}>
          {preview.items.map((it, i) => (
            <div key={i} className="ai-preview-item">
              <div className="t">{i + 1}. {it.term}</div>
              <div className="d">{it.def}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 16, marginTop: 12 }}>
          <label className="field-label">어디에 추가할까요?</label>
          <div className="row" style={{ gap: 8 }}>
            <Chip active={target === "new"} onClick={() => setTarget("new")}>새 과목으로</Chip>
            <Chip active={target === "existing"} onClick={() => setTarget("existing")}>기존 과목에</Chip>
          </div>
          {target === "existing" && (
            <select className="mini-select" style={{ width: "100%", height: 40, marginTop: 10 }}
                    value={targetSub} onChange={e => setTargetSub(e.target.value)}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
            </select>
          )}
        </div>

        <div className="row" style={{ gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
          <Button variant="outline" size="md" onClick={onClose}>취소</Button>
          <Button variant="solid-primary" size="md" leadingIcon="check" onClick={commit}>
            {preview.items.length}개 항목 추가
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <label className="field-label">학습할 주제</label>
        <textarea className="textarea" placeholder="예시: 정보처리기사 5과목 인터페이스 구현 핵심 개념 / TOEIC Part 5 빈출 동사 / 운영체제 동기화 기법"
                  value={topic} onChange={e => setTopic(e.target.value)} />
        <div className="muted" style={{ font: "400 11px/16px var(--font-sans)", marginTop: 4 }}>
          AI가 검색해서 학습 항목과 정의를 자동으로 만들어드려요.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div>
          <label className="field-label">난이도</label>
          <div className="row" style={{ gap: 6 }}>
            <Chip active={level === "easy"}   onClick={() => setLevel("easy")}>입문</Chip>
            <Chip active={level === "medium"} onClick={() => setLevel("medium")}>중간</Chip>
            <Chip active={level === "hard"}   onClick={() => setLevel("hard")}>심화</Chip>
          </div>
        </div>
        <div>
          <label className="field-label">생성 개수 · {count}개</label>
          <input type="range" min={5} max={30} step={1} value={count}
                 onChange={e => setCount(+e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={withEx} onChange={e => setWithEx(e.target.checked)} />
        <span style={{ font: "500 13px/20px var(--font-sans)", color: "var(--gray-700)" }}>예문·암기법 포함</span>
      </label>

      {error && (
        <div style={{ marginTop: 12, padding: 10, background: "var(--red-50)", color: "var(--red-700)", borderRadius: 8, fontSize: 13 }}>
          <Icon name="alert-triangle" size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          {error}
        </div>
      )}

      {phase === "thinking" && (
        <div className="ai-thinking" style={{ marginTop: 16 }}>
          <div className="ai-spinner" />
          AI가 학습 항목을 생성하고 있어요… 잠시만 기다려주세요.
        </div>
      )}

      <div className="row" style={{ gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
        <Button variant="outline" size="md" onClick={onClose} disabled={phase === "thinking"}>취소</Button>
        <Button variant="solid-primary" size="md" leadingIcon="sparkles"
                onClick={generate} disabled={phase === "thinking" || !topic.trim()}>
          AI로 생성
        </Button>
      </div>
    </div>
  );
}

/* ─── 직접 입력 폼 ─── */
function ManualForm({ onCreate, onClose, subjects }) {
  const [target,    setTarget]    = useStateS("new");
  const [targetSub, setTargetSub] = useStateS(subjects[0]?.id);
  const [subjName,  setSubjName]  = useStateS("");
  const [chName,    setChName]    = useStateS("");
  const [emoji,     setEmoji]     = useStateS("📚");
  const [items,     setItems]     = useStateS([{ term: "", def: "" }]);

  function add() { setItems([...items, { term: "", def: "" }]); }
  function setItem(i, key, v) {
    const next = [...items]; next[i] = { ...next[i], [key]: v }; setItems(next);
  }
  function removeItem(i) {
    setItems(items.filter((_, idx) => idx !== i));
  }
  function commit() {
    const validItems = items.filter(x => x.term.trim());
    if (validItems.length === 0) return;
    onCreate({
      target, targetSub,
      subjectName: subjName || "새 과목",
      chapterName: chName || "새 챕터",
      emoji,
      items: validItems,
    });
    onClose();
  }

  return (
    <div>
      <label className="field-label">어디에 추가할까요?</label>
      <div className="row" style={{ gap: 8, marginBottom: 12 }}>
        <Chip active={target === "new"}      onClick={() => setTarget("new")}>새 과목</Chip>
        <Chip active={target === "existing"} onClick={() => setTarget("existing")}>기존 과목에 챕터 추가</Chip>
      </div>

      {target === "new" ? (
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label className="field-label">이모지</label>
            <input className="text-input" value={emoji} onChange={e => setEmoji(e.target.value)} style={{ textAlign: "center", fontSize: 20 }} />
          </div>
          <div>
            <label className="field-label">과목 이름</label>
            <input className="text-input" value={subjName} onChange={e => setSubjName(e.target.value)} placeholder="예: SQLD · SQL 개발자" />
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">기존 과목</label>
          <select className="mini-select" style={{ width: "100%", height: 40 }}
                  value={targetSub} onChange={e => setTargetSub(e.target.value)}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
          </select>
        </div>
      )}

      <label className="field-label">챕터 이름</label>
      <input className="text-input" value={chName} onChange={e => setChName(e.target.value)} placeholder="예: 1과목 · 데이터 모델링" />

      <div className="row between" style={{ marginTop: 18, marginBottom: 8 }}>
        <label className="field-label" style={{ margin: 0 }}>항목 · {items.length}개</label>
        <Button variant="ghost" size="sm" leadingIcon="plus" onClick={add}>항목 추가</Button>
      </div>

      <div style={{ maxHeight: 280, overflow: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 28px", gap: 6, alignItems: "start" }}>
            <input className="text-input" placeholder="용어/문제"
                   value={it.term} onChange={e => setItem(i, "term", e.target.value)} />
            <input className="text-input" placeholder="정의/답"
                   value={it.def} onChange={e => setItem(i, "def", e.target.value)} />
            <button className="icon-btn" onClick={() => removeItem(i)} aria-label="삭제">
              <Icon name="trash-2" size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="row" style={{ gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
        <Button variant="outline" size="md" onClick={onClose}>취소</Button>
        <Button variant="solid-primary" size="md" leadingIcon="check" onClick={commit}>
          저장
        </Button>
      </div>
    </div>
  );
}

/* ─── 가져오기 폼 (스텁) ─── */
function ImportForm({ onClose }) {
  return (
    <div>
      <div style={{ border: "2px dashed var(--gray-300)", borderRadius: 12, padding: 36, textAlign: "center", marginBottom: 12 }}>
        <Icon name="upload-cloud" size={32} style={{ color: "var(--gray-400)", marginBottom: 8 }} />
        <div style={{ font: "600 14px/22px var(--font-sans)", color: "var(--gray-800)", marginBottom: 4 }}>
          CSV · 엑셀 · Anki(.apkg) · Markdown 파일을 끌어다 놓으세요
        </div>
        <div className="muted" style={{ font: "400 12px/18px var(--font-sans)" }}>
          또는 클릭해서 파일을 선택할 수 있어요
        </div>
        <Button variant="outline" size="md" leadingIcon="folder" style={{ marginTop: 12 }}>파일 선택</Button>
      </div>
      <div className="muted" style={{ font: "400 12px/18px var(--font-sans)" }}>
        가져온 자료는 즉시 챕터로 정리되며, 항목별로 별표·진도 상태가 보존돼요.
      </div>
      <div className="row" style={{ gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
        <Button variant="outline" size="md" onClick={onClose}>닫기</Button>
      </div>
    </div>
  );
}

window.AddMaterialModal = AddMaterialModal;
