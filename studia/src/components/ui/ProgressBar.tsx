

interface ProgressBarProps {
  value: number;
  total: number;
  tone?: string;
  showLabel?: boolean;
  height?: number;
}

export function ProgressBar({ value, total, tone = 'primary', showLabel = true, height = 8 }: ProgressBarProps) {
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
