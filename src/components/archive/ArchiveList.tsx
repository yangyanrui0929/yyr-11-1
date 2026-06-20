import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, applySubstitution } from '@/utils/cipher';
import { CheckCircle, Clock, Trash2, FileText, Map, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CipherTask } from '@/types';

export default function ArchiveList() {
  const { tasks, deleteTask } = useAppStore();
  const navigate = useNavigate();

  const { completed, inProgress } = useMemo(() => {
    return {
      completed: tasks.filter((t) => t.status === 'completed'),
      inProgress: tasks.filter((t) => t.status === 'in_progress'),
    };
  }, [tasks]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-phosphor text-2xl tracking-wider mb-1">情报档案库</h1>
        <p className="text-sm font-mono text-phosphor-dim">
          共收录 {tasks.length} 份情报 · 已破译 {completed.length} 份 · 待破译 {inProgress.length} 份
        </p>
      </div>

      <div className="divider-terminal mb-6" />

      {completed.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-phosphor" size={18} />
            <h2 className="font-display text-phosphor text-lg tracking-wider">已破译情报</h2>
            <span className="text-xs font-mono text-phosphor-dim">({completed.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map((task) => (
              <ArchiveCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/archive/${task.id}`)}
                onDelete={() => {
                  if (confirm(`删除情报「${task.title}」?`)) deleteTask(task.id);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {inProgress.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-amber" size={18} />
            <h2 className="font-display text-amber text-lg tracking-wider">破译中</h2>
            <span className="text-xs font-mono text-phosphor-dim">({inProgress.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {inProgress.map((task) => (
              <ArchiveCard
                key={task.id}
                task={task}
                onClick={() => {
                  navigate('/');
                }}
                onDelete={() => {
                  if (confirm(`删除任务「${task.title}」?`)) deleteTask(task.id);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-20">
          <FileText size={48} className="text-phosphor-dim mx-auto mb-4" />
          <div className="font-mono text-phosphor-dim">档案库为空...</div>
          <div className="text-xs font-mono text-phosphor-dim/60 mt-2">
            创建第一个译码任务开始收集情报
          </div>
        </div>
      )}
    </div>
  );
}

function ArchiveCard({
  task,
  onClick,
  onDelete,
}: {
  task: CipherTask;
  onClick: () => void;
  onDelete: () => void;
}) {
  const preview = task.status === 'completed'
    ? task.plaintextAnswer.slice(0, 80)
    : applySubstitution(task.ciphertext, task.substitutionMap).slice(0, 80);

  const mappedCount = Object.keys(task.substitutionMap).length;
  const uniqueCount = new Set(task.ciphertext.replace(/[^A-Z]/g, '')).size;

  return (
    <div className="archive-card p-4" onClick={onClick}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {task.status === 'completed' ? (
            <CheckCircle size={14} className="text-terminal-phosphorDim" />
          ) : (
            <Clock size={14} className="text-terminal-rust" />
          )}
          <h3 className="font-display text-terminal-ink text-base tracking-wide leading-tight">
            {task.title}
          </h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-terminal-ink/40 hover:text-terminal-alert transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 text-[10px] font-mono">
        <span className={`tag-difficulty tag-${task.difficulty}`} style={{ padding: '1px 4px' }}>
          {task.difficulty}
        </span>
        <span className="text-terminal-ink/60">{task.source}</span>
      </div>

      <div className="text-xs text-terminal-ink/70 font-mono leading-relaxed mb-3 min-h-[40px]">
        {preview}
        {(task.status === 'completed' ? task.plaintextAnswer.length : task.ciphertext.length) > 80 && '...'}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-terminal-ink/50 border-t border-terminal-paperDark/30 pt-2">
        <div className="flex items-center gap-1">
          <Map size={10} />
          {task.status === 'completed' ? (
            <span>100% 破译</span>
          ) : (
            <span>映射 {mappedCount}/{uniqueCount}</span>
          )}
        </div>
        <div>
          {task.status === 'completed' && task.completedAt
            ? formatDate(task.completedAt)
            : formatDate(task.updatedAt)}
        </div>
        <ArrowRight size={10} />
      </div>
    </div>
  );
}
