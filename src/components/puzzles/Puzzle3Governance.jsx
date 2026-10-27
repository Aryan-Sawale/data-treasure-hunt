import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Lightbulb, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle, GitFork } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { isDevHelperEnabled } from '../../config/questConfig';
import { hapticService } from '../../services/hapticService';

const STAGES = [
  {
    stepId: 1,
    title: 'Discover & Scan Metadata',
    subtitle: 'Scan technical data catalogs',
    icon: '🔍'
  },
  {
    stepId: 2,
    title: 'Enrich & Understand Data',
    subtitle: 'Classify and assign ownership',
    icon: '🧠'
  },
  {
    stepId: 3,
    title: 'Connect & Trace Lineage',
    subtitle: 'Trace end-to-end pipeline hops',
    icon: '🔗'
  },
  {
    stepId: 4,
    title: 'Visualize & Act',
    subtitle: 'Analyze impacts and act',
    icon: '📊'
  }
];

export default function Puzzle3Governance({ onSolved, onPenalty }) {
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

  // Submit button verification handler (No intermediate green feedback)
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
      setErrorMessage('Sequence is incorrect (-5 pts). Reorder steps from 1 to 4 and submit again!');
      if (onPenalty) {
        onPenalty(5, 'Incorrect Lineage Sequence');
      }
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const correctOrder = [STAGES[0], STAGES[1], STAGES[2], STAGES[3]];
    setItems(correctOrder);
    setErrorMessage(null);
    setSelectedIdx(null);
    setIsSuccess(true);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-3.5">
      {/* Challenge Header & Concise Prompt (Emoji Puzzle Style) */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 4 of 4
          </span>
          <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#F0FDF4] border border-[#009488]/30 text-[#009488]">
            4 Steps
          </span>
        </div>

        {/* Larger Font, Green Brand Color with Icon */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span>Data Lineage Sequence</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            {selectedIdx !== null ? (
              <span className="text-[#9E6E00]">Tap another step to swap positions.</span>
            ) : (
              <span>Tap steps to swap into correct order.</span>
            )}
          </p>
        </div>
      </div>

      {/* Sequential Lineage Chain (Neutral styling - no early green spoiler) */}
      <div className="space-y-2">
        {items.map((item, idx) => {
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
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Step Slot & Icon */}
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                  isSuccess
                    ? 'bg-[#009488] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : `${idx + 1}`}
                </div>
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#878787] mt-0.5 leading-tight truncate">
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

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSuccess}
        className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-40 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all"
      >
        <CheckCircle2 className="w-4 h-4 text-[#F9BD20]" />
        <span>Submit Sequence</span>
      </button>

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center space-x-1 text-[#878787] hover:text-[#B45309]"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
            <span>{showHint ? 'Hide Hint' : 'View Lifecycle Order'}</span>
          </button>

          <button
            onClick={() => onSolved()}
            className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            ⚡ Quick Complete ➔
          </button>
        </div>
      )}

      {isDevHelperEnabled() && showHint && (
        <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700 space-y-1">
          <p className="font-bold text-[#9E6E00]">Standard Lineage Lifecycle:</p>
          <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-slate-600">
            <li>Discover & Scan Metadata</li>
            <li>Enrich & Understand Data</li>
            <li>Connect & Trace Lineage</li>
            <li>Visualize & Act</li>
          </ol>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">Lineage Sequence Certified!</h4>
          <p className="text-[11px] text-slate-600">Stop 4: BDM and Data Lineage (House Slytherin) Unlocked</p>
        </div>
      )}
    </div>
  );
}
