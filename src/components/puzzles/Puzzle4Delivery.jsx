import React, { useState } from 'react';
import { Activity, Zap, CheckCircle2, Lightbulb, Radio, Shield } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

const PARAMETERS = [
  {
    name: '1. Protocol',
    options: [
      { id: 'sftp', label: 'SFTP (Daily)', valid: false },
      { id: 'rest', label: 'REST API', valid: false },
      { id: 'kafka', label: 'Kafka Stream', valid: true }
    ]
  },
  {
    name: '2. Max Latency SLA',
    options: [
      { id: 'slow', label: '1,500 ms', valid: false },
      { id: 'med', label: '250 ms', valid: false },
      { id: 'fast', label: '< 15 ms', valid: true }
    ]
  },
  {
    name: '3. Security Standard',
    options: [
      { id: 'open', label: 'Plain HTTP', valid: false },
      { id: 'token', label: 'Basic Token', valid: false },
      { id: 'mtls', label: 'mTLS + OAuth', valid: true }
    ]
  }
];

export default function Puzzle4Delivery({ onSolved }) {
  // Store selected option index for each parameter (defaults to 0)
  const [selections, setSelections] = useState([0, 0, 0]);
  const [isSynced, setIsSynced] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Check valid count
  const isProtoValid = PARAMETERS[0].options[selections[0]].valid;
  const isLatencyValid = PARAMETERS[1].options[selections[1]].valid;
  const isSecValid = PARAMETERS[2].options[selections[2]].valid;
  const matchCount = (isProtoValid ? 1 : 0) + (isLatencyValid ? 1 : 0) + (isSecValid ? 1 : 0);

  const handleSelect = (paramIdx, optIdx) => {
    if (isSynced) return;
    soundService.playDialTick();
    hapticService.light();

    const next = [...selections];
    next[paramIdx] = optIdx;
    setSelections(next);

    const protoOk = PARAMETERS[0].options[next[0]].valid;
    const latencyOk = PARAMETERS[1].options[next[1]].valid;
    const secOk = PARAMETERS[2].options[next[2]].valid;

    if (protoOk && latencyOk && secOk) {
      setIsSynced(true);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setSelections([2, 2, 2]); // All valid
    setIsSynced(true);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-3">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488]">Marketplace Handshake</h3>
          <p className="text-xs text-[#878787]">
            Tune 3 parameters to match the banking SLA.
          </p>
        </div>
        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border ${
          matchCount === 3 
            ? 'bg-[#F0FDF4] text-[#009488] border-[#009488]/30' 
            : 'bg-[#FFFDF5] text-[#9E6E00] border-[#F9BD20]/40'
        }`}>
          {matchCount}/3 Synced
        </span>
      </div>

      {/* Compact Waveform Visualizer */}
      <div className="bg-[#021715] p-2.5 rounded-2xl border border-[#009488]/30 space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between text-[10px] font-mono px-1">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-[#00B3A4] animate-pulse" />
            TELEMETRY SIGNAL
          </span>
          <span className={`font-black ${matchCount === 3 ? 'text-[#00B3A4]' : 'text-[#F9BD20]'}`}>
            {matchCount === 3 ? 'SIGNAL LOCKED • 100% SLA' : `CALIBRATING (${matchCount * 33}%)`}
          </span>
        </div>

        {/* Dynamic Waveform SVG */}
        <div className="h-12 w-full bg-black/60 rounded-xl overflow-hidden relative flex items-center border border-[#009488]/20">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 48">
            {matchCount === 3 ? (
              // Clean sine wave
              <path
                d="M 0 24 Q 25 6 50 24 T 100 24 T 150 24 T 200 24"
                fill="none"
                stroke="#00B3A4"
                strokeWidth="2.5"
                className="animate-pulse"
              />
            ) : (
              // Distorted wave
              <path
                d={`M 0 24 Q ${20 + matchCount * 15} ${6 + (3 - matchCount) * 12} 50 24 T 100 ${
                  20 + (3 - matchCount) * 8
                } T 150 24 T 200 24`}
                fill="none"
                stroke={matchCount === 2 ? '#F9BD20' : '#EF4444'}
                strokeWidth="2"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Horizontal Segmented Parameter Selectors */}
      <div className="space-y-2">
        {PARAMETERS.map((param, pIdx) => {
          const currentOptIdx = selections[pIdx];
          const isCurrentValid = param.options[currentOptIdx].valid;

          return (
            <div key={param.name} className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-extrabold text-slate-800">
                  {param.name}
                </span>
                {isCurrentValid && (
                  <span className="text-[10px] text-[#009488] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> OK
                  </span>
                )}
              </div>

              {/* 3-Pill Horizontal Row */}
              <div className="grid grid-cols-3 gap-1.5">
                {param.options.map((opt, oIdx) => {
                  const isSelected = currentOptIdx === oIdx;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(pIdx, oIdx)}
                      disabled={isSynced}
                      className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all select-none active:scale-95 ${
                        isSelected
                          ? opt.valid
                            ? 'bg-[#009488] text-white shadow-sm'
                            : 'bg-rose-50 text-rose-700 border border-rose-300'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span className="truncate block">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Notification */}
      {isSynced && (
        <div className="p-3 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">Data Marketplace Handshake Established!</h4>
          <p className="text-[11px] text-slate-600">Secure real-time telemetry stream connected</p>
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
          Auto Align
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700 animate-fade-in space-y-1">
          <p className="font-bold text-[#9E6E00]">💡 Target Handshake:</p>
          <p className="text-slate-600 text-[11px]">
            • Protocol: <strong>Kafka Stream</strong><br />
            • SLA: <strong>&lt; 15 ms</strong><br />
            • Security: <strong>mTLS + OAuth</strong>
          </p>
        </div>
      )}
    </div>
  );
}
