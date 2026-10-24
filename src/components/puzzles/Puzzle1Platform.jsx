import React, { useState } from 'react';
import { 
  CreditCard, 
  FileSpreadsheet, 
  Smartphone, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Zap,
  Server,
  Cpu,
  Database,
  Link2
} from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

// The 4 Banking Feeds (Left Column)
const SOURCES = [
  {
    id: 'sepa',
    name: 'SEPA Payments',
    subtitle: 'Real-time wire rail',
    targetId: 'stream',
    icon: CreditCard,
  },
  {
    id: 'ledger',
    name: 'Daily Ledgers',
    subtitle: 'Batch ledger files',
    targetId: 'batch',
    icon: FileSpreadsheet,
  },
  {
    id: 'atm',
    name: 'ATM Terminals',
    subtitle: 'Sub-ms withdrawals',
    targetId: 'cache',
    icon: Smartphone,
  },
  {
    id: 'clickstream',
    name: 'Mobile App',
    subtitle: 'High-speed telemetry',
    targetId: 'lakehouse',
    icon: Activity,
  }
];

// The 4 Cloud Engines (Right Column - Scrambled for real matching challenge)
const TARGETS = [
  {
    id: 'batch',
    name: 'Spark Batch',
    subtitle: 'High-volume ETL',
    icon: Server,
  },
  {
    id: 'stream',
    name: 'Kafka Stream',
    subtitle: 'Event bus',
    icon: Zap,
  },
  {
    id: 'lakehouse',
    name: 'Delta Lake',
    subtitle: 'Storage & SQL',
    icon: Database,
  },
  {
    id: 'cache',
    name: 'Memory Cache',
    subtitle: 'Low-latency RAM',
    icon: Cpu,
  }
];

export default function Puzzle1Platform({ onSolved }) {
  const [selectedSource, setSelectedSource] = useState(null);
  const [connections, setConnections] = useState({}); // { sourceId: targetId }
  const [errorTarget, setErrorTarget] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const matchedCount = Object.keys(connections).length;

  const handleSelectSource = (sourceId) => {
    if (isSuccess || connections[sourceId]) return;
    soundService.playDialTick();
    hapticService.light();
    setErrorTarget(null);
    setSelectedSource(selectedSource === sourceId ? null : sourceId);
  };

  const handleSelectTarget = (targetId) => {
    if (isSuccess) return;

    // Check if target is already connected to something
    const alreadyConnectedSource = Object.keys(connections).find(sId => connections[sId] === targetId);
    if (alreadyConnectedSource) return;

    if (!selectedSource) {
      soundService.playError();
      hapticService.light();
      return;
    }

    const currentSource = SOURCES.find(s => s.id === selectedSource);
    
    if (currentSource.targetId === targetId) {
      // Correct Match!
      soundService.playSuccess();
      hapticService.success();
      setErrorTarget(null);

      const next = { ...connections, [selectedSource]: targetId };
      setConnections(next);
      setSelectedSource(null);

      if (Object.keys(next).length === SOURCES.length) {
        setIsSuccess(true);
        setTimeout(() => {
          onSolved();
        }, 1200);
      }
    } else {
      // Wrong Match
      soundService.playError();
      hapticService.error();
      setErrorTarget(targetId);
      setTimeout(() => setErrorTarget(null), 800);
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const solved = {};
    SOURCES.forEach(s => {
      solved[s.id] = s.targetId;
    });
    setConnections(solved);
    setIsSuccess(true);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-3">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488]">Data Lake Architecture</h3>
          <p className="text-xs text-[#878787]">
            {selectedSource ? (
              <span className="text-[#9E6E00] font-bold">Now tap the matching Cloud Engine!</span>
            ) : (
              <span>Tap a banking feed, then tap its cloud engine.</span>
            )}
          </p>
        </div>
        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#009488] border border-[#009488]/30">
          {matchedCount}/4 Linked
        </span>
      </div>

      {/* Side-by-Side 2-Column Matching Board */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Left Column: Banking Feeds */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-1">
            Data Feeds
          </span>

          {SOURCES.map((s) => {
            const isConnected = !!connections[s.id];
            const isSelected = selectedSource === s.id;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => handleSelectSource(s.id)}
                disabled={isConnected || isSuccess}
                className={`w-full p-2.5 rounded-xl border-2 text-left transition-all relative select-none ${
                  isConnected
                    ? 'bg-[#F0FDF4] border-[#009488] opacity-90'
                    : isSelected
                    ? 'bg-[#FFFDF5] border-[#F9BD20] ring-2 ring-[#F9BD20]/30 shadow-md scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300 active:scale-98 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isConnected ? 'text-[#009488]' : isSelected ? 'text-[#9E6E00]' : 'text-slate-600'}`} />
                  {isConnected && <CheckCircle2 className="w-3.5 h-3.5 text-[#009488]" />}
                </div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">{s.name}</div>
                <div className="text-[10px] text-[#878787] mt-0.5 truncate">{s.subtitle}</div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Cloud Engines */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-1">
            Cloud Engines
          </span>

          {TARGETS.map((t) => {
            const isConnected = Object.values(connections).includes(t.id);
            const isError = errorTarget === t.id;
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                onClick={() => handleSelectTarget(t.id)}
                disabled={isConnected || isSuccess}
                className={`w-full p-2.5 rounded-xl border-2 text-left transition-all relative select-none ${
                  isConnected
                    ? 'bg-[#F0FDF4] border-[#009488] opacity-90'
                    : isError
                    ? 'bg-rose-50 border-rose-400 text-rose-600 animate-shake'
                    : selectedSource
                    ? 'bg-white border-slate-300 hover:border-[#009488] active:scale-98 shadow-xs'
                    : 'bg-white border-slate-200 active:scale-98 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isConnected ? 'text-[#009488]' : 'text-slate-600'}`} />
                  {isConnected && <CheckCircle2 className="w-3.5 h-3.5 text-[#009488]" />}
                </div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">{t.name}</div>
                <div className="text-[10px] text-[#009488] mt-0.5 truncate font-medium">{t.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">Data Lake Ingestion Active!</h4>
          <p className="text-[11px] text-slate-600">All 4 streams operating at 100k events/sec</p>
        </div>
      )}

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-[#878787] hover:text-[#009488] px-3 py-1.5 rounded-xl bg-white border border-slate-200 active:scale-95 transition-all shadow-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>{showHint ? "Hide Hint" : "Hint"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline font-medium"
        >
          Auto Link
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700 animate-fade-in space-y-1">
          <p className="font-bold text-[#9E6E00]">💡 Matching Clue:</p>
          <p className="text-slate-600 text-[11px]">
            • SEPA ➔ Kafka Stream<br />
            • Ledgers ➔ Spark Batch<br />
            • ATM ➔ Memory Cache<br />
            • Mobile App ➔ Delta Lake
          </p>
        </div>
      )}
    </div>
  );
}
