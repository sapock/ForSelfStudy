

interface KPICardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDir?: 'up' | 'down';
}

export function KPICard({ label, value, delta, deltaDir = 'up' }: KPICardProps) {
  return (
    <div className="card-surface kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className={`kpi-delta ${deltaDir}`}>
          {deltaDir === 'up' ? '↑' : '↓'} {delta}
        </div>
      )}
    </div>
  );
}
