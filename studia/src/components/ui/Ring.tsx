

interface RingProps {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sub?: string;
}

export function Ring({ value, total, size = 88, stroke = 10, color = 'var(--purple-600)', label, sub }: RingProps) {
  const pct = total > 0 ? value / total : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <div className="ring-center">
        <div className="ring-value">{label ?? `${Math.round(pct*100)}%`}</div>
        {sub && <div className="ring-sub">{sub}</div>}
      </div>
    </div>
  );
}
