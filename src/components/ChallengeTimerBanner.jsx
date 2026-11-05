import React, { useState, useEffect, useRef } from 'react';
import { Flame, Clock, Zap } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function ChallengeTimerBanner({ timer, onTimeout, challengeTitle }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!timer?.expires_at) return 30;
    const diff = Math.ceil((new Date(timer.expires_at).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  const hasTimedOutRef = useRef(false);
  const lastTickSecRef = useRef(secondsLeft);

  // Initial mount alert sound & haptic
  useEffect(() => {
    soundService.playTimerAlert();
    hapticService.medium();
  }, [timer?.challenge_id]);

  useEffect(() => {
    if (!timer?.expires_at) return;

    const interval = setInterval(() => {
      const expTime = new Date(timer.expires_at).getTime();
      const diff = Math.max(0, Math.ceil((expTime - Date.now()) / 1000));
      setSecondsLeft(diff);

      // Play tick sound in final 5 seconds
      if (diff <= 5 && diff > 0 && diff !== lastTickSecRef.current) {
        lastTickSecRef.current = diff;
        soundService.playTimerTick();
        hapticService.light();
      }

      // Check for timeout
      if (diff <= 0 && !hasTimedOutRef.current) {
        hasTimedOutRef.current = true;
        clearInterval(interval);
        if (onTimeout) {
          onTimeout();
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [timer?.expires_at, onTimeout]);

  // Color gradient based on urgency
  const isUrgent = secondsLeft <= 10;
  const isMedium = secondsLeft > 10 && secondsLeft <= 18;

  const pct = Math.max(0, Math.min(100, (secondsLeft / 30) * 100));

  const solverName = timer?.first_solved_by_name || 'Someone in your room';

  return (
    <div
      className={`rounded-2xl border-2 p-3 transition-all duration-300 shadow-md animate-bounce-subtle select-none ${
        isUrgent
          ? 'bg-rose-50 border-rose-500 shadow-rose-200/60 ring-2 ring-rose-400/40'
          : isMedium
          ? 'bg-amber-50 border-amber-500 shadow-amber-200/50'
          : 'bg-emerald-50 border-[#009488] shadow-teal-100/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-black ${
              isUrgent
                ? 'bg-rose-500 text-white animate-pulse'
                : isMedium
                ? 'bg-[#F9BD20] text-slate-950'
                : 'bg-[#009488] text-white'
            }`}
          >
            {isUrgent ? (
              <Flame className="w-4 h-4 fill-current" />
            ) : (
              <Zap className="w-4 h-4 fill-current" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                {solverName} finished!
              </span>
              <span
                className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded uppercase ${
                  isUrgent
                    ? 'bg-rose-200 text-rose-900 animate-pulse'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                30s Rush
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-bold leading-tight">
              {isUrgent
                ? 'Time almost up! Finish now to score points!'
                : 'Complete before timer ends to earn points!'}
            </p>
          </div>
        </div>

        {/* Big Countdown Badge */}
        <div
          className={`shrink-0 px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono font-black text-sm sm:text-base shadow-xs ${
            isUrgent
              ? 'bg-rose-600 border-rose-700 text-white animate-pulse'
              : isMedium
              ? 'bg-[#F9BD20] border-amber-600 text-slate-950'
              : 'bg-teal-700 border-teal-800 text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-linear rounded-full ${
            isUrgent ? 'bg-rose-500' : isMedium ? 'bg-[#F9BD20]' : 'bg-[#009488]'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

