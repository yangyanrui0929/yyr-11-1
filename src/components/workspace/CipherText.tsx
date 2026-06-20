import { useCipherTask } from '@/hooks/useCipherTask';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CipherTextProps {
  selectedChars: Set<string>;
  onCharClick: (char: string, index: number) => void;
}

export default function CipherText({ selectedChars, onCharClick }: CipherTextProps) {
  const { currentTask, validation } = useCipherTask();
  const { setSubstitution } = useAppStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!currentTask) {
    return (
      <div className="flex-1 flex items-center justify-center text-phosphor-dim font-mono text-sm">
        {'// 未选择任务，请从右侧列表选择或创建新任务'}
      </div>
    );
  }

  const errorSet = new Set(validation?.errorIndices ?? []);
  const { substitutionMap } = currentTask;

  const handleCellClick = (char: string, index: number) => {
    if (!/[A-Z]/.test(char)) return;
    onCharClick(char, index);
    setEditingIndex(index);
    setEditValue(substitutionMap[char] || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent, char: string, index: number) => {
    if (e.key === 'Escape') {
      setEditingIndex(null);
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      setSubstitution(currentTask.id, char, null);
      setEditingIndex(null);
      return;
    }
    if (/^[a-zA-Z]$/.test(e.key)) {
      setSubstitution(currentTask.id, char, e.key.toUpperCase());
      setEditingIndex(null);
    }
  };

  const chars = currentTask.ciphertext.split('');
  let charIndex = 0;

  return (
    <div className="panel-terminal p-5 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-phosphor text-xl tracking-wider">
            {currentTask.title}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-xs font-mono text-phosphor-dim">
            <span>来源: {currentTask.source}</span>
            <span className={`tag-difficulty tag-${currentTask.difficulty}`}>
              {currentTask.difficulty}
            </span>
            <span className={currentTask.status === 'completed' ? 'text-phosphor' : 'text-amber'}>
              {currentTask.status === 'completed' ? '[已破译]' : '[破译中]'}
            </span>
          </div>
        </div>
        <HintButton taskId={currentTask.id} hint={currentTask.hint} />
      </div>

      <div className="divider-terminal mb-4" />

      <div className="font-mono text-xl leading-relaxed tracking-wide select-none">
        {chars.map((ch, i) => {
          const isLetter = /[A-Z]/.test(ch);
          if (isLetter) {
            const currentIdx = charIndex++;
            const isSelected = selectedChars.has(ch);
            const isError = errorSet.has(currentIdx);
            const mapped = substitutionMap[ch];
            const isEditing = editingIndex === currentIdx;

            return (
              <span
                key={i}
                className={`char-cell ${isSelected ? 'selected' : ''} ${
                  isError ? 'error' : mapped ? 'mapped' : ''
                } ${validation?.isCorrect ? 'correct' : ''}`}
                onClick={() => handleCellClick(ch, currentIdx)}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, ch, currentIdx)}
              >
                {isEditing ? (
                  <span className="cursor-blink">{editValue || ch}</span>
                ) : (
                  <>
                    <span className="relative">
                      {ch}
                      {mapped && (
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-amber">
                          {mapped}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </span>
            );
          }
          if (ch === '\n') {
            return <br key={i} />;
          }
          if (ch === ' ') {
            return <span key={i} className="inline-block w-5" />;
          }
          return (
            <span key={i} className="char-cell text-phosphor-dim">
              {ch}
            </span>
          );
        })}
      </div>

      <div className="divider-terminal my-4" />

      <div className="text-xs font-mono text-phosphor-dim space-y-1">
        <div>{'>'} 点击密文字符后可直接输入对应明文字母</div>
        <div>{'>'} 按 DELETE/BACKSPACE 清除该字符的映射</div>
        <div>{'>'} 也可在下方替换表中拖拽建立映射</div>
      </div>
    </div>
  );
}

function HintButton({ taskId, hint }: { taskId: string; hint: string }) {
  const [show, setShow] = useState(false);
  if (!hint) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="btn-rust !py-1.5 !px-3 text-xs flex items-center gap-1.5"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
        {show ? '隐藏提示' : '查看提示'}
      </button>
      {show && (
        <div className="absolute right-0 top-full mt-2 w-72 panel-terminal !bg-terminal-rust/20 border-rust p-3 text-xs font-mono text-paper z-10">
          <div className="text-rust mb-1">[ 译码线索 ]</div>
          {hint}
        </div>
      )}
    </div>
  );
}
