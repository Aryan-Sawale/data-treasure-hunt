import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  Unlock, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  RefreshCw,
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
  const targetDigits = (vaultCode || '7394').split('');
  
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
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#009488', '#F9BD20', '#00B3A4', '#878787']
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#009488', '#F9BD20', '#00B3A4', '#878787']
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
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] text-[#9E6E00] border border-[#F9BD20] text-xs font-black uppercase tracking-wider mb-1 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>ABN AMRO Vault Terminal</span>
        </div>
        <h2 className="text-2xl font-black text-[#009488] tracking-tight">
          {isOpen ? "The Safe Has Been Cracked!" : "Dial the 4-Digit Combination"}
        </h2>
        <p className="text-xs text-[#878787]">
          {isOpen 
            ? "Your physical lockbox code is confirmed below." 
            : "Use the unlocked digits to set each tumbler dial and open the vault."}
        </p>
      </div>

      {/* Realistic Combination Lock Visual */}
      <div className={`p-6 rounded-3xl border-2 border-t-4 border-t-[#F9BD20] transition-all duration-700 relative overflow-hidden ${
        isOpen
          ? 'bg-gradient-to-b from-[#FFFDF5] to-white border-[#F9BD20] shadow-2xl shadow-[#F9BD20]/25'
          : 'bg-white border-slate-200 shadow-xl'
      }`}>
        {/* Safe Handle / Vault Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-700 border-4 ${
            isOpen
              ? 'bg-[#F9BD20] border-[#D99400] text-slate-950 shadow-xl shadow-[#F9BD20]/40 scale-105'
              : 'bg-[#FFFDF5] border-[#F9BD20]/50 text-[#009488]'
          }`}>
            {isOpen ? (
              <Unlock className="w-10 h-10 stroke-[2.5]" />
            ) : (
              <Lock className="w-10 h-10 stroke-[2.5]" />
            )}
          </div>
        </div>

        {/* 4 Rotary Tumbler Dials */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const dialVal = dials[idx];

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Up Button */}
                {!isOpen && (
                  <button
                    onClick={() => handleDialChange(idx, 1)}
                    className="p-1.5 rounded-lg text-[#878787] hover:text-[#9E6E00] bg-[#F8FAFA] hover:bg-[#FFFDF5] border border-slate-200 hover:border-[#F9BD20] active:scale-90 transition-all mb-1"
                    aria-label={`Increment dial ${idx + 1}`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}

                {/* Tumbler Cylinder Display */}
                <div className={`w-full py-4 rounded-2xl border-2 flex flex-col items-center justify-center relative select-none transition-all ${
                  isOpen
                    ? 'bg-[#FFFDF5] border-[#F9BD20] text-[#B45309] shadow-sm'
                    : 'bg-[#F8FAFA] border-slate-300 text-slate-800'
                }`}>
                  <span className="font-mono text-3xl font-black tracking-widest text-[#B45309]">
                    {dialVal}
                  </span>
                  <span className="text-[9px] font-mono text-[#878787] mt-0.5 font-bold">
                    Wheel {idx + 1}
                  </span>
                </div>

                {/* Down Button */}
                {!isOpen && (
                  <button
                    onClick={() => handleDialChange(idx, -1)}
                    className="p-1.5 rounded-lg text-[#878787] hover:text-[#9E6E00] bg-[#F8FAFA] hover:bg-[#FFFDF5] border border-slate-200 hover:border-[#F9BD20] active:scale-90 transition-all mt-1"
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
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-600 text-center mb-4 font-bold">
            Combination mismatch. Double-check your collected digits!
          </div>
        )}

        {/* Unlock Action Button */}
        {!isOpen ? (
          <div className="space-y-2">
            <button
              onClick={handleAttemptUnlock}
              className="w-full py-4 px-6 rounded-2xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-base flex items-center justify-center space-x-3 shadow-xl shadow-[#009488]/25 border-b-4 border-[#006E64] active:scale-[0.98] transition-all"
            >
              <span className="w-7 h-7 rounded-full bg-[#F9BD20] text-slate-950 flex items-center justify-center shadow-xs">
                <Unlock className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span className="tracking-wide">Crack Physical Safe</span>
            </button>

            <button
              onClick={handleAutoFill}
              className="w-full py-2 text-xs text-[#878787] hover:text-[#9E6E00] underline font-bold"
            >
              Auto-Align Discovered Digits
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border-4 border-[#F9BD20] space-y-2 shadow-md">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#9E6E00] block">
                Physical Lockbox Combination Code
              </span>
              <div className="font-mono text-4xl font-black text-[#B45309] tracking-[0.25em] py-1">
                {vaultCode.split('').join(' - ')}
              </div>
              <p className="text-xs text-slate-700">
                Go to the locked box at the <strong>{QUEST_CONFIG.vaultLocation}</strong>, turn the padlock dials to <strong className="text-[#009488] font-mono font-black">{vaultCode}</strong>, and pull the shackle!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recap of Teams Visited */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 bg-white shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#009488]" />
            Expedition Recap: {QUEST_CONFIG.teams.length} Houses Cleared
          </span>
          <span className="text-[11px] font-mono text-[#009488] font-bold">
            100% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {QUEST_CONFIG.teams.map((t) => (
            <div key={t.id} className="p-2.5 rounded-xl bg-[#F8FAFA] border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-base">{t.houseEmoji || t.badge}</span>
                <div>
                  <span className="font-semibold text-slate-800 block">{t.shortName}</span>
                  <span className="text-[10px] text-[#B45309] font-bold">{t.room}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-950 bg-[#F9BD20] px-2 py-0.5 rounded font-black shadow-xs">
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
          className="text-xs text-[#878787] hover:text-slate-800 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 shadow-sm"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Expedition for Next Group</span>
        </button>
      </div>
    </div>
  );
}
