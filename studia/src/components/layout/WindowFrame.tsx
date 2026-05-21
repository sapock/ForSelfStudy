

interface WindowFrameProps {
  children: React.ReactNode;
  title?: string;
}

export function WindowFrame({ children, title = 'Studia · 학습관' }: WindowFrameProps) {
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
