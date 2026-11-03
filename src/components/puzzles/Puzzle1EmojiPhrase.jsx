import React, { useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, Lightbulb, KeyRound, Share2 } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const WORDS = [
  {
    id: 1,
    word: 'DATA',
    len: 4,
    label: 'Word 1',
    isExcelGrid: true,
    hint: 'Structured rows & columns in spreadsheets or databases (D _ _ _)',
  },
  {
    id: 2,
    word: 'SHARING',
    len: 7,
    label: 'Word 2',
    isShareIcon: true,
    hint: 'Distributing or sending to others on social media (S _ _ _ _ _ _)',
  },
  {
    id: 3,
    word: 'AGREEMENT',
    len: 9,
    label: 'Word 3',
    emojis: ['🤝', '📜'],
    hint: 'Formal contract, accord, or legal pact between parties (A _ _ _ _ _ _ _ _)',
  },
];

export default function Puzzle1EmojiPhrase({ onSolved, onPenalty }) {
  const [solvedWords, setSolvedWords] = useState([]);
  const [activeWordId, setActiveWordId] = useState(1);
  const [currentGuess, setCurrentGuess] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [wordSuccessMsg, setWordSuccessMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  const activeWord = WORDS.find((w) => w.id === activeWordId) || WORDS[0];

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isSuccess) return;

    const rawClean = currentGuess.trim().toUpperCase();
    const clean = rawClean.replace(/[^A-Z]/g, '');

    if (!clean) {
      setErrorMsg(`Please type your guess for ${activeWord.label}!`);
      soundService.playError();
      hapticService.error();
      return;
    }

    // 1. User typed entire target phrase "DATA SHARING AGREEMENT"
    if (clean === 'DATASHARINGAGREEMENT' || rawClean.replace(/\s+/g, '') === 'DATASHARINGAGREEMENT') {
      setSolvedWords([1, 2, 3]);
      setCurrentGuess('');
      setErrorMsg(null);
      setWordSuccessMsg('Brilliant! All 3 words solved at once!');
      setIsSuccess(true);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
      return;
    }

    // 2. User guessed the currently active word
    if (clean === activeWord.word) {
      const nextSolved = [...new Set([...solvedWords, activeWord.id])];
      setSolvedWords(nextSolved);
      setCurrentGuess('');
      setErrorMsg(null);

      soundService.playSuccess();
      hapticService.success();

      if (nextSolved.length >= 3) {
        setIsSuccess(true);
        setWordSuccessMsg(`Correct! "${activeWord.word}" completes the phrase!`);
        setTimeout(() => {
          onSolved();
        }, 1200);
      } else {
        setWordSuccessMsg(`Correct! "${activeWord.word}" solved!`);
        // Advance to next unsolved word
        const nextUnsolved = WORDS.find((w) => !nextSolved.includes(w.id));
        if (nextUnsolved) {
          setActiveWordId(nextUnsolved.id);
        }
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
      return;
    }

    // 3. User typed one of the other words (e.g., typed "SHARING" while Word 1 was active)
    const matchedOther = WORDS.find((w) => w.word === clean && !solvedWords.includes(w.id));
    if (matchedOther) {
      const nextSolved = [...new Set([...solvedWords, matchedOther.id])];
      setSolvedWords(nextSolved);
      setCurrentGuess('');
      setErrorMsg(null);

      soundService.playSuccess();
      hapticService.success();

      if (nextSolved.length >= 3) {
        setIsSuccess(true);
        setWordSuccessMsg(`Correct! "${matchedOther.word}" completes the phrase!`);
        setTimeout(() => {
          onSolved();
        }, 1200);
      } else {
        setWordSuccessMsg(`Nice! "${clean}" is ${matchedOther.label}! Now solve ${activeWord.label}.`);
        if (matchedOther.id === activeWord.id) {
          const nextUnsolved = WORDS.find((w) => !nextSolved.includes(w.id));
          if (nextUnsolved) {
            setActiveWordId(nextUnsolved.id);
          }
        }
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
      return;
    }

    // 4. Incorrect guess
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    soundService.playError();
    hapticService.error();
    setWordSuccessMsg(null);
    setErrorMsg(`Not quite right! (-5 pts). Try guessing ${activeWord.label} again.`);
    if (onPenalty) {
      onPenalty(5, 'Incorrect Word Guess');
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

  const handleSelectWord = (wordId) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    setActiveWordId(wordId);
    setCurrentGuess('');
    setErrorMsg(null);
    setWordSuccessMsg(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="space-y-3.5">
      {/* Challenge Header & Concise Prompt */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 2
          </span>
          <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#F0FDF4] border border-[#009488]/30 text-[#009488]">
            {solvedWords.length}/3 Words Solved
          </span>
        </div>

        {/* Larger Font, Green Brand Color with Icon */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <span>Guess the Phrase!</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Guess each word from the clues below.
          </p>
        </div>
      </div>

      {/* 3 Emoji Clue Cards (Selectable Word Tabs) */}
      <div className="grid grid-cols-3 gap-2">
        {WORDS.map((w) => {
          const isSolved = solvedWords.includes(w.id);
          const isActive = activeWordId === w.id;

          return (
            <button
              key={w.id}
              type="button"
              onClick={() => handleSelectWord(w.id)}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-1 relative cursor-pointer select-none ${
                isSolved
                  ? 'bg-[#F0FDF4] border-[#009488] shadow-xs'
                  : isActive
                  ? 'bg-[#FFFDF5] border-[#F9BD20] ring-2 ring-[#F9BD20]/50 shadow-sm scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs opacity-90'
              }`}
            >
              {/* Top Status */}
              <div className="w-full flex items-center justify-between text-[9px] font-mono font-bold">
                <span className={isSolved ? 'text-[#009488] font-black' : isActive ? 'text-[#9E6E00] font-black' : 'text-slate-400'}>
                  {w.label}
                </span>
                {isSolved ? (
                  <span className="text-[#009488] font-black flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                ) : isActive ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#F9BD20] text-slate-950 font-black text-[8px] uppercase">
                    Active
                  </span>
                ) : null}
              </div>

              {/* Clue Visuals: Excel Cell Grid, Social Media Share Icon, or Emojis */}
              {w.isExcelGrid ? (
                <div className="flex items-center justify-center py-0.5 select-none">
                  <div className="bg-white border-2 border-emerald-600 rounded-lg shadow-2xs overflow-hidden w-20 text-[8px] font-mono leading-tight">
                    {/* Excel Title Bar */}
                    <div className="bg-[#107C41] text-white flex items-center justify-between px-1.5 py-0.5 font-bold">
                      <span className="text-[8px] flex items-center gap-0.5">
                        <span>📊</span>
                        <span>.xlsx</span>
                      </span>
                      <span className="text-[7px] text-emerald-100 font-mono">fx</span>
                    </div>
                    {/* Table Column Headers */}
                    <div className="grid grid-cols-3 bg-slate-100 text-slate-500 border-b border-slate-200 text-center font-bold text-[7px] py-0.5">
                      <span className="border-r border-slate-200">A</span>
                      <span className="border-r border-slate-200">B</span>
                      <span>C</span>
                    </div>
                    {/* Row 1 */}
                    <div className="grid grid-cols-3 text-slate-700 text-center text-[7px] border-b border-slate-100 py-0.5">
                      <span className="border-r border-slate-100 bg-emerald-50/70 font-bold text-emerald-800">104</span>
                      <span className="border-r border-slate-100 font-medium">89</span>
                      <span className="font-medium">42</span>
                    </div>
                    {/* Row 2 */}
                    <div className="grid grid-cols-3 text-slate-700 text-center text-[7px] py-0.5">
                      <span className="border-r border-slate-100 font-medium">250</span>
                      <span className="border-r border-slate-100 font-medium">18</span>
                      <span className="bg-emerald-50/70 font-bold text-emerald-800">95</span>
                    </div>
                  </div>
                </div>
              ) : w.isShareIcon ? (
                <div className="flex items-center justify-center gap-1.5 py-0.5 filter drop-shadow-xs">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs transition-colors ${
                      isSolved
                        ? 'bg-[#009488]/15 border-[#009488]/40 text-[#009488]'
                        : 'bg-sky-50 border-sky-300 text-sky-600'
                    }`}
                  >
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-2xl sm:text-3xl">📲</span>
                </div>
              ) : (
                <div className="text-3xl sm:text-4xl filter drop-shadow-xs flex items-center justify-center gap-1 select-none py-0.5">
                  {w.emojis?.map((em, i) => (
                    <span key={i}>{em}</span>
                  ))}
                </div>
              )}

              {/* Bottom Label: Solved Word or Letter Count */}
              {isSolved ? (
                <span className="text-xs font-black text-[#009488] font-mono tracking-wider truncate w-full">
                  {w.word}
                </span>
              ) : (
                <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-slate-800 font-black' : 'text-slate-500'}`}>
                  {w.len} letters
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Word Letter Slots (Stacked Rows, Perfectly Uniform Boxes) */}
      <div className="bg-[#F8FAFA] border-2 border-slate-200 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-inner select-none">
        {WORDS.map((w) => {
          const isSolved = solvedWords.includes(w.id);
          const isActive = activeWordId === w.id;
          const currentWordGuess = isActive
            ? currentGuess.trim().toUpperCase().replace(/[^A-Z]/g, '')
            : '';

          return (
            <div
              key={w.id}
              onClick={() => handleSelectWord(w.id)}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isActive && !isSolved
                  ? 'bg-amber-50/70 border border-[#F9BD20]/60 ring-2 ring-[#F9BD20]/20'
                  : isSolved
                  ? 'bg-teal-50/40 border border-[#009488]/30'
                  : 'hover:bg-slate-100/60'
              }`}
              title={isSolved ? `${w.word} (Solved)` : `Tap to guess ${w.label}`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold px-1 mb-1">
                <span
                  className={
                    isSolved
                      ? 'text-[#009488] font-black'
                      : isActive
                      ? 'text-[#9E6E00] font-black'
                      : 'text-slate-400'
                  }
                >
                  {w.label} {isSolved ? `✓ ${w.word}` : `(${w.len} letters)`}
                </span>
                {isActive && !isSolved && (
                  <span className="text-[9px] font-mono text-[#9E6E00] font-bold">
                    typing...
                  </span>
                )}
              </div>

              {/* Uniform Boxes */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                {Array.from({ length: w.len }, (_, i) => {
                  const letter = isSolved
                    ? w.word[i]
                    : isActive
                    ? currentWordGuess[i] || '_'
                    : '_';

                  const isFilled = letter !== '_';

                  return (
                    <span
                      key={i}
                      className={`w-7 h-9 sm:w-8 sm:h-10 flex items-center justify-center rounded-xl border-2 font-mono font-black text-xs sm:text-sm transition-all ${
                        isSolved
                          ? 'bg-teal-50 border-[#009488] text-[#009488] shadow-xs'
                          : isFilled
                          ? 'bg-amber-50 border-[#F9BD20] text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-300'
                      }`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Input & Action Buttons */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs px-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <span>
                Guess {activeWord.label} ({activeWord.len} letters):
              </span>
            </label>
            <span className="text-[11px] font-mono font-bold text-[#009488]">
              {solvedWords.length}/3 Solved
            </span>
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={currentGuess}
              disabled={isSuccess}
              onChange={(e) => {
                setCurrentGuess(e.target.value);
                if (errorMsg) setErrorMsg(null);
                if (wordSuccessMsg) setWordSuccessMsg(null);
              }}
              placeholder={`Type ${activeWord.label.toLowerCase()} guess (${activeWord.len} letters)...`}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="w-full bg-white border-2 border-slate-200 focus:border-[#009488] rounded-xl px-3.5 py-3 text-sm text-slate-900 font-bold uppercase placeholder:text-slate-400 placeholder:normal-case focus:outline-none transition-all shadow-xs"
            />
            {currentGuess && !isSuccess && (
              <button
                type="button"
                onClick={() => {
                  setCurrentGuess('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Word Success Notice */}
        {wordSuccessMsg && (
          <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#009488]/40 flex items-center gap-2 text-[#009488] text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#009488]" />
            <span>{wordSuccessMsg}</span>
          </div>
        )}

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
          <div className="p-3 rounded-2xl bg-[#FFFDF5] border-2 border-[#F9BD20] space-y-1.5 text-xs animate-fade-in shadow-2xs">
            <div className="flex items-center gap-1.5 font-mono font-black text-[10px] uppercase text-[#9E6E00]">
              <Lightbulb className="w-4 h-4 text-[#F9BD20] fill-[#F9BD20]" />
              <span>HINTS UNLOCKED (-5 PTS)</span>
            </div>
            <div className="space-y-1 text-slate-700 font-medium pl-1">
              <p>
                <strong className="text-[#009488]">Word 1:</strong> {WORDS[0].hint}
              </p>
              <p>
                <strong className="text-[#009488]">Word 2:</strong> {WORDS[1].hint}
              </p>
              <p>
                <strong className="text-[#009488]">Word 3:</strong> {WORDS[2].hint}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSuccess || !currentGuess.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
        >
          <KeyRound className="w-4 h-4 text-[#F9BD20]" />
          <span>Submit {activeWord.label} Guess</span>
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
            Stop 1: Metadata governance and solutions Unlocked
          </p>
        </div>
      )}
    </div>
  );
}
