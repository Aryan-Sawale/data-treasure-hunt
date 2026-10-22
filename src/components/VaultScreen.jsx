import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  Unlock, 
  Gift, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  Award, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { QUEST_CONFIG } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function VaultScreen({
  vaultCode,
  unlockedDigits,
  isVaultCracked,
  onVaultCracked,
  onResetQuest
}) {
  // 4 dials for combination lock
  const targetDigits = (vaultCode || '7394').split('');
  
  // Initialize dials with whatever has been unlocked so far, or 0
  const [dials, setDials] = useState([
    unlockedDigits[0] !== undefined ? parseInt(unlockedDigits[0]) : 0,
    unlockedDigits[1] !== undefined ? parseInt(unlockedDigits[1]) : 0,
    unlockedDigits[2] !== undefined ? parseInt(unlockedDigits[2]) : 0,
    unlockedDigits[3] !== undefined ? parseInt(unlockedDigits[3]) : 0
  ]);

  const [isOpen, setIsOpen] = useState(isVaultCracked);
  const [errorFeedback, setErrorFeedback] = useState(false);

  const triggerVictoryConfetti = () => {
    try {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FF6B00', '#F59E0B', '#3B82F6', '#10B981']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FF6B00', '#F59E0B', '#3B82F6', '#10B981']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      // Ignore
    }
  };

  const handleDialChange = (dialIndex, delta) => {
    if (isOpen) return;
    soundService.playDialTick();
    hapticService.light();

    setDials(prev => {
      const next = [...prev];
      let val = next[dialIndex] + delta;
      if (val > 9) val = 0;
      if (val < 0) val = 9;
      next[dialIndex] = val;
      return next;
    });
    setErrorFeedback(false);
  };

  const handleAutoFill = () => {
    soundService.playSuccess();
    hapticService.medium();
    const targetArr = targetDigits.map(d => parseInt(d));
    setDials(targetArr);
    setErrorFeedback(false);
  };

  const handleAttemptUnlock = () => {
    const entered = dials.join('');
    if (entered === vaultCode) {
      soundService.playVaultUnlock();
      hapticService.victory();
      setIsOpen(true);
      triggerVictoryConfetti();
      onVaultCracked();
    } else {
      soundService.playError();
      hapticService.error();
      setErrorFeedback(true);
    }
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto space-y-5">
      {/* Top Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Physical Safe Unlocking Terminal</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isOpen ? "The Safe Has Been Cracked!" : "Dial the 4-Digit Combination"}
        </h2>
        <p className="text-xs text-slate-300">
          {isOpen 
            ? "Your physical souvenir lockbox code is confirmed below." 
            : "Use the unlocked digits to set each tumbler dial and open the vault."}
        </p>
      </div>

      {/* Realistic Combination Lock Visual */}
      <div className={`p-6 rounded-3xl border transition-all duration-700 relative overflow-hidden ${
        isOpen
          ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-amber-950/60 border-amber-500/80 shadow-2xl shadow-amber-500/20'
          : 'bg-slate-950/90 border-slate-700/80 shadow-2xl'
      }`}>
        {/* Safe Handle / Vault Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 border-4 ${
            isOpen
              ? 'bg-gradient-to-tr from-amber-400 to-orange-500 border-amber-200 text-slate-950 shadow-xl shadow-amber-400/50 scale-105'
              : 'bg-slate-900 border-slate-700 text-amber-400'
          }`}>
            {isOpen ? (
              <Unlock className="w-10 h-10 stroke-[2.5]" />
            ) : (
              <Lock className="w-10 h-10" />
            )}
          </div>
        </div>

        {/* 4 Rotary Tumbler Dials */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const dialVal = dials[idx];
            const isDiscovered = unlockedDigits[idx] !== undefined;

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Up Button */}
                {!isOpen && (
                  <button
                    onClick={() => handleDialChange(idx, 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-90 transition-all mb-1"
                    aria-label={`Increment dial ${idx + 1}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}

                {/* Tumbler Cylinder Display */}
                <div className={`w-full py-4 rounded-2xl border flex flex-col items-center justify-center relative select-none transition-all ${
                  isOpen
                    ? 'bg-gradient-to-b from-amber-900/60 to-slate-900 border-amber-400/80 text-amber-300 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}>
                  <span className="font-mono text-3xl font-black tracking-widest">
                    {dialVal}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                    Wheel {idx + 1}
                  </span>
                </div>

                {/* Down Button */}
                {!isOpen && (
                  <button
                    onClick={() => handleDialChange(idx, -1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-90 transition-all mt-1"
                    aria-label={`Decrement dial ${idx + 1}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Feedback */}
        {errorFeedback && !isOpen && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center mb-4">
            Combination mismatch. Double-check your collected digits!
          </div>
        )}

        {/* Unlock Action Button */}
        {!isOpen ? (
          <div className="space-y-2">
            <button
              onClick={handleAttemptUnlock}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-base flex items-center justify-center space-x-2 shadow-xl shadow-orange-500/30 active:scale-98 transition-all"
            >
              <Unlock className="w-5 h-5 stroke-[2.5]" />
              <span>Crack Physical Safe</span>
            </button>

            <button
              onClick={handleAutoFill}
              className="w-full py-2 text-xs text-slate-400 hover:text-amber-400 underline"
            >
              Auto-Align Discovered Digits
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                Physical Lockbox Combination Code
              </span>
              <div className="font-mono text-4xl font-black text-white tracking-[0.25em] py-1">
                {vaultCode.split('').join(' - ')}
              </div>
              <p className="text-xs text-slate-300">
                Go to the souvenir box at the <strong>{QUEST_CONFIG.vaultLocation}</strong>, turn the padlock dials to <strong className="text-amber-300 font-mono">{vaultCode}</strong>, and pull the shackle!
              </p>
            </div>

            {/* Prize Box Info */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-left space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase">
                <Gift className="w-4 h-4" />
                <span>Souvenirs Inside</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {QUEST_CONFIG.prizeDescription}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recap of Teams Visited */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Expedition Recap: {QUEST_CONFIG.teams.length} Teams Visited
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            100% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {QUEST_CONFIG.teams.map((t) => (
            <div key={t.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-base">{t.badge}</span>
                <div>
                  <span className="font-semibold text-white block">{t.shortName}</span>
                  <span className="text-[10px] text-slate-400">{t.room}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Verified ✓
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Option for Presenters */}
      <div className="text-center pt-2">
        <button
          onClick={onResetQuest}
          className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Expedition for Next Group</span>
        </button>
      </div>
    </div>
  );
}

