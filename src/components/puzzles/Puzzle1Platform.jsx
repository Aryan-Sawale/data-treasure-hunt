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
      <div className="glass-card p-3.5 rounded-xl border border-[#009488]/20 bg-white">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-[#009488] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Data Lake Challenge: Cloud Ingestion Match
          </span>
          <span className="font-mono text-[10px] bg-[#009488]/10 px-2 py-0.5 rounded text-[#009488] font-bold">
            {matchedCount}/4 Linked
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Match each <strong className="text-slate-800">Banking Data Feed</strong> to its optimal <strong className="text-[#009488]">Cloud Data Lake Engine</strong> to achieve 100,000 events/sec capacity.
        </p>
      </div>

      {/* Throughput & Health Meter */}
      <div className="bg-[#F8FAFA] p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#878787]">INGESTION THROUGHPUT</span>
          <span className={`font-bold ${matchedCount === 4 ? 'text-[#009488] font-extrabold animate-pulse' : 'text-[#009488]'}`}>
            {throughput.toLocaleString()} tx/sec {matchedCount === 4 ? '• OPTIMAL' : ''}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              matchedCount === 4
                ? 'bg-gradient-to-r from-[#009488] to-[#00B3A4] shadow-md'
                : 'bg-gradient-to-r from-[#009488] to-[#F9BD20]'
            }`}
            style={{ width: `${(matchedCount / 4) * 100}%` }}
          />
        </div>

        {/* Instructions / Feedback Banner */}
        {errorMessage ? (
          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-[11px] flex items-center space-x-1.5 animate-fade-in font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : selectedSource ? (
          <div className="p-2 rounded-lg bg-[#F0FDF4] border border-[#009488]/30 text-[#009488] text-[11px] flex items-center space-x-1.5 animate-fade-in font-medium">
            <ArrowRight className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span>Now tap the matching <strong>Cloud Data Lake Engine</strong> below!</span>
          </div>
        ) : (
          <div className="text-[11px] text-[#878787] text-center">
            Tap a banking feed, then tap its cloud engine to link them.
          </div>
        )}
      </div>

      {/* Section 1: Banking Data Feeds */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#009488] block px-1">
          1. Incoming Banking Feeds
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
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden active:scale-95 shadow-sm ${
                  isConnected
                    ? 'bg-[#F0FDF4] border-2 border-[#009488]'
                    : isSelected
                    ? 'bg-[#F0FDF4] border-2 border-[#009488] ring-2 ring-[#009488]/20'
                    : 'bg-white border-slate-200 hover:border-[#009488]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isConnected ? 'text-[#009488]' : 'text-[#009488]'}`} />
                  {isConnected && (
                    <span className="text-[9px] font-mono text-slate-950 bg-[#F9BD20] px-2 py-0.5 rounded font-black shadow-xs">
                      ✓ LINKED
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-800 leading-tight">{s.name}</div>
                <div className="text-[10px] text-[#878787] truncate mt-0.5">{s.desc}</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">{s.volume}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Cloud Ingestion Engines */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#009488] block px-1">
          2. Target Cloud Lakehouse Engines
        </span>
        <div className="grid grid-cols-2 gap-2">
          {TARGETS.map((t) => {
            const isConnected = Object.values(connections).includes(t.id);
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                onClick={() => handleSelectTarget(t.id)}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden active:scale-95 shadow-sm ${
                  isConnected
                    ? 'bg-[#F0FDF4] border-2 border-[#009488]'
                    : 'bg-white border-slate-200 hover:border-[#009488]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`w-4 h-4 ${isConnected ? 'text-[#009488]' : 'text-[#009488]'}`} />
                  {isConnected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#009488]" />
                  )}
                </div>
                <div className="font-bold text-xs text-slate-800 leading-tight">{t.name}</div>
                <div className="text-[10px] text-[#009488] truncate mt-0.5 font-medium">{t.tech}</div>
                <div className="text-[9px] font-mono text-[#878787] mt-1">
                  {isConnected ? 'Active & Receiving' : 'Awaiting Connection'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Banner */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in space-y-1 shadow-md">
          <CheckCircle2 className="w-7 h-7 text-[#009488] mx-auto animate-bounce" />
          <h4 className="text-sm font-extrabold text-[#009488]">Enterprise Data Lake Fully Connected!</h4>
          <p className="text-xs text-slate-700 font-mono">Capacity: 100,000 events/sec • Latency: &lt; 5ms</p>
          <p className="text-[11px] text-[#878787]">Revealing Team 2 Profile & Harry Potter House...</p>
        </div>
      )}

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-[#878787] hover:text-[#009488] px-3 py-1.5 rounded-lg bg-white border border-slate-200 active:scale-95 transition-all shadow-sm"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline"
        >
          Auto Link
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#F8FAFA] border border-[#009488]/30 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-[#009488]">💡 Platform Architecture Clue:</p>
          <p className="text-slate-600">
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
