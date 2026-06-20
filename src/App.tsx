import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import Workspace from '@/pages/Workspace';
import Archive from '@/pages/Archive';
import ArchiveDetail from '@/pages/ArchiveDetail';
import Dictionary from '@/pages/Dictionary';
import { useAppStore } from '@/store/useAppStore';

export default function App() {
  const init = useAppStore((s) => s.init);
  const crtEffect = useAppStore((s) => s.settings?.crtEffect ?? true);
  const [booted, setBooted] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);

  const BOOT_LOGS = [
    '> SYS.INIT: RUINS SIGNAL DECODER v2.17',
    '> LOADING CRYPTO MODULES............... [OK]',
    '> ESTABLISHING RADIO LINK............... [OK]',
    '> FREQUENCY SCANNER CALIBRATED.......... [OK]',
    '> DECRYPTION ENGINE READY............... [OK]',
    '> ARCHIVE DATABASE LOADED............... [OK]',
    '> WELCOME, OPERATOR.',
    '> AWAITING SIGNAL INPUT...',
  ];

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (booted) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LOGS.length) {
        setBootLines((prev) => [...prev, BOOT_LOGS[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooted(true), 400);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [booted]);

  if (!booted) {
    return (
      <div className={`w-full h-full bg-terminal-bg text-phosphor font-mono text-sm p-8 overflow-hidden ${crtEffect ? 'crt-screen animate-flicker' : ''}`}>
        {crtEffect && <div className="scanline-overlay" />}
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-3 h-3 bg-terminal-phosphor rounded-full animate-pulse shadow-phosphor" />
            <div className="w-3 h-3 bg-terminal-phosphor/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-terminal-phosphor/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          {bootLines.filter(Boolean).map((line, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-phosphor-dim">{typeof line === 'string' ? line.slice(0, 2) : ''}</span>
              <span className={typeof line === 'string' && line.includes('[OK]') ? 'text-phosphor' : ''}>
                {typeof line === 'string' ? line.slice(2) : ''}
              </span>
              {i === bootLines.length - 1 && <span className="animate-blink">▊</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`w-full h-full flex bg-terminal-bg text-phosphor overflow-hidden ${crtEffect ? 'crt-screen animate-flicker' : ''}`}>
        {crtEffect && <div className="scanline-overlay" />}
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-hidden min-h-0">
            <Routes>
              <Route path="/" element={<Workspace />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/archive/:id" element={<ArchiveDetail />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="*" element={<Workspace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
