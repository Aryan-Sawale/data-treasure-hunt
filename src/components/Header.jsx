import React from 'react';
import { Volume2, VolumeX, Settings, Trophy } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function Header({
  stage,
  isMuted,
  onToggleSound,
  onOpenFacilitator,
  onOpenLeaderboard,
  playerScore = 0,
  playerRank = null,
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

  const handleLeaderboardClick = () => {
    soundService.playClick();
    hapticService.light();
    if (onOpenLeaderboard) onOpenLeaderboard();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#009488]/20 shadow-sm">
      {/* Top ABN AMRO Brand Accent Bar */}
      <div className="h-1 bg-[#009488]" />

      <div className="max-w-md mx-auto flex items-center justify-between px-3 py-2.5">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#009488] flex items-center justify-center shadow-xs border border-[#007A70] shrink-0">
            <span className="text-sm">🔐</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-xs tracking-wider uppercase text-[#009488] whitespace-nowrap">
                The Data Vault
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="bg-[#F9BD20] text-slate-950 px-1.5 py-0.5 rounded-md font-mono font-black text-[9px] uppercase tracking-wider shadow-2xs leading-none">
                ABN AMRO
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-[#878787] font-medium leading-none whitespace-nowrap">
                Expedition
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Leaderboard Score Badge */}
          <button
            onClick={handleLeaderboardClick}
            className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg bg-[#FFFDF5] hover:bg-[#FEF9C3] border border-[#F9BD20] text-slate-950 font-mono font-black text-xs active:scale-95 transition-all shadow-xs"
            aria-label="Leaderboard"
            title="View Live Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 text-[#B45309]" />
            <span>{playerScore}</span>
            <span className="text-[9px] text-[#9E6E00] font-sans font-bold">PTS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live Sync Active" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleSoundClick}
            className="p-1.5 rounded-lg bg-[#F8FAFA] hover:bg-[#FFFDF5] border border-slate-200 hover:border-[#F9BD20] text-slate-600 active:scale-95 transition-all shadow-xs"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#878787]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#009488]" />
            )}
          </button>

          {/* Facilitator / Admin Tools */}
          <button
            onClick={handleSettingsClick}
            className="p-1.5 rounded-lg bg-[#F8FAFA] hover:bg-[#FFFDF5] border border-slate-200 hover:border-[#F9BD20] text-[#878787] hover:text-[#009488] active:scale-95 transition-all shadow-xs"
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
