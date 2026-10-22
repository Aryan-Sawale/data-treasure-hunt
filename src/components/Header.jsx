import React from 'react';
import { Volume2, VolumeX, Settings } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#009488]/20 shadow-sm">
      {/* Top ABN AMRO Brand Accent Bar */}
      <div className="h-1 bg-[#009488]" />

      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#009488] flex items-center justify-center shadow-md shadow-[#009488]/20 border border-[#007A70]">
            <span className="text-lg">🔐</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-wider uppercase text-[#009488]">
                The Data Vault
              </span>
              <span className="text-[10px] bg-[#F9BD20] text-slate-950 border border-[#F9BD20] px-1.5 py-0.2 rounded font-mono font-black tracking-tight shadow-xs">
                ABN AMRO
              </span>
            </div>
            <p className="text-[11px] text-[#878787] font-medium">Banking Data Expedition</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          {/* Sound Toggle */}
          <button
            onClick={handleSoundClick}
            className="p-2 rounded-lg bg-[#FFFDF5] hover:bg-[#FEF9C3] border border-[#F9BD20]/40 text-[#9E6E00] active:scale-95 transition-all shadow-sm"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#878787]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#9E6E00]" />
            )}
          </button>

          {/* Facilitator / Admin Tools */}
          <button
            onClick={handleSettingsClick}
            className="p-2 rounded-lg bg-[#F8FAFA] hover:bg-[#FFFDF5] border border-slate-200 hover:border-[#F9BD20] text-[#878787] hover:text-[#9E6E00] active:scale-95 transition-all shadow-sm"
            aria-label="Facilitator Menu"
            title="Facilitator & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
