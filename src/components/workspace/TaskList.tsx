import { useAppStore } from '@/store/useAppStore';
import { useCipherTask } from '@/hooks/useCipherTask';
import { formatDate } from '@/utils/cipher';
import { FileText, CheckCircle, Clock, Trash2, ChevronRight } from 'lucide-react';
import type { CipherTask } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function TaskList() {
  const { tasks, deleteTask } = useAppStore();
  const { currentTaskId, setCurrentTask } = useCipherTask();
  const navigate = useNavigate();

  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const completed = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="panel-terminal p-4 h-full overflow-y-auto flex flex-col">
      <h3 className="font-display text-phosphor text-base tracking-wider mb-3">任务列表</h3>
      <div className="divider-terminal mb-3" />

      <TaskSection
        title="进行中"
        icon={<Clock size={12} className="text-amber" />}
        tasks={inProgress}
        currentTaskId={currentTaskId}
        onSelect={setCurrentTask}
        onDelete={deleteTask}
      />

      {completed.length > 0 && (
        <>
          <div className="divider-terminal my-3" />
          <TaskSection
            title="已破译"
            icon={<CheckCircle size={12} className="text-phosphor" />}
            tasks={completed}
            currentTaskId={currentTaskId}
            onSelect={(id) => {
              setCurrentTask(id);
              navigate(`/archive/${id}`);
            }}
            onDelete={deleteTask}
          />
        </>
      )}
    </div>
  );
}

function TaskSection({
  title,
  icon,
  tasks,
  currentTaskId,
  onSelect,
  onDelete,
}: {
  title: string;
  icon: React.ReactNode;
  tasks: CipherTask[];
  currentTaskId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-phosphor-dim mb-2">
          {icon}
          {title} ({tasks.length})
        </div>
        <div className="text-[11px] font-mono text-phosphor-dim/50 pl-4">暂无任务</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-mono text-phosphor-dim mb-2">
        {icon}
        {title} ({tasks.length})
      </div>
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`group relative p-2.5 text-sm cursor-pointer border transition-all ${
              currentTaskId === task.id
                ? 'bg-terminal-phosphor/10 border-phosphor shadow-phosphor'
                : 'bg-terminal-bg border-phosphor-dim hover:border-phosphor/60'
            }`}
            onClick={() => onSelect(task.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <FileText size={14} className="text-phosphor-dim mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-phosphor truncate text-xs leading-tight">
                    {task.title}
                  </div>
                  <div className="text-[10px] text-phosphor-dim font-mono mt-1 flex items-center gap-2">
                    <span className={`tag-difficulty tag-${task.difficulty}`} style={{ padding: '1px 4px' }}>
                      {task.difficulty}
                    </span>
                    <span>{formatDate(task.updatedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`删除任务「${task.title}」?`)) onDelete(task.id);
                  }}
                  className="p-1 text-phosphor-dim hover:text-terminal-alert"
                  title="删除"
                >
                  <Trash2 size={12} />
                </button>
                <ChevronRight size={12} className="text-phosphor-dim" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
