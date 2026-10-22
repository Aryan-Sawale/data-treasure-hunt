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
      className={`mx-4 mt-3 p-3.5 rounded-2xl border border-t-4 transition-all cursor-pointer select-none ${
        isAllUnlocked 
          ? 'bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FFFBEB] border-[#F9BD20] border-t-[#F9BD20] shadow-lg shadow-[#F9BD20]/30 animate-pulse-slow'
          : 'bg-white border-slate-200 border-t-[#F9BD20] hover:border-[#F9BD20]/60 shadow-md'
      }`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-[#F9BD20] text-slate-950 font-black shadow-sm">
            {isAllUnlocked ? <Gift className="w-4 h-4" /> : <Lock className="w-4 h-4 stroke-[2.5]" />}
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
              Physical Souvenir Safe
              {isAllUnlocked && (
                <span className="bg-[#F9BD20] text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black shadow-xs">
                  READY
                </span>
              )}
            </span>
            <p className="text-[11px] text-[#878787]">
              {isAllUnlocked 
                ? "All 4 digits cracked! Dial code on the box." 
                : `${unlockedCount} of 4 combination digits discovered`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-slate-950 font-black bg-[#F9BD20] px-2.5 py-1 rounded-lg border border-[#F9BD20] shadow-xs">
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
              className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border transition-all ${
                isUnlocked
                  ? 'bg-[#FFFDF5] border-2 border-[#F9BD20] shadow-sm text-slate-950'
                  : 'bg-[#F8FAFA] border-slate-200 text-[#878787]'
              }`}
            >
              <span className={`font-mono text-2xl font-black ${isUnlocked ? 'text-[#B45309] tracking-wider' : 'text-[#878787]'}`}>
                {digitValue}
              </span>
              
              <span className={`text-[9px] font-mono tracking-tight mt-0.5 uppercase font-bold ${isUnlocked ? 'text-[#9E6E00]' : 'text-[#878787]'}`}>
                {isUnlocked ? `Digit ${idx + 1}` : `Locked`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
