import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Lightbulb, CheckCircle2, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

const STAGES = [
  {
    stepId: 1,
    title: 'Raw Ingestion',
    subtitle: 'Payment Streams & Transcripts',
    icon: '📥'
  },
  {
    stepId: 2,
    title: 'PII Masking & Privacy',
    subtitle: 'GDPR & Tokenization Engine',
    icon: '🔒'
  },
  {
    stepId: 3,
    title: 'Gold Catalog & Lineage',
    subtitle: 'Business Dictionary & Metadata',
    icon: '🏷️'
  },
  {
    stepId: 4,
    title: 'Statutory Audit Report',
    subtitle: 'Regulatory Compliance Filing',
    icon: '🏛️'
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
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if current order matches [1, 2, 3, 4]
  const checkOrder = (currentItems) => {
    const isCorrect = currentItems.every((item, idx) => item.stepId === idx + 1);
    if (isCorrect) {
      setIsSuccess(true);
      setSelectedIdx(null);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    }
  };

  const handleCardClick = (idx) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();

    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null); // Deselect if tapped again
    } else {
      // Swap items
      const updated = [...items];
      const temp = updated[selectedIdx];
      updated[selectedIdx] = updated[idx];
      updated[idx] = temp;
      setItems(updated);
      setSelectedIdx(null);
      checkOrder(updated);
    }
  };

  const moveUp = (e, index) => {
    e.stopPropagation();
    if (index === 0 || isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    const updated = [...items];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    setSelectedIdx(null);
    checkOrder(updated);
  };

  const moveDown = (e, index) => {
    e.stopPropagation();
    if (index === items.length - 1 || isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    const updated = [...items];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    setSelectedIdx(null);
    checkOrder(updated);
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const correctOrder = [STAGES[0], STAGES[1], STAGES[2], STAGES[3]];
    setItems(correctOrder);
    setIsSuccess(true);
    setSelectedIdx(null);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  const correctCount = items.filter((item, idx) => item.stepId === idx + 1).length;

  return (
    <div className="space-y-3">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488]">Data Lineage Trail</h3>
          <p className="text-xs text-[#878787]">
            {selectedIdx !== null ? (
              <span className="text-[#9E6E00] font-bold">Now tap another step to swap!</span>
            ) : (
              <span>Order steps from first (1) to final (4).</span>
            )}
          </p>
        </div>
        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#009488] border border-[#009488]/30">
          {correctCount}/4 in place
        </span>
      </div>

      {/* Sequential Lineage Chain */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isAtCorrectPosition = item.stepId === idx + 1;
          const isSelected = selectedIdx === idx;

          return (
            <div
              key={item.stepId}
              onClick={() => handleCardClick(idx)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs active:scale-[0.99] select-none ${
                isSelected
                  ? 'bg-[#FFFDF5] border-[#F9BD20] ring-2 ring-[#F9BD20]/30 shadow-md'
                  : isSuccess || isAtCorrectPosition
                  ? 'bg-[#F0FDF4] border-[#009488]/50'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Step Slot & Icon */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                  isAtCorrectPosition
                    ? 'bg-[#009488] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {isAtCorrectPosition ? <CheckCircle2 className="w-4 h-4" /> : `${idx + 1}`}
                </div>
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#878787] mt-0.5 leading-tight">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Move Buttons */}
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={(e) => moveUp(e, idx)}
                  disabled={idx === 0 || isSuccess}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                    idx === 0 || isSuccess
                      ? 'opacity-20 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-[#F8FAFA] hover:bg-slate-100 border-slate-200 text-[#009488] active:scale-90'
                  }`}
                  aria-label="Move up"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  onClick={(e) => moveDown(e, idx)}
                  disabled={idx === items.length - 1 || isSuccess}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                    idx === items.length - 1 || isSuccess
                      ? 'opacity-20 border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'bg-[#F8FAFA] hover:bg-slate-100 border-slate-200 text-[#009488] active:scale-90'
                  }`}
                  aria-label="Move down"
                >
                  <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Success Overlay Banner */}
        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
            <ShieldCheck className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
            <span className="font-black text-[#009488] text-xs block">Lineage Trail Verified!</span>
            <span className="text-[11px] text-slate-600">Regulatory Audit Passed</span>
          </div>
        )}
      </div>

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
          Auto Sequence
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700 animate-fade-in">
          <p className="font-bold text-[#9E6E00] mb-0.5">💡 Lineage Order:</p>
          <p className="text-slate-600">
            1. Raw Ingestion ➔ 2. PII Masking ➔ 3. Gold Catalog ➔ 4. Audit Report
          </p>
        </div>
      )}
    </div>
  );
}
