import { Fragment } from 'react';

interface BreadcrumbProps {
  items: string[];
  onNavigate?: (idx: number) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <div className="breadcrumb">
      {items.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {i < items.length - 1 ? (
            <a href="#" onClick={e => { e.preventDefault(); onNavigate?.(i); }}>{item}</a>
          ) : (
            <span className="curr">{item}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
