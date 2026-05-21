import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { Chip } from '../ui/Chip';
import type { Tweaks } from '../../types';

interface TweaksPanelProps {
  tweaks: Tweaks;
  onTweak: (key: keyof Tweaks, value: string) => void;
  view: 'grid' | 'list';
  onViewChange: (v: 'grid' | 'list') => void;
}

export function TweaksPanel({ tweaks, onTweak, view, onViewChange }: TweaksPanelProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="tweaks-fab" onClick={() => setOpen(o => !o)} aria-label="Tweaks">
        <Icon name="settings-2" size={18} />
      </button>
      {open && (
        <div className="tweaks-panel">
          <div className="tweaks-panel-title">Tweaks</div>

          <div className="tweaks-section-label">모양새</div>
          <div className="tweaks-row">
            <span className="tweaks-row-label">밀도</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <Chip active={tweaks.density === 'comfortable'} onClick={() => onTweak('density', 'comfortable')}>보통</Chip>
              <Chip active={tweaks.density === 'dense'} onClick={() => onTweak('density', 'dense')}>조밀</Chip>
            </div>
          </div>
          <div className="tweaks-row">
            <span className="tweaks-row-label">자료 보기</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <Chip active={view === 'grid'} onClick={() => onViewChange('grid')}>카드</Chip>
              <Chip active={view === 'list'} onClick={() => onViewChange('list')}>리스트</Chip>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
