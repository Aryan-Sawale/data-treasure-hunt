import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Lightbulb, KeyRound } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const TARGET_PHRASE = 'DATA SHARING AGREEMENT';
const NORMALIZED_TARGET = TARGET_PHRASE.replace(/\s+/g, '').toUpperCase();
const WORD1_LEN = 4;
const WORD2_LEN = 7;
const WORD3_LEN = 9;

export default function Puzzle1EmojiPhrase({ onSolved, onPenalty }) {
  const [guess, setGuess] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  // Compute dynamic slot states based on user typing
  const clean = guess.trimStart().toUpperCase();
  let w1 = '';
  let w2 = '';
  let w3 = '';

  if (clean.includes(' ')) {
    const parts = clean.split(' ');
    w1 = (parts[0] || '').replace(/[^A-Z]/g, '').slice(0, WORD1_LEN);
    w2 = (parts[1] || '').replace(/[^A-Z]/g, '').slice(0, WORD2_LEN);
    w3 = (parts.slice(2).join('') || '').replace(/[^A-Z]/g, '').slice(0, WORD3_LEN);
  } else {
    const letters = clean.replace(/[^A-Z]/g, '');
    w1 = letters.slice(0, WORD1_LEN);
    w2 = letters.slice(WORD1_LEN, WORD1_LEN + WORD2_LEN);
    w3 = letters.slice(WORD1_LEN + WORD2_LEN, WORD1_LEN + WORD2_LEN + WORD3_LEN);
  }

  const slots1 = Array.from({ length: WORD1_LEN }, (_, i) => w1[i] || '_');
  const slots2 = Array.from({ length: WORD2_LEN }, (_, i) => w2[i] || '_');
  const slots3 = Array.from({ length: WORD3_LEN }, (_, i) => w3[i] || '_');

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
      setIsSuccess(true);
      setErrorMsg(null);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      soundService.playError();
      hapticService.error();
      setErrorMsg('Not quite right! (-5 pts). Check the emojis and try again.');
      if (onPenalty) {
        onPenalty(5, 'Incorrect Phrase Guess');
      }
    }
  };

  const handleRequestHint = () => {
    if (showHint || isSuccess) return;
    soundService.playSuccess();
    hapticService.medium();
    setShowHint(true);
    if (onPenalty) {
      onPenalty(5, 'Emoji Phrase Hint');
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Challenge Header & Concise Prompt (Matching Memory Game Style) */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 1 of 4
          </span>
          <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#F0FDF4] border border-[#009488]/30 text-[#009488]">
            3 Words
          </span>
        </div>

        {/* Larger Font, Green Brand Color with Icon */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span>Guess the Phrase!</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Decipher 3 words from the emojis below.
          </p>
        </div>
      </div>

      {/* 3 Emoji Clue Cards (Large Emojis, Minimalist Labels) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Word 1 */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center space-y-1 shadow-2xs hover:border-[#009488]/50 transition-all">
          <div className="text-3xl sm:text-4xl filter drop-shadow-xs flex items-center gap-1 select-none py-0.5">
            <span>💾</span>
            <span>📊</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">4 letters</span>
        </div>

        {/* Word 2 */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center space-y-1 shadow-2xs hover:border-[#009488]/50 transition-all">
          <div className="text-3xl sm:text-4xl filter drop-shadow-xs flex items-center gap-1 select-none py-0.5">
            <span>🍕</span>
            <span>🫂</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">7 letters</span>
        </div>

        {/* Word 3 */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-3 flex flex-col items-center text-center space-y-1 shadow-2xs hover:border-[#009488]/50 transition-all">
          <div className="text-3xl sm:text-4xl filter drop-shadow-xs flex items-center gap-1 select-none py-0.5">
            <span>🤝</span>
            <span>📜</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">9 letters</span>
        </div>
      </div>

      {/* Clean Letter Slots (Completely Uniform Across All 3 Words) */}
      <div 
        onClick={() => inputRef.current?.focus()}
        className="bg-[#F8FAFA] border-2 border-slate-200 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-inner cursor-pointer select-none"
        title="Tap to type your guess"
      >
        {/* Word 1: 4 Boxes */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          {slots1.map((char, idx) => (
            <span
              key={idx}
              className={`w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center rounded-xl border-2 font-mono font-black text-xs sm:text-sm transition-all ${
                char !== '_'
                  ? 'bg-teal-50 border-[#009488] text-[#009488] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-300'
              }`}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Word 2: 7 Boxes */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          {slots2.map((char, idx) => (
            <span
              key={idx}
              className={`w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center rounded-xl border-2 font-mono font-black text-xs sm:text-sm transition-all ${
                char !== '_'
                  ? 'bg-teal-50 border-[#009488] text-[#009488] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-300'
              }`}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Word 3: 9 Boxes */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          {slots3.map((char, idx) => (
            <span
              key={idx}
              className={`w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center rounded-xl border-2 font-mono font-black text-xs sm:text-sm transition-all ${
                char !== '_'
                  ? 'bg-teal-50 border-[#009488] text-[#009488] shadow-xs'
                  : 'bg-white border-slate-200 text-slate-300'
              }`}
            >
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Form Input & Action Buttons */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={guess}
            disabled={isSuccess}
            onChange={(e) => {
              setGuess(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Type guess here..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full bg-white border-2 border-slate-200 focus:border-[#009488] rounded-xl px-3.5 py-3 text-sm text-slate-900 font-bold uppercase placeholder:text-slate-400 placeholder:normal-case focus:outline-none transition-all shadow-xs"
          />
          {guess && !isSuccess && (
            <button
              type="button"
              onClick={() => {
                setGuess('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100"
            >
              ✕
            </button>
          )}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Hint Section (-5 pts) */}
        {!showHint ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRequestHint}
              disabled={isSuccess}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FEF9C3] border border-[#F9BD20] text-[#9E6E00] hover:text-[#B45309] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Get a hint for 5 points penalty"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
              <span>Need a Hint?</span>
              <span className="font-mono text-[10px] bg-[#F9BD20]/25 text-[#B45309] px-1.5 py-0.5 rounded font-black">
                -5 pts
              </span>
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20] flex items-center gap-2 text-xs animate-fade-in shadow-2xs">
            <Lightbulb className="w-4 h-4 text-[#F9BD20] shrink-0 fill-[#F9BD20]" />
            <p className="text-slate-800 font-medium">
              Hint: Formal agreement or contract to share data.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSuccess || !guess.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
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
            onClick={() => onSolved()}
            className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            ⚡ Quick Complete ➔
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
            Stop 1: Data Marketplace Unlocked
          </p>
        </div>
      )}
    </div>
  );
}
