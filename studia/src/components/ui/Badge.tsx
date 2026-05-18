

type BadgeTone = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ tone = 'neutral', children, dot = true }: BadgeProps) {
  return (
    <span className={`badge ${tone}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
