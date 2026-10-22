import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Zap, 
  Cpu, 
  CreditCard, 
  FileSpreadsheet, 
  Smartphone, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

// The 4 Core Banking Feeds (Sources)
const SOURCES = [
  {
    id: 'sepa',
    name: 'SEPA Instant Rail',
    desc: 'Euro payments & wire transfers',
    volume: '35,000 tx/s',
    targetId: 'stream',
    icon: CreditCard,
    color: 'text-amber-400'
  },
  {
    id: 'ledger',
    name: 'End-of-Day Ledgers',
    desc: 'Batch general ledger postings',
    volume: '12 GB / file',
    targetId: 'batch',
    icon: FileSpreadsheet,
    color: 'text-blue-400'
  },
  {
    id: 'atm',
    name: 'ATM Cash Terminals',
    desc: 'Sub-millisecond cash withdrawals',
    volume: '8,000 tx/s',
    targetId: 'cache',
    icon: Smartphone,
    color: 'text-emerald-400'
  },
  {
    id: 'clickstream',
    name: 'Mobile App Events',
    desc: 'Customer in-app telemetry',
    volume: '50,000 msg/s',
    targetId: 'lakehouse',
    icon: Activity,
    color: 'text-purple-400'
  }
];

// The 4 Cloud Platform Ingestion Engines (Destinations)
const TARGETS = [
  {
    id: 'stream',
    name: 'Real-Time Event Stream',
    tech: 'Apache Kafka Cluster',
    sourceId: 'sepa',
    icon: Zap,
    color: 'border-amber-500/50'
  },
  {
    id: 'batch',
    name: 'Distributed Batch Engine',
    tech: 'Apache Spark / Databricks',
    sourceId: 'ledger',
    icon: Server,
    color: 'border-blue-500/50'
  },
  {
    id: 'cache',
    name: 'In-Memory Cache Hub',
    tech: 'High-Speed Memory Cache',
    sourceId: 'atm',
    icon: Cpu,
    color: 'border-emerald-500/50'
  },
  {
    id: 'lakehouse',
    name: 'Cloud Delta Lakehouse',
    tech: 'Parquet & Object Storage',
    sourceId: 'clickstream',
    icon: Database,
    color: 'border-purple-500/50'
  }
];

export default function Puzzle1Platform({ onSolved }) {
  const [selectedSource, setSelectedSource] = useState(null);
  const [connections, setConnections] = useState({}); // { sourceId: targetId }
  const [errorMessage, setErrorMessage] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const matchedCount = Object.keys(connections).length;
  const throughput = matchedCount * 25000;

  const handleSelectSource = (sourceId) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    setErrorMessage(null);

    // If already connected, allow re-selecting or changing
    setSelectedSource(sourceId);
  };

  const handleSelectTarget = (targetId) => {
    if (isSuccess) return;

    if (!selectedSource) {
      soundService.playError();
      hapticService.light();
      setErrorMessage("Select a Banking Data Feed on the left first!");
      return;
    }

    const currentSource = SOURCES.find(s => s.id === selectedSource);
    
    if (currentSource.targetId === targetId) {
      // Correct Match!
      soundService.playSuccess();
      hapticService.success();
      setErrorMessage(null);

      const next = { ...connections, [selectedSource]: targetId };
      setConnections(next);
      setSelectedSource(null);

      if (Object.keys(next).length === SOURCES.length) {
        setIsSuccess(true);
        setTimeout(() => {
          onSolved();
        }, 1300);
      }
    } else {
      // Wrong Match
      soundService.playError();
      hapticService.error();
      setErrorMessage(`Incompatible architecture! ${currentSource.name} needs a different cloud engine.`);
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
    <div className="space-y-4">
      {/* Objective Card */}
      <div className="glass-card p-3.5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Platform Challenge: Cloud Ingestion Match
          </span>
          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300">
            {matchedCount}/4 Linked
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Match each <strong className="text-white">Banking Data Feed</strong> to its optimal <strong className="text-cyan-400">Cloud Platform Engine</strong> to achieve 100,000 events/sec capacity.
        </p>
      </div>

      {/* Throughput & Health Meter */}
      <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">INGESTION THROUGHPUT</span>
          <span className={`font-bold ${matchedCount === 4 ? 'text-emerald-400 font-extrabold animate-pulse' : 'text-cyan-400'}`}>
            {throughput.toLocaleString()} tx/sec {matchedCount === 4 ? '• OPTIMAL' : ''}
          </span>
        </div>

        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              matchedCount === 4
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/50'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${(matchedCount / 4) * 100}%` }}
          />
        </div>

        {/* Instructions / Feedback Banner */}
        {errorMessage ? (
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center space-x-1.5 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : selectedSource ? (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center space-x-1.5 animate-fade-in">
            <ArrowRight className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span>Now tap the matching <strong>Cloud Ingestion Engine</strong> below!</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 text-center">
            Tap a banking feed, then tap its cloud engine to link them.
          </div>
        )}
      </div>

      {/* Section 1: Banking Data Feeds */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          1. Incoming Dutch Banking Feeds
        </span>
        <div className="grid grid-cols-2 gap-2">
          {SOURCES.map((s) => {
            const isConnected = !!connections[s.id];
            const isSelected = selectedSource === s.id;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => handleSelectSource(s.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden active:scale-95 ${
                  isConnected
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                    : isSelected
                    ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : s.color}`} />
                  {isConnected && (
                    <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                      ✓ LINKED
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-white leading-tight">{s.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.desc}</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">{s.volume}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Cloud Ingestion Engines */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block px-1">
          2. Target Cloud Platform Engines
        </span>
        <div className="grid grid-cols-2 gap-2">
          {TARGETS.map((t) => {
            const isConnected = Object.values(connections).includes(t.id);
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                onClick={() => handleSelectTarget(t.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden active:scale-95 ${
                  isConnected
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  {isConnected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="font-bold text-xs text-white leading-tight">{t.name}</div>
                <div className="text-[10px] text-cyan-300/80 truncate mt-0.5">{t.tech}</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">
                  {isConnected ? 'Active & Receiving' : 'Awaiting Connection'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Banner */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/25 to-emerald-500/20 border border-emerald-500/60 text-center animate-fade-in space-y-1">
          <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto animate-bounce" />
          <h4 className="text-sm font-extrabold text-white">Cloud Lakehouse Fully Connected!</h4>
          <p className="text-xs text-emerald-300 font-mono">Capacity: 100,000 events/sec • Latency: &lt; 5ms</p>
          <p className="text-[11px] text-slate-300">Revealing Team 1 Profile & Location...</p>
        </div>
      )}

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 active:scale-95 transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-slate-500 hover:text-slate-300 text-[11px] px-2 py-1 rounded"
        >
          Auto Link
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
          <p className="font-semibold">💡 Platform Architecture Clue:</p>
          <p className="text-slate-300">
            • <strong>SEPA Instant</strong> ➔ Real-Time Event Stream (Kafka)<br />
            • <strong>End-of-Day Ledgers</strong> ➔ Distributed Batch Engine (Spark)<br />
            • <strong>ATM Terminals</strong> ➔ In-Memory Cache Hub<br />
            • <strong>Mobile App Events</strong> ➔ Cloud Delta Lakehouse
          </p>
        </div>
      )}
    </div>
  );
}
