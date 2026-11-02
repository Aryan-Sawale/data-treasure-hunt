import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Play, RotateCcw, Clock } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const GRID_SIZE = 9; // 3x3
const TARGET_CLEANSED = 8;
const TIME_LIMIT = 10; // 15 seconds countdown
const POPUP_LIFETIME = 1200; // ms item stays visible (brisk reaction required)
const SPAWN_INTERVAL = 680; // ms between spawns

const BUG_TYPES = [
  { type: 'bug', icon: '🐛', label: 'Bad Schema' },
  { type: 'bug', icon: '👾', label: 'Corrupt Row' },
  { type: 'bug', icon: '⚠️', label: 'Null Glitch' },
  { type: 'bug', icon: '💥', label: 'Syntax Error' },
];

const CLEAN_TYPES = [
  { type: 'clean', icon: '💎', label: 'Clean Asset' },
  { type: 'clean', icon: '🛡️', label: 'Verified Record' },
];

export default function Puzzle2AnomalyWhack({ onSolved, onPenalty }) {
  const [cleansedCount, setCleansedCount] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isExpired, setIsExpired] = useState(false);
  const [slots, setSlots] = useState(() => Array(GRID_SIZE).fill(null));
  const [whackedSlots, setWhackedSlots] = useState({}); // { [slotIndex]: timestamp }
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);

  const spawnTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const startTimeRef = useRef(null);
  const itemTimeoutsRef = useRef({});

  // Stop all active timers & timeouts
  const clearAllTimers = () => {
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    Object.values(itemTimeoutsRef.current).forEach((tid) => clearTimeout(tid));
    itemTimeoutsRef.current = {};
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Spawn an item in a free slot
  const spawnItem = useCallback(() => {
    setSlots((prevSlots) => {
      // Find empty slots
      const emptyIndices = [];
      prevSlots.forEach((slot, idx) => {
        if (!slot) emptyIndices.push(idx);
      });

      if (emptyIndices.length === 0) return prevSlots;

      // Pick random empty slot
      const randomSlotIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

      // 75% chance bug, 25% chance clean asset
      const isBug = Math.random() < 0.75;
      const template = isBug
        ? BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)]
        : CLEAN_TYPES[Math.floor(Math.random() * CLEAN_TYPES.length)];

      const item = {
        ...template,
        id: Date.now() + Math.random(),
        slotIdx: randomSlotIdx,
      };

      // Set timeout to clear this item after POPUP_LIFETIME
      if (itemTimeoutsRef.current[randomSlotIdx]) {
        clearTimeout(itemTimeoutsRef.current[randomSlotIdx]);
      }

      itemTimeoutsRef.current[randomSlotIdx] = setTimeout(() => {
        setSlots((curr) => {
          const next = [...curr];
          if (next[randomSlotIdx] && next[randomSlotIdx].id === item.id) {
            next[randomSlotIdx] = null;
          }
          return next;
        });
      }, POPUP_LIFETIME);

      const next = [...prevSlots];
      next[randomSlotIdx] = item;
      return next;
    });
  }, []);

  // Handle countdown timeout
  const handleTimeout = useCallback(() => {
    clearAllTimers();
    setGameStarted(false);
    setIsExpired(true);
    setSlots(Array(GRID_SIZE).fill(null));
    setTimeLeft(0);

    soundService.playError();
    hapticService.error();
    setIsBoardShaking(true);
    setTimeout(() => setIsBoardShaking(false), 600);

    if (onPenalty) {
      onPenalty(5, 'Anomaly Cleansing Timeout');
    }

    setErrorMsg(`⏱️ Time expired (-5 pts)! Cleansed ${cleansedCount} of ${TARGET_CLEANSED} bugs. Try again!`);
  }, [cleansedCount, onPenalty]);

  // Start or restart game handler
  const handleStartGame = () => {
    clearAllTimers();
    soundService.playSuccess();
    hapticService.medium();

    setGameStarted(true);
    setIsExpired(false);
    setCleansedCount(0);
    setErrorMsg(null);
    setTimeLeft(TIME_LIMIT);
    setSlots(Array(GRID_SIZE).fill(null));

    startTimeRef.current = Date.now();

    // Spawn loop
    spawnItem();
    spawnTimerRef.current = setInterval(() => {
      spawnItem();
    }, SPAWN_INTERVAL);

    // Countdown loop (every 100ms)
    countdownTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TIME_LIMIT - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleTimeout();
      }
    }, 100);
  };

  // Handle slot tap
  const handleSlotClick = (slotIdx) => {
    if (!gameStarted || isSuccess || isExpired) return;

    const currentItem = slots[slotIdx];
    if (!currentItem) return;

    // Clear timeout for this slot
    if (itemTimeoutsRef.current[slotIdx]) {
      clearTimeout(itemTimeoutsRef.current[slotIdx]);
      delete itemTimeoutsRef.current[slotIdx];
    }

    if (currentItem.type === 'bug') {
      // Successfully whacked an anomaly!
      soundService.playWhack();
      hapticService.medium();

      // Show whacked effect
      setWhackedSlots((prev) => ({ ...prev, [slotIdx]: true }));
      setTimeout(() => {
        setWhackedSlots((prev) => {
          const next = { ...prev };
          delete next[slotIdx];
          return next;
        });
      }, 400);

      // Remove item from slot
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });

      const nextCleansed = cleansedCount + 1;
      setCleansedCount(nextCleansed);
      if (errorMsg) setErrorMsg(null);

      // Check win condition
      if (nextCleansed >= TARGET_CLEANSED) {
        clearAllTimers();
        setIsSuccess(true);
        setGameStarted(false);
        soundService.playSuccess();
        hapticService.success();
      }
    } else if (currentItem.type === 'clean') {
      // Mistakenly whacked a clean data asset!
      soundService.playError();
      hapticService.error();
      setIsBoardShaking(true);
      setTimeout(() => setIsBoardShaking(false), 600);

      if (onPenalty) {
        onPenalty(5, 'Whacked Clean Data Asset');
      }

      setErrorMsg('⚠️ Clean asset damaged (-5 pts)! Only whack corrupted bugs (🐛/👾/⚠️)!');

      // Clear the item
      setSlots((prev) => {
        const next = [...prev];
        next[slotIdx] = null;
        return next;
      });
    }
  };

  // Dev Quick Complete
  const handleAutoSolve = () => {
    clearAllTimers();
    soundService.playSuccess();
    hapticService.medium();
    setCleansedCount(TARGET_CLEANSED);
    setIsSuccess(true);
    setGameStarted(false);
    setSlots(Array(GRID_SIZE).fill(null));
  };

  const isLowTime = timeLeft <= 5.0 && timeLeft > 0;

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header & Concise Prompt */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 5
          </span>
          <div className="flex items-center gap-2">
            {/* Live Timer Badge */}
            {gameStarted && (
              <span
                className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${
                  isLowTime
                    ? 'bg-rose-100 border-rose-400 text-rose-700 animate-pulse'
                    : 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft.toFixed(1)}s</span>
              </span>
            )}
            <span
              className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
                isSuccess
                  ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                  : !gameStarted
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-amber-100/60 border-amber-300 text-amber-900'
              }`}
            >
              {cleansedCount}/{TARGET_CLEANSED} Cleansed
            </span>
          </div>
        </div>

        {/* Title with icon & Green brand styling */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span>Data Anomaly Whacker</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Whack {TARGET_CLEANSED} data bugs in {TIME_LIMIT} seconds! Avoid clean assets.
          </p>
        </div>
      </div>

      {/* Start or Retry Button */}
      {!gameStarted && !isSuccess && (
        <button
          type="button"
          onClick={handleStartGame}
          className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
        >
          {isExpired ? (
            <>
              <RotateCcw className="w-4 h-4 text-[#F9BD20]" />
              <span>Try Again ({TIME_LIMIT}s Timer)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-[#F9BD20]" />
              <span>Start Anomaly Hunt ({TIME_LIMIT}s Timer)</span>
            </>
          )}
        </button>
      )}

      {/* HUD: Target Progress & Countdown Bar (Active Game) */}
      {gameStarted && (
        <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-2xs space-y-2">
          {/* Top Row: Labels */}
          <div className="flex items-center justify-between text-xs font-black">
            <span
              className={`flex items-center gap-1 font-mono ${
                isLowTime ? 'text-rose-600 animate-pulse' : 'text-[#009488]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Time: {timeLeft.toFixed(1)}s</span>
            </span>
            <span className="text-slate-800 font-mono">
              Bugs Cleansed: {cleansedCount}/{TARGET_CLEANSED}
            </span>
          </div>

          {/* Time Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-100 ease-linear ${
                isLowTime ? 'bg-rose-500' : 'bg-[#009488]'
              }`}
              style={{ width: `${Math.max(0, (timeLeft / TIME_LIMIT) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 3x3 Database Server Rack Grid */}
      <div
        className={`bg-slate-100/90 p-3 rounded-2xl border-2 border-slate-200 shadow-inner transition-transform ${
          isBoardShaking ? 'animate-shake' : ''
        }`}
      >
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {slots.map((item, idx) => {
            const isWhacked = whackedSlots[idx];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSlotClick(idx)}
                disabled={!gameStarted || isSuccess}
                className={`aspect-square rounded-2xl border-2 transition-all select-none flex flex-col items-center justify-center relative p-2 ${
                  isWhacked
                    ? 'bg-emerald-100 border-emerald-500 scale-95 shadow-inner'
                    : item
                    ? item.type === 'bug'
                      ? 'bg-rose-50 border-rose-400 hover:bg-rose-100 shadow-md shadow-rose-200/50 scale-[1.04] active:scale-95 cursor-pointer animate-bounce'
                      : 'bg-emerald-50 border-emerald-400 hover:bg-emerald-100 shadow-md shadow-emerald-200/50 scale-[1.04] active:scale-95 cursor-pointer ring-2 ring-emerald-300'
                    : 'bg-slate-200/70 border-slate-300/80 shadow-2xs'
                } ${!gameStarted ? 'opacity-80' : ''}`}
              >
                {/* Rack Indicator */}
                <span className="text-[9px] font-mono font-bold text-slate-400 absolute top-1 left-1.5">
                  #{idx + 1}
                </span>

                {isWhacked ? (
                  <div className="flex flex-col items-center animate-fade-in">
                    <span className="text-2xl sm:text-3xl">💥</span>
                    <span className="text-[10px] font-mono font-black text-emerald-700">
                      +1 Clean!
                    </span>
                  </div>
                ) : item ? (
                  <div className="flex flex-col items-center text-center gap-0.5 animate-fade-in">
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                    <span
                      className={`text-[10px] font-bold leading-tight ${
                        item.type === 'bug' ? 'text-rose-700' : 'text-emerald-700 font-black'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-300/50 border border-slate-300/60" />
                )}
              </button>
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
            <span>Pipeline Sanitized in Time!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            All 8 data anomalies successfully neutralized before the clock ran out. Proceed to the Data Quality Audit...
          </p>
          <button
            type="button"
            onClick={onSolved}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Proceed to Challenge 6</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#878787] text-[11px]">
            Target: Cleanse {TARGET_CLEANSED} Anomalies in {TIME_LIMIT}s
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