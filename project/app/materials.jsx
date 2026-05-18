/* Studia — 학습 자료 목록 + 과목 상세 화면 */

function MaterialsList({ subjects, filter, setFilter, view, setView, query, onOpenSubject, onStartQuiz, onAddClick }) {
  const filtered = subjects.filter(s => {
    const total = s.chapters.reduce((sum, c) => sum + c.items.length, 0);
    const done  = s.chapters.reduce((sum, c) => sum + c.items.filter(i => i.mastered === 2).length, 0);
    if (filter === "in-progress" && (done === 0 || done === total)) return false;
    if (filter === "completed"   && done !== total) return false;
    if (filter === "starred")    {
      const hasStar = s.chapters.some(c => c.items.some(i => i.starred));
      if (!hasStar) return false;
    }
    if (query) {
      const q = query.toLowerCase();
      const hit = s.name.toLowerCase().includes(q)
        || s.description.toLowerCase().includes(q)
        || s.chapters.some(c => c.name.toLowerCase().includes(q)
            || c.items.some(i => i.term.toLowerCase().includes(q) || i.def.toLowerCase().includes(q)));
      if (!hit) return false;
    }
    return true;
  });

  const filters = [
    { id: "all",         label: "전체",     count: subjects.length },
    { id: "in-progress", label: "진행 중" },
    { id: "completed",   label: "완료" },
    { id: "starred",     label: "별표 포함" },
  ];

  return (
    <div className="main-inner">
      <div className="studia-page-header">
        <div>
          <h1 className="studia-page-title">학습 자료</h1>
          <p className="studia-page-sub">총 {subjects.length}개 과목 · 카테고리별 정리, 챕터별 진도 확인</p>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="md" leadingIcon="download">내보내기</Button>
          <Button variant="solid-primary" size="md" leadingIcon="plus" onClick={onAddClick}>
            자료 추가
          </Button>
        </div>
      </div>

      <div className="filter-bar">
        {filters.map(f => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}{typeof f.count === "number" && <span style={{ color: "var(--gray-400)", marginLeft: 4 }}>{f.count}</span>}
          </Chip>
        ))}
        <span style={{ flex: 1 }} />
        <select className="mini-select">
          <option>최근 학습순</option>
          <option>이름순</option>
          <option>진도 낮은 순</option>
          <option>별표 많은 순</option>
        </select>
        <div style={{ display: "inline-flex", border: "1px solid var(--gray-300)", borderRadius: 8, padding: 2 }}>
          <button onClick={() => setView("grid")}
                  className="icon-btn"
                  style={{ background: view === "grid" ? "var(--gray-100)" : "transparent", borderRadius: 6 }}>
            <Icon name="layout-grid" size={16} />
          </button>
          <button onClick={() => setView("list")}
                  className="icon-btn"
                  style={{ background: view === "list" ? "var(--gray-100)" : "transparent", borderRadius: 6 }}>
            <Icon name="list" size={16} />
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map(s => (
            <SubjectCard key={s.id} subject={s}
                         onClick={() => onOpenSubject(s.id)}
                         onStartQuiz={() => onStartQuiz(s.id)} />
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
              <th>진도</th>
              <th>별표</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const total = s.chapters.reduce((sum, c) => sum + c.items.length, 0);
              const done  = s.chapters.reduce((sum, c) => sum + c.items.filter(i => i.mastered === 2).length, 0);
              const starred = s.chapters.reduce((sum, c) => sum + c.items.filter(i => i.starred).length, 0);
              return (
                <tr key={s.id} onClick={() => onOpenSubject(s.id)} style={{ cursor: "pointer" }}>
                  <td><span style={{ fontSize: 18 }}>{s.emoji}</span></td>
                  <td><span className="name">{s.name}</span><div className="muted" style={{ fontSize: 11 }}>{s.description}</div></td>
                  <td>{s.category}</td>
                  <td>{s.chapters.length}</td>
                  <td style={{ width: 200 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <ProgressBar value={done} total={total} tone={s.accent} showLabel={false} height={6} />
                      <span className="mono" style={{ fontSize: 11, color: "var(--gray-500)" }}>{done}/{total}</span>
                    </div>
                  </td>
                  <td>
                    <Icon name="star" size={12} style={{ color: "var(--yellow-500)", verticalAlign: "-2px", marginRight: 4 }} />
                    {starred}
                  </td>
                  <td>
                    <Button variant="outline" size="sm" leadingIcon="play">학습</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {filtered.length === 0 && (
        <div className="card-surface" style={{ padding: 64, textAlign: "center", color: "var(--gray-500)" }}>
          <Icon name="search-x" size={32} style={{ color: "var(--gray-300)", marginBottom: 8 }} />
          <div style={{ font: "600 16px/24px var(--font-sans)", color: "var(--gray-700)", marginBottom: 4 }}>
            결과가 없어요
          </div>
          <div>다른 필터나 키워드로 시도해보세요.</div>
        </div>
      )}
    </div>
  );
}

/* ─── 과목 상세 ─── */
function SubjectDetail({ subject, onBack, onUpdate, onStartQuiz, onAddClick, query }) {
  const [tab, setTab] = useStateS("chapters");

  if (!subject) return null;

  const totalItems = subject.chapters.reduce((s, c) => s + c.items.length, 0);
  const doneItems  = subject.chapters.reduce((s, c) => s + c.items.filter(i => i.mastered === 2).length, 0);
  const starredItems = subject.chapters.reduce((s, c) => s + c.items.filter(i => i.starred).length, 0);
  const learningItems = subject.chapters.reduce((s, c) => s + c.items.filter(i => i.mastered === 1).length, 0);

  function toggleStar(itemId) {
    onUpdate(subject.id, draft => {
      for (const c of draft.chapters) {
        for (const i of c.items) {
          if (i.id === itemId) { i.starred = !i.starred; return; }
        }
      }
    });
  }
  function cycleMastered(itemId) {
    onUpdate(subject.id, draft => {
      for (const c of draft.chapters) {
        for (const i of c.items) {
          if (i.id === itemId) { i.mastered = (i.mastered + 1) % 3; return; }
        }
      }
    });
  }

  const allItems = subject.chapters.flatMap(c => c.items.map(i => ({ item: i, chapter: c })));
  const filteredAllItems = query
    ? allItems.filter(({ item }) => item.term.toLowerCase().includes(query.toLowerCase())
                                 || item.def.toLowerCase().includes(query.toLowerCase()))
    : allItems;
  const starredOnly = allItems.filter(({ item }) => item.starred);

  return (
    <div className="main-inner">
      {/* Breadcrumb */}
      <Breadcrumb items={["학습 자료", subject.name]} />

      {/* Header */}
      <div className="page-header">
        <div className="row" style={{ gap: 16, alignItems: "center" }}>
          <div className="subj-emoji" style={{
            width: 56, height: 56, fontSize: 26,
            background: `var(--${subject.accent}-50)`,
            color: `var(--${subject.accent}-700)`,
            borderRadius: 12,
          }}>{subject.emoji}</div>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 4 }}>
              <Badge tone="neutral">{subject.category}</Badge>
              <Badge tone={subject.accent === "purple" ? "primary" : subject.accent === "blue" ? "info" : subject.accent === "yellow" ? "warning" : "success"}>
                {subject.chapters.length}챕터
              </Badge>
            </div>
            <h1 className="studia-page-title" style={{ fontSize: 30, lineHeight: "38px" }}>{subject.name}</h1>
            <p className="studia-page-sub">{subject.description}</p>
          </div>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="md" leadingIcon="pencil">편집</Button>
          <Button variant="outline" size="md" leadingIcon="plus" onClick={onAddClick}>챕터 추가</Button>
          <Button variant="solid-primary" size="md" leadingIcon="play" onClick={() => onStartQuiz(subject.id)}>
            전체 퀴즈 시작
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard label="전체 항목" value={String(totalItems)} delta={`${subject.chapters.length}챕터`} deltaDir="up" />
        <KPICard label="완료" value={String(doneItems)} delta={`${Math.round((doneItems/totalItems)*100)}%`} deltaDir="up" />
        <KPICard label="학습 중" value={String(learningItems)} delta="우선 복습" deltaDir="up" />
        <KPICard label="별표" value={String(starredItems)} delta="중요 표시" deltaDir="up" />
      </div>

      <Tabs
        items={[
          { id: "chapters", label: "챕터별", count: subject.chapters.length },
          { id: "all",      label: "모든 항목", count: totalItems },
          { id: "starred",  label: "별표만", count: starredItems },
          { id: "notes",    label: "메모" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "chapters" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {subject.chapters.map(c => (
            <ChapterBlock key={c.id} chapter={c}
                          onToggleStar={toggleStar}
                          onCycleMastered={cycleMastered}
                          onQuiz={() => onStartQuiz(subject.id, c.id)} />
          ))}
          <button className="btn outline md" style={{ alignSelf: "flex-start", marginTop: 8 }}>
            <Icon name="plus" size={16} />
            챕터 추가
          </button>
        </div>
      )}

      {tab === "all" && (
        <div className="ch-block">
          <div className="ch-items">
            {filteredAllItems.map(({ item, chapter }) => (
              <div key={item.id} className="item-row">
                <StarToggle on={item.starred} onClick={() => toggleStar(item.id)} />
                <button className={`item-state s${item.mastered}`}
                        onClick={() => cycleMastered(item.id)}
                        title={["미학습","학습중","완료"][item.mastered]}>
                  {item.mastered === 2 && <Icon name="check" size={12} />}
                  {item.mastered === 1 && <span className="dot-half" />}
                </button>
                <div className="item-main">
                  <div className="row" style={{ gap: 6, marginBottom: 2 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--gray-500)" }}>{chapter.name}</span>
                  </div>
                  <div className="item-term">{item.term}</div>
                  <div className="item-def">{item.def}</div>
                </div>
                <div className="item-stats">
                  {item.correct > 0 && <span className="stat ok">정 {item.correct}</span>}
                  {item.wrong > 0   && <span className="stat ng">오 {item.wrong}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "starred" && (
        <div className="ch-block">
          <div className="ch-items">
            {starredOnly.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: "var(--gray-500)" }}>
                <Icon name="star" size={28} style={{ color: "var(--gray-300)", marginBottom: 8 }} />
                <div>별표 표시한 항목이 없어요. 항목 옆 ⭐로 표시해보세요.</div>
              </div>
            ) : starredOnly.map(({ item, chapter }) => (
              <div key={item.id} className="item-row">
                <StarToggle on={item.starred} onClick={() => toggleStar(item.id)} />
                <button className={`item-state s${item.mastered}`}
                        onClick={() => cycleMastered(item.id)}>
                  {item.mastered === 2 && <Icon name="check" size={12} />}
                  {item.mastered === 1 && <span className="dot-half" />}
                </button>
                <div className="item-main">
                  <span className="mono" style={{ fontSize: 11, color: "var(--gray-500)" }}>{chapter.name}</span>
                  <div className="item-term">{item.term}</div>
                  <div className="item-def">{item.def}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="card-surface" style={{ padding: 64, textAlign: "center", color: "var(--gray-500)" }}>
          <Icon name="notebook" size={32} style={{ color: "var(--gray-300)", marginBottom: 8 }} />
          <div style={{ font: "600 16px/24px var(--font-sans)", color: "var(--gray-700)", marginBottom: 4 }}>
            메모가 비어있어요
          </div>
          <div>이 과목에 대한 개인 메모를 자유롭게 작성할 수 있어요.</div>
          <Button variant="outline" size="md" leadingIcon="plus" style={{ marginTop: 16 }}>메모 작성</Button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { MaterialsList, SubjectDetail });
