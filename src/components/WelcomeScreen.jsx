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
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#009488]/15 border border-[#009488]/40 text-[#00B3A4] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>ABN AMRO Client Visit</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          The <span className="bg-gradient-to-r from-[#00B3A4] via-[#F9BD20] to-[#00B3A4] bg-clip-text text-transparent">Data Vault</span>
        </h1>
        <p className="text-sm text-[#878787] font-medium">
          ABN AMRO Banking Data Expedition
        </p>
      </div>

      {/* Main Quest Brief Card */}
      <div className="glass-panel p-5 rounded-2xl border border-[#009488]/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#009488]/15 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#F9BD20]/20 border border-[#F9BD20]/40 flex items-center justify-center text-[#F9BD20] shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">The Mission</h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              A locked souvenir box awaits your visit. It is secured with a <strong className="text-[#F9BD20]">4-digit combination padlock</strong>.
            </p>
          </div>
        </div>

        <div className="bg-[#04211E]/80 rounded-xl p-3.5 border border-[#009488]/20 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#878787] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#009488]" />
            How The Expedition Works
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#009488]/25 text-[#00B3A4] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <span><strong>Solve the Data Puzzle:</strong> Decrypt clues to discover each secret team and their Harry Potter house booth.</span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#009488]/25 text-[#00B3A4] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <span><strong>Attend Their Presentation:</strong> Walk over to the team's booth and experience their live showcase.</span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#009488]/25 text-[#00B3A4] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <span><strong>Collect Safe Digits:</strong> Enter the presenter's secret word to reveal a digit for the physical lock!</span>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#F9BD20]/25 text-[#F9BD20] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                4
              </span>
              <span><strong>Crack the Safe:</strong> Unlock all 4 digits, dial the combination on the physical box, and claim your gifts!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pt-2">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#009488] via-[#00A89B] to-[#F9BD20] hover:from-[#00A89B] hover:to-[#F9BD20] text-slate-950 font-black text-base flex items-center justify-center space-x-2 shadow-xl shadow-[#009488]/30 active:scale-98 transition-all"
        >
          <span>Begin The Data Quest</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
        <p className="text-center text-[11px] text-[#878787] mt-2">
          ABN AMRO Client Experience • Audio & Haptics Enabled
        </p>
      </div>
    </div>
  );
}
