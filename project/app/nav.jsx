/* Studia — Global &amp; Local Navigation (학습관 브랜딩) */

function StudiaGNB({ section, onSection, streakDays, onSearch, searchValue, onAddClick }) {
  const items = [
    { id: "dashboard",  label: "대시보드" },
    { id: "materials",  label: "학습 자료" },
    { id: "quiz",       label: "퀴즈" },
    { id: "stats",      label: "통계" },
  ];
  return (
    <header className="gnb">
      <div className="brand-studia">
        <span className="logo-mark">S</span>
        Studia
        <span className="ko">· 학습관</span>
      </div>
      <nav className="gnb-nav" style={{ marginLeft: 12 }}>
        {items.map(it => (
          <a
            key={it.id}
            href="#"
            className={section === it.id ? "on" : ""}
            onClick={(e) => { e.preventDefault(); onSection?.(it.id); }}
          >{it.label}</a>
        ))}
      </nav>
      <div className="gnb-right">
        <div className="gnb-search" style={{ width: 280 }}>
          <Icon name="search" size={16} color="var(--gray-400)" />
          <input
            placeholder="자료·챕터·항목 검색…"
            value={searchValue || ""}
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <span className="muted" style={{ font: "500 11px/16px var(--font-mono)" }}>⌘ K</span>
        </div>
        <div className="streak-chip" title={`연속 학습 ${streakDays}일`}>
          <Icon name="flame" size={14} />
          <span className="num">{streakDays}</span>일
        </div>
        <Button variant="solid-primary" size="md" leadingIcon="plus" onClick={onAddClick}>자료 추가</Button>
        <IconButton name="bell" label="알림" />
        <Avatar initials="나" size="md" />
      </div>
    </header>
  );
}

function StudiaLNB({ active, onSelect, subjects, counts, pinned }) {
  const general = [
    { id: "dashboard", label: "대시보드", icon: "layout-dashboard" },
    { id: "materials", label: "모든 자료", icon: "library", count: counts.materials },
    { id: "today",     label: "오늘 복습", icon: "calendar-check", count: counts.today, badge: "primary" },
    { id: "starred",   label: "별표",     icon: "star", count: counts.starred },
    { id: "quiz",      label: "퀴즈",     icon: "zap" },
    { id: "stats",     label: "통계",     icon: "bar-chart-3" },
  ];
  return (
    <aside className="lnb">
      <div className="lnb-section">학습</div>
      {general.map(it => (
        <div
          key={it.id}
          className={`lnb-item ${active === it.id ? "on" : ""}`}
          onClick={() => onSelect?.(it.id)}
        >
          <span className="ic"><Icon name={it.icon} size={16} /></span>
          {it.label}
          {typeof it.count === "number" && (
            <span className="count">{it.count}</span>
          )}
        </div>
      ))}

      <div className="lnb-section">내 과목</div>
      {subjects.map(s => (
        <div
          key={s.id}
          className={`lnb-item ${active === `subject:${s.id}` ? "on" : ""}`}
          onClick={() => onSelect?.(`subject:${s.id}`)}
          title={s.name}
        >
          <span className="ic" style={{ fontSize: 14 }}>{s.emoji}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{s.name}</span>
        </div>
      ))}

      <div className="lnb-section">설정</div>
      <div className={`lnb-item ${active === "settings" ? "on" : ""}`} onClick={() => onSelect?.("settings")}>
        <span className="ic"><Icon name="settings" size={16} /></span>
        환경설정
      </div>
      <div className={`lnb-item ${active === "trash" ? "on" : ""}`} onClick={() => onSelect?.("trash")}>
        <span className="ic"><Icon name="trash-2" size={16} /></span>
        휴지통
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--gray-100)", marginTop: 12 }}>
        <div className="muted" style={{ font: "500 11px/14px var(--font-mono)", marginBottom: 6 }}>로컬 저장소</div>
        <div style={{ font: "500 12px/16px var(--font-sans)", color: "var(--gray-700)" }}>
          {counts.materials}개 자료 · 동기화 안 됨
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { StudiaGNB, StudiaLNB });
