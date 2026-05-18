
import { Icon } from './Icon';

interface ToastProps {
  open: boolean;
  kind?: 'success' | 'error' | 'info';
  children: React.ReactNode;
}

export function Toast({ open, kind = 'success', children }: ToastProps) {
  if (!open) return null;
  const iconName = kind === 'success' ? 'check-circle-2' : kind === 'error' ? 'x-circle' : 'info';
  return (
    <div className={`toast ${kind}`}>
      <Icon name={iconName} size={16} />
      <span>{children}</span>
    </div>
  );
}
