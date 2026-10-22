import React from 'react';
import { Lock, Gift } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function VaultHud({ unlockedDigits, vaultCode, onOpenVaultPreview }) {
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
          ? 'bg-gradient-to-r from-[#009488]/30 via-[#F9BD20]/25 to-[#009488]/30 border-[#F9BD20] shadow-lg shadow-[#F9BD20]/25 animate-pulse-slow'
          : 'bg-[#04211E]/90 border-[#009488]/30 hover:border-[#009488]/60 shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${isAllUnlocked ? 'bg-[#F9BD20] text-slate-950 font-bold' : 'bg-[#062D29] text-[#00B3A4]'}`}>
            {isAllUnlocked ? <Gift className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              Physical Souvenir Safe
              {isAllUnlocked && (
                <span className="bg-[#F9BD20] text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                  UNLOCKED
                </span>
              )}
            </span>
            <p className="text-[11px] text-[#878787]">
              {isAllUnlocked 
                ? "All digits cracked! Dial code on the box." 
                : `${unlockedCount} of 4 combination digits discovered`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-[#F9BD20] font-bold bg-[#F9BD20]/15 px-2 py-0.5 rounded-md border border-[#F9BD20]/30">
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
                  ? 'bg-gradient-to-b from-[#093E39] via-[#021A18] to-[#093E39] border-[#F9BD20] shadow-md shadow-[#F9BD20]/20 text-[#F9BD20]'
                  : 'bg-[#021715] border-[#009488]/20 text-[#878787]'
              }`}
            >
              {/* Metallic tumbler highlight lines */}
              <div className="absolute inset-x-1 top-1 h-[1px] bg-white/10 rounded-full" />
              <div className="absolute inset-x-1 bottom-1 h-[1px] bg-black/40 rounded-full" />
              
              <span className={`font-mono text-xl font-extrabold ${isUnlocked ? 'text-[#F9BD20] tracking-wider' : 'text-[#878787]'}`}>
                {digitValue}
              </span>
              
              <span className="text-[9px] font-mono tracking-tighter text-[#878787] mt-0.5 uppercase">
                {isUnlocked ? `Digit ${idx + 1}` : `Locked`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
