import React, { useState, useEffect } from 'react';
import { Lightbulb, Shuffle, RotateCcw, CheckCircle2, Compass, Sparkles } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { isDevHelperEnabled } from '../../config/questConfig';
import { hapticService } from '../../services/hapticService';

const TARGET_WORD = 'LINEAGE';
const INITIAL_SCRAMBLE = ['G', 'E', 'A', 'L', 'I', 'E', 'N'];

export default function Puzzle4Delivery({ onSolved }) {
  // Available tiles in bank: array of { id, char, isUsed }
  const [tiles, setTiles] = useState(() =>
    INITIAL_SCRAMBLE.map((char, index) => ({
      id: `tile-${index}`,
      char,
      isUsed: false
    }))
  );

  // Placed tiles in answer slots (array of tile objects or null)
  const [slots, setSlots] = useState(Array(TARGET_WORD.length).fill(null));
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const placedWord = slots.map(s => (s ? s.char : '')).join('');

  // Check word when all slots are filled
  useEffect(() => {
    if (placedWord.length === TARGET_WORD.length && !isSuccess) {
      if (placedWord === TARGET_WORD) {
        setIsSuccess(true);
        setIsError(false);
        soundService.playSuccess();
        hapticService.success();
        setTimeout(() => {
          onSolved();
        }, 1200);
      } else {
        setIsError(true);
        soundService.playError();
        hapticService.error();
        setTimeout(() => setIsError(false), 900);
      }
    }
  }, [placedWord, isSuccess, onSolved]);

  // Tap an available tile to place in next empty slot
  const handleTileClick = (tile) => {
    if (tile.isUsed || isSuccess) return;

    const firstEmptyIdx = slots.findIndex(s => s === null);
    if (firstEmptyIdx === -1) return;

    soundService.playDialTick();
    hapticService.light();

    // Mark tile as used
    setTiles(prev =>
      prev.map(t => (t.id === tile.id ? { ...t, isUsed: true } : t))
    );

    // Place into slots
    const newSlots = [...slots];
    newSlots[firstEmptyIdx] = tile;
    setSlots(newSlots);
  };

  // Tap a placed slot to remove it and return to bank
  const handleSlotClick = (index) => {
    if (isSuccess || !slots[index]) return;

    soundService.playDialTick();
    hapticService.light();

    const removedTile = slots[index];

    // Return to bank
    setTiles(prev =>
      prev.map(t => (t.id === removedTile.id ? { ...t, isUsed: false } : t))
    );

    // Empty slot
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    setIsError(false);
  };

  // Shuffle available bank tiles
  const handleShuffle = () => {
    soundService.playClick();
    hapticService.light();
    setTiles(prev => {
      const unused = prev.filter(t => !t.isUsed);
      const shuffledUnused = [...unused].sort(() => Math.random() - 0.5);
      let unusedIdx = 0;
      return prev.map(t => (t.isUsed ? t : shuffledUnused[unusedIdx++]));
    });
  };

  // Clear all slots
  const handleClear = () => {
    soundService.playClick();
    hapticService.light();
    setTiles(prev => prev.map(t => ({ ...t, isUsed: false })));
    setSlots(Array(TARGET_WORD.length).fill(null));
    setIsError(false);
  };

  // Hint: place next correct letter
  const handleHint = () => {
    soundService.playSuccess();
    hapticService.medium();

    const targetChars = TARGET_WORD.split('');
    const firstWrongOrEmptyIdx = slots.findIndex((s, idx) => !s || s.char !== targetChars[idx]);

    if (firstWrongOrEmptyIdx === -1) return;

    const neededChar = targetChars[firstWrongOrEmptyIdx];

    // If a tile is currently in that slot, remove it first
    if (slots[firstWrongOrEmptyIdx]) {
      const curTile = slots[firstWrongOrEmptyIdx];
      const matchInBank = tiles.find(t => t.id === curTile.id);
      if (matchInBank) matchInBank.isUsed = false;
    }

    // Find an unused tile with the needed char
    const candidateTile = tiles.find(t => t.char === neededChar && !t.isUsed);
    if (candidateTile) {
      candidateTile.isUsed = true;
      const newSlots = [...slots];
      newSlots[firstWrongOrEmptyIdx] = candidateTile;
      setSlots(newSlots);
      setTiles([...tiles]);
    }
  };

  // Auto solve
  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const targetChars = TARGET_WORD.split('');
    const newTiles = [...tiles];
    const newSlots = targetChars.map((char) => {
      const tile = newTiles.find(t => t.char === char && !t.isUsed);
      if (tile) tile.isUsed = true;
      return tile;
    });
    setTiles(newTiles);
    setSlots(newSlots);
    setIsSuccess(true);
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
            <Compass className="w-4 h-4" />
            Data Trail Word Scramble
          </h3>
          <p className="text-xs text-[#878787]">
            Unscramble the letters to reveal the team's secret keyword.
          </p>
        </div>
        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#009488] border border-[#009488]/30">
          7 Letters
        </span>
      </div>

      {/* Business Clue Card */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border border-[#F9BD20]/50 shadow-xs space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#9E6E00] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#F9BD20]" />
          Business Clue
        </span>
        <p className="text-xs text-slate-800 font-medium leading-relaxed">
          "What verifiable audit trail traces the complete origin journey of data from its first source all the way to customer reports?"
        </p>
      </div>

      {/* Answer Slots Row */}
      <div className="py-2">
        <div className="flex justify-center items-center gap-1.5 sm:gap-2">
          {slots.map((tile, idx) => (
            <button
              key={idx}
              onClick={() => handleSlotClick(idx)}
              disabled={isSuccess || !tile}
              className={`w-10 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all select-none shadow-xs ${
                isSuccess
                  ? 'bg-[#009488] text-white border-2 border-[#007066] scale-105'
                  : isError
                  ? 'bg-rose-50 border-2 border-rose-400 text-rose-700 animate-shake'
                  : tile
                  ? 'bg-white border-2 border-[#009488] text-[#009488] active:scale-95 shadow-sm'
                  : 'bg-slate-50 border-2 border-dashed border-slate-300 text-slate-300'
              }`}
            >
              {tile ? tile.char : ''}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-[#878787] mt-1.5 font-medium">
          {isSuccess ? (
            <span className="text-[#009488] font-bold">Word Unscrambled!</span>
          ) : (
            <span>Tap an empty letter slot to remove it</span>
          )}
        </p>
      </div>

      {/* Scrambled Letter Bank */}
      <div className="bg-[#F8FAFA] p-3 rounded-2xl border border-slate-200">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 text-center">
          Tap Letters to Spell the Word
        </span>
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 flex-wrap">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              disabled={tile.isUsed || isSuccess}
              className={`w-10 h-11 rounded-xl font-black text-base flex items-center justify-center transition-all select-none shadow-xs ${
                tile.isUsed
                  ? 'opacity-20 bg-slate-200 text-slate-400 cursor-not-allowed scale-90'
                  : 'bg-white hover:bg-[#FFFDF5] text-slate-900 border-2 border-slate-200 hover:border-[#F9BD20] active:scale-95 shadow-sm'
              }`}
            >
              {tile.char}
            </button>
          ))}
        </div>
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleShuffle}
            disabled={isSuccess}
            className="flex items-center space-x-1 text-slate-700 hover:text-[#009488] px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 active:scale-95 transition-all shadow-xs"
            title="Shuffle letter bank"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Shuffle</span>
          </button>

          <button
            onClick={handleClear}
            disabled={isSuccess || slots.every(s => s === null)}
            className="flex items-center space-x-1 text-slate-700 hover:text-rose-600 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 active:scale-95 transition-all shadow-xs disabled:opacity-40"
            title="Clear all letters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Clear</span>
          </button>

          {isDevHelperEnabled() && (
            <button
              onClick={handleHint}
              disabled={isSuccess}
              className="flex items-center space-x-1 text-[#9E6E00] hover:text-[#B45309] px-2.5 py-1.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/60 active:scale-95 transition-all shadow-xs"
              title="Reveal next letter"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
              <span className="text-[11px] font-bold">Hint</span>
            </button>
          )}
        </div>

        {isDevHelperEnabled() && (
          <button
            onClick={handleAutoSolve}
            className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline font-medium"
          >
            Auto Solve
          </button>
        )}
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">Correct: LINEAGE!</h4>
          <p className="text-[11px] text-slate-600">Data Marketplace & Lineage (House Gryffindor) Unlocked</p>
        </div>
      )}
    </div>
  );
}
