import { Link, useLocation } from 'react-router-dom';
import { Terminal, FileArchive, BookOpen, Radio } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '工作台', icon: <Terminal size={18} /> },
  { path: '/archive', label: '情报档案', icon: <FileArchive size={18} /> },
  { path: '/dictionary', label: '废土字典', icon: <BookOpen size={18} /> },
];

export default function Sidebar() {
  const location = useLocation();
  const { tasks } = useAppStore();
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;

  return (
    <aside className="w-64 h-full flex flex-col border-r border-phosphor-dim bg-terminal-panel">
      <div className="p-4 border-b border-phosphor-dim">
        <div className="flex items-center gap-2">
          <Radio className="text-phosphor animate-pulse-slow" size={24} />
          <div>
            <h1 className="font-display text-lg text-phosphor leading-tight">
              废墟信号译码站
            </h1>
            <p className="text-xs text-phosphor-dim tracking-widest">
              RUINS SIGNAL // v2.17
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-mono tracking-wider uppercase transition-all ${
                isActive
                  ? 'bg-terminal-phosphor/10 text-phosphor border-l-2 border-phosphor shadow-phosphor'
                  : 'text-phosphor-dim hover:text-phosphor hover:bg-terminal-phosphor/5 border-l-2 border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-phosphor-dim space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-phosphor-dim">进行中</span>
          <span className="text-amber">{inProgress}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-phosphor-dim">已归档</span>
          <span className="text-phosphor">{completed}</span>
        </div>
        <div className="divider-terminal my-3" />
        <div className="text-[10px] text-phosphor-dim font-mono leading-relaxed">
          <div>SYS.STATUS: ONLINE</div>
          <div>FREQ.SCAN: ACTIVE</div>
          <div className="flex items-center gap-1">
            SIGNAL:
            <span className="inline-block w-2 h-2 bg-terminal-phosphor rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}
