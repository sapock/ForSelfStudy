/* Studia — 학습 앱 전용 컴포넌트
   OPUS-X 토큰만 사용. Window 프레임 / Star / Progress / Sparkbar / Modal / Card */

const { useState: useStateS, useEffect: useEffectS, useMemo: useMemoS, useRef: useRefS } = React;

/* ─── Windows 11-style 창 프레임 ─── */
function WindowFrame({ children, title = "Studia · 학습관" }) {
  return (
    <div className="winframe">
      <div className="wintitle">
        <div className="wintitle-left">
          <div className="winicon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="0.5" y="0.5" width="6" height="6" rx="1" fill="var(--purple-600)"/>
              <rect x="7.5" y="0.5" width="6" height="6" rx="1" fill="var(--purple-400)"/>
              <rect x="0.5" y="7.5" width="6" height="6" rx="1" fill="var(--purple-400)"/>
              <rect x="7.5" y="7.5" width="6" height="6" rx="1" fill="var(--purple-300)"/>
            </svg>
          </div>
          <div className="wintitle-text">{title}</div>
        </div>
        <div className="wincontrols">
          <button className="wc" aria-label="Minimize">
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5h10" stroke="currentColor" strokeWidth="1"/></svg>
          </button>
          <button className="wc" aria-label="Maximize">
            <svg width="10" height="10" viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" fill="none"/></svg>
          </button>
          <button className="wc close" aria-label="Close">
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1"/></svg>
          </button>
        </div>
      </div>
      <div className="winbody">{children}</div>
    </div>
  );
}

/* ─── 별표 토글 ─── */
function StarToggle({ on, onClick, size = 18 }) {
  return (
    <button className={`star ${on ? "on" : ""}`} onClick={onClick} aria-label={on ? "별표 해제" : "별표"}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </button>
  );
}

