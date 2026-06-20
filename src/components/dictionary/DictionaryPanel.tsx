import { useState, useMemo } from 'react';
import { Search, BookOpen, Tag } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function DictionaryPanel() {
  const { dictionary } = useAppStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const set = new Set(dictionary.map((d) => d.category));
    return ['all', ...Array.from(set)];
  }, [dictionary]);

  const filtered = useMemo(() => {
    return dictionary.filter((entry) => {
      const matchesQuery =
        !query ||
        entry.word.toLowerCase().includes(query.toLowerCase()) ||
        entry.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || entry.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [dictionary, query, category]);

  return (
    <div className="panel-terminal p-5 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="text-phosphor" size={20} />
        <h3 className="font-display text-phosphor text-lg tracking-wider">废土字典</h3>
      </div>
      <p className="text-xs font-mono text-phosphor-dim mb-4">
        收录废土世界常见术语与黑话
      </p>

      <div className="divider-terminal mb-4" />

      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-phosphor-dim" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索词条..."
            className="input-terminal w-full pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider border transition-all ${
                category === c
                  ? 'bg-terminal-phosphor/15 text-phosphor border-phosphor'
                  : 'bg-transparent text-phosphor-dim border-phosphor-dim hover:text-phosphor hover:border-phosphor'
              }`}
            >
              {c === 'all' ? '全部' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-xs font-mono text-phosphor-dim text-center py-8">
            未找到匹配词条...
          </div>
        ) : (
          filtered.map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-terminal-bg border border-phosphor-dim hover:border-phosphor/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-base text-phosphor font-bold">
                  {entry.word}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber px-1.5 py-0.5 border border-amber/50">
                  <Tag size={9} />
                  {entry.category}
                </span>
              </div>
              <div className="text-xs text-phosphor-dim leading-relaxed">
                {entry.description}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
