import type { LucideIcon } from 'lucide-react';
import * as icons from 'lucide-react';


interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'solid-primary' | 'solid-neutral' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leadingIcon?: string;
  trailingIcon?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

function getIcon(name: string, size: number): React.ReactElement | null {
  const pascalName = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const IconComp = (icons as unknown as Record<string, LucideIcon>)[pascalName];
  if (!IconComp) return null;
  return <IconComp size={size} />;
}

export function Button({ children, variant = 'outline', size = 'md', leadingIcon, trailingIcon, disabled, onClick, style, className, type = 'button' }: ButtonProps) {
  const iconSize = size === 'lg' ? 18 : 16;
  return (
    <button
      type={type}
      className={`btn ${size} ${variant}${className ? ' ' + className : ''}`}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {leadingIcon && getIcon(leadingIcon, iconSize)}
      {children}
      {trailingIcon && getIcon(trailingIcon, iconSize)}
    </button>
  );
}
