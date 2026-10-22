import React, { useState, useEffect } from 'react';
import { Activity, Zap, CheckCircle2, Lightbulb, Lock, Radio } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

const PROTOCOLS = [
  { id: 'sftp', label: 'Batch SFTP (Daily)', valid: false, speed: 'Too Slow' },
  { id: 'rest', label: 'HTTP REST Polling', valid: false, speed: 'High Overhead' },
  { id: 'kafka', label: 'Apache Kafka Event Mesh', valid: true, speed: 'Real-Time' }
];

const LATENCIES = [
  { id: 'slow', label: '1,500 ms (Batch Mode)', valid: false },
  { id: 'med', label: '250 ms (Polling Latency)', valid: false },
  { id: 'fast', label: '< 15 ms (Sub-Second SLA)', valid: true }
];

const SECURITIES = [
  { id: 'open', label: 'Unencrypted HTTP', valid: false },
  { id: 'basic', label: 'Basic Auth Token', valid: false },
  { id: 'mtls', label: 'mTLS + Banking OAuth 2.0', valid: true }
];

export default function Puzzle4Delivery({ onSolved }) {
  const [selectedProto, setSelectedProto] = useState(0); // index
  const [selectedLatency, setSelectedLatency] = useState(0);
  const [selectedSecurity, setSelectedSecurity] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isProtocolValid = PROTOCOLS[selectedProto].valid;
  const isLatencyValid = LATENCIES[selectedLatency].valid;
  const isSecurityValid = SECURITIES[selectedSecurity].valid;
  const matchCount = (isProtocolValid ? 1 : 0) + (isLatencyValid ? 1 : 0) + (isSecurityValid ? 1 : 0);

  const handleSync = () => {
    if (matchCount === 3) {
      setIsSynced(true);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    } else {
      soundService.playError();
      hapticService.error();
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setSelectedProto(2); // kafka
    setSelectedLatency(2); // < 15ms
    setSelectedSecurity(2); // mtls
    setIsSynced(true);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Objective Card */}
      <div className="glass-card p-3.5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Delivery Challenge: Real-Time Stream Handshake
          </span>
          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
            {matchCount}/3 Matched
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Configure the API streaming gateway for the Dutch Mobile Banking App to deliver sub-second data safely with zero packet loss.
        </p>
      </div>

      {/* Real-time Oscilloscope Signal Monitor */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            LIVE TELEMETRY WAVEFORM
          </span>
          <span className={`font-bold ${matchCount === 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {matchCount === 3 ? 'SYNCHRONIZED (100k msg/s)' : 'UNSYNCHRONIZED'}
          </span>
        </div>

        {/* Dynamic Waveform SVG */}
        <div className="h-16 w-full bg-slate-900/90 rounded-lg overflow-hidden relative flex items-center border border-slate-800">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
            {matchCount === 3 ? (
              // Clean sine wave
              <path
                d="M 0 30 Q 25 10 50 30 T 100 30 T 150 30 T 200 30"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                className="animate-pulse"
              />
            ) : (
              // Distorted noisy wave
              <path
                d={`M 0 30 Q ${20 + matchCount * 10} ${10 + (3 - matchCount) * 15} 50 30 T 100 ${
                  25 + (3 - matchCount) * 10
                } T 150 30 T 200 30`}
                fill="none"
                stroke={matchCount === 2 ? '#F59E0B' : '#EF4444'}
                strokeWidth="2"
              />
            )}
          </svg>
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none" />
        </div>
      </div>

      {/* 3 Parameter Selection Controls */}
      <div className="space-y-3">
        {/* Parameter 1: Protocol */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            1. Streaming Protocol
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {PROTOCOLS.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => {
                  soundService.playDialTick();
                  hapticService.light();
                  setSelectedProto(idx);
                }}
                className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-all ${
                  selectedProto === idx
                    ? p.valid
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300 font-semibold shadow-sm'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] font-mono text-slate-400">{p.speed}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parameter 2: Latency SLA */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            2. Latency SLA Target
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {LATENCIES.map((l, idx) => (
              <button
                key={l.id}
                onClick={() => {
                  soundService.playDialTick();
                  hapticService.light();
                  setSelectedLatency(idx);
                }}
                className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-all ${
                  selectedLatency === idx
                    ? l.valid
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300 font-semibold shadow-sm'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parameter 3: Security */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
            3. Banking Security Protocol
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {SECURITIES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  soundService.playDialTick();
                  hapticService.light();
                  setSelectedSecurity(idx);
                }}
                className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-all ${
                  selectedSecurity === idx
                    ? s.valid
                      ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300 font-semibold shadow-sm'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Initiate Handshake Button */}
      <button
        onClick={handleSync}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
          matchCount === 3
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
        }`}
      >
        <Zap className="w-4 h-4" />
        <span>{matchCount === 3 ? "Establish Live Stream Handshake" : "Validate API Configuration"}</span>
      </button>

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 active:scale-95 transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-slate-500 hover:text-slate-300 text-[11px] px-2 py-1 rounded"
        >
          Auto Align
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 space-y-1">
          <p className="font-semibold">💡 Data Delivery Hint:</p>
          <p className="text-slate-300">
            For Dutch mobile banking apps, choose the modern event-driven stack: <strong>Apache Kafka</strong>, <strong>&lt; 15 ms latency SLA</strong>, and <strong>mTLS + Banking OAuth 2.0</strong>!
          </p>
        </div>
      )}
    </div>
  );
}

