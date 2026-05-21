

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  removable?: boolean;
}

export function Chip({ children, active, onClick, removable }: ChipProps) {
  return (
    <span className={`chip ${active ? 'on' : ''}`} onClick={onClick} style={{ cursor: 'pointer' }}>
      {children}
      {removable && <span className="x">✕</span>}
    </span>
  );
}
