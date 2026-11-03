import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const GRID_LETTERS = [
  ['K', 'S', 'O', 'W', 'N', 'E', 'R', 'B'],
  ['P', 'T', 'F', 'H', 'A', 'C', 'U', 'D'],
  ['V', 'X', 'I', 'R', 'J', 'N', 'G', 'L'],
  ['A', 'Z', 'B', 'M', 'I', 'P', 'K', 'T'],
  ['L', 'Y', 'O', 'Q', 'E', 'S', 'W', 'A'],
  ['I', 'M', 'U', 'D', 'N', 'L', 'C', 'V'],
  ['D', 'E', 'H', 'F', 'B', 'R', 'Y', 'E'],
  ['Q', 'A', 'T', 'U', 'V', 'O', 'X', 'N'],
];

const TARGET_WORDS = [
  {
    word: 'TIMELY',
    start: [1, 1],
    end: [6, 6],
  },
  {
    word: 'UNIQUE',
    start: [1, 6],
    end: [6, 1],
  },
  {
    word: 'OWNER',
    start: [0, 2],
    end: [0, 6],
  },
  {
    word: 'VALID',
    start: [2, 0],
    end: [6, 0],
  },
];

// Helper: Given start (r1, c1) and end (r2, c2), return all cells in straight line
const getLineCells = (r1, c1, r2, c2) => {
  const dr = r2 - r1;
  const dc = c2 - c1;

  const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;

  // Must be straight horizontal, vertical, or 45-deg diagonal
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
    return null;
  }

  const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const cells = [];

  for (let i = 0; i < length; i++) {
    cells.push([r1 + i * stepR, c1 + i * stepC]);
  }

  return cells;
};

