import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Maximize, 
  Minimize, 
  Compass, 
  Shield, 
  Layers
} from 'lucide-react';
import { getRoomId } from '../services/apiService';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function PresentationScreen({
  roomId = null,
  onNavigateLeaderboard,
  onNavigateHome,
  onNavigateAdmin
}) {
  const [currentRoom] = useState(() => (roomId || getRoomId()).trim().toUpperCase() || 'ABN2026');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Listen to browser fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    soundService.playClick();
    hapticService.light();
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Clock tick every second for stage presentation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleProceed = () => {
    soundService.playSuccess();
    hapticService.medium();
    if (onNavigateLeaderboard) {
      onNavigateLeaderboard();
    } else {
      window.location.hash = 'leaderboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021312] via-[#042824] to-[#001715] text-white flex flex-col justify-between selection:bg-[#009488] selection:text-white relative overflow-hidden font-sans">
      {/* Ambient background glows for big screen projector depth */}
      <div className="absolute top-0 right-1/4 -translate-y-20 w-[600px] h-[600px] bg-[#009488]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 translate-y-20 w-[600px] h-[600px] bg-[#F9BD20]/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[#007A70]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Stage Bar */}
      <header className="relative z-20 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#009488] to-[#00B4A6] flex items-center justify-center text-white shadow-lg shadow-[#009488]/30 border border-[#00C4B4]/40">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black tracking-widest uppercase text-[#F9BD20]">
                ABN AMRO
              </span>
              <span className="text-[10px] text-white/40">•</span>
              <span className="text-xs font-bold text-slate-300">
                Data & Analytics
              </span>
            </div>
            <p className="text-[11px] font-mono font-semibold text-slate-400">
              Client Innovation Showcase
            </p>
          </div>
        </div>

        {/* Live event badge & Room indicator */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wider">LIVE EVENT IN PROGRESS</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-mono font-bold text-slate-200">
            ROOM: <span className="text-[#F9BD20] font-black">{currentRoom}</span>
          </div>

          {/* Fullscreen button */}
          <button
            onClick={handleToggleFullscreen}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Center Stage Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        {/* Shimmering Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#F9BD20]/15 border border-[#F9BD20]/60 text-[#F9BD20] text-xs sm:text-sm font-black mb-6 shadow-lg shadow-[#F9BD20]/10 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span className="tracking-wider uppercase">Annual Client Expedition</span>
        </div>

        {/* Big Words Headline (Designed for Auditorium / Big Screen display) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.08] max-w-5xl mb-6">
          Welcome to the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F9BD20] via-[#FFE27A] to-[#00E5D4] drop-shadow-sm">
            Data Treasure Hunt 2026
          </span>
        </h1>

        {/* Subtitle / Narrative */}
        <p className="text-base sm:text-xl md:text-2xl text-slate-300 font-medium max-w-3xl mb-12 sm:mb-14 leading-relaxed">
          Solve the data engineering challenges, decrypt the 4 team showcases, and unlock the final Datasphere padlock combination.
        </p>

        {/* Main CTA: Proceed to Leaderboard */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-8 sm:px-12 py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-[#F9BD20] to-[#E5A812] hover:from-[#FFCA38] hover:to-[#F9BD20] text-slate-950 font-black text-xl sm:text-2xl flex items-center justify-center gap-3.5 shadow-2xl shadow-[#F9BD20]/30 border-b-4 border-[#B87A00] active:scale-[0.98] hover:scale-105 transition-all cursor-pointer group"
          >
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950 group-hover:rotate-12 transition-transform" />
            <span>Proceed to Leaderboard</span>
            <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3] group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </main>

      {/* Stage Footer Bar with Navigation */}
      <footer className="relative z-20 px-6 sm:px-12 py-4 border-t border-white/10 backdrop-blur-md bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <span>ABN AMRO Data & Analytics • Stage Presentation Display</span>
          <span>•</span>
          <span className="font-mono text-slate-300">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors flex items-center gap-1 font-bold cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#009488]" />
              <span>Player Quest View</span>
            </button>
          )}

          {onNavigateAdmin && (
            <button
              onClick={onNavigateAdmin}
              className="hover:text-white transition-colors flex items-center gap-1 font-bold cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#F9BD20]" />
              <span>Facilitator Panel</span>
            </button>
          )}

          <button
            onClick={handleProceed}
            className="text-[#F9BD20] hover:text-[#FFE27A] transition-colors flex items-center gap-1 font-black cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
