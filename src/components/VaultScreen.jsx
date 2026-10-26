import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Globe2, 
  KeyRound, 
  AlertCircle, 
  Lightbulb, 
  ArrowRight,
  Unlock,
  Layers
} from 'lucide-react';
import { QUEST_CONFIG, isDevHelperEnabled, DATASPHERE_PHRASE } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { getPlayerName } from '../services/apiService';

const TARGET_PHRASE = DATASPHERE_PHRASE || 'DATA VALUE CHAIN';
const NORMALIZED_TARGET = TARGET_PHRASE.replace(/\s+/g, '').toUpperCase();

const FRAGMENTS = [
  { id: 1, label: 'Stop 1', letters: 'HACN' },
  { id: 2, label: 'Stop 2', letters: 'EUL' },
  { id: 3, label: 'Stop 3', letters: 'ATD' },
  { id: 4, label: 'Stop 4', letters: 'AAIV' }
];

export default function VaultScreen({
  vaultCode = '2347',
  playerScore = 0,
  playerRank = null,
  isUnlockedInitially = false,
  onOpenLeaderboard,
  onPenalty,
  onDatasphereUnlocked
}) {
  const [isSphereOpen, setIsSphereOpen] = useState(isUnlockedInitially);
  const [inputPhrase, setInputPhrase] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0 = none, 1 = first word DATA, 2 = 3rd word CHAIN ⛓️
  const [isOpeningAnim, setIsOpeningAnim] = useState(false);

  const codeDigits = (vaultCode || '2347').split('');
  const playerName = getPlayerName() || 'Data Explorer';

  const triggerConfetti = () => {
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
      // Ignore
    }
  };

  useEffect(() => {
    if (isUnlockedInitially) {
      triggerConfetti();
    }
  }, [isUnlockedInitially]);

  const handleSubmitPhrase = (e) => {
    if (e) e.preventDefault();
    if (isSphereOpen || isOpeningAnim) return;

    const cleanInput = inputPhrase.trim().toUpperCase();
    const normalized = cleanInput.replace(/\s+/g, '');

    if (!cleanInput) {
      setErrorMsg('Please enter your unscrambled phrase!');
      soundService.playError();
      hapticService.error();
      return;
    }

    if (normalized === NORMALIZED_TARGET) {
      // Correct! Trigger Datasphere Opening
      soundService.playSuccess();
      hapticService.victory();
      setErrorMsg(null);
      setIsOpeningAnim(true);

      setTimeout(() => {
        soundService.playVaultUnlock();
        setIsSphereOpen(true);
        setIsOpeningAnim(false);
        triggerConfetti();
        if (onDatasphereUnlocked) onDatasphereUnlocked();
      }, 1200);
    } else {
      // Incorrect unscramble attempt (-5 pts penalty)
      soundService.playError();
      hapticService.error();

      const nextHint = hintLevel === 0 ? 1 : 2;
      setHintLevel(nextHint);

      if (nextHint === 1) {
        setErrorMsg('Incorrect phrase (-5 pts). Hint Unlocked: First word is "DATA"!');
      } else {
        setErrorMsg('Incorrect phrase (-5 pts). Hint Unlocked: 3rd word is ⛓️!');
      }

      if (onPenalty) {
        onPenalty(5, 'Incorrect Datasphere Guess');
      }
    }
  };

  const handleBuyHint = () => {
    if (hintLevel >= 2) return;
    const nextHint = hintLevel + 1;
    setHintLevel(nextHint);
    soundService.playClick();
    hapticService.light();
    setErrorMsg(null);
    if (onPenalty) {
      onPenalty(5, nextHint === 1 ? 'Datasphere Hint #1 Unlocked' : 'Datasphere Hint #2 Unlocked');
    }
  };

  const handleAutoSolve = () => {
    setInputPhrase(TARGET_PHRASE);
    soundService.playSuccess();
    hapticService.victory();
    setErrorMsg(null);
    setIsOpeningAnim(true);

    setTimeout(() => {
      soundService.playVaultUnlock();
      setIsSphereOpen(true);
      setIsOpeningAnim(false);
      triggerConfetti();
      if (onDatasphereUnlocked) onDatasphereUnlocked();
    }, 800);
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto space-y-4">
      {/* Hero Badge */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#F9BD20] text-[#9E6E00] text-xs font-black shadow-xs">
          <Globe2 className="w-3.5 h-3.5 text-[#009488]" />
          <span>The Datasphere Chamber</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isSphereOpen ? 'Datasphere Unlocked!' : 'Unlock The Datasphere'}
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          {isSphereOpen 
            ? 'The physical combination safe code is revealed below.'
            : 'Unscramble your letter fragments to open the Datasphere.'}
        </p>
      </div>

      {/* 3D Animated Datasphere Container */}
      <div className="relative py-6 flex flex-col items-center justify-center">
        {/* Glowing Sphere Visual */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Orbital Ring 1 - Electric Cyan */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 animate-sphere-orbit pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.35)]" 
            style={{ width: '100%', height: '100%' }}
          />
          {/* Orbital Ring 2 - Deep Violet / Indigo */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/60 animate-sphere-reverse pointer-events-none shadow-[0_0_15px_rgba(129,140,248,0.35)]" 
            style={{ width: '100%', height: '100%' }}
          />

          {/* Core Orb - Cosmic Cyber Sphere */}
          <div 
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center text-center p-3 transition-all duration-700 select-none ${
              isSphereOpen
                ? 'bg-gradient-to-tr from-cyan-400 via-indigo-600 to-violet-700 shadow-2xl animate-sphere-burst border-2 border-white/60 ring-4 ring-cyan-300/30'
                : isOpeningAnim
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-500 to-cyan-300 scale-110 shadow-2xl'
                : 'bg-gradient-to-tr from-[#0F172A] via-[#1E1B4B] to-[#4338CA] animate-sphere-pulse text-white shadow-2xl border-2 border-cyan-400/40 ring-2 ring-indigo-500/20'
            }`}
          >
            {isSphereOpen ? (
              <div className="animate-fade-in text-white space-y-0.5">
                <span className="text-2xl drop-shadow-md">✨</span>
                <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#FFFDF5] block">
                  SPHERE OPEN
                </span>
              </div>
            ) : isOpeningAnim ? (
              <div className="animate-spin text-3xl">
                🌐
              </div>
            ) : (
              <div className="space-y-1">
                <Globe2 className="w-8 h-8 text-cyan-300 mx-auto animate-pulse filter drop-shadow-[0_0_8px_rgba(103,232,249,0.7)]" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-black text-cyan-200 block drop-shadow-xs">
                  DATASPHERE
                </span>
                <span className="text-[9px] font-mono text-indigo-200/80 block">
                  SEALED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* State A: Sealed -> Unscramble Input */}
      {!isSphereOpen ? (
        <div className="bg-white border-2 border-[#009488]/30 rounded-3xl p-5 shadow-lg space-y-4">
          {/* Letter Fragments Bank */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#F9BD20]" />
                Collected Letter Fragments
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                4 Stops
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {FRAGMENTS.map((frag) => (
                <div
                  key={frag.id}
                  className="bg-[#FFFDF5] border-2 border-[#F9BD20]/70 rounded-xl p-2 text-center shadow-xs"
                >
                  <span className="text-[9px] font-mono font-bold text-[#9E6E00] uppercase block">
                    {frag.label}
                  </span>
                  <span className="font-mono text-base font-black text-[#B45309] tracking-wider block mt-0.5">
                    {frag.letters}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Word Pattern & Hint Reveal */}
          <div className="bg-[#F8FAFA] border border-slate-200 rounded-2xl p-3 text-center space-y-1.5 shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
              Unscramble Pattern (3 Words • 14 Letters)
            </span>
            <div className="font-mono text-xs font-black tracking-widest flex items-center justify-center gap-1.5 flex-wrap">
              {hintLevel >= 1 ? (
                <span className="text-[#009488] bg-teal-50 border border-[#009488]/40 px-2 py-0.5 rounded-lg shadow-2xs animate-fade-in font-black">
                  [ D A T A ]
                </span>
              ) : (
                <span className="text-indigo-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                  [ • • • • ]
                </span>
              )}

              <span className="text-slate-400 font-sans">&bull;</span>

              <span className="text-indigo-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                [ • • • • • ]
              </span>

              <span className="text-slate-400 font-sans">&bull;</span>

              {hintLevel >= 2 ? (
                <span className="text-[#B45309] bg-amber-50 border border-[#F9BD20]/60 px-2 py-0.5 rounded-lg shadow-2xs animate-fade-in flex items-center gap-1 font-black">
                  <span>[ • • • • • ]</span>
                  <span className="text-sm">⛓️</span>
                </span>
              ) : (
                <span className="text-indigo-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                  [ • • • • • ]
                </span>
              )}
            </div>
          </div>

          {/* Unlocked Penalty Hints Display */}
          {hintLevel > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 space-y-1.5 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-[#9E6E00] uppercase text-[10px] tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
                <span>Datasphere Clues Unlocked</span>
              </div>
              {hintLevel >= 1 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#009488]">Hint 1:</span>
                  <span>The first word is <strong className="font-mono font-black text-[#009488]">DATA</strong></span>
                </div>
              )}
              {hintLevel >= 2 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#B45309]">Hint 2:</span>
                  <span>The 3rd word is <span className="text-base">⛓️</span></span>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitPhrase} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Enter Unscrambled Phrase:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputPhrase}
                  onChange={(e) => {
                    setInputPhrase(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder=""
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full bg-[#F8FAFA] border-2 border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-3 text-sm text-slate-900 font-bold uppercase tracking-wider focus:outline-none transition-all shadow-inner"
                />
                {inputPhrase && (
                  <button
                    type="button"
                    onClick={() => setInputPhrase('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isOpeningAnim || !inputPhrase.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all"
            >
              <KeyRound className="w-4 h-4 text-[#F9BD20]" />
              <span>Unlock Datasphere</span>
            </button>

            {/* Optional "Unlock Hint (-5 PTS)" button if not all hints unlocked */}
            {hintLevel < 2 && (
              <button
                type="button"
                onClick={handleBuyHint}
                className="w-full py-2 px-3 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 text-amber-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
                <span>
                  {hintLevel === 0 ? 'Need a Clue? Unlock Hint #1 (-5 PTS)' : 'Need Another Clue? Unlock Hint #2 (-5 PTS)'}
                </span>
              </button>
            )}
          </form>

          {/* Dev Helper */}
          {isDevHelperEnabled() && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center space-x-1 text-[#878787] hover:text-[#B45309]"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
                <span>{showHint ? 'Hide Clue' : 'Phrase Clue'}</span>
              </button>

              <button
                type="button"
                onClick={handleAutoSolve}
                className="text-[#878787] hover:text-[#009488] text-[11px] underline font-medium"
              >
                Auto Unscramble
              </button>
            </div>
          )}

          {isDevHelperEnabled() && showHint && (
            <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700">
              Target Phrase: <strong className="font-mono text-[#009488] font-black">{TARGET_PHRASE}</strong>
            </div>
          )}
        </div>
      ) : (
        /* State B: Unlocked -> Master Safe Code Display */
        <div className="bg-gradient-to-b from-[#FFFDF5] to-white border-2 border-[#F9BD20] rounded-3xl p-6 text-center space-y-4 shadow-xl animate-fade-in relative overflow-hidden">
          {/* Confetti & Congratulations */}
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-[#F0FDF4] border border-[#009488]/30 text-[#009488] text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-[#009488]" />
              <span>Datasphere Solved: DATA VALUE CHAIN</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Congratulations, {playerName}!
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              You decoded the Datasphere! The physical padlock combination is now revealed.
            </p>
          </div>

          {/* Master Padlock Combination Code Display */}
          <div className="p-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#F9BD20] space-y-2 shadow-inner">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#9E6E00] block">
              Physical Lockbox Padlock Combination
            </span>
            
            <div className="flex justify-center items-center gap-2.5 py-1.5">
              {codeDigits.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-12 h-14 rounded-2xl bg-white border-2 border-[#F9BD20] flex items-center justify-center font-mono text-3xl font-black text-[#B45309] shadow-md shadow-[#F9BD20]/25"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-700 leading-relaxed pt-1">
              <p>
                Walk over to the locked box at the <strong>{QUEST_CONFIG.vaultLocation}</strong>, dial <strong className="font-mono text-[#009488] font-black">{codeDigits.join(' - ')}</strong>, and unlock the padlock to claim your prize!
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
      )}

      {/* Recap of 4 Teams Completed */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
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
                <span className="text-xs font-black text-slate-900 truncate">
                  {t.shortName}
                </span>
              </div>
              <p className="text-[10px] text-[#009488] font-mono font-bold">
                {t.letters} • {t.house}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