export default function Puzzle2WordSearch({ onSolved, onPenalty }) {
  const [foundWordKeys, setFoundWordKeys] = useState([]); // ['TIMELY', 'OWNER', ...]
  const [selectedStart, setSelectedStart] = useState(null); // [r, c]
  const [errorMsg, setErrorMsg] = useState(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Compute set of all found cell coordinates
  const foundCellKeys = new Set();
  foundWordKeys.forEach((wKey) => {
    const target = TARGET_WORDS.find((t) => t.word === wKey);
    if (target) {
      const line = getLineCells(target.start[0], target.start[1], target.end[0], target.end[1]);
      if (line) {
        line.forEach(([r, c]) => foundCellKeys.add(`${r},${c}`));
      }
    }
  });

  const handleCellClick = (r, c) => {
    if (isSuccess) return;

    // First letter selection
    if (!selectedStart) {
      soundService.playDialTick();
      hapticService.light();
      setSelectedStart([r, c]);
      setErrorMsg(null);
      return;
    }

    // Tap same letter: deselect
    if (selectedStart[0] === r && selectedStart[1] === c) {
      soundService.playClick();
      hapticService.light();
      setSelectedStart(null);
      return;
    }

    // Second letter tapped: check line
    const [r1, c1] = selectedStart;
    const lineCells = getLineCells(r1, c1, r, c);

    if (!lineCells) {
      // Not a straight line
      soundService.playError();
      hapticService.error();
      setErrorMsg('Letters must form a line! Tap the first letter, then the last.');
      setSelectedStart(null);
      return;
    }

    // Form word from line
    const wordForward = lineCells.map(([cr, cc]) => GRID_LETTERS[cr][cc]).join('');
    const wordBackward = [...wordForward].reverse().join('');

    // Check if matches any target word
    const matchedTarget = TARGET_WORDS.find(
      (t) => (t.word === wordForward || t.word === wordBackward) && !foundWordKeys.includes(t.word)
    );

    if (matchedTarget) {
      // Found a valid word!
      soundService.playSuccess();
      hapticService.success();
      setSelectedStart(null);
      setErrorMsg(null);

      const nextFound = [...foundWordKeys, matchedTarget.word];
      setFoundWordKeys(nextFound);

      // Check win condition
      if (nextFound.length === TARGET_WORDS.length) {
        setIsSuccess(true);
        setTimeout(() => {
          onSolved();
        }, 1800);
      }
    } else {
      // Invalid word selection
      soundService.playError();
      hapticService.error();
      setIsBoardShaking(true);
      setTimeout(() => setIsBoardShaking(false), 500);

      setErrorMsg(`"${wordForward}" is not one of the target words. Check the word list below!`);
      setSelectedStart(null);
    }
  };

  const handleReset = () => {
    if (isSuccess) return;
    soundService.playClick();
    hapticService.light();
    setSelectedStart(null);
    setFoundWordKeys([]);
    setErrorMsg(null);
  };

  // Dev Quick Complete
  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setFoundWordKeys(TARGET_WORDS.map((w) => w.word));
    setIsSuccess(true);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-3.5 animate-fade-in select-none">
      {/* Header & Prompt */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 8
          </span>
          <span
            className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
              foundWordKeys.length === TARGET_WORDS.length
                ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                : 'bg-amber-100/60 border-amber-300 text-amber-900'
            }`}
          >
            {foundWordKeys.length}/{TARGET_WORDS.length} Words Found
          </span>
        </div>

        {/* Title with icon & Green brand styling */}
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <span>Find the 4 key data asset terms</span>
          </h2>
          <p className="text-xs font-bold text-slate-600">
            Tap the first and last letter to select a word.
          </p>
        </div>
      </div>

      {/* Helper Prompt or Reset Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-bold text-slate-500">
          {selectedStart ? (
            <span className="text-[#009488] font-black flex items-center gap-1.5 animate-pulse">
              <span>● Started at "{GRID_LETTERS[selectedStart[0]][selectedStart[1]]}"</span>
              <span>➔ Now tap the last letter</span>
            </span>
          ) : (
            <span>Tap the first letter of a word</span>
          )}
        </span>

        {foundWordKeys.length > 0 && !isSuccess && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-mono font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 8x8 Word Search Letter Grid */}
      <div
        className={`bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-slate-200 shadow-sm transition-transform ${
          isBoardShaking ? 'animate-shake' : ''
        }`}
      >
        <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
          {GRID_LETTERS.map((row, r) =>
            row.map((letter, c) => {
              const cellKey = `${r},${c}`;
              const isFound = foundCellKeys.has(cellKey);
              const isStart = selectedStart && selectedStart[0] === r && selectedStart[1] === c;

              return (
                <button
                  key={cellKey}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={isSuccess}
                  className={`aspect-square rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center transition-all select-none border-2 cursor-pointer ${
                    isStart
                      ? 'bg-[#FFFDF5] border-[#F9BD20] text-slate-950 ring-4 ring-[#F9BD20]/40 scale-105 shadow-md z-10'
                      : isFound
                      ? 'bg-[#F9BD20] border-[#D97706] text-slate-950 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 active:scale-95'
                  }`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Target Words Checklist */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 block px-1">
          Words to Find ({foundWordKeys.length}/4)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TARGET_WORDS.map((item) => {
            const isFound = foundWordKeys.includes(item.word);

            return (
              <div
                key={item.word}
                className={`py-2 px-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  isFound
                    ? 'bg-[#F0FDF4] border-[#009488] text-[#009488] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span className={`text-xs font-mono font-black tracking-wider ${isFound ? 'line-through opacity-85' : ''}`}>
                  {item.word}
                </span>
                {isFound ? (
                  <CheckCircle2 className="w-4 h-4 text-[#009488] shrink-0 ml-1.5" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 ml-1.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Completion Banner */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center space-y-2.5 animate-fade-in shadow-md">
          <div className="flex items-center justify-center gap-2 text-[#009488] font-black text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-[#009488] animate-bounce" />
            <span>Cracked it! All 4 Words Found!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            You've validated the core pillars of trusted data assets: Timely, Owner, Unique, and Valid.
          </p>
          <button
            type="button"
            onClick={onSolved}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Proceed to Presentation</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#878787] text-[11px]">
            Target: 4 Words (TIMELY, OWNER, UNIQUE, VALID)
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
