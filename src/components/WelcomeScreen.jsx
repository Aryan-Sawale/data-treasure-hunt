import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Gift, Compass, ChevronDown, ChevronUp, User, Globe2, Loader2, Maximize, Minimize } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { getPlayerName, setPlayerName } from '../services/apiService';

export default function WelcomeScreen({ onStart }) {
  const [playerName, setPlayerNameState] = useState(() => getPlayerName());
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    hapticService.light();
    soundService.playClick();
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

  useEffect(() => {
    // Quick initial skeleton loader for smooth appearance & session verification
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    if (!playerName.trim()) {
      soundService.playError();
      hapticService.error();
      setNameError(true);
      return;
    }

    setIsSubmitting(true);
    soundService.playSuccess();
    hapticService.success();
    const cleanName = playerName.trim();
    setPlayerName(cleanName);
    setTimeout(() => {
      onStart(cleanName);
    }, 250);
  };

  const toggleHowItWorks = () => {
    soundService.playClick();
    hapticService.light();
    setShowHowItWorks(!showHowItWorks);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto space-y-5 animate-pulse" aria-busy="true" aria-label="Loading welcome screen">
        {/* Hero Badge Skeleton */}
        <div className="flex flex-col items-center pt-1 space-y-2.5">
          <div className="w-36 h-6 rounded-full bg-amber-100/80"></div>
          <div className="w-48 h-8 rounded-xl bg-slate-200"></div>
          <div className="w-56 h-4 rounded-lg bg-slate-100"></div>
        </div>

        {/* Main Quest Brief Skeleton Card */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200/80 bg-white space-y-3.5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#F9BD20]/30 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="w-28 h-4 rounded-md bg-slate-200"></div>
              <div className="w-full h-3 rounded-md bg-slate-100"></div>
              <div className="w-5/6 h-3 rounded-md bg-slate-100"></div>
            </div>
          </div>
          <div className="w-full h-10 rounded-xl bg-slate-100"></div>
        </div>

        {/* Name Input Skeleton */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm space-y-2.5">
          <div className="w-48 h-3.5 rounded-md bg-teal-100/80"></div>
          <div className="w-full h-11 rounded-xl bg-slate-100"></div>
        </div>

        {/* Start Button Skeleton */}
        <div className="pt-1 space-y-2">
          <div className="w-full h-14 rounded-2xl bg-[#009488]/30"></div>
          <div className="w-48 h-3 rounded-md bg-slate-100 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Hero Badge */}
      <div className="relative text-center pt-1">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#FFFBEB] border border-[#F9BD20] text-[#9E6E00] text-xs font-black mb-2.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>ABN AMRO Client Visit</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#009488] mb-1.5">
          The Data Vault
        </h1>
        <p className="text-sm text-[#878787] font-medium">
          ABN AMRO Banking Data Expedition
        </p>
      </div>

      {/* Main Quest Brief Card */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border-2 border-[#009488]/20 shadow-md relative overflow-hidden bg-white space-y-3.5">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F9BD20] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm shadow-[#F9BD20]/20 mt-0.5">
            <Gift className="w-5 h-5 text-slate-950" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-[#009488] text-base leading-tight">The Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A locked box awaits on the main table. Visit the 4 domain teams, collect secret letter fragments, and unlock the <strong className="text-[#009488] bg-[#F9BD20]/20 px-1 py-0.5 rounded font-black">Datasphere</strong> to reveal the 4-digit physical safe combination!
            </p>
          </div>
        </div>

        {/* Collapsible How It Works Box */}
        <div className="bg-[#FFFDF5] rounded-xl border border-[#F9BD20]/40 overflow-hidden transition-all">
          <button
            onClick={toggleHowItWorks}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-[#FEF9C3]/40 transition-colors select-none"
            aria-expanded={showHowItWorks}
          >
            <div className="text-xs font-black uppercase tracking-wider text-[#9E6E00] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#009488]" />
              <span>How The Expedition Works</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#009488]">
              <span>{showHowItWorks ? 'Hide' : 'View Steps'}</span>
              {showHowItWorks ? (
                <ChevronUp className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
          </button>

          {showHowItWorks && (
            <div className="px-3.5 pb-3.5 pt-1 space-y-2 text-xs text-slate-700 border-t border-[#F9BD20]/20 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F9BD20] text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-xs">
                  1
                </span>
                <span><strong>Solve the Data Puzzle:</strong> Decrypt clues to discover each secret team and their Harry Potter house booth.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F9BD20] text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-xs">
                  2
                </span>
                <span><strong>Attend Their Presentation:</strong> Walk over to the team's booth and experience their live showcase.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F9BD20] text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-xs">
                  3
                </span>
                <span><strong>Collect Letter Fragments:</strong> Enter the presenter's secret letters at the end of each showcase.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#009488] text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-xs">
                  4
                </span>
                <span><strong>Open the Datasphere & Vault:</strong> Unscramble the phrase to open the Datasphere, reveal the padlock combination, and open the physical safe!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enter Your Name Field */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm space-y-2">
        <label htmlFor="playerName" className="text-xs font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>Enter Name / team name</span>
        </label>
        <input
          id="playerName"
          type="text"
          value={playerName}
          onChange={(e) => {
            setPlayerNameState(e.target.value);
            if (nameError) setNameError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleStart();
          }}
          placeholder="e.g. Alexander or Gryffindor Squad"
          maxLength={40}
          className={`w-full px-3.5 py-3 rounded-xl border text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
            nameError
              ? 'border-rose-400 ring-2 ring-rose-300/40 bg-rose-50/50'
              : 'border-slate-300 focus:border-[#009488] focus:ring-2 focus:ring-[#009488]/20 bg-[#F8FAFA] focus:bg-white'
          }`}
        />
        {nameError && (
          <p className="text-[11px] text-rose-600 font-semibold animate-fade-in">
            Please enter your name or team name to join the leaderboard!
          </p>
        )}
      </div>

      {/* Start Button & Controls */}
      <div className="pt-1 space-y-2.5">
        <button
          onClick={handleStart}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-75 text-white font-black text-base flex items-center justify-center space-x-3 shadow-xl shadow-[#009488]/25 border-b-4 border-[#006E64] active:scale-[0.98] transition-all group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span className="tracking-wide">Entering The Vault...</span>
            </>
          ) : (
            <>
              <span className="tracking-wide">Begin The Data Quest</span>
              <span className="w-7 h-7 rounded-full bg-[#F9BD20] text-slate-950 flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          {isFullscreen ? (
            <>
              <Minimize className="w-4 h-4 text-[#009488]" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize className="w-4 h-4 text-[#009488]" />
              <span>Fullscreen Mode</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-[#878787] mt-1 font-medium">
          ABN AMRO Client Experience • Live Competitive Leaderboard
        </p>
      </div>
    </div>
  );
}
