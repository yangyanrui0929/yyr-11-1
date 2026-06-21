import { useCipherTask } from '@/hooks/useCipherTask';
import { useAppStore } from '@/store/useAppStore';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, EyeOff, Highlighter, AlertTriangle, StickyNote, Trash2, X, Save } from 'lucide-react';
import type { MarkerType, Marker } from '@/types';

interface CipherTextProps {
  selectedChars: Set<string>;
  onCharClick: (char: string, index: number) => void;
}

const MARKER_CONFIG: Record<MarkerType, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  highlight: {
    label: '高亮',
    color: '#d4a017',
    bgColor: 'rgba(212, 160, 23, 0.3)',
    icon: <Highlighter size={14} />,
  },
  suspicious: {
    label: '可疑',
    color: '#b7410e',
    bgColor: 'rgba(183, 65, 14, 0.4)',
    icon: <AlertTriangle size={14} />,
  },
  note: {
    label: '笔记',
    color: '#39ff14',
    bgColor: 'rgba(57, 255, 20, 0.25)',
    icon: <StickyNote size={14} />,
  },
};

const CUSTOM_COLORS = ['#d4a017', '#b7410e', '#39ff14', '#ff3b30', '#00bfff', '#ff69b4', '#9370db'];

export default function CipherText({ selectedChars, onCharClick }: CipherTextProps) {
  const { currentTask, validation } = useCipherTask();
  const { setSubstitution, addMarker, removeMarker } = useAppStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<Marker | null>(null);

  const [markerType, setMarkerType] = useState<MarkerType>('highlight');
  const [markerColor, setMarkerColor] = useState<string>(MARKER_CONFIG.highlight.color);
  const [markerComment, setMarkerComment] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  if (!currentTask) {
    return (
      <div className="flex-1 flex items-center justify-center text-phosphor-dim font-mono text-sm">
        {'// 未选择任务，请从右侧列表选择或创建新任务'}
      </div>
    );
  }

  const errorSet = new Set(validation?.errorIndices ?? []);
  const { substitutionMap, markers } = currentTask;

  const getMarkerForLetterIndex = (letterIdx: number): Marker | null => {
    for (const marker of markers) {
      if (letterIdx >= marker.startIndex && letterIdx <= marker.endIndex) {
        return marker;
      }
    }
    return null;
  };

  const isInSelection = (letterIdx: number): boolean => {
    if (selectionStart === null || selectionEnd === null) return false;
    const min = Math.min(selectionStart, selectionEnd);
    const max = Math.max(selectionStart, selectionEnd);
    return letterIdx >= min && letterIdx <= max;
  };

  const handleMouseDown = (letterIdx: number) => {
    setIsSelecting(true);
    setSelectionStart(letterIdx);
    setSelectionEnd(letterIdx);
    setShowMarkerModal(false);
  };

  const handleMouseEnter = (letterIdx: number) => {
    if (isSelecting && selectionStart !== null) {
      setSelectionEnd(letterIdx);
    }
  };

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionStart !== null && selectionEnd !== null) {
      const min = Math.min(selectionStart, selectionEnd);
      const max = Math.max(selectionStart, selectionEnd);
      if (min !== max) {
        setShowMarkerModal(true);
        setMarkerComment('');
        setMarkerType('highlight');
        setMarkerColor(MARKER_CONFIG.highlight.color);
      }
    }
    setIsSelecting(false);
  }, [isSelecting, selectionStart, selectionEnd]);

  const handleGlobalMouseUp = useCallback(() => {
    if (isSelecting) {
      handleMouseUp();
    }
  }, [isSelecting, handleMouseUp]);

  useEffect(() => {
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleGlobalMouseUp]);

  const handleSaveMarker = () => {
    if (selectionStart === null || selectionEnd === null) return;
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    addMarker(currentTask.id, {
      startIndex: start,
      endIndex: end,
      type: markerType,
      color: markerColor,
      comment: markerComment.trim() || undefined,
    });
    setShowMarkerModal(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleCancelSelection = () => {
    setShowMarkerModal(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  const handleCellClick = (char: string, index: number) => {
    if (!/[A-Z]/.test(char)) return;
    if (isSelecting) return;
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

  const selectedText = (() => {
    if (selectionStart === null || selectionEnd === null) return '';
    const min = Math.min(selectionStart, selectionEnd);
    const max = Math.max(selectionStart, selectionEnd);
    let lIdx = 0;
    let result = '';
    for (const ch of currentTask.ciphertext) {
      if (/[A-Z]/.test(ch)) {
        if (lIdx >= min && lIdx <= max) result += ch;
        lIdx++;
      }
    }
    return result;
  })();

  return (
    <div
      ref={containerRef}
      className="panel-terminal p-5 h-full overflow-y-auto"
      onMouseUp={handleMouseUp}
    >
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
            {markers.length > 0 && (
              <span className="text-phosphor-dim">标记: {markers.length}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HintButton taskId={currentTask.id} hint={currentTask.hint} />
          {(selectionStart !== null || selectionEnd !== null) && !showMarkerModal && (
            <button onClick={handleCancelSelection} className="btn-rust !py-1.5 !px-3 text-xs flex items-center gap-1.5">
              <X size={14} /> 取消选择
            </button>
          )}
        </div>
      </div>

      <div className="divider-terminal mb-4" />

      {(selectionStart !== null || selectionEnd !== null) && (
        <div className="mb-4 p-3 bg-terminal-rust/20 border border-rust">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs text-paper">
              <span className="text-rust font-bold">已选择:</span> {selectedText}
              <span className="text-paper/60 ml-2">
                (位置 {Math.min(selectionStart ?? 0, selectionEnd ?? 0)}-{Math.max(selectionStart ?? 0, selectionEnd ?? 0)})
              </span>
            </div>
            <button
              onClick={() => setShowMarkerModal(true)}
              className="btn-terminal !py-1 !px-3 text-xs flex items-center gap-1.5"
            >
              <Highlighter size={12} /> 添加标记
            </button>
          </div>
        </div>
      )}

      <div className="font-mono text-xl leading-loose tracking-wide select-none">
        {chars.map((ch, i) => {
          const isLetter = /[A-Z]/.test(ch);
          if (isLetter) {
            const currentIdx = charIndex++;
            const isSelectedChar = selectedChars.has(ch);
            const isError = errorSet.has(currentIdx);
            const mapped = substitutionMap[ch];
            const isEditing = editingIndex === currentIdx;
            const marker = getMarkerForLetterIndex(currentIdx);
            const inSel = isInSelection(currentIdx);

            const markerBg = marker ? marker.color : undefined;
            const markerBgStyle = marker
              ? { backgroundColor: `${marker.color}25`, borderBottom: `2px solid ${marker.color}` }
              : undefined;

            return (
              <span
                key={i}
                className={`char-cell ${isSelectedChar ? 'selected' : ''} ${
                  isError ? 'error' : mapped ? 'mapped' : ''
                } ${validation?.isCorrect ? 'correct' : ''} ${inSel ? 'bg-terminal-rust/40 !border-rust' : ''}`}
                style={markerBgStyle}
                onClick={() => handleCellClick(ch, currentIdx)}
                onMouseDown={() => handleMouseDown(currentIdx)}
                onMouseEnter={() => {
                  handleMouseEnter(currentIdx);
                  if (marker) setHoveredMarker(marker);
                }}
                onMouseLeave={() => setHoveredMarker(null)}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, ch, currentIdx)}
                title={marker?.comment || marker ? `${MARKER_CONFIG[marker.type].label}: ${marker.comment || ''}` : undefined}
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

      {hoveredMarker && (
        <div className="fixed bottom-4 right-4 panel-terminal !bg-terminal-bg border-phosphor p-3 z-20 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            {MARKER_CONFIG[hoveredMarker.type].icon}
            <span className="font-mono text-sm" style={{ color: hoveredMarker.color }}>
              {MARKER_CONFIG[hoveredMarker.type].label}标记
            </span>
            <button
              onClick={() => removeMarker(currentTask.id, hoveredMarker.id)}
              className="ml-auto p-1 text-phosphor-dim hover:text-terminal-alert transition-colors"
              title="删除标记"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <div className="text-xs font-mono text-phosphor-dim mb-1">
            位置: {hoveredMarker.startIndex} - {hoveredMarker.endIndex}
          </div>
          {hoveredMarker.comment && (
            <div className="text-xs text-paper">{hoveredMarker.comment}</div>
          )}
        </div>
      )}

      {showMarkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleCancelSelection}>
          <div
            className="panel-terminal w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-phosphor-dim">
              <h3 className="font-display text-phosphor text-lg tracking-wider">添加标记</h3>
              <button onClick={handleCancelSelection} className="text-phosphor-dim hover:text-phosphor transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-terminal-bg border border-phosphor-dim">
                <div className="text-xs font-mono text-phosphor-dim mb-1">选中片段</div>
                <div className="font-mono text-phosphor tracking-widest">{selectedText}</div>
              </div>

              <div>
                <label className="block text-xs font-mono text-phosphor-dim mb-2 uppercase tracking-wider">
                  标记类型
                </label>
                <div className="flex gap-2">
                  {(Object.keys(MARKER_CONFIG) as MarkerType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setMarkerType(type);
                        setMarkerColor(MARKER_CONFIG[type].color);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-mono uppercase tracking-wider border transition-all ${
                        markerType === type
                          ? 'bg-terminal-phosphor/15 border-phosphor text-phosphor'
                          : 'bg-transparent border-phosphor-dim text-phosphor-dim hover:text-phosphor hover:border-phosphor'
                      }`}
                    >
                      {MARKER_CONFIG[type].icon}
                      {MARKER_CONFIG[type].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-phosphor-dim mb-2 uppercase tracking-wider">
                  标记颜色
                </label>
                <div className="flex gap-2">
                  {CUSTOM_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setMarkerColor(color)}
                      className={`w-8 h-8 rounded transition-transform ${
                        markerColor === color ? 'scale-125 ring-2 ring-white/50' : ''
                      }`}
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-phosphor-dim mb-2 uppercase tracking-wider">
                  备注 (可选)
                </label>
                <textarea
                  value={markerComment}
                  onChange={(e) => setMarkerComment(e.target.value)}
                  placeholder="记录关于此片段的思路..."
                  rows={3}
                  className="input-terminal w-full resize-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={handleCancelSelection} className="btn-rust !py-2 !px-4 text-xs">
                  取消
                </button>
                <button onClick={handleSaveMarker} className="btn-terminal !py-2 !px-4 text-xs flex items-center gap-1.5">
                  <Save size={12} /> 保存标记
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="divider-terminal my-4" />

      <div className="text-xs font-mono text-phosphor-dim space-y-1">
        <div>{'>'} 点击密文字符后可直接输入对应明文字母</div>
        <div>{'>'} 按 DELETE/BACKSPACE 清除该字符的映射</div>
        <div>{'>'} <span className="text-amber">拖拽鼠标</span> 选择连续片段添加标记</div>
        <div>{'>'} <span className="text-amber">hover 标记</span> 可查看备注或删除</div>
      </div>

      {markers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-phosphor-dim/50">
          <div className="text-xs font-mono text-phosphor-dim mb-2 uppercase tracking-wider">
            已保存标记
          </div>
          <div className="space-y-1.5">
            {markers.map((m) => {
              const text = (() => {
                let lIdx = 0;
                let result = '';
                for (const ch of currentTask.ciphertext) {
                  if (/[A-Z]/.test(ch)) {
                    if (lIdx >= m.startIndex && lIdx <= m.endIndex) result += ch;
                    lIdx++;
                  }
                }
                return result;
              })();
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 p-2 bg-terminal-bg border border-phosphor-dim/50 text-xs font-mono"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: m.color, boxShadow: `0 0 4px ${m.color}` }}
                  />
                  <span className="text-phosphor-dim">{MARKER_CONFIG[m.type].label}</span>
                  <span className="text-amber tracking-widest">{text}</span>
                  <span className="text-phosphor-dim/60">({m.startIndex}-{m.endIndex})</span>
                  {m.comment && <span className="text-paper/70 ml-auto truncate max-w-[180px]">{m.comment}</span>}
                  <button
                    onClick={() => removeMarker(currentTask.id, m.id)}
                    className="p-0.5 text-phosphor-dim hover:text-terminal-alert transition-colors ml-auto"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
