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
      <div className="glass-card p-3.5 rounded-xl border border-[#009488]/20 bg-white">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-[#009488] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#009488]" />
            Marketplace Challenge: Product Handshake
          </span>
          <span className="font-mono text-[10px] bg-[#009488]/10 px-2 py-0.5 rounded text-[#009488] font-bold">
            {matchCount}/3 Matched
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Tune the 3 Marketplace handshake parameters to subscribe to the certified banking data product and verify its lineage.
        </p>
      </div>

      {/* Real-time Oscilloscope Signal Monitor */}
      <div className="bg-[#021715] p-3 rounded-xl border border-[#009488]/30 space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-300 flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#00B3A4] animate-pulse" />
            LIVE TELEMETRY WAVEFORM
          </span>
          <span className={`font-bold ${matchCount === 3 ? 'text-[#00B3A4]' : 'text-[#F9BD20]'}`}>
            {matchCount === 3 ? 'SYNCHRONIZED (100k msg/s)' : 'UNSYNCHRONIZED'}
          </span>
        </div>

        {/* Dynamic Waveform SVG */}
        <div className="h-16 w-full bg-black/60 rounded-lg overflow-hidden relative flex items-center border border-[#009488]/30">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
            {matchCount === 3 ? (
              // Clean sine wave
              <path
                d="M 0 30 Q 25 10 50 30 T 100 30 T 150 30 T 200 30"
                fill="none"
                stroke="#00B3A4"
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
                stroke={matchCount === 2 ? '#F9BD20' : '#EF4444'}
                strokeWidth="2"
              />
            )}
          </svg>
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#009488_1px,transparent_1px),linear-gradient(to_bottom,#009488_1px,transparent_1px)] bg-[size:20px_20px] opacity-15 pointer-events-none" />
        </div>
      </div>

      {/* 3 Parameter Selection Controls */}
      <div className="space-y-3">
        {/* Parameter 1: Protocol */}
        <div className="bg-[#F8FAFA] p-3 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-[#009488] uppercase tracking-wider block mb-2">
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
                className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-all shadow-sm ${
                  selectedProto === idx
                    ? p.valid
                      ? 'bg-[#F0FDF4] border-2 border-[#009488] text-[#009488] font-bold'
                      : 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#009488]/40'
                }`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] font-mono text-[#878787]">{p.speed}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parameter 2: Latency SLA */}
        <div className="bg-[#F8FAFA] p-3 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-[#009488] uppercase tracking-wider block mb-2">
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
                className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-all shadow-sm ${
                  selectedLatency === idx
                    ? l.valid
                      ? 'bg-[#F0FDF4] border-2 border-[#009488] text-[#009488] font-bold'
                      : 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#009488]/40'
                }`}
              >
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parameter 3: Security */}
        <div className="bg-[#F8FAFA] p-3 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-[#009488] uppercase tracking-wider block mb-2">
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
                className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-all shadow-sm ${
                  selectedSecurity === idx
                    ? s.valid
                      ? 'bg-[#F0FDF4] border-2 border-[#009488] text-[#009488] font-bold'
                      : 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-[#009488]/40'
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
            ? 'bg-gradient-to-r from-[#009488] to-[#007066] hover:from-[#00A89B] hover:to-[#007066] text-white shadow-lg shadow-[#009488]/30 animate-pulse'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
        }`}
      >
        <Zap className="w-4 h-4" />
        <span>{matchCount === 3 ? "Establish Data Product Handshake" : "Validate Contract Configuration"}</span>
      </button>

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
          Auto Align
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#F8FAFA] border border-[#009488]/30 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-[#009488]">💡 Marketplace & Lineage Hint:</p>
          <p className="text-slate-600">
            For certified Data Marketplace products, select: <strong>Apache Kafka Event Mesh</strong>, <strong>&lt; 15 ms latency SLA</strong>, and <strong>mTLS + Banking OAuth 2.0</strong>!
          </p>
        </div>
      )}
    </div>
  );
}

