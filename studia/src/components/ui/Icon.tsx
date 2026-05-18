import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';


interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ name, size = 18, color, style, className }: IconProps) {
  const pascalName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const IconComp = (icons as unknown as Record<string, LucideIcon>)[pascalName];
  if (!IconComp) return <span style={{ width: size, height: size, display: 'inline-flex' }} />;
  return <IconComp size={size} color={color} style={style} className={className} />;
}
