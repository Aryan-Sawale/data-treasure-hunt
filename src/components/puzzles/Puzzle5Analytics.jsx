import React, { useState } from 'react';
import { BrainCircuit, CheckCircle2, Lightbulb, ShieldAlert, AlertOctagon, Sparkles } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { isDevHelperEnabled } from '../../config/questConfig';
import { hapticService } from '../../services/hapticService';

const ACCOUNTS = [
  { id: '101', name: 'Mule Node A', city: 'Amsterdam', isMule: true, x: 80, y: 50 },
  { id: '204', name: 'Mule Node B', city: 'Rotterdam', isMule: true, x: 220, y: 50 },
  { id: '309', name: 'Mule Node C', city: 'Utrecht', isMule: true, x: 150, y: 150 },
  { id: '401', name: 'Bakery B.V.', city: 'Haarlem', isMule: false, x: 25, y: 140 },
  { id: '502', name: 'Dutch Telecom', city: 'The Hague', isMule: false, x: 275, y: 140 },
  { id: '603', name: 'Salary Corp', city: 'Eindhoven', isMule: false, x: 150, y: 10 }
];

export default function Puzzle5Analytics({ onSolved }) {
  const [selected, setSelected] = useState(new Set());
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const toggleAccount = (acc) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();

    const updated = new Set(selected);
    if (updated.has(acc.id)) {
      updated.delete(acc.id);
    } else {
      updated.add(acc.id);
    }
    setSelected(updated);

    // Check if the 3 mule accounts are selected
    if (updated.size === 3 && updated.has('101') && updated.has('204') && updated.has('309')) {
      setIsSuccess(true);
      soundService.playSuccess();
      hapticService.victory();
      setTimeout(() => {
        onSolved();
      }, 1200);
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setSelected(new Set(['101', '204', '309']));
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
          <span className="font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI & Analytics Challenge: The Mule Ring
          </span>
          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-purple-300">
            {selected.size}/3 Accounts Selected
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Our graph AI flagged an illegal circular transaction loop. Tap the <strong className="text-purple-400">3 accounts</strong> transferring money in a closed cycle (A ➔ B ➔ C ➔ A).
        </p>
      </div>

      {/* Interactive Visual Graph Canvas */}
      <div className="relative bg-slate-950 p-2 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
        <svg viewBox="0 0 300 200" className="w-full h-auto select-none">
          {/* Background grid markings */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            {/* Arrowhead marker */}
            <marker id="arrow" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#818CF8" />
            </marker>
            <marker id="arrow-fraud" viewBox="0 0 10 10" refX="16" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#EC4899" />
            </marker>
          </defs>

          <rect width="300" height="200" fill="url(#grid)" />

          {/* Benign Transfer Lines */}
          <line x1="150" y1="20" x2="80" y2="50" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="80" y1="50" x2="25" y2="140" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="220" y1="50" x2="275" y2="140" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Suspicious Circular Loop (A -> B -> C -> A) */}
          <line
            x1="80"
            y1="50"
            x2="220"
            y2="50"
            stroke={isSuccess ? "#EC4899" : "#6366F1"}
            strokeWidth={isSuccess ? "3" : "2"}
            markerEnd={isSuccess ? "url(#arrow-fraud)" : "url(#arrow)"}
            className={isSuccess ? "animate-pulse" : ""}
          />
          <line
            x1="220"
            y1="50"
            x2="150"
            y2="150"
            stroke={isSuccess ? "#EC4899" : "#6366F1"}
            strokeWidth={isSuccess ? "3" : "2"}
            markerEnd={isSuccess ? "url(#arrow-fraud)" : "url(#arrow)"}
            className={isSuccess ? "animate-pulse" : ""}
          />
          <line
            x1="150"
            y1="150"
            x2="80"
            y2="50"
            stroke={isSuccess ? "#EC4899" : "#6366F1"}
            strokeWidth={isSuccess ? "3" : "2"}
            markerEnd={isSuccess ? "url(#arrow-fraud)" : "url(#arrow)"}
            className={isSuccess ? "animate-pulse" : ""}
          />

          {/* Nodes */}
          {ACCOUNTS.map((acc) => {
            const isPicked = selected.has(acc.id);

            return (
              <g
                key={acc.id}
                onClick={() => toggleAccount(acc)}
                className="cursor-pointer transition-all active:scale-95"
              >
                {/* Node Halo */}
                <circle
                  cx={acc.x}
                  cy={acc.y}
                  r={isPicked ? 20 : 16}
                  fill={isPicked ? '#A855F7' : '#0F172A'}
                  stroke={isPicked ? '#E879F9' : '#334155'}
                  strokeWidth="2.5"
                  className={isPicked ? 'drop-shadow-lg shadow-purple-500' : ''}
                />

                {/* Account Icon / Number */}
                <text
                  x={acc.x}
                  y={acc.y + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  #{acc.id}
                </text>

                {/* Label text */}
                <text
                  x={acc.x}
                  y={acc.y + 26}
                  textAnchor="middle"
                  fill={isPicked ? '#F0ABFC' : '#94A3B8'}
                  fontSize="8"
                  fontWeight="600"
                >
                  {acc.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Success Overlay Banner */}
        {isSuccess && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-purple-400 mb-2 animate-bounce" />
            <h4 className="text-base font-extrabold text-white">Money Mule Ring Isolated!</h4>
            <p className="text-xs text-purple-300 font-mono mt-0.5">AI Confidence Score: 99.8%</p>
            <p className="text-xs text-slate-300 mt-2">Unlocking the Final Vault Digit...</p>
          </div>
        )}
      </div>

      {/* Selected Nodes Indicator */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-400">
        <span>Selected: {Array.from(selected).map(id => `#${id}`).join(', ') || 'None'}</span>
        <span className="text-[11px] text-purple-400 font-medium">Tap nodes to toggle</span>
      </div>

      {/* Controls & Hints */}
      {isDevHelperEnabled() && (
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-purple-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 active:scale-95 transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-slate-500 hover:text-slate-300 text-[11px] px-2 py-1 rounded"
        >
          Auto Detect
        </button>
      </div>
      )}

      {isDevHelperEnabled() && showHint && (
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 space-y-1">
          <p className="font-semibold">💡 Fraud Ring Hint:</p>
          <p className="text-slate-300">
            Look at the center triangle formed by <strong>#101 (Amsterdam)</strong>, <strong>#204 (Rotterdam)</strong>, and <strong>#309 (Utrecht)</strong>. Tap all 3 of them!
          </p>
        </div>
      )}
    </div>
  );
}

