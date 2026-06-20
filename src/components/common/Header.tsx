import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Download, Upload, RotateCcw, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Difficulty } from '@/types';

export default function Header() {
  const navigate = useNavigate();
  const { createTask, exportTasks, importTasks, settings, updateSettings } = useAppStore();
  const [showNewTask, setShowNewTask] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newCiphertext, setNewCiphertext] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('medium');
  const [newHint, setNewHint] = useState('');

  const handleCreate = () => {
    if (!newCiphertext.trim()) return;
    createTask({
      title: newTitle || '未命名任务',
      ciphertext: newCiphertext.toUpperCase(),
      plaintextAnswer: newAnswer.toUpperCase(),
      source: newSource || '未知来源',
      difficulty: newDifficulty,
      hint: newHint,
    });
    setShowNewTask(false);
    setNewTitle('');
    setNewCiphertext('');
    setNewAnswer('');
    setNewSource('');
    setNewHint('');
    navigate('/');
  };

  const handleExport = () => {
    const json = exportTasks();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruins-signal-archive-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importTasks(importJson)) {
      setShowImport(false);
      setImportJson('');
      navigate('/');
    }
  };

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 border-b border-phosphor-dim bg-terminal-panel">
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm text-phosphor-dim">
            <span className="text-phosphor">{'>'}</span> SIGNAL.INTERFACE
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-terminal-phosphor rounded-full animate-pulse" />
            <span className="inline-block w-1.5 h-1.5 bg-terminal-phosphor/60 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span className="inline-block w-1.5 h-1.5 bg-terminal-phosphor/30 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewTask(true)}
            className="btn-terminal !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> 新建任务
          </button>
          <button
            onClick={handleExport}
            className="btn-terminal !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <Download size={14} /> 导出
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="btn-terminal !py-1.5 !px-3 text-xs flex items-center gap-1.5"
          >
            <Upload size={14} /> 导入
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="btn-terminal !py-1.5 !px-3 text-xs"
          >
            <Settings size={14} />
          </button>
        </div>
      </header>

      {showNewTask && (
        <Modal onClose={() => setShowNewTask(false)} title="新建译码任务">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-phosphor-dim mb-1 uppercase">任务标题</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="输入任务标题..."
                className="input-terminal w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-phosphor-dim mb-1 uppercase">密文 *</label>
              <textarea
                value={newCiphertext}
                onChange={(e) => setNewCiphertext(e.target.value)}
                placeholder="粘贴待破译密文..."
                rows={4}
                className="input-terminal w-full resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-phosphor-dim mb-1 uppercase">标准答案（可选）</label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="用于提交校验的明文..."
                rows={3}
                className="input-terminal w-full resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-phosphor-dim mb-1 uppercase">情报来源</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="来源描述..."
                  className="input-terminal w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-phosphor-dim mb-1 uppercase">难度</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                  className="input-terminal w-full"
                >
                  <option value="easy">EASY - 简单</option>
                  <option value="medium">MEDIUM - 中等</option>
                  <option value="hard">HARD - 困难</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-phosphor-dim mb-1 uppercase">提示</label>
              <textarea
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                placeholder="给译码员的线索..."
                rows={2}
                className="input-terminal w-full resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowNewTask(false)} className="btn-rust !py-2 !px-4 text-xs">
                <X size={14} className="inline mr-1" /> 取消
              </button>
              <button onClick={handleCreate} disabled={!newCiphertext.trim()} className="btn-terminal !py-2 !px-4 text-xs">
                创建任务
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="系统设置">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-phosphor font-mono">CRT 扫描线效果</div>
                <div className="text-xs text-phosphor-dim">复古显示器扫描线与辉光</div>
              </div>
              <Toggle
                checked={settings.crtEffect}
                onChange={(v) => updateSettings({ crtEffect: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-phosphor font-mono">音效反馈</div>
                <div className="text-xs text-phosphor-dim">操作时播放终端音效</div>
              </div>
              <Toggle
                checked={settings.soundEnabled}
                onChange={(v) => updateSettings({ soundEnabled: v })}
              />
            </div>
            <div className="divider-terminal" />
            <div>
              <div className="text-xs font-mono text-phosphor-dim mb-2 uppercase">显示主题</div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'terminal' })}
                  className={`btn-terminal !py-2 !px-4 text-xs flex-1 ${settings.theme === 'terminal' ? '!bg-terminal-phosphor !text-terminal-bg' : ''}`}
                >
                  终端模式
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'paper' })}
                  className={`btn-terminal !py-2 !px-4 text-xs flex-1 ${settings.theme === 'paper' ? '!bg-terminal-phosphor !text-terminal-bg' : ''}`}
                >
                  电报纸张
                </button>
              </div>
            </div>
            <div className="divider-terminal" />
            <button
              onClick={() => {
                if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="btn-rust !py-2 w-full text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> 重置所有数据
            </button>
          </div>
        </Modal>
      )}

      {showImport && (
        <Modal onClose={() => setShowImport(false)} title="导入档案">
          <div className="space-y-4">
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="粘贴导出的 JSON 数据..."
              rows={10}
              className="input-terminal w-full resize-none font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowImport(false)} className="btn-rust !py-2 !px-4 text-xs">
                取消
              </button>
              <button onClick={handleImport} disabled={!importJson.trim()} className="btn-terminal !py-2 !px-4 text-xs">
                导入
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="panel-terminal w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-phosphor-dim">
          <h2 className="font-display text-phosphor text-lg tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-phosphor-dim hover:text-phosphor transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full border-2 transition-all relative ${
        checked ? 'border-phosphor bg-terminal-phosphor/20' : 'border-phosphor-dim bg-terminal-bg'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
          checked ? 'left-6 bg-terminal-phosphor shadow-phosphor' : 'left-0.5 bg-phosphor-dim'
        }`}
      />
    </button>
  );
}
