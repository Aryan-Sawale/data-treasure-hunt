import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Gift, Sparkles, CheckCircle2, ShieldCheck, MapPin, Award } from 'lucide-react';
import { QUEST_CONFIG } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { getPlayerName } from '../services/apiService';

export default function VaultScreen({
  vaultCode,
  playerScore = 0,
  playerRank = null,
  onOpenLeaderboard,
  onResetQuest
}) {
  const codeDigits = (vaultCode || '7394').split('');
  const playerName = getPlayerName() || 'Data Explorer';

  useEffect(() => {
    soundService.playVaultUnlock();
    hapticService.victory();

    // Fire celebratory confetti on mount
    try {
      const duration = 3.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
          colors: ['#009488', '#F9BD20', '#00B3A4', '#FFD700']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
          colors: ['#009488', '#F9BD20', '#00B3A4', '#FFD700']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      // Ignore if canvas-confetti is unavailable
    }
  }, []);

  return (
    <div className="px-4 py-4 max-w-md mx-auto space-y-4">
      {/* Victory Congratulations Hero Card */}
      <div className="bg-gradient-to-b from-[#FFFDF5] to-white border-2 border-[#F9BD20] rounded-3xl p-6 text-center space-y-3.5 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="w-20 h-20 rounded-full bg-[#F9BD20]/20 absolute -top-8 -right-8 blur-xl pointer-events-none" />

        <div className="w-16 h-16 rounded-3xl bg-[#F9BD20] text-slate-950 flex items-center justify-center mx-auto text-3xl font-black shadow-lg shadow-[#F9BD20]/40 animate-bounce">
          🏆
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-[#F0FDF4] border border-[#009488]/30 text-[#009488] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-[#009488]" />
            <span>Expedition Completed!</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Congratulations, {playerName}!
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            You conquered all 4 banking challenges and unlocked the master safe combination!
          </p>
        </div>

        {/* Master Padlock Combination Code Display */}
        <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#F9BD20] space-y-2 shadow-inner">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9E6E00] block">
            Physical Lockbox Padlock Code
          </span>
          
          <div className="flex justify-center items-center gap-2 py-1">
            {codeDigits.map((digit, idx) => (
              <div
                key={idx}
                className="w-12 h-14 rounded-2xl bg-white border-2 border-[#F9BD20] flex items-center justify-center font-mono text-3xl font-black text-[#B45309] shadow-md shadow-[#F9BD20]/20"
              >
                {digit}
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-700 leading-relaxed pt-1">
            <p>
              Walk to the locked box at the <strong>{QUEST_CONFIG.vaultLocation}</strong>, dial <strong className="font-mono text-[#009488] font-black">{codeDigits.join(' - ')}</strong>, and open the padlock to claim your souvenir!
            </p>
          </div>
        </div>

        {/* Player Score & Standing */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-2xl bg-[#F8FAFA] border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Total Score</span>
            <span className="text-lg font-mono font-black text-[#009488]">{playerScore} PTS</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#F8FAFA] border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-400 block">Current Rank</span>
            <span className="text-lg font-mono font-black text-[#B45309]">
              {playerRank ? `#${playerRank}` : 'Top 10'}
            </span>
          </div>
        </div>

        {/* Leaderboard CTA Button */}
        <button
          onClick={() => {
            soundService.playClick();
            hapticService.light();
            if (onOpenLeaderboard) onOpenLeaderboard();
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#009488]/25 border-b-4 border-[#006E64] active:scale-[0.98] transition-all"
        >
          <Trophy className="w-4 h-4 text-[#F9BD20]" />
          <span>View Final Leaderboard</span>
        </button>
      </div>

      {/* Recap of 4 Teams Completed */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            4 Completed Stops
          </span>
          <span className="text-[10px] font-mono font-bold text-[#009488] bg-[#F0FDF4] px-2 py-0.5 rounded-full">
            4 / 4 Certified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {QUEST_CONFIG.teams.map((t) => (
            <div
              key={t.id}
              className="p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFA] text-left space-y-0.5"
            >
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">{t.badge}</span>
                <span className="text-xs font-extrabold text-slate-800 truncate">
                  {t.shortName}
                </span>
              </div>
              <p className="text-[10px] text-[#009488] font-bold">
                {t.room}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
