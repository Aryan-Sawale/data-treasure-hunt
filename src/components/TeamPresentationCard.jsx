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
      <div className={`p-5 rounded-2xl bg-gradient-to-br ${team.color} text-white shadow-xl relative overflow-hidden border border-[#009488]/30`}>
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-7xl opacity-20 pointer-events-none select-none">
          {team.badge}
        </div>

        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-[#F9BD20] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#F9BD20]/30">
          <Sparkles className="w-3 h-3 text-[#F9BD20]" />
          <span>Stop {team.id} of {totalTeams} Unlocked!</span>
        </div>

        <h2 className="text-xl font-extrabold tracking-tight mb-1 text-white">{team.name}</h2>
        <p className="text-xs text-slate-200 font-medium leading-relaxed mb-3">
          {team.tagline}
        </p>

        {/* Booth Location: Harry Potter House (No Presenters) */}
        <div className="bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">{team.houseEmoji || "🏰"}</span>
            <div>
              <span className="text-[#878787] text-[10px] uppercase font-bold tracking-wider block">
                Booth Location:
              </span>
              <span className="font-extrabold text-[#F9BD20] text-sm">
                {team.room}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-[#009488]/30 text-[#00B3A4] border border-[#009488]/40 px-2 py-0.5 rounded font-semibold">
            ABN AMRO
          </span>
        </div>
      </div>

      {/* Presentation Check-In Section */}
      <div className="glass-panel p-4 rounded-2xl border border-[#009488]/30 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-[#F9BD20] flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#F9BD20]" />
            Presentation Verification
          </span>
          {isPresentationDone ? (
            <span className="bg-[#009488]/25 text-[#00B3A4] border border-[#009488]/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              VERIFIED
            </span>
          ) : (
            <span className="bg-[#F9BD20]/15 text-[#F9BD20] border border-[#F9BD20]/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
              CODE REQUIRED
            </span>
          )}
        </div>

        {!isPresentationDone ? (
          <>
            <p className="text-xs text-slate-300">
              Visit <strong className="text-[#F9BD20]">{team.room}</strong> for the presentation. At the end, enter the secret keyword to reveal your safe digit!
            </p>

            {/* Input & Submit */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Enter secret word..."
                  className="flex-1 bg-[#021715] border border-[#009488]/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#878787] focus:outline-none focus:border-[#F9BD20] font-mono uppercase"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerify(false);
                  }}
                />
                <button
                  onClick={() => handleVerify(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#009488] hover:bg-[#00B3A4] active:scale-95 text-white font-bold text-xs shadow-md shadow-[#009488]/20 transition-all"
                >
                  Verify
                </button>
              </div>

              {errorMsg && (
                <p className="text-[11px] text-rose-400 font-medium px-1">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Hint & Fast Check-In Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center space-x-1 text-[#878787] hover:text-[#F9BD20]"
              >
                <Lightbulb className="w-3 h-3 text-[#F9BD20]" />
                <span>{showHint ? "Hide Word Clue" : "Where is the word?"}</span>
              </button>

              <button
                onClick={() => handleVerify(true)}
                className="text-[#878787] hover:text-slate-300 text-[11px] underline"
              >
                Quick Check-in
              </button>
            </div>

            {showHint && (
              <div className="p-2.5 rounded-xl bg-[#009488]/15 border border-[#009488]/30 text-xs text-slate-200">
                <p>{team.presentationHint}</p>
                <p className="text-[10px] text-[#878787] mt-1">
                  Keyword for this presentation: <strong className="font-mono text-[#F9BD20]">{team.presentationSecretCode}</strong>
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#009488]/20 border border-[#009488]/40 text-xs text-[#00B3A4] flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#00B3A4]" />
              <span>
                Presentation verified at {team.room}! Safe digit collected.
              </span>
            </div>

            <button
              onClick={onProceedToNext}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#009488] via-[#00A89B] to-[#F9BD20] hover:from-[#00A89B] hover:to-[#F9BD20] text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#009488]/30 active:scale-98 transition-all"
            >
              <span>{team.id === totalTeams ? "Proceed to Final Vault Crack" : `Unlock Stop #${team.id + 1} Puzzle`}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}
      </div>

      {/* Digit Unlocked Celebration Modal */}
      {justUnlockedModal && revealedDigitData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#04211E] border border-[#F9BD20] p-6 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-[#F9BD20]/20 border border-[#F9BD20]/50 flex items-center justify-center mx-auto text-[#F9BD20] text-2xl animate-bounce">
              {revealedDigitData.digitChar ? '🔐' : '🏆'}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">
                {revealedDigitData.title}
              </h3>
              <p className="text-xs text-slate-300">
                {revealedDigitData.flavor}
              </p>
            </div>

            {/* If a digit is revealed */}
            {revealedDigitData.digitChar && (
              <div className="py-3 px-6 bg-[#021715] rounded-2xl border border-[#F9BD20]/60 inline-block shadow-inner">
                <span className="text-[10px] font-mono uppercase text-[#878787] block">
                  COMBINATION DIGIT #{revealedDigitData.digitIndex + 1}
                </span>
                <span className="font-mono text-5xl font-black text-[#F9BD20] tracking-wider">
                  {revealedDigitData.digitChar}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                soundService.playClick();
                setJustUnlockedModal(false);
              }}
              className="w-full py-3 rounded-xl bg-[#009488] hover:bg-[#00B3A4] text-white font-bold text-sm shadow-md transition-all active:scale-95"
            >
              Add to Vault HUD & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
