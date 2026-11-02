import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, ArrowRight, AlertCircle, Play, Eye } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const BUTTONS = [
  {
    id: 0,
    title: 'Data Origin',
    icon: '💾',
    theme: {
      idle: 'bg-teal-600 hover:bg-teal-500 border-teal-700 text-white shadow-teal-700/30',
      lit: 'bg-teal-300 border-teal-200 text-teal-950 ring-4 ring-teal-400 shadow-lg shadow-teal-400/60 scale-[1.03]',
    },
  },
  {
    id: 1,
    title: 'Transformation',
    icon: '⚡',
    theme: {
      idle: 'bg-amber-600 hover:bg-amber-500 border-amber-700 text-white shadow-amber-700/30',
      lit: 'bg-amber-300 border-amber-200 text-amber-950 ring-4 ring-amber-400 shadow-lg shadow-amber-400/60 scale-[1.03]',
    },
  },
  {
    id: 2,
    title: 'Lineage Hop',
    icon: '🔗',
    theme: {
      idle: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-700 text-white shadow-emerald-700/30',
      lit: 'bg-emerald-300 border-emerald-200 text-emerald-950 ring-4 ring-emerald-400 shadow-lg shadow-emerald-400/60 scale-[1.03]',
    },
  },
  {
    id: 3,
    title: 'Catalog Target',
    icon: '📊',
    theme: {
      idle: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-700 text-white shadow-indigo-700/30',
      lit: 'bg-indigo-300 border-indigo-200 text-indigo-950 ring-4 ring-indigo-400 shadow-lg shadow-indigo-400/60 scale-[1.03]',
    },
  },
];

const TOTAL_ROUNDS = 4;
const ROUND_LENGTHS = [3, 4, 5, 6]; // Steps in Round 1, 2, 3, 4

