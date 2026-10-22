import React from 'react';
import { Lock, Unlock, Key, Gift } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function VaultHud({ unlockedDigits, vaultCode, onOpenVaultPreview }) {
  // vaultCode is 4 chars, e.g. "7394"
  const digits = vaultCode ? vaultCode.split('') : ['7', '3', '9', '4'];
  const unlockedCount = Object.keys(unlockedDigits).length;
  const isAllUnlocked = unlockedCount >= 4;

  const handleClick = () => {
    soundService.playClick();
    hapticService.light();
    if (isAllUnlocked && onOpenVaultPreview) {
      onOpenVaultPreview();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`mx-4 mt-3 p-3 rounded-2xl border transition-all cursor-pointer select-none ${
        isAllUnlocked 
          ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20 border-amber-500/60 shadow-lg shadow-amber-500/20 animate-pulse-slow'
          : 'bg-slate-900/90 border-slate-700/60 hover:border-slate-600 shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${isAllUnlocked ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'}`}>
            {isAllUnlocked ? <Gift className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              Physical Souvenir Safe
              {isAllUnlocked && (
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  READY
                </span>
              )}
            </span>
            <p className="text-[11px] text-slate-400">
              {isAllUnlocked 
                ? "All digits cracked! Dial code on the box." 
                : `${unlockedCount} of 4 combination digits discovered`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-amber-400/90 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            {unlockedCount}/4 DIGITS
          </span>
        </div>
      </div>

      {/* 4 Lock Tumbler Wheels */}
      <div className="grid grid-cols-4 gap-2.5 pt-1">
        {[0, 1, 2, 3].map((idx) => {
          const isUnlocked = unlockedDigits[idx] !== undefined;
          const digitValue = isUnlocked ? unlockedDigits[idx] : '?';

          return (
            <div
              key={idx}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-b from-amber-950/70 via-slate-900 to-amber-950/70 border-amber-500/80 shadow-md shadow-amber-500/20 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              {/* Metallic tumbler highlight lines */}
              <div className="absolute inset-x-1 top-1 h-[1px] bg-white/10 rounded-full" />
              <div className="absolute inset-x-1 bottom-1 h-[1px] bg-black/40 rounded-full" />
              
              <span className={`font-mono text-xl font-extrabold ${isUnlocked ? 'text-amber-300 tracking-wider' : 'text-slate-600'}`}>
                {digitValue}
              </span>
              
              <span className="text-[9px] font-mono tracking-tighter text-slate-400 mt-0.5 uppercase">
                {isUnlocked ? `Digit ${idx + 1}` : `Locked`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
