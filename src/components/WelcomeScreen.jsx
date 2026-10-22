import React from 'react';
import { ArrowRight, Sparkles, Shield, Gift, Compass, Terminal, Lock } from 'lucide-react';
import { QUEST_CONFIG } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function WelcomeScreen({ onStart }) {
  const handleStart = () => {
    soundService.playSuccess();
    hapticService.success();
    onStart();
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6">
      {/* Hero Badge */}
      <div className="relative text-center pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Client Visit Experience</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          The <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">Data Vault</span>
        </h1>
        <p className="text-sm text-slate-300 font-medium">
          Netherlands Banking Data Expedition
        </p>
      </div>

      {/* Main Quest Brief Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">The Mission</h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              A locked souvenir box filled with authentic Dutch treats & exclusive banking gifts awaits you. It is sealed with a <strong className="text-amber-400">4-digit combination padlock</strong>.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-orange-400" />
            How The Expedition Works
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span><strong>Solve the Data Puzzle:</strong> Decrypt clues to discover the secret team name and room location.</span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span><strong>Attend Their Presentation:</strong> Walk over to the team's booth and experience their live showcase.</span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span><strong>Collect Safe Digits:</strong> Enter the presenter's secret word to reveal a digit for the physical lock!</span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                4
              </span>
              <span><strong>Crack the Safe:</strong> Dial the complete 4-digit code on the physical box to claim your Dutch souvenirs!</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Domains Preview Pill Grid */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 px-1 uppercase tracking-wider">
          5 Core Data Domains to Explore
        </div>
        <div className="grid grid-cols-1 gap-2">
          {QUEST_CONFIG.teams.map((t, i) => (
            <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-base">{t.badge}</span>
                <div>
                  <span className="font-semibold text-slate-200">{t.name}</span>
                  <p className="text-[10px] text-slate-400">{t.tagline}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-orange-400/80 bg-orange-500/10 px-2 py-0.5 rounded">
                Stop {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-extrabold text-base flex items-center justify-center space-x-2 shadow-xl shadow-orange-500/30 active:scale-98 transition-all"
        >
          <span>Begin The Data Quest</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Optimized for mobile. Audio enabled.
        </p>
      </div>
    </div>
  );
}

