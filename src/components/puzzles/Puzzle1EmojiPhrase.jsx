import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb, KeyRound } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const TARGET_PHRASE = 'DATA SHARING AGREEMENT';
const NORMALIZED_TARGET = TARGET_PHRASE.replace(/\s+/g, '').toUpperCase();

export default function Puzzle1EmojiPhrase({ onSolved, onPenalty }) {
  const [guess, setGuess] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isSuccess) return;

    const cleanInput = guess.trim().toUpperCase();
    const normalizedInput = cleanInput.replace(/\s+/g, '');

    if (!cleanInput) {
      setErrorMsg('Please enter your phrase guess!');
      soundService.playError();
      hapticService.error();
      return;
    }

    if (normalizedInput === NORMALIZED_TARGET) {
      // Solved!
      setIsSuccess(true);
      setErrorMsg(null);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    } else {
      // Wrong guess: apply penalty (-5 pts)
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      soundService.playError();
      hapticService.error();
      setErrorMsg('Not quite right! (-5 pts). Hint: What formal agreement allows teams to share data?');
      if (onPenalty) {
        onPenalty(5, 'Incorrect Phrase Guess');
      }
    }
  };

  const handleAutoSolve = () => {
    setGuess(TARGET_PHRASE);
    setIsSuccess(true);
    setErrorMsg(null);
    soundService.playSuccess();
    hapticService.medium();
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488] flex items-center gap-1.5">
            <span className="text-base">🛒</span>
            Emoji Phrase Decrypt
          </h3>
          <p className="text-xs text-[#878787]">
            Guess the 3-word data governance term represented by emojis.
          </p>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#009488] border border-[#009488]/30">
          3 Words
        </span>
      </div>

      {/* 3 Emoji Clue Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Word 1: Data */}
        <div className="bg-[#F8FAFA] border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center space-y-1 shadow-2xs hover:border-[#009488]/50 transition-all">
          <span className="text-3xl filter drop-shadow-xs">📊</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Word 1</span>
          <span className="text-xs font-black text-slate-800">4 Letters</span>
        </div>

        {/* Word 2: Sharing */}
        <div className="bg-[#F8FAFA] border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center space-y-1 shadow-2xs hover:border-[#009488]/50 transition-all">
          <span className="text-3xl filter drop-shadow-xs">🔄</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Word 2</span>
          <span className="text-xs font-black text-slate-800">7 Letters</span>
        </div>

        {/* Word 3: Agreement */}
        <div className="bg-[#F8FAFA] border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center space-y-1 shadow-2xs hover:border-[#009488]/50 transition-all">
          <span className="text-3xl filter drop-shadow-xs">📝</span>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Word 3</span>
          <span className="text-xs font-black text-slate-800">9 Letters</span>
        </div>
      </div>

      {/* Target Word Pattern Preview */}
      <div className="bg-[#FFFDF5] border border-[#F9BD20]/50 rounded-2xl p-3 text-center space-y-1 shadow-xs">
        <div className="text-[11px] font-bold text-[#9E6E00] uppercase tracking-wider">
          Target Pattern
        </div>
        <div className="font-mono text-sm tracking-widest text-[#B45309] font-black">
          [ • • • • ] &nbsp; [ • • • • • • • ] &nbsp; [ • • • • • • • • • ]
        </div>
      </div>

      {/* Guess Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            Your Phrase Guess:
          </label>
          <div className="relative">
            <input
              type="text"
              value={guess}
              disabled={isSuccess}
              onChange={(e) => {
                setGuess(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Type your phrase guess..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="w-full bg-[#F8FAFA] border-2 border-slate-200 focus:border-[#009488] focus:bg-white rounded-xl px-3.5 py-3 text-sm text-slate-900 font-bold uppercase placeholder:text-slate-400 placeholder:normal-case focus:outline-none transition-all shadow-inner"
            />
            {guess && !isSuccess && (
              <button
                type="button"
                onClick={() => setGuess('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSuccess || !guess.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all"
        >
          <KeyRound className="w-4 h-4 text-[#F9BD20]" />
          <span>Submit Guess</span>
        </button>
      </form>

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#878787] text-[11px]">
            Target: <strong>DATA SHARING AGREEMENT</strong>
          </span>
          <button
            type="button"
            onClick={handleAutoSolve}
            className="text-[#878787] hover:text-[#009488] text-[11px] underline font-medium"
          >
            Auto Fill
          </button>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">
            "Data Sharing Agreement" Decrypted!
          </h4>
          <p className="text-[11px] text-slate-600">
            Stop 1: Data Marketplace (House Ravenclaw) Unlocked
          </p>
        </div>
      )}
    </div>
  );
}

