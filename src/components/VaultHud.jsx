import React, { useState } from 'react';
import { Lock, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function VaultHud({ unlockedDigits, vaultCode, onOpenVaultPreview }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const digits = vaultCode ? vaultCode.split('') : ['7', '3', '9', '4'];
  const unlockedCount = Object.keys(unlockedDigits).length;
  const isAllUnlocked = unlockedCount >= 4;

  const handleToggle = () => {
    soundService.playClick();
    hapticService.light();
    setIsExpanded(!isExpanded);
  };

  const handleReadyClick = (e) => {
    if (isAllUnlocked && onOpenVaultPreview) {
      e.stopPropagation();
      soundService.playSuccess();
      hapticService.medium();
      onOpenVaultPreview();
    }
  };

  return (
    <div 
      className={`mx-4 mt-3 rounded-2xl border transition-all select-none overflow-hidden ${
        isAllUnlocked 
          ? 'bg-[#FFFBEB] border-2 border-[#F9BD20] shadow-md shadow-[#F9BD20]/20'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Clickable Header Bar (Always Visible) */}
      <div
        onClick={handleToggle}
        className="p-3 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
      >
        {/* Left: Icon & Inline Digits Preview */}
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F9BD20] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
            {isAllUnlocked ? <Gift className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-[#009488]">Safe:</span>
            {/* Inline Compact Digits */}
            <div className="flex items-center space-x-1 font-mono">
              {[0, 1, 2, 3].map((idx) => {
                const isUnlocked = unlockedDigits[idx] !== undefined;
                return (
                  <span
                    key={idx}
                    className={`w-5 h-6 rounded flex items-center justify-center text-xs font-black transition-all ${
                      isUnlocked
                        ? 'bg-[#FFFDF5] border border-[#F9BD20] text-[#B45309] shadow-2xs'
                        : 'bg-slate-100 border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? unlockedDigits[idx] : '•'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Badge & Chevron Toggle */}
        <div className="flex items-center space-x-2">
          {isAllUnlocked ? (
            <button
              onClick={handleReadyClick}
              className="bg-[#F9BD20] hover:bg-[#E5AC15] text-slate-950 text-[10px] px-2.5 py-1 rounded-lg font-black shadow-xs animate-pulse"
            >
              CRACK SAFE 🔓
            </button>
          ) : (
            <span className="text-[11px] font-mono font-black text-[#009488] bg-[#F0FDF4] border border-[#009488]/30 px-2 py-0.5 rounded-lg">
              {unlockedCount}/4
            </span>
          )}

          <div className="text-slate-400 hover:text-slate-700 p-0.5">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Detailed Tumbler View */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 space-y-2.5 animate-fade-in bg-[#FAFCFC]">
          <div className="flex items-center justify-between text-[11px] text-[#878787] pt-1">
            <span>Physical combination padlock status:</span>
            <span className="font-semibold text-slate-700">
              {isAllUnlocked ? 'All digits cracked!' : `${4 - unlockedCount} digits left`}
            </span>
          </div>

          {/* 4 Lock Tumbler Wheels */}
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((idx) => {
              const isUnlocked = unlockedDigits[idx] !== undefined;
              const digitValue = isUnlocked ? unlockedDigits[idx] : '?';

              return (
                <div
                  key={idx}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isUnlocked
                      ? 'bg-white border-2 border-[#F9BD20] shadow-xs text-slate-950'
                      : 'bg-slate-50 border-slate-200 text-[#878787]'
                  }`}
                >
                  <span className={`font-mono text-xl font-black ${isUnlocked ? 'text-[#B45309]' : 'text-slate-400'}`}>
                    {digitValue}
                  </span>
                  <span className={`text-[9px] font-mono uppercase font-bold mt-0.5 ${isUnlocked ? 'text-[#9E6E00]' : 'text-slate-400'}`}>
                    {isUnlocked ? `#${idx + 1}` : 'Lock'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
