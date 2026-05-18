

interface AvatarProps {
  initials: string;
  tint?: 'p' | 'b' | 'g' | 'y';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Avatar({ initials, tint = 'p', size = 'md' }: AvatarProps) {
  const map: Record<string, string> = { p: '', b: 'b', g: 'g', y: 'y' };
  return <span className={`avatar ${size} ${map[tint] || ''}`}>{initials}</span>;
}
