
import type { StreakDay } from '../../types';

interface SparkBarsProps {
  data: StreakDay[];
}

export function SparkBars({ data }: SparkBarsProps) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="spark">
      {data.map((d, i) => (
        <div key={i} className="spark-col">
          <div className="spark-bar-wrap">
            <div
              className={`spark-bar ${d.ok ? '' : 'miss'}`}
              style={{ height: `${(d.count / max) * 100}%` }}
              title={`${d.count}개`}
            />
          </div>
          <div className="spark-label">{d.d}</div>
        </div>
      ))}
    </div>
  );
}