export default function Puzzle3LineageSimon({ onSolved, onPenalty }) {
  const [round, setRound] = useState(1); // 1, 2, 3, 4
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeLitButton, setActiveLitButton] = useState(null);
  // gamePhase: 'NOT_STARTED', 'WATCHING', 'PLAYING', 'ROUND_CLEARED', 'SUCCESS'
  const [gamePhase, setGamePhase] = useState('NOT_STARTED');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const timeoutIds = useRef([]);

  const clearAllTimeouts = () => {
    timeoutIds.current.forEach((id) => clearTimeout(id));
    timeoutIds.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  // Flash a single button with tone
  const flashButton = (btnId, duration = 400) => {
    setActiveLitButton(btnId);
    soundService.playButtonTone(btnId);
    hapticService.light();

    const tid = setTimeout(() => {
      setActiveLitButton(null);
    }, duration);
    timeoutIds.current.push(tid);
  };

  // Play full sequence for current round
  const playSequence = useCallback((seq) => {
    clearAllTimeouts();
    setIsPlayingSequence(true);
    setGamePhase('WATCHING');
    setPlayerInput([]);

    const stepDelay = 550;
    const initialDelay = 500;

    seq.forEach((btnId, idx) => {
      const tid = setTimeout(() => {
        flashButton(btnId, 360);
      }, initialDelay + idx * stepDelay);
      timeoutIds.current.push(tid);
    });

    const totalDuration = initialDelay + seq.length * stepDelay + 250;
    const endTid = setTimeout(() => {
      setIsPlayingSequence(false);
      setGamePhase('PLAYING');
    }, totalDuration);
    timeoutIds.current.push(endTid);
  }, []);

  // Generate sequence of given length
  const generateNewSequence = (len) => {
    const seq = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    return seq;
  };

  // Start specific round
  const startRound = useCallback((roundNum) => {
    const len = ROUND_LENGTHS[roundNum - 1] || 3;
    const newSeq = generateNewSequence(len);
    setRound(roundNum);
    setSequence(newSeq);
    setPlayerInput([]);
    if (errorMsg) setErrorMsg(null);
    playSequence(newSeq);
  }, [errorMsg, playSequence]);

  // Initial user start button
  const handleStartGame = () => {
    soundService.playSuccess();
    hapticService.medium();
    startRound(1);
  };

  // Continue to next round button
  const handleNextRound = () => {
    soundService.playSuccess();
    hapticService.medium();
    const nextRound = round + 1;
    startRound(nextRound);
  };

  // Handle player button click
  const handleButtonClick = (btnId) => {
    if (isSuccess || isPlayingSequence || gamePhase !== 'PLAYING') return;

    // Flash button feedback
    flashButton(btnId, 220);

    const nextStepIndex = playerInput.length;
    const expectedBtnId = sequence[nextStepIndex];

    if (btnId === expectedBtnId) {
      // Correct button pressed
      const nextInput = [...playerInput, btnId];
      setPlayerInput(nextInput);
      if (errorMsg) setErrorMsg(null);

      // Check if current round completed
      if (nextInput.length === sequence.length) {
        soundService.playSuccess();
        hapticService.success();

        if (round < TOTAL_ROUNDS) {
          // Pause and let user proceed to next round
          setGamePhase('ROUND_CLEARED');
        } else {
          // Completed all 3 rounds!
          setIsSuccess(true);
          setGamePhase('SUCCESS');
        }
      }
    } else {
      // Wrong button pressed
      soundService.playError();
      hapticService.error();
      setIsBoardShaking(true);
      setTimeout(() => setIsBoardShaking(false), 600);

      setErrorMsg('Sequence broken! (-5 pts). Replaying round sequence...');
      if (onPenalty) {
        onPenalty(5, 'Lineage Sequence Memory Slip');
      }

      setPlayerInput([]);
      const tid = setTimeout(() => {
        playSequence(sequence);
      }, 1100);
      timeoutIds.current.push(tid);
    }
  };

  // Replay sequence manually (-5 pts penalty)
  const handleReplaySequence = () => {
    if (isSuccess || isPlayingSequence || sequence.length === 0) return;
    soundService.playClick();
    hapticService.light();

    if (onPenalty) {
      onPenalty(5, 'Replay Lineage Sequence');
    }

    setErrorMsg('Sequence replayed (-5 pts penalty). Watch carefully!');
    playSequence(sequence);
  };

  // Dev Quick Complete
  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setIsSuccess(true);
    setGamePhase('SUCCESS');
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header & Concise Prompt (No How-To-Play section) */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 9
          </span>
          <span
            className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
              isSuccess
                ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                : gamePhase === 'NOT_STARTED'
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-amber-100/60 border-amber-300 text-amber-900'
            }`}
          >
            Round {Math.min(round, TOTAL_ROUNDS)} of {TOTAL_ROUNDS}
          </span>
        </div>

        {/* Title with icon & Green brand styling */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span>Lineage Memory Sequence</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Watch the lineage pipeline nodes light up, then repeat the exact sequence!
          </p>
        </div>
      </div>

      {/* Start Button (If Not Started Yet) */}
      {gamePhase === 'NOT_STARTED' && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-[#F9BD20]" />
            <span>Start Sequence (Round 1 of {TOTAL_ROUNDS})</span>
          </button>
        </div>
      )}

      {/* Round Cleared Prompt (Between Rounds) */}
      {gamePhase === 'ROUND_CLEARED' && (
        <div className="p-3 bg-[#F0FDF4] border-2 border-[#009488] rounded-2xl text-center space-y-2 animate-fade-in shadow-xs">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-[#009488]">
            <CheckCircle2 className="w-4 h-4 text-[#009488]" />
            <span>Round {round} Completed!</span>
          </div>
          <button
            type="button"
            onClick={handleNextRound}
            className="w-full py-2.5 px-3 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm border-b-2 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Start Round {round + 1} ({ROUND_LENGTHS[round]} Steps)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Turn Status & Progress Dots (When Game is Active) */}
      {gamePhase !== 'NOT_STARTED' && gamePhase !== 'ROUND_CLEARED' && (
        <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-2xs flex items-center justify-between">
          {/* Status Prompt */}
          <div className="flex items-center gap-2">
            {isPlayingSequence ? (
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span>Watch sequence...</span>
              </div>
            ) : isSuccess ? (
              <div className="flex items-center gap-1.5 text-xs font-black text-[#009488]">
                <CheckCircle2 className="w-4 h-4 text-[#009488]" />
                <span>All {TOTAL_ROUNDS} Rounds Cleared!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-black text-[#009488]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#009488]" />
                <span>Your Turn! ({playerInput.length}/{sequence.length})</span>
              </div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="flex items-center gap-1.5">
            {sequence.map((_, i) => {
              const isEntered = i < playerInput.length;
              return (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full border transition-all ${
                    isEntered
                      ? 'bg-[#009488] border-[#009488] scale-110 shadow-xs'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 2x2 Memory Buttons Grid */}
      <div
        className={`grid grid-cols-2 gap-3 transition-transform ${
          isBoardShaking ? 'animate-shake' : ''
        }`}
      >
        {BUTTONS.map((btn) => {
          const isLit = activeLitButton === btn.id;
          const theme = btn.theme;
          const isButtonDisabled = isSuccess || isPlayingSequence || gamePhase !== 'PLAYING';

          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => handleButtonClick(btn.id)}
              disabled={isButtonDisabled}
              className={`p-4 sm:p-5 rounded-2xl border-b-4 transition-all select-none min-h-[92px] sm:min-h-[100px] flex flex-col items-center justify-center text-center gap-1.5 relative ${
                isLit ? theme.lit : theme.idle
              } ${
                isButtonDisabled
                  ? 'cursor-not-allowed opacity-85'
                  : 'cursor-pointer active:scale-95'
              }`}
            >
              <span className="text-3xl sm:text-4xl">{btn.icon}</span>
              <span className="text-sm sm:text-base font-black block leading-tight">
                {btn.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Replay Option (-5 pts penalty) */}
      {!isSuccess && !isPlayingSequence && gamePhase === 'PLAYING' && (
        <div className="flex justify-center pt-0.5">
          <button
            type="button"
            onClick={handleReplaySequence}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FEF9C3] border border-[#F9BD20] text-[#9E6E00] hover:text-[#B45309] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Replay the sequence with a 5-point penalty"
          >
            <Eye className="w-3.5 h-3.5 text-[#F9BD20]" />
            <span>Replay Sequence</span>
            <span className="font-mono text-[10px] bg-[#F9BD20]/25 text-[#B45309] px-1.5 py-0.5 rounded font-black">
              -5 pts
            </span>
          </button>
        </div>
      )}

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
            <span>Lineage Memory Mastered!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            All {TOTAL_ROUNDS} pipeline sequences successfully verified. Proceed to the Lineage Sequence puzzle...
          </p>
          <button
            type="button"
            onClick={onSolved}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Proceed to Challenge 10</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#878787] text-[11px]">
            Target: {TOTAL_ROUNDS} Progressive Sequences
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