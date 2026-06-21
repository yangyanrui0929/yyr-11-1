import { useCipherTask } from '@/hooks/useCipherTask';
import { useAppStore } from '@/store/useAppStore';
import { useState } from 'react';
import { Edit3, Save } from 'lucide-react';

export default function TranslationPreview() {
  const { currentTask, translation, validation, submitTranslation, mappedCount, uniqueCharsCount } = useCipherTask();
  const updateNotes = useAppStore((s) => s.updateNotes);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(currentTask?.notes || '');

  if (!currentTask) return null;

  const errorSet = new Set(validation?.errorIndices ?? []);
  const tChars = translation.split('');
  const cChars = currentTask.ciphertext.split('');
  let letterIdx = 0;

  const handleSaveNotes = () => {
    updateNotes(currentTask.id, noteText);
    setIsEditingNotes(false);
  };

  return (
    <div className="panel-paper p-5 h-full overflow-y-auto font-display">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-terminal-paperDark/50">
        <div>
          <h3 className="text-lg text-terminal-ink tracking-wide">译文预览</h3>
          <div className="text-xs text-terminal-ink/60 mt-0.5">
            译码进度: {mappedCount} / {uniqueCharsCount} 字符
            {validation && (
              <span className="ml-2">
                | 校验正确率: {validation.accuracy.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <button
          onClick={submitTranslation}
          className="bg-terminal-ink text-terminal-paper px-4 py-1.5 text-xs font-mono uppercase tracking-wider hover:bg-terminal-rust transition-colors"
        >
          提交译文
        </button>
      </div>

      <div className="text-lg leading-loose tracking-wide whitespace-pre-wrap break-words min-h-[180px] p-4 bg-terminal-paper/60 border border-terminal-paperDark/30">
        {tChars.map((ch, i) => {
          const cipherCh = cChars[i] || ' ';
          const isCipherLetter = /[A-Za-z]/.test(cipherCh);
          const currentLetterIdx = isCipherLetter ? letterIdx++ : letterIdx;
          const isError = isCipherLetter && errorSet.has(currentLetterIdx);
          const isTranslatedLetter = /[A-Za-z]/.test(ch);

          if (ch === '\n') return <br key={i} />;

          return (
            <span
              key={i}
              className={
                isError
                  ? 'text-terminal-alert font-bold underline decoration-wavy decoration-terminal-alert'
                  : ch === '·'
                  ? 'text-terminal-ink/30'
                  : validation?.isCorrect
                  ? 'text-terminal-phosphorDim font-bold'
                  : 'text-terminal-ink'
              }
            >
              {ch}
            </span>
          );
        })}
        {!translation && <span className="text-terminal-ink/30 italic">（译文将在建立映射后实时显示...）</span>}
      </div>

      {validation && !validation.isCorrect && validation.errorIndices.length > 0 && (
        <div className="mt-4 p-3 border border-terminal-alert/50 bg-terminal-alert/10">
          <div className="text-xs font-mono text-terminal-alert mb-1">
            [ 校验结果 ] 发现 {validation.errorIndices.length} 处错误
          </div>
          <div className="text-xs text-terminal-ink/70">
            红色波浪线标记的字符表示与标准答案不符，请检查该位置的映射关系。
          </div>
        </div>
      )}

      {validation?.isCorrect && (
        <div className="mt-4 p-3 border border-terminal-phosphorDim/50 bg-terminal-phosphorDim/10">
          <div className="text-sm font-mono text-terminal-phosphorDim mb-1">
            ✓ 译码成功！情报已自动归档
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-terminal-ink/80 tracking-wide">译码笔记</span>
          {isEditingNotes ? (
            <button
              onClick={handleSaveNotes}
              className="text-xs font-mono text-terminal-phosphorDim hover:text-terminal-ink flex items-center gap-1"
            >
              <Save size={12} /> 保存
            </button>
          ) : (
            <button
              onClick={() => {
                setNoteText(currentTask.notes);
                setIsEditingNotes(true);
              }}
              className="text-xs font-mono text-terminal-ink/60 hover:text-terminal-ink flex items-center gap-1"
            >
              <Edit3 size={12} /> 编辑
            </button>
          )}
        </div>
        {isEditingNotes ? (
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            className="w-full p-3 text-sm bg-terminal-paper border border-terminal-paperDark/50 font-display resize-none focus:outline-none focus:border-terminal-ink/50"
            placeholder="记录译码思路、发现的模式..."
          />
        ) : (
          <div className="p-3 min-h-[60px] text-sm text-terminal-ink/80 bg-terminal-paper/60 border border-terminal-paperDark/30 whitespace-pre-wrap">
            {currentTask.notes || <span className="text-terminal-ink/30 italic">暂无笔记...</span>}
          </div>
        )}
      </div>
    </div>
  );
}
