import React, { useState } from 'react';
import { ArrowRight, Sparkles, Gift, Compass, ChevronDown, ChevronUp, User } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { getPlayerName, setPlayerName } from '../services/apiService';

export default function WelcomeScreen({ onStart }) {
  const [playerName, setPlayerNameState] = useState(() => getPlayerName());
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [nameError, setNameError] = useState(false);

  const handleStart = () => {
    if (!playerName.trim()) {
      soundService.playError();
      hapticService.error();
      setNameError(true);
      return;
    }

    soundService.playSuccess();
    hapticService.success();
    const cleanName = playerName.trim();
    setPlayerName(cleanName);
    onStart(cleanName);
  };

  const toggleHowItWorks = () => {
    soundService.playClick();
    hapticService.light();
    setShowHowItWorks(!showHowItWorks);
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-5">
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
              A locked box awaits on the main table. It is secured with a <strong className="text-[#009488] bg-[#F9BD20]/20 px-1 py-0.5 rounded font-black">4-digit combination padlock</strong>.
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
                <span><strong>Collect Safe Digits:</strong> Enter the presenter's secret word to reveal a digit for the physical lock!</span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#009488] text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-xs">
                  4
                </span>
                <span><strong>Crack the Safe:</strong> Unlock all 4 digits, dial the combination on the physical box, and open the lock!</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enter Your Name Field */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm space-y-2">
        <label htmlFor="playerName" className="text-xs font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>Enter your name</span>
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
          placeholder="e.g. Alexander"
          maxLength={40}
          className={`w-full px-3.5 py-3 rounded-xl border text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
            nameError
              ? 'border-rose-400 ring-2 ring-rose-300/40 bg-rose-50/50'
              : 'border-slate-300 focus:border-[#009488] focus:ring-2 focus:ring-[#009488]/20 bg-[#F8FAFA] focus:bg-white'
          }`}
        />
        {nameError && (
          <p className="text-[11px] text-rose-600 font-semibold animate-fade-in">
            Please enter your name to join the leaderboard!
          </p>
        )}
      </div>

      {/* Start Button */}
      <div className="pt-1">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-base flex items-center justify-center space-x-3 shadow-xl shadow-[#009488]/25 border-b-4 border-[#006E64] active:scale-[0.98] transition-all group"
        >
          <span className="tracking-wide">Begin The Data Quest</span>
          <span className="w-7 h-7 rounded-full bg-[#F9BD20] text-slate-950 flex items-center justify-center shadow-xs group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </span>
        </button>
        <p className="text-center text-[11px] text-[#878787] mt-2 font-medium">
          ABN AMRO Client Experience • Live Competitive Leaderboard
        </p>
      </div>
    </div>
  );
}
