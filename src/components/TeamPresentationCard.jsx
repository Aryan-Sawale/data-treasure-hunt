import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Key, 
  Lightbulb
} from 'lucide-react';
import { QUEST_CONFIG } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function TeamPresentationCard({
  team,
  vaultCode,
  isPresentationDone,
  onVerifyPresentation,
  onProceedToNext
}) {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [justUnlockedModal, setJustUnlockedModal] = useState(false);
  const [revealedDigitData, setRevealedDigitData] = useState(null);

  const totalTeams = QUEST_CONFIG.teams.length;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#009488', '#F9BD20', '#00B3A4', '#878787']
      });
    } catch (e) {
      // Ignore
    }
  };

  const handleVerify = (forceBypass = false) => {
    const expected = team.presentationSecretCode.trim().toUpperCase();
    const entered = passcodeInput.trim().toUpperCase();

    if (forceBypass || entered === expected) {
      soundService.playDigitUnlock();
      hapticService.victory();
      triggerConfetti();

      let digitChar = null;
      if (team.digitReveal && team.digitReveal.digitIndex !== null) {
        digitChar = vaultCode[team.digitReveal.digitIndex];
      }

      setRevealedDigitData({
        digitChar,
        digitIndex: team.digitReveal ? team.digitReveal.digitIndex : null,
        title: team.digitReveal ? team.digitReveal.title : 'Milestone Achieved!',
        flavor: team.digitReveal ? team.digitReveal.flavor : 'Presentation verified!'
      });

      setJustUnlockedModal(true);
      onVerifyPresentation(team.id, team.digitReveal?.digitIndex, digitChar);
      setErrorMsg(null);
    } else {
      soundService.playError();
      hapticService.error();
      setErrorMsg(`Incorrect code. Check the presentation slides or tap 'Quick Check-in'.`);
    }
  };

  return (
    <div className="px-4 py-2 max-w-md mx-auto space-y-4">
      {/* Team Reveal Banner */}
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${team.color} text-white shadow-lg relative overflow-hidden border-2 border-t-4 border-t-[#F9BD20] border-[#009488]/40`}>
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-7xl opacity-20 pointer-events-none select-none">
          {team.badge}
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F9BD20] text-slate-950 text-[11px] font-black uppercase tracking-wider mb-2 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stop {team.id} of {totalTeams} Unlocked!</span>
        </div>

        <h2 className="text-xl font-extrabold tracking-tight mb-1 text-white">{team.name}</h2>
        <p className="text-xs text-white/90 font-medium leading-relaxed mb-3">
          {team.tagline}
        </p>

        {/* Booth Location: Harry Potter House (No Presenters) */}
        <div className="bg-black/35 backdrop-blur-md p-3 rounded-xl border border-[#F9BD20]/50 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{team.houseEmoji || "🏰"}</span>
            <div>
              <span className="text-slate-300 text-[10px] uppercase font-bold tracking-wider block">
                Booth Location:
              </span>
              <span className="font-black text-[#F9BD20] text-sm tracking-wide">
                {team.room}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-[#F9BD20] text-slate-950 px-2 py-0.5 rounded font-black shadow-xs">
            ABN AMRO
          </span>
        </div>
      </div>

      {/* Presentation Check-In Section */}
      <div className="glass-panel p-4 rounded-2xl border border-t-4 border-t-[#F9BD20] border-slate-200 bg-white shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#F9BD20]" />
            Presentation Verification
          </span>
          {isPresentationDone ? (
            <span className="bg-[#009488]/10 text-[#009488] border border-[#009488]/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              VERIFIED
            </span>
          ) : (
            <span className="bg-[#F9BD20] text-slate-950 font-black text-[10px] font-mono px-2.5 py-0.5 rounded-full shadow-xs">
              CODE REQUIRED
            </span>
          )}
        </div>

        {!isPresentationDone ? (
          <>
            <p className="text-xs text-slate-600">
              Visit <strong className="text-[#009488] font-bold">{team.room}</strong> for the presentation. At the end, enter the secret keyword to reveal your safe digit!
            </p>

            {/* Input & Submit */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter secret word..."
                  className="flex-1 bg-[#F8FAFA] border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-[#878787] focus:outline-none focus:border-[#F9BD20] focus:bg-white font-mono uppercase shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify(false);
                  }}
                />
                <button
                  onClick={() => handleVerify(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#009488] hover:bg-[#007066] active:scale-95 text-white font-black text-xs shadow-md shadow-[#009488]/20 transition-all"
                >
                  Verify
                </button>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-600 font-medium px-1">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Hint & Fast Check-In Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center space-x-1 text-[#878787] hover:text-[#B45309]"
              >
                <Lightbulb className="w-3 h-3 text-[#F9BD20]" />
                <span>{showHint ? "Hide Word Clue" : "Where is the word?"}</span>
              </button>

              <button
                onClick={() => handleVerify(true)}
                className="text-[#878787] hover:text-[#009488] text-[11px] underline font-medium"
              >
                Quick Check-in
              </button>
            </div>

            {showHint && (
              <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700">
                <p>{team.presentationHint}</p>
                <p className="text-[10px] text-[#878787] mt-1">
                  Keyword for this presentation: <strong className="font-mono text-[#009488] font-bold">{team.presentationSecretCode}</strong>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#009488]/30 text-xs text-[#009488] font-medium flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#009488]" />
              <span>
                Presentation verified at {team.room}! Safe digit collected.
              </span>
            </div>

            <button
              onClick={onProceedToNext}
              className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-sm flex items-center justify-center space-x-2.5 shadow-lg shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all group"
            >
              <span>{team.id === totalTeams ? "Proceed to Final Vault Crack" : `Unlock Stop #${team.id + 1} Puzzle`}</span>
              <span className="w-6 h-6 rounded-full bg-[#F9BD20] text-slate-950 flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Digit Unlocked Celebration Modal */}
      {justUnlockedModal && revealedDigitData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border-4 border-[#F9BD20] p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-[#F9BD20] text-slate-950 flex items-center justify-center mx-auto text-2xl font-black shadow-md shadow-[#F9BD20]/30 animate-bounce">
              {revealedDigitData.digitChar ? '🔐' : '🏆'}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#009488]">
                {revealedDigitData.title}
              </h3>
              <p className="text-xs text-slate-600">
                {revealedDigitData.flavor}
              </p>
            </div>

            {/* If a digit is revealed */}
            {revealedDigitData.digitChar && (
              <div className="py-3 px-6 bg-[#FFFDF5] rounded-2xl border-2 border-[#F9BD20] inline-block shadow-inner">
                <span className="text-[10px] font-mono uppercase text-[#9E6E00] font-black block">
                  COMBINATION DIGIT #{revealedDigitData.digitIndex + 1}
                </span>
                <span className="font-mono text-5xl font-black text-[#B45309] tracking-wider">
                  {revealedDigitData.digitChar}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                soundService.playClick();
                setJustUnlockedModal(false);
              }}
              className="w-full py-3 rounded-xl bg-[#009488] hover:bg-[#007066] text-white font-black text-sm shadow-md transition-all active:scale-95"
            >
              Add to Vault HUD & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
