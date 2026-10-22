import React from 'react';
import { Volume2, VolumeX, ShieldCheck, Settings, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function Header({
  stage,
  isMuted,
  onToggleSound,
  onOpenFacilitator,
  vaultUnlocked
}) {
  const handleSoundClick = () => {
    hapticService.light();
    onToggleSound();
  };

  const handleSettingsClick = () => {
    hapticService.light();
    onOpenFacilitator();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#061325]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-md shadow-orange-500/20">
            <span className="text-lg">🔐</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-orange-400 via-amber-300 to-orange-200 bg-clip-text text-transparent">
                The Data Vault
              </span>
              <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1.5 py-0.2 rounded font-mono font-semibold">
                NL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Dutch Banking Quest</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundClick}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 active:scale-95 transition-all"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Facilitator / Admin Tools */}
          <button
            onClick={handleSettingsClick}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 active:scale-95 transition-all"
            aria-label="Facilitator Menu"
            title="Facilitator & Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
}

