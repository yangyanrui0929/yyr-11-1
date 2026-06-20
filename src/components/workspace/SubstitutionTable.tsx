import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useCipherTask } from '@/hooks/useCipherTask';
import { getUniqueChars } from '@/utils/cipher';
import { Trash2 } from 'lucide-react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function SubstitutionTable() {
  const { currentTask } = useCipherTask();
  const { setSubstitution, clearSubstitution } = useAppStore();
  const [dragging, setDragging] = useState<{ from: 'cipher' | 'plain'; char: string } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const dragCounter = useRef(0);

  if (!currentTask) return null;

  const cipherChars = getUniqueChars(currentTask.ciphertext);
  const { substitutionMap } = currentTask;
  const reverseMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(substitutionMap)) {
    reverseMap[v] = k;
  }

  const usedPlainChars = new Set(Object.values(substitutionMap));

  const handleDragStart = (from: 'cipher' | 'plain', char: string) => {
    setDragging({ from, char });
    dragCounter.current++;
  };

  const handleDragEnd = () => {
    setDragging(null);
    setHoverTarget(null);
  };

  const handleDropOnCipher = (cipherChar: string) => {
    if (!dragging) return;
    if (dragging.from === 'plain') {
      setSubstitution(currentTask.id, cipherChar, dragging.char);
    } else if (dragging.from === 'cipher' && dragging.char !== cipherChar) {
      const plainForDragging = substitutionMap[dragging.char];
      const plainForTarget = substitutionMap[cipherChar];
      if (plainForDragging) {
        setSubstitution(currentTask.id, cipherChar, plainForDragging);
      }
      if (plainForTarget) {
        setSubstitution(currentTask.id, dragging.char, plainForTarget);
      }
    }
    handleDragEnd();
  };

  const handleDropOnPlain = (plainChar: string) => {
    if (!dragging) return;
    if (dragging.from === 'cipher') {
      setSubstitution(currentTask.id, dragging.char, plainChar);
    } else if (dragging.from === 'plain' && dragging.char !== plainChar) {
      const cipherForDragging = reverseMap[dragging.char];
      const cipherForTarget = reverseMap[plainChar];
      if (cipherForDragging) {
        setSubstitution(currentTask.id, cipherForDragging, plainChar);
      }
      if (cipherForTarget) {
        setSubstitution(currentTask.id, cipherForTarget, dragging.char);
      }
    }
    handleDragEnd();
  };

  const handleCipherClick = (ch: string) => {
    if (substitutionMap[ch]) {
      setSubstitution(currentTask.id, ch, null);
    }
  };

  return (
    <div className="panel-terminal p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-phosphor text-lg tracking-wider">字符替换映射表</h3>
        <button
          onClick={() => clearSubstitution(currentTask.id)}
          className="btn-rust !py-1 !px-3 text-xs flex items-center gap-1"
        >
          <Trash2 size={12} /> 清空
        </button>
      </div>

      <div className="divider-terminal mb-4" />

      <div className="mb-4">
        <div className="text-xs font-mono text-phosphor-dim mb-2 uppercase tracking-wider">
          密文字符（点击清除映射 / 拖拽到明文）
        </div>
        <div className="flex flex-wrap gap-1.5 p-3 bg-terminal-bg border border-phosphor-dim rounded">
          {cipherChars.map((ch) => {
            const mapped = substitutionMap[ch];
            const isHovered = hoverTarget === `c-${ch}`;
            return (
              <div
                key={ch}
                draggable
                onDragStart={() => handleDragStart('cipher', ch)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverTarget(`c-${ch}`);
                }}
                onDragLeave={() => setHoverTarget(null)}
                onDrop={() => handleDropOnCipher(ch)}
                onClick={() => handleCipherClick(ch)}
                className={`draggable-char drop-target w-9 h-11 flex flex-col items-center justify-center border font-mono text-lg transition-all ${
                  mapped
                    ? 'bg-terminal-phosphor/10 border-phosphor text-phosphor shadow-phosphor'
                    : 'bg-terminal-panel border-phosphor-dim text-phosphor-dim'
                } ${isHovered ? 'over' : ''} ${
                  dragging?.char === ch ? 'dragging' : ''
                }`}
                title={mapped ? `→ ${mapped} (点击清除)` : '拖拽到明文行建立映射'}
              >
                <span className="text-base">{ch}</span>
                {mapped && (
                  <span className="text-[9px] text-amber font-bold">↓{mapped}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center my-3">
        <div className="w-16 h-8 border-l-2 border-r-2 border-b-2 border-phosphor-dim rounded-b-full" />
      </div>

      <div>
        <div className="text-xs font-mono text-phosphor-dim mb-2 uppercase tracking-wider">
          明文字母表（拖拽到密文行建立映射）
        </div>
        <div className="grid grid-cols-13 gap-1 p-3 bg-terminal-bg border border-phosphor-dim rounded">
          {ALPHABET.map((ch) => {
            const used = usedPlainChars.has(ch);
            const cipherForThis = reverseMap[ch];
            const isHovered = hoverTarget === `p-${ch}`;
            return (
              <div
                key={ch}
                draggable
                onDragStart={() => handleDragStart('plain', ch)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverTarget(`p-${ch}`);
                }}
                onDragLeave={() => setHoverTarget(null)}
                onDrop={() => handleDropOnPlain(ch)}
                className={`draggable-char drop-target w-9 h-9 flex items-center justify-center border font-mono text-base transition-all ${
                  used
                    ? 'bg-terminal-rust/20 border-rust text-rust'
                    : 'bg-terminal-panel border-phosphor-dim text-phosphor hover:border-phosphor hover:text-phosphor'
                } ${isHovered ? 'over' : ''} ${
                  dragging?.char === ch ? 'dragging' : ''
                }`}
                title={used ? `已被 ${cipherForThis} 使用` : `拖拽映射为 ${ch}`}
              >
                {ch}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-xs font-mono text-phosphor-dim">
        {'>>>'} 已建立 {Object.keys(substitutionMap).length} / {cipherChars.length} 个映射关系
      </div>
    </div>
  );
}
