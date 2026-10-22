import React from 'react';
import { ArrowRight, Sparkles, Gift, Compass } from 'lucide-react';
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
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#FFFBEB] border border-[#F9BD20] text-[#9E6E00] text-xs font-black mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>ABN AMRO Client Visit</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-[#009488] mb-2">
          The Data Vault
        </h1>
        <p className="text-sm text-[#878787] font-medium">
          ABN AMRO Banking Data Expedition
        </p>
      </div>

      {/* Main Quest Brief Card */}
      <div className="glass-panel p-5 rounded-2xl border-2 border-[#009488]/20 shadow-md relative overflow-hidden bg-white">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F9BD20] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md shadow-[#F9BD20]/30">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-[#009488] text-base">The Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              A locked box awaits your visit on the main table. It is secured with a <strong className="text-[#009488] bg-[#F9BD20]/20 px-1 py-0.5 rounded font-black">4-digit combination padlock</strong>.
            </p>
          </div>
        </div>

        <div className="bg-[#FFFDF5] rounded-xl p-3.5 border border-[#F9BD20]/40 space-y-2.5">
          <div className="text-xs font-black uppercase tracking-wider text-[#9E6E00] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#009488]" />
            How The Expedition Works
          </div>

          <div className="space-y-2 text-xs text-slate-700">
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
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2">
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
          ABN AMRO Client Experience • Optimized for Mobile
        </p>
      </div>
    </div>
  );
}
