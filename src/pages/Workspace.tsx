import { useState } from 'react';
import CipherText from '@/components/workspace/CipherText';
import SubstitutionTable from '@/components/workspace/SubstitutionTable';
import TranslationPreview from '@/components/workspace/TranslationPreview';
import TaskList from '@/components/workspace/TaskList';
import FrequencyChart, { PatternAnalyzer } from '@/components/frequency/FrequencyChart';
import DictionaryPanel from '@/components/dictionary/DictionaryPanel';
import { BarChart3, BookOpen, Sparkles } from 'lucide-react';

type RightPanel = 'frequency' | 'dictionary' | 'patterns';

export default function Workspace() {
  const [selectedChars, setSelectedChars] = useState<Set<string>>(new Set());
  const [rightPanel, setRightPanel] = useState<RightPanel>('frequency');

  const handleCharClick = (char: string) => {
    setSelectedChars((prev) => {
      const next = new Set(prev);
      if (next.has(char)) {
        next.clear();
      } else {
        next.clear();
        next.add(char);
      }
      return next;
    });
  };

  const panels: { id: RightPanel; label: string; icon: React.ReactNode }[] = [
    { id: 'frequency', label: '频率分析', icon: <BarChart3 size={14} /> },
    { id: 'patterns', label: '模式识别', icon: <Sparkles size={14} /> },
    { id: 'dictionary', label: '字典', icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-64 shrink-0 border-r border-phosphor-dim">
        <TaskList />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 overflow-hidden flex flex-col min-w-0">
            <div className="flex-1 min-h-0 overflow-hidden">
              <CipherText selectedChars={selectedChars} onCharClick={handleCharClick} />
            </div>
          </div>

          <div className="w-[380px] shrink-0 border-l border-phosphor-dim flex flex-col overflow-hidden">
            <div className="flex border-b border-phosphor-dim">
              {panels.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setRightPanel(p.id)}
                  className={`flex-1 px-3 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    rightPanel === p.id
                      ? 'text-phosphor bg-terminal-phosphor/10 border-b-2 border-phosphor'
                      : 'text-phosphor-dim hover:text-phosphor hover:bg-terminal-phosphor/5'
                  }`}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightPanel === 'frequency' && <FrequencyChart />}
              {rightPanel === 'patterns' && <PatternAnalyzer />}
              {rightPanel === 'dictionary' && <DictionaryPanel />}
            </div>
          </div>
        </div>

        <div className="h-[400px] shrink-0 border-t border-phosphor-dim flex overflow-hidden">
          <div className="flex-1 overflow-hidden min-w-0">
            <SubstitutionTable />
          </div>
          <div className="w-1/2 shrink-0 border-l border-phosphor-dim overflow-hidden min-w-0">
            <TranslationPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
