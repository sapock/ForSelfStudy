

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
}

export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {items.map(item => (
        <div
          key={item.id}
          className={`tab ${value === item.id ? 'on' : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
          {typeof item.count === 'number' && (
            <span className="count">{item.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}
