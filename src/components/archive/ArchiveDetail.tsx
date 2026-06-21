import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, applySubstitution } from '@/utils/cipher';
import { ArrowLeft, Calendar, MapPin, Tag, FileText, CheckCircle, Edit3, Highlighter, AlertTriangle, StickyNote, Trash2 } from 'lucide-react';
import type { MarkerType, Marker } from '@/types';

const MARKER_CONFIG: Record<MarkerType, { label: string; color: string; icon: React.ReactNode }> = {
  highlight: {
    label: '高亮',
    color: '#d4a017',
    icon: <Highlighter size={14} />,
  },
  suspicious: {
    label: '可疑',
    color: '#b7410e',
    icon: <AlertTriangle size={14} />,
  },
  note: {
    label: '笔记',
    color: '#39ff14',
    icon: <StickyNote size={14} />,
  },
};

export default function ArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, setCurrentTask, removeMarker } = useAppStore();

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

  const getMarkerForLetterIndex = (letterIdx: number): Marker | null => {
    for (const marker of task.markers) {
      if (letterIdx >= marker.startIndex && letterIdx <= marker.endIndex) {
        return marker;
      }
    }
    return null;
  };

  const renderCipherWithMarkers = () => {
    const chars = task.ciphertext.split('');
    let letterIdx = 0;
    return chars.map((ch, i) => {
      const isLetter = /[A-Z]/.test(ch);
      if (isLetter) {
        const currentIdx = letterIdx++;
        const marker = getMarkerForLetterIndex(currentIdx);
        if (marker) {
          return (
            <span
              key={i}
              className="font-bold"
              style={{
                backgroundColor: `${marker.color}30`,
                borderBottom: `2px solid ${marker.color}`,
                color: marker.color,
                padding: '0 2px',
                borderRadius: '2px',
              }}
              title={`${MARKER_CONFIG[marker.type].label}: ${marker.comment || ''}`}
            >
              {ch}
            </span>
          );
        }
      }
      return <span key={i}>{ch}</span>;
    });
  };

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
            <div className="p-4 bg-terminal-paper/50 border border-terminal-paperDark/40 font-mono text-sm text-terminal-ink/80 leading-loose tracking-wide break-words whitespace-pre-wrap">
              {renderCipherWithMarkers()}
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

          {task.markers.length > 0 && (
            <section className="mb-6">
              <h2 className="font-display text-terminal-ink text-lg tracking-wide mb-3 flex items-center gap-2">
                <Highlighter size={16} /> 可疑片段标记 ({task.markers.length})
              </h2>
              <div className="space-y-2">
                {task.markers.map((marker) => {
                  const text = (() => {
                    let lIdx = 0;
                    let result = '';
                    for (const ch of task.ciphertext) {
                      if (/[A-Z]/.test(ch)) {
                        if (lIdx >= marker.startIndex && lIdx <= marker.endIndex) result += ch;
                        lIdx++;
                      }
                    }
                    return result;
                  })();
                  return (
                    <div
                      key={marker.id}
                      className="p-3 border font-display text-sm"
                      style={{
                        backgroundColor: `${marker.color}15`,
                        borderColor: `${marker.color}50`,
                        borderLeftWidth: '4px',
                        borderLeftColor: marker.color,
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {MARKER_CONFIG[marker.type].icon}
                          <span className="font-mono text-xs" style={{ color: marker.color }}>
                            {MARKER_CONFIG[marker.type].label}
                          </span>
                          <span className="text-terminal-ink/50 text-xs">
                            位置 {marker.startIndex}-{marker.endIndex}
                          </span>
                        </div>
                        <button
                          onClick={() => removeMarker(task.id, marker.id)}
                          className="p-1 text-terminal-ink/40 hover:text-terminal-alert transition-colors"
                          title="删除标记"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="font-mono tracking-widest text-terminal-ink mb-1">{text}</div>
                      {marker.comment && (
                        <div className="text-terminal-ink/70 text-sm">{marker.comment}</div>
                      )}
                    </div>
                  );
                })}
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
