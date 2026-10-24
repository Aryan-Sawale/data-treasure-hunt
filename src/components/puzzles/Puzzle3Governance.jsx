import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Lightbulb, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
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
  const [errorMessage, setErrorMessage] = useState(null);

  const handleCardClick = (idx) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    setErrorMessage(null);

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
    }
  };

  const moveUp = (e, index) => {
    e.stopPropagation();
    if (index === 0 || isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    setErrorMessage(null);
    const updated = [...items];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    setSelectedIdx(null);
  };

  const moveDown = (e, index) => {
    e.stopPropagation();
    if (index === items.length - 1 || isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    setErrorMessage(null);
    const updated = [...items];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setItems(updated);
    setSelectedIdx(null);
  };

  // Submit button verification handler
  const handleSubmit = () => {
    if (isSuccess) return;

    const isCorrect = items.every((item, idx) => item.stepId === idx + 1);

    if (isCorrect) {
      setIsSuccess(true);
      setErrorMessage(null);
      setSelectedIdx(null);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    } else {
      soundService.playError();
      hapticService.error();
      setErrorMessage("Sequence is not quite right yet. Reorder steps from 1 to 4 and try again!");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const correctOrder = [STAGES[0], STAGES[1], STAGES[2], STAGES[3]];
    setItems(correctOrder);
    setErrorMessage(null);
    setSelectedIdx(null);
  };

  const correctCount = items.filter((item, idx) => item.stepId === idx + 1).length;

  return (
    <div className="space-y-3.5">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488]">Data Lineage Trail</h3>
          <p className="text-xs text-[#878787]">
            {selectedIdx !== null ? (
              <span className="text-[#9E6E00] font-bold">Now tap another step to swap!</span>
            ) : (
              <span>Order steps from first (1) to final (4), then submit.</span>
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
                  : isSuccess
                  ? 'bg-[#F0FDF4] border-[#009488] scale-[1.01]'
                  : isAtCorrectPosition
                  ? 'bg-[#F0FDF4] border-[#009488]/40'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Step Slot & Icon */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                  isSuccess || isAtCorrectPosition
                    ? 'bg-[#009488] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : `${idx + 1}`}
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
      </div>

      {/* Error message if sequence is incorrect */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center space-x-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-1">
        <button
          onClick={handleSubmit}
          disabled={isSuccess}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2.5 transition-all shadow-md active:scale-[0.98] ${
            isSuccess
              ? 'bg-[#009488] text-white border-b-4 border-[#006E64]'
              : 'bg-[#009488] hover:bg-[#007E74] text-white shadow-[#009488]/25 border-b-4 border-[#006E64]'
          }`}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
              <span>Sequence Verified! Proceeding...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#F9BD20]" />
              <span>Submit Sequence</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-0.5">
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