/* ─── 진도 바 ─── */
function ProgressBar({ value, total, tone = "primary", showLabel = true, height = 8 }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="progress">
      <div className="progress-track" style={{ height }}>
        <div className={`progress-fill tone-${tone}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <div className="progress-meta">
          <span>{value}<span className="mono">/{total}</span></span>
          <span className="mono">{pct}%</span>
        </div>
      )}
    </div>
  );
}

/* ─── 7일 활동 바 차트 ─── */
function SparkBars({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="spark">
      {data.map((d, i) => (
        <div key={i} className="spark-col">
          <div className="spark-bar-wrap">
            <div
              className={`spark-bar ${d.ok ? "" : "miss"}`}
              style={{ height: `${(d.count / max) * 100}%` }}
              title={`${d.count}개`}
            />
          </div>
          <div className="spark-label">{d.d}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── 도넛/링 차트 ─── */
function Ring({ value, total, size = 88, stroke = 10, color = "var(--purple-600)", label, sub }) {
  const pct = total > 0 ? value / total : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke="var(--gray-100)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${c * pct} ${c}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className="ring-center">
        <div className="ring-value">{label ?? `${Math.round(pct*100)}%`}</div>
        {sub && <div className="ring-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ─── 모달 ─── */
function Modal({ open, onClose, title, sub, children, footer, width = 560 }) {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="닫기">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ─── 토스트 ─── */
function Toast({ open, kind = "success", children }) {
  if (!open) return null;
  return (
    <div className={`toast ${kind}`}>
      <Icon name={kind === "success" ? "check-circle-2" : kind === "error" ? "x-circle" : "info"} size={16} />
      <span>{children}</span>
    </div>
  );
}

/* ─── Subject 카드 ─── */
function SubjectCard({ subject, onClick, onStartQuiz }) {
  const total = subject.chapters.reduce((s, c) => s + c.items.length, 0);
  const done = subject.chapters.reduce(
    (s, c) => s + c.items.filter(i => i.mastered === 2).length, 0
  );
  const starred = subject.chapters.reduce(
    (s, c) => s + c.items.filter(i => i.starred).length, 0
  );
  return (
    <div className="subj-card" onClick={onClick}>
      <div className="subj-card-head">
        <div className="subj-emoji" style={{ background: `var(--${subject.accent}-50)`, color: `var(--${subject.accent}-700)` }}>
          {subject.emoji}
        </div>
        <div className="subj-meta">
          <div className="subj-cat">{subject.category}</div>
          <div className="subj-name">{subject.name}</div>
        </div>
        <Badge tone={subject.accent === "purple" ? "primary" : subject.accent === "blue" ? "info" : subject.accent === "yellow" ? "warning" : "success"}>
          {subject.chapters.length}챕터
        </Badge>
      </div>
      <div className="subj-desc">{subject.description}</div>
      <ProgressBar value={done} total={total} tone={subject.accent} />
      <div className="subj-foot">
        <div className="row" style={{ gap: 14 }}>
          <span className="muted" style={{ fontSize: 12 }}>
            <Icon name="star" size={12} style={{ verticalAlign:"-2px", marginRight: 3, color: "var(--yellow-600)" }} />
            {starred}
          </span>
          <span className="muted" style={{ fontSize: 12 }}>
            <Icon name="list" size={12} style={{ verticalAlign:"-2px", marginRight: 3 }} />
            {total}개
          </span>
        </div>
        <button className="btn sm ghost" onClick={(e) => { e.stopPropagation(); onStartQuiz?.(subject); }}>
          <Icon name="play" size={12} />
          퀴즈
        </button>
      </div>
    </div>
  );
}

/* ─── 챕터 아코디언 (한 챕터) ─── */
function ChapterBlock({ chapter, onToggleStar, onCycleMastered, onQuiz, onEdit }) {
  const [open, setOpen] = useStateS(true);
  const total = chapter.items.length;
  const done = chapter.items.filter(i => i.mastered === 2).length;
  return (
    <div className="ch-block">
      <div className="ch-head" onClick={() => setOpen(o => !o)}>
        <div className="row" style={{ gap: 10, flex: 1, minWidth: 0 }}>
          <Icon name={open ? "chevron-down" : "chevron-right"} size={16} />
          <div className="ch-name">{chapter.name}</div>
          <Badge tone="neutral">{done}/{total}</Badge>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div style={{ width: 120 }}>
            <ProgressBar value={done} total={total} tone="primary" showLabel={false} height={6} />
          </div>
          <button className="btn sm outline" onClick={(e) => { e.stopPropagation(); onQuiz?.(chapter); }}>
            <Icon name="zap" size={12} />
            챕터 퀴즈
          </button>
        </div>
      </div>
      {open && (
        <div className="ch-items">
          {chapter.items.map(item => (
            <div key={item.id} className="item-row">
              <StarToggle on={item.starred} onClick={() => onToggleStar(item.id)} />
              <button
                className={`item-state s${item.mastered}`}
                onClick={() => onCycleMastered(item.id)}
                title={["미학습","학습중","완료"][item.mastered]}
              >
                {item.mastered === 2 && <Icon name="check" size={12} />}
                {item.mastered === 1 && <span className="dot-half" />}
              </button>
              <div className="item-main">
                <div className="item-term">{item.term}</div>
                <div className="item-def">{item.def}</div>
              </div>
              <div className="item-stats">
                {item.correct > 0 && <span className="stat ok">정 {item.correct}</span>}
                {item.wrong > 0   && <span className="stat ng">오 {item.wrong}</span>}
              </div>
              <button className="icon-btn" onClick={() => onEdit?.(item)} aria-label="편집">
                <Icon name="more-horizontal" size={16} />
              </button>
            </div>
          ))}
          <button className="add-item-row">
            <Icon name="plus" size={14} />
            이 챕터에 항목 추가
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  WindowFrame, StarToggle, ProgressBar, SparkBars, Ring,
  Modal, Toast, SubjectCard, ChapterBlock,
});
