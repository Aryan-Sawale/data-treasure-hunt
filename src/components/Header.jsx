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
    <header className="sticky top-0 z-40 bg-[#031917]/95 backdrop-blur-md border-b border-[#009488]/25 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#009488] via-[#00B3A4] to-[#F9BD20] flex items-center justify-center shadow-md shadow-[#009488]/30">
            <span className="text-lg">🔐</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-[#00B3A4] via-[#F9BD20] to-[#00B3A4] bg-clip-text text-transparent">
                The Data Vault
              </span>
              <span className="text-[9px] bg-[#009488]/20 text-[#F9BD20] border border-[#009488]/40 px-1.5 py-0.2 rounded font-mono font-bold tracking-tight">
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
            className="p-2 rounded-lg bg-[#062624] hover:bg-[#093532] border border-[#009488]/30 text-slate-300 active:scale-95 transition-all"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#878787]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#F9BD20]" />
            )}
          </button>

          {/* Facilitator / Admin Tools */}
          <button
            onClick={handleSettingsClick}
            className="p-2 rounded-lg bg-[#062624] hover:bg-[#093532] border border-[#009488]/30 text-slate-300 active:scale-95 transition-all"
            aria-label="Facilitator Menu"
            title="Facilitator & Settings"
          >
            <Settings className="w-4 h-4 text-[#878787] hover:text-[#F9BD20]" />
          </button>
        </div>
      </div>
    </header>
  );
}
