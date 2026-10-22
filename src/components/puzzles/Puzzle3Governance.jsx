import React, { useState } from 'react';
import { FileCheck, ArrowDown, ArrowUp, Lightbulb, CheckCircle2, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

const STAGES = [
  {
    stepId: 1,
    title: 'Raw Ingestion',
    subtitle: 'Core Banking Mainframe & Payment Streams',
    badge: 'STAGE 1',
    icon: '📥',
    detail: 'Unfiltered transaction logs from Dutch payment rails.'
  },
  {
    stepId: 2,
    title: 'PII Masking & Privacy',
    subtitle: 'GDPR / BSN Tokenization Engine',
    badge: 'STAGE 2',
    icon: '🔒',
    detail: 'Customer citizen numbers (BSN) masked with SHA-256 tokens.'
  },
  {
    stepId: 3,
    title: 'Gold Catalog & Metadata',
    subtitle: 'Searchable Dictionary & Data Lineage',
    badge: 'STAGE 3',
    icon: '🏷️',
    detail: 'Curated financial definitions tagged with data stewards.'
  },
  {
    stepId: 4,
    title: 'ABN AMRO Statutory Report',
    subtitle: 'ABN AMRO Capital Adequacy Regulatory Filing',
    badge: 'STAGE 4',
    icon: '🏛️',
    detail: 'Audited statutory report delivered to regulatory authority.'
  }
];

export default function Puzzle3Governance({ onSolved }) {
  // Scrambled initial order: [3, 1, 4, 2]
  const [items, setItems] = useState([
    STAGES[2],
    STAGES[0],
    STAGES[3],
    STAGES[1]
  ]);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if current order matches [1, 2, 3, 4]
  const checkOrder = (currentItems) => {
    const isCorrect = currentItems.every((item, idx) => item.stepId === idx + 1);
    if (isCorrect) {
      setIsSuccess(true);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    }
  };

  const moveUp = (index) => {
    if (index === 0 || isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    const updated = [...items];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    checkOrder(updated);
  };

  const moveDown = (index) => {
    if (index === items.length - 1 || isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    const updated = [...items];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    checkOrder(updated);
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const correctOrder = [STAGES[0], STAGES[1], STAGES[2], STAGES[3]];
    setItems(correctOrder);
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
            <FileCheck className="w-3.5 h-3.5" />
            Governance Challenge: Lineage Trail
          </span>
          <span className="font-mono text-[10px] bg-[#009488]/10 px-2 py-0.5 rounded text-[#009488] font-bold">
            ABN AMRO Audit Check
          </span>
        </div>
        <p className="text-xs text-slate-600">
          ABN AMRO requires verified data lineage. Use the arrows to reorder the 4 stages from <strong className="text-[#009488]">Raw Ingestion (Top)</strong> down to the <strong className="text-[#009488]">ABN AMRO Statutory Filing (Bottom)</strong>.
        </p>
      </div>

      {/* Sequential Lineage Chain */}
      <div className="space-y-2 relative">
        {items.map((item, idx) => {
          const isAtCorrectPosition = item.stepId === idx + 1;

          return (
            <div key={item.stepId} className="relative">
              <div
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 shadow-sm ${
                  isSuccess
                    ? 'bg-[#F0FDF4] border-2 border-[#009488]'
                    : isAtCorrectPosition
                    ? 'bg-[#F0FDF4] border-2 border-[#009488]'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Left badge & info */}
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-xs">{item.title}</span>
                      <span className="text-[10px] font-mono text-[#878787] bg-slate-100 px-1.5 py-0.2 rounded font-semibold">
                        Pos {idx + 1}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{item.subtitle}</p>
                    <p className="text-[10px] text-[#878787] mt-0.5">{item.detail}</p>
                  </div>
                </div>

                {/* Move Controls */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0 || isSuccess}
                    className={`p-1.5 rounded-lg border text-xs transition-all ${
                      idx === 0 || isSuccess
                        ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'bg-slate-50 hover:bg-[#F0FDF4] border-slate-200 text-[#009488] active:scale-95 shadow-sm'
                    }`}
                    aria-label="Move stage up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === items.length - 1 || isSuccess}
                    className={`p-1.5 rounded-lg border text-xs transition-all ${
                      idx === items.length - 1 || isSuccess
                        ? 'opacity-30 border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'bg-slate-50 hover:bg-[#F0FDF4] border-slate-200 text-[#009488] active:scale-95 shadow-sm'
                    }`}
                    aria-label="Move stage down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Connecting Line between cards */}
              {idx < items.length - 1 && (
                <div className="flex justify-center -my-1 relative z-10">
                  <div className={`w-0.5 h-3 ${isSuccess ? 'bg-[#009488]' : 'bg-slate-300'}`} />
                </div>
              )}
            </div>
          );
        })}

        {/* Success Overlay Banner */}
        {isSuccess && (
          <div className="p-3 rounded-xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
            <span className="font-extrabold text-[#009488] text-xs block">Lineage Trail Cryptographically Certified!</span>
            <span className="text-[11px] text-slate-600">ABN AMRO & GDPR Regulatory Compliance Confirmed</span>
          </div>
        )}
      </div>

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
          Auto Sequence
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#F8FAFA] border border-[#009488]/30 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-[#009488]">💡 Governance Lineage Hint:</p>
          <p className="text-slate-600">
            Think about privacy & compliance order: First data arrives (Raw Ingestion) ➔ Then sensitive data is anonymized (PII Masking) ➔ Then it's cataloged for reuse (Gold Catalog) ➔ Finally, the certified ABN AMRO statutory report is generated!
          </p>
        </div>
      )}
    </div>
  );
}

