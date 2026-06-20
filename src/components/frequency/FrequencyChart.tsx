import { useCipherTask } from '@/hooks/useCipherTask';
import type { FrequencyResult, PatternResult } from '@/types';

const ENGLISH_FREQ_ORDER = ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'C', 'U', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z'];

export default function FrequencyChart() {
  const { frequency, currentTask } = useCipherTask();

  if (!currentTask || frequency.length === 0) return null;

  const maxCount = frequency[0]?.count || 1;

  return (
    <div className="panel-terminal p-5">
      <h3 className="font-display text-phosphor text-lg tracking-wider mb-2">字符频率统计</h3>
      <div className="text-xs font-mono text-phosphor-dim mb-4">
        英文频率参考排序: E T A O I N S H R D L C U M W F G Y P B V K J X Q Z
      </div>

      <div className="divider-terminal mb-4" />

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-2">
        {frequency.map((item: FrequencyResult, idx: number) => {
          const widthPct = (item.count / maxCount) * 100;
          const expectedChar = ENGLISH_FREQ_ORDER[idx] || '?';
          return (
            <div key={item.char} className="flex items-center gap-2 text-sm font-mono">
              <span className="w-6 text-phosphor font-bold text-right">{item.char}</span>
              <div className="flex-1 h-5 bg-terminal-bg border border-phosphor-dim relative overflow-hidden">
                <div
                  className="freq-bar h-full"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-xs text-terminal-bg font-bold">
                  {item.count}  ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <span className="w-6 text-amber text-center" title="按频率推测的明文字母">
                {expectedChar}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PatternAnalyzer() {
  const { patterns, currentTask } = useCipherTask();

  if (!currentTask || patterns.length === 0) {
    return (
      <div className="panel-terminal p-5">
        <h3 className="font-display text-phosphor text-lg tracking-wider mb-4">模式识别</h3>
        <div className="text-xs font-mono text-phosphor-dim">未检测到显著重复模式...</div>
      </div>
    );
  }

  return (
    <div className="panel-terminal p-5">
      <h3 className="font-display text-phosphor text-lg tracking-wider mb-4">模式识别</h3>
      <div className="divider-terminal mb-4" />
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {patterns.map((p: PatternResult, i) => (
          <div
            key={`${p.pattern}-${i}`}
            className="flex items-center justify-between p-2 bg-terminal-bg border border-phosphor-dim text-sm font-mono"
          >
            <span className="text-amber tracking-widest">{p.pattern}</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-phosphor-dim">长度: {p.pattern.length}</span>
              <span className="text-phosphor">出现 x{p.count}</span>
              <span className="text-phosphor-dim">
                位置: {p.positions.slice(0, 3).join(',')}
                {p.positions.length > 3 ? '...' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
