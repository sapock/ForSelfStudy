
import { Icon } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, sub, children, footer, width = 560 }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{title}</div>
            {sub && <div className="modal-sub">{sub}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="닫기">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
