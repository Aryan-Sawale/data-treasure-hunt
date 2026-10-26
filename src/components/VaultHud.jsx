import React, { useState } from 'react';
import { Globe2, Lock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

const FRAGMENT_KEYS = [
  { id: 1, name: 'Marketplace', target: 'HACN' },
  { id: 2, name: 'Data Lake', target: 'EUL' },
  { id: 3, name: 'Quality', target: 'ATD' },
  { id: 4, name: 'Lineage', target: 'AAIV' }
];

export default function VaultHud({ unlockedFragments = {}, onOpenVaultPreview }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const unlockedCount = Object.keys(unlockedFragments).length;
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
        {/* Left: Icon & Inline Fragments Preview */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black shrink-0 shadow-xs ${
            isAllUnlocked ? 'bg-[#F9BD20] text-slate-950' : 'bg-[#009488] text-white'
          }`}>
            <Globe2 className="w-3.5 h-3.5" />
          </div>
          
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="text-xs font-black text-[#009488] shrink-0">Datasphere:</span>
            {/* Inline Compact Fragments */}
            <div className="flex items-center space-x-1 font-mono text-[10px]">
              {FRAGMENT_KEYS.map((item) => {
                const fragment = unlockedFragments[item.id];
                const isUnlocked = !!fragment;
                return (
                  <span
                    key={item.id}
                    className={`px-1.5 py-0.5 rounded font-black tracking-wider transition-all ${
                      isUnlocked
                        ? 'bg-[#FFFDF5] border border-[#F9BD20] text-[#B45309] shadow-2xs'
                        : 'bg-slate-100 border border-slate-200 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? fragment : '••••'}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Badge & Chevron Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          {isAllUnlocked ? (
            <button
              onClick={handleReadyClick}
              className="bg-[#F9BD20] hover:bg-[#E5AC15] text-slate-950 text-[10px] px-2.5 py-1 rounded-lg font-black shadow-xs animate-pulse"
            >
              OPEN SPHERE 🌐
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

      {/* Expanded Detailed Fragments View */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 space-y-2.5 animate-fade-in bg-[#FAFCFC]">
          <div className="flex items-center justify-between text-[11px] text-[#878787] pt-1">
            <span>Datasphere letter fragments collected:</span>
            <span className="font-semibold text-slate-700">
              {isAllUnlocked ? 'All 4 fragments ready to unscramble!' : `${4 - unlockedCount} fragments remaining`}
            </span>
          </div>

          {/* 4 Fragment Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FRAGMENT_KEYS.map((item) => {
              const fragment = unlockedFragments[item.id];
              const isUnlocked = !!fragment;

              return (
                <div
                  key={item.id}
                  className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isUnlocked
                      ? 'bg-white border-2 border-[#F9BD20] shadow-xs text-slate-950'
                      : 'bg-slate-50 border-slate-200 text-[#878787]'
                  }`}
                >
                  <span className={`font-mono text-sm font-black tracking-widest ${isUnlocked ? 'text-[#B45309]' : 'text-slate-400'}`}>
                    {isUnlocked ? fragment : '— — —'}
                  </span>
                  <span className={`text-[9px] font-mono uppercase font-bold mt-0.5 ${isUnlocked ? 'text-[#9E6E00]' : 'text-slate-400'}`}>
                    Stop #{item.id}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 leading-tight text-center pt-0.5">
            Unscramble the collected letters at the Datasphere to reveal the 4-digit physical safe combination!
          </p>
        </div>
      )}
    </div>
  );
}
