import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, applySubstitution } from '@/utils/cipher';
import { ArrowLeft, Calendar, MapPin, Tag, FileText, CheckCircle, Edit3 } from 'lucide-react';

export default function ArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, setCurrentTask } = useAppStore();

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-terminal-alert font-mono mb-4">情报不存在或已被销毁</div>
        <button onClick={() => navigate('/archive')} className="btn-terminal">
          <ArrowLeft size={14} className="inline mr-2" /> 返回档案库
        </button>
      </div>
    );
  }

  const translation = applySubstitution(task.ciphertext, task.substitutionMap);
  const mappedCount = Object.keys(task.substitutionMap).length;
  const uniqueCount = new Set(task.ciphertext.replace(/[^A-Z]/g, '')).size;

  return (
    <div className="h-full overflow-y-auto p-6">
      <button
        onClick={() => navigate('/archive')}
        className="flex items-center gap-2 text-sm font-mono text-phosphor-dim hover:text-phosphor mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> 返回档案库
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="archive-card p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {task.status === 'completed' ? (
                  <span className="flex items-center gap-1 text-terminal-phosphorDim text-xs font-mono">
                    <CheckCircle size={14} /> 已破译归档
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-terminal-rust text-xs font-mono">
                    [破译中]
                  </span>
                )}
                <span className={`tag-difficulty tag-${task.difficulty}`}>
                  {task.difficulty}
                </span>
              </div>
              <h1 className="font-display text-terminal-ink text-3xl tracking-wide leading-tight">
                {task.title}
              </h1>
            </div>
            {task.status !== 'completed' && (
              <button
                onClick={() => {
                  setCurrentTask(task.id);
                  navigate('/');
                }}
                className="btn-terminal !py-2 !px-4 text-xs"
              >
                <Edit3 size={12} className="inline mr-1" /> 继续译码
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs font-mono">
            <div className="flex items-center gap-2 text-terminal-ink/70">
              <MapPin size={12} />
              <span>{task.source}</span>
            </div>
            <div className="flex items-center gap-2 text-terminal-ink/70">
              <Calendar size={12} />
              <span>创建: {formatDate(task.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-terminal-ink/70">
              <Calendar size={12} />
              <span>更新: {formatDate(task.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-terminal-ink/70">
              <Tag size={12} />
              <span>映射: {mappedCount}/{uniqueCount}</span>
            </div>
          </div>

          <div className="divider-terminal mb-6" style={{ background: 'linear-gradient(90deg, transparent, #a89878, transparent)' }} />

          <section className="mb-6">
            <h2 className="font-display text-terminal-ink text-lg tracking-wide mb-3 flex items-center gap-2">
              <FileText size={16} /> 原始密文
            </h2>
            <div className="p-4 bg-terminal-paper/50 border border-terminal-paperDark/40 font-mono text-sm text-terminal-ink/80 leading-loose tracking-wide break-words">
              {task.ciphertext}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="font-display text-terminal-ink text-lg tracking-wide mb-3 flex items-center gap-2">
              <Edit3 size={16} /> 当前译文
            </h2>
            <div className="p-4 bg-terminal-paper/80 border border-terminal-paperDark/60 font-display text-base text-terminal-ink leading-loose tracking-wide whitespace-pre-wrap break-words">
              {translation.split('').map((ch, i) => (
                <span key={i} className={ch === '·' ? 'text-terminal-ink/30' : ''}>
                  {ch}
                </span>
              ))}
            </div>
          </section>

          {task.status === 'completed' && (
            <section className="mb-6">
              <h2 className="font-display text-terminal-ink text-lg tracking-wide mb-3 flex items-center gap-2">
                <CheckCircle size={16} /> 标准答案
              </h2>
              <div className="p-4 bg-terminal-phosphorDim/10 border border-terminal-phosphorDim/40 font-display text-base text-terminal-ink leading-loose tracking-wide whitespace-pre-wrap break-words">
                {task.plaintextAnswer}
              </div>
            </section>
          )}

          {task.hint && (
            <section className="mb-6">
              <h2 className="font-display text-terminal-ink text-lg tracking-wide mb-3">译码提示</h2>
              <div className="p-4 bg-terminal-rust/10 border border-terminal-rust/40 font-display text-sm text-terminal-ink leading-relaxed">
                {task.hint}
              </div>
            </section>
          )}

          {task.notes && (
            <section className="mb-2">
              <h2 className="font-display text-terminal-ink text-lg tracking-wide mb-3">译码笔记</h2>
              <div className="p-4 bg-terminal-ink/5 border border-terminal-ink/20 font-display text-sm text-terminal-ink/80 leading-relaxed whitespace-pre-wrap">
                {task.notes}
              </div>
            </section>
          )}

          {Object.keys(task.substitutionMap).length > 0 && (
            <section>
              <h2 className="font-display text-terminal-ink text-lg tracking-wide mb-3">替换映射表</h2>
              <div className="p-4 bg-terminal-ink/5 border border-terminal-ink/20">
                <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-1.5 font-mono text-sm">
                  {Object.entries(task.substitutionMap)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([cipher, plain]) => (
                      <div key={cipher} className="flex items-center justify-center gap-1 p-1.5 bg-terminal-paper/60 border border-terminal-paperDark/40">
                        <span className="text-terminal-ink/60">{cipher}</span>
                        <span className="text-terminal-ink/40">→</span>
                        <span className="text-terminal-rust font-bold">{plain}</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
