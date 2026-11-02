import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw, KeyRound } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

// Left Column: Capabilities
const CAPABILITIES = [
  {
    id: 1,
    title: 'Data Sharing Agreement',
    matchId: 'def-1',
    theme: {
      border: 'border-teal-500',
      bg: 'bg-teal-50/60',
      badge: 'bg-teal-600 text-white border-teal-600',
      pill: 'bg-teal-100 text-teal-800 border-teal-300',
    },
  },
  {
    id: 2,
    title: 'Data Access Management',
    matchId: 'def-2',
    theme: {
      border: 'border-sky-500',
      bg: 'bg-sky-50/60',
      badge: 'bg-sky-600 text-white border-sky-600',
      pill: 'bg-sky-100 text-sky-800 border-sky-300',
    },
  },
  {
    id: 3,
    title: 'Integrated Dataset framework',
    matchId: 'def-3',
    theme: {
      border: 'border-amber-500',
      bg: 'bg-amber-50/60',
      badge: 'bg-amber-600 text-white border-amber-600',
      pill: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  },
  {
    id: 4,
    title: 'Metadata Management',
    matchId: 'def-4',
    theme: {
      border: 'border-indigo-500',
      bg: 'bg-indigo-50/60',
      badge: 'bg-indigo-600 text-white border-indigo-600',
      pill: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
  },
];

// Right Column: Definitions (initial non-aligned scramble: 4, 1, 2, 3)
const DEFINITIONS = [
  {
    id: 'def-4',
    partnerId: 4,
    text: 'Describes meaning, owner and quality of each dataset',
  },
  {
    id: 'def-1',
    partnerId: 1,
    text: 'Agrees purpose, terms and allowed use',
  },
  {
    id: 'def-2',
    partnerId: 2,
    text: 'Grants, reviews and revokes access',
  },
  {
    id: 'def-3',
    partnerId: 3,
    text: 'Combines several datasets into one consistent view',
  },
];

export default function Puzzle0CapabilityMatch({ onSolved, onPenalty }) {
  // matches: { [capabilityId]: definitionId }
  const [matches, setMatches] = useState({});
  const [selectedLeftId, setSelectedLeftId] = useState(null);
  const [selectedRightId, setSelectedRightId] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPairs = CAPABILITIES.length; // 4
  const pairedCount = Object.keys(matches).length;

  // Helper: Find which capability is paired with a definition
  const getPairedCapIdForDef = (defId) => {
    const entry = Object.entries(matches).find(([_, dId]) => dId === defId);
    return entry ? parseInt(entry[0], 10) : null;
  };

  // Pair a capability and definition
  const assignPair = (capId, defId) => {
    soundService.playDialTick();
    hapticService.light();

    setMatches((prev) => {
      const next = { ...prev };
      // If definition was already assigned to another capability, remove previous
      Object.keys(next).forEach((cId) => {
        if (next[cId] === defId) {
          delete next[cId];
        }
      });
      // Assign
      next[capId] = defId;
      return next;
    });

    setSelectedLeftId(null);
    setSelectedRightId(null);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSelectLeft = (capId) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();

    if (selectedRightId) {
      assignPair(capId, selectedRightId);
    } else {
      setSelectedLeftId(capId === selectedLeftId ? null : capId);
    }
  };

  const handleSelectRight = (defId) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();

    if (selectedLeftId) {
      assignPair(selectedLeftId, defId);
    } else {
      setSelectedRightId(defId === selectedRightId ? null : defId);
    }
  };

  const handleClearAll = () => {
    if (isSuccess) return;
    soundService.playClick();
    hapticService.light();
    setMatches({});
    setSelectedLeftId(null);
    setSelectedRightId(null);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmitMatches = () => {
    if (isSuccess || pairedCount < totalPairs) return;

    let correctCount = 0;
    CAPABILITIES.forEach((cap) => {
      if (matches[cap.id] === cap.matchId) {
        correctCount++;
      }
    });

    if (correctCount === totalPairs) {
      // 4 / 4 Correct!
      setIsSuccess(true);
      setErrorMsg(null);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1500);
    } else {
      // Incorrect pairings
      const wrongCount = totalPairs - correctCount;
      soundService.playError();
      hapticService.error();
      setIsBoardShaking(true);
      setTimeout(() => setIsBoardShaking(false), 600);

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setErrorMsg(`${wrongCount} of 4 matches are incorrect (-5 pts). Tap any card to adjust pairs!`);

      if (onPenalty) {
        onPenalty(5, 'Incorrect Capability Matches');
      }
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const solved = {};
    CAPABILITIES.forEach((c) => {
      solved[c.id] = c.matchId;
    });
    setMatches(solved);
    setIsSuccess(true);
    setTimeout(() => {
      onSolved();
    }, 800);
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header & Prompt */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 1
          </span>
          <span
            className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
              pairedCount === totalPairs
                ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                : 'bg-amber-100/60 border-amber-300 text-amber-900'
            }`}
          >
            {pairedCount}/{totalPairs} Paired
          </span>
        </div>

        {/* Title with icon & Green brand styling */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span>Match the Capabilities</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Decide all 4 matches, then submit your answers.
          </p>
        </div>
      </div>

      {/* Subheaders & Clear Action */}
      <div className="flex items-center justify-between px-1 text-[10px] font-mono font-extrabold uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-[#009488]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#009488]" />
          <span>Tap capability</span>
        </div>
        <div className="flex items-center gap-2">
          {pairedCount > 0 && !isSuccess && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-slate-500 hover:text-rose-600 underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Tap definition</span>
          </div>
        </div>
      </div>

      {/* Match The Following 2-Column Grid */}
      <div
        className={`grid grid-cols-2 gap-2 sm:gap-2.5 transition-transform ${
          isBoardShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Left Column: Capabilities */}
        <div className="space-y-2">
          {CAPABILITIES.map((cap) => {
            const pairedDefId = matches[cap.id];
            const isPaired = !!pairedDefId;
            const isSelected = selectedLeftId === cap.id;
            const theme = cap.theme;

            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => handleSelectLeft(cap.id)}
                disabled={isSuccess}
                className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all select-none min-h-[76px] sm:min-h-[82px] flex items-center gap-2 relative ${
                  isSuccess
                    ? 'bg-[#F0FDF4] border-[#009488] text-[#009488] opacity-95 shadow-2xs'
                    : isSelected
                    ? 'bg-[#FFFDF5] border-[#F9BD20] ring-2 ring-[#F9BD20]/50 shadow-sm scale-[1.02]'
                    : isPaired
                    ? `${theme.bg} ${theme.border} shadow-xs`
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer active:scale-[0.98]'
                }`}
              >
                {/* Number Badge */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 border ${
                    isSuccess
                      ? 'bg-[#009488] text-white border-[#009488]'
                      : isSelected
                      ? 'bg-[#F9BD20] text-slate-950 border-[#F9BD20]'
                      : isPaired
                      ? theme.badge
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : cap.id}
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs sm:text-sm font-black block leading-tight ${
                      isSuccess ? 'text-[#009488]' : 'text-slate-900'
                    }`}
                  >
                    {cap.title}
                  </span>
                  {isPaired && !isSuccess && (
                    <span className="text-[9px] font-mono text-slate-500 font-bold block mt-0.5">
                      Paired ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Definitions */}
        <div className="space-y-2">
          {DEFINITIONS.map((def) => {
            const pairedCapId = getPairedCapIdForDef(def.id);
            const isPaired = pairedCapId !== null;
            const pairedCap = isPaired ? CAPABILITIES.find((c) => c.id === pairedCapId) : null;
            const isSelected = selectedRightId === def.id;
            const theme = pairedCap?.theme;

            return (
              <button
                key={def.id}
                type="button"
                onClick={() => handleSelectRight(def.id)}
                disabled={isSuccess}
                className={`w-full p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all select-none min-h-[76px] sm:min-h-[82px] flex items-center gap-2 relative ${
                  isSuccess
                    ? 'bg-[#F0FDF4] border-[#009488] text-[#009488] opacity-95 shadow-2xs'
                    : isSelected
                    ? 'bg-[#FFFDF5] border-[#F9BD20] ring-2 ring-[#F9BD20]/50 shadow-sm scale-[1.02]'
                    : isPaired && theme
                    ? `${theme.bg} ${theme.border} shadow-xs`
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs cursor-pointer active:scale-[0.98]'
                }`}
              >
                {/* Paired Partner Indicator */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 border ${
                    isSuccess
                      ? 'bg-[#009488] text-white border-[#009488]'
                      : isSelected
                      ? 'bg-[#F9BD20] text-slate-950 border-[#F9BD20]'
                      : isPaired && theme
                      ? theme.badge
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : isPaired ? pairedCapId : '?'}
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={`text-[11px] sm:text-xs font-bold block leading-snug ${
                      isSuccess ? 'text-[#009488]' : 'text-slate-700'
                    }`}
                  >
                    {def.text}
                  </span>
                  {isPaired && !isSuccess && (
                    <span className="text-[9px] font-mono text-slate-500 font-bold block mt-0.5">
                      Matched with #{pairedCapId}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error notification */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Submit Button (Activated once all 4 are decided) */}
      {!isSuccess ? (
        <button
          type="button"
          onClick={handleSubmitMatches}
          disabled={pairedCount < totalPairs}
          className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-45 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
        >
          <KeyRound className="w-4 h-4 text-[#F9BD20]" />
          <span>
            {pairedCount === totalPairs
              ? 'Submit Matches'
              : `Pair all 4 capabilities (${pairedCount}/4)`}
          </span>
        </button>
      ) : (
        /* Completion Banner */
        <div className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center space-y-2.5 animate-fade-in shadow-md">
          <div className="flex items-center justify-center gap-2 text-[#009488] font-black text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-[#009488] animate-bounce" />
            <span>All 4 Matches Correct!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Great job! Proceeding to Challenge 2...
          </p>
          <button
            onClick={onSolved}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Proceed to Challenge 2</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#878787] text-[11px]">
            Target: 4 Correct Pairs
          </span>
          <button
            type="button"
            onClick={handleAutoSolve}
            className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            ⚡ Quick Complete ➔
          </button>
        </div>
      )}
    </div>
  );
}
