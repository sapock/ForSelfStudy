
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import type { AppSection } from '../../types';

interface GNBProps {
  section: AppSection;
  onSection: (id: AppSection) => void;
  streakDays: number;
  searchValue: string;
  onSearch: (q: string) => void;
  onAddClick: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'materials', label: '학습 자료' },
  { id: 'quiz', label: '퀴즈' },
  { id: 'stats', label: '통계' },
];

export function GNB({ section, onSection, streakDays, searchValue, onSearch, onAddClick }: GNBProps) {
  return (
    <header className="gnb">
      <div className="brand-studia">
        <span className="logo-mark">S</span>
        Studia
        <span className="ko">· 학습관</span>
      </div>
      <nav className="gnb-nav" style={{ marginLeft: 12 }}>
        {NAV_ITEMS.map(it => (
          <a
            key={it.id}
            href="#"
            className={section === it.id ? 'on' : ''}
            onClick={e => { e.preventDefault(); onSection(it.id); }}
          >{it.label}</a>
        ))}
      </nav>
      <div className="gnb-right">
        <div className="gnb-search" style={{ width: 280 }}>
          <Icon name="search" size={16} color="var(--gray-400)" />
          <input
            placeholder="자료·챕터·항목 검색…"
            value={searchValue}
            onChange={e => onSearch(e.target.value)}
          />
          <span className="muted" style={{ font: '500 11px/16px var(--font-mono)' }}>⌘ K</span>
        </div>
        <div className="streak-chip" title={`연속 학습 ${streakDays}일`}>
          <Icon name="flame" size={14} />
          <span className="num">{streakDays}</span>일
        </div>
        <Button variant="solid-primary" size="md" leadingIcon="plus" onClick={onAddClick}>자료 추가</Button>
        <button className="icon-btn" aria-label="알림"><Icon name="bell" size={20} /></button>
        <Avatar initials="나" size="md" />
      </div>
    </header>
  );
}
