
import { Icon } from '../ui/Icon';
import type { Subject } from '../../types';

interface LNBProps {
  active: string;
  onSelect: (key: string) => void;
  subjects: Subject[];
  counts: { materials: number; today: number; starred: number };
}

const GENERAL_ITEMS = [
  { id: 'dashboard', label: '대시보드', icon: 'layout-dashboard' },
  { id: 'materials', label: '모든 자료', icon: 'library', countKey: 'materials' },
  { id: 'today', label: '오늘 복습', icon: 'calendar-check', countKey: 'today' },
  { id: 'starred', label: '별표', icon: 'star', countKey: 'starred' },
  { id: 'quiz', label: '퀴즈', icon: 'zap' },
  { id: 'stats', label: '통계', icon: 'bar-chart-3' },
] as const;

export function LNB({ active, onSelect, subjects, counts }: LNBProps) {
  return (
    <aside className="lnb">
      <div className="lnb-section">학습</div>
      {GENERAL_ITEMS.map(it => {
        const count = 'countKey' in it ? counts[it.countKey as keyof typeof counts] : undefined;
        return (
          <div
            key={it.id}
            className={`lnb-item ${active === it.id ? 'on' : ''}`}
            onClick={() => onSelect(it.id)}
          >
            <span className="ic"><Icon name={it.icon} size={16} /></span>
            {it.label}
            {typeof count === 'number' && <span className="count">{count}</span>}
          </div>
        );
      })}

      <div className="lnb-section">내 과목</div>
      {subjects.map(s => (
        <div
          key={s.id}
          className={`lnb-item ${active === `subject:${s.id}` ? 'on' : ''}`}
          onClick={() => onSelect(`subject:${s.id}`)}
          title={s.name}
        >
          <span className="ic" style={{ fontSize: 14 }}>{s.emoji}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
            {s.name}
          </span>
        </div>
      ))}

      <div className="lnb-section">설정</div>
      <div className={`lnb-item ${active === 'settings' ? 'on' : ''}`} onClick={() => onSelect('settings')}>
        <span className="ic"><Icon name="settings" size={16} /></span>환경설정
      </div>
      <div className={`lnb-item ${active === 'trash' ? 'on' : ''}`} onClick={() => onSelect('trash')}>
        <span className="ic"><Icon name="trash-2" size={16} /></span>휴지통
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--gray-100)', marginTop: 12 }}>
        <div className="muted" style={{ font: '500 11px/14px var(--font-mono)', marginBottom: 6 }}>로컬 저장소</div>
        <div style={{ font: '500 12px/16px var(--font-sans)', color: 'var(--gray-700)' }}>
          {counts.materials}개 자료 · 동기화 안 됨
        </div>
      </div>
    </aside>
  );
}
