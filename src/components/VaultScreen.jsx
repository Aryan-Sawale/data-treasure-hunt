import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  Globe2, 
  KeyRound, 
  AlertCircle, 
  Lightbulb, 
  Layers,
  RotateCcw
} from 'lucide-react';
import { QUEST_CONFIG, isDevHelperEnabled, DATASPHERE_PHRASE } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { getPlayerName } from '../services/apiService';

const TARGET_PHRASE = DATASPHERE_PHRASE || 'DATA VALUE CHAIN';
const NORMALIZED_TARGET = TARGET_PHRASE.replace(/\s+/g, '').toUpperCase();

// 14 Letters collected across 4 team stops:
// Stop 1: HACN | Stop 2: EUL | Stop 3: ATD | Stop 4: AAIV
const COLLECTED_TILES = [
  { id: 't-0', letter: 'H' },
  { id: 't-1', letter: 'A' },
  { id: 't-2', letter: 'C' },
  { id: 't-3', letter: 'N' },
  { id: 't-4', letter: 'E' },
  { id: 't-5', letter: 'U' },
  { id: 't-6', letter: 'L' },
  { id: 't-7', letter: 'A' },
  { id: 't-8', letter: 'T' },
  { id: 't-9', letter: 'D' },
  { id: 't-10', letter: 'A' },
  { id: 't-11', letter: 'A' },
  { id: 't-12', letter: 'I' },
  { id: 't-13', letter: 'V' },
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
  const [slots, setSlots] = useState(Array(14).fill(null));
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0 = none, 1 = first word DATA, 2 = 3rd word CHAIN ⛓️
  const [isOpeningAnim, setIsOpeningAnim] = useState(false);

  // Drag and touch tracking
  const [draggedTile, setDraggedTile] = useState(null);
  const [touchDragTile, setTouchDragTile] = useState(null);
  const [touchPos, setTouchPos] = useState(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const justTouchedRef = useRef(false);

  const codeDigits = (vaultCode || '2347').split('');
  const playerName = getPlayerName() || 'Data Explorer';

  const usedTileIds = new Set(slots.filter(Boolean).map((s) => s.id));
  const placedCount = slots.filter(Boolean).length;

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

  // Place tile in specific slot
  const placeTileInSlot = (tile, targetIdx) => {
    if (targetIdx < 0 || targetIdx >= 14) return;
    soundService.playDialTick();
    hapticService.light();

    setSlots((prev) => {
      const next = [...prev];
      const existingIdx = next.findIndex((s) => s && s.id === tile.id);
      const targetTile = next[targetIdx];

      if (existingIdx !== -1) {
        next[existingIdx] = targetTile;
      }
      next[targetIdx] = tile;
      return next;
    });
    if (errorMsg) setErrorMsg(null);
  };

  // Place tile in first available empty slot
  const placeTileInNextEmptySlot = (tile) => {
    const emptyIdx = slots.findIndex((s) => s === null);
    if (emptyIdx !== -1) {
      placeTileInSlot(tile, emptyIdx);
    }
  };

  // Handle direct tap on an available letter tile
  const handleTileTap = (tile) => {
    if (usedTileIds.has(tile.id)) return;
    soundService.playDialTick();
    hapticService.light();

    if (selectedSlotIdx !== null && selectedSlotIdx >= 0 && selectedSlotIdx < 14) {
      // Place into selected slot
      placeTileInSlot(tile, selectedSlotIdx);
      // Advance selection to next empty slot
      const nextEmpty = slots.findIndex((s, i) => i > selectedSlotIdx && s === null);
      if (nextEmpty !== -1) {
        setSelectedSlotIdx(nextEmpty);
      } else {
        const anyEmpty = slots.findIndex((s) => s === null);
        setSelectedSlotIdx(anyEmpty !== -1 ? anyEmpty : null);
      }
    } else {
      placeTileInNextEmptySlot(tile);
    }
  };

  // Remove tile from slot back to pool
  const removeTileFromSlot = (slotIdx) => {
    soundService.playClick();
    hapticService.light();
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    if (errorMsg) setErrorMsg(null);
  };

  // Clear all slots
  const handleClearAll = () => {
    soundService.playClick();
    hapticService.light();
    setSlots(Array(14).fill(null));
    setSelectedSlotIdx(null);
    if (errorMsg) setErrorMsg(null);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (tile, e) => {
    e.dataTransfer.setData('text/plain', tile.id);
    setDraggedTile(tile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnSlot = (slotIdx, e) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain') || draggedTile?.id;
    const tile = COLLECTED_TILES.find((t) => t.id === tileId) || slots.find((s) => s && s.id === tileId);
    if (tile) {
      placeTileInSlot(tile, slotIdx);
      setSelectedSlotIdx(null);
    }
    setDraggedTile(null);
  };

  // Mobile Touch Drag handlers (touch-action: none prevents page scrolling)
  const handleTouchStart = (tile, e) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setTouchDragTile(tile);
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e) => {
    if (!touchDragTile) return;
    if (e.cancelable) {
      e.preventDefault(); // Prevents page scrolling on mobile while dragging
    }
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!touchDragTile) return;
    justTouchedRef.current = true;
    setTimeout(() => {
      justTouchedRef.current = false;
    }, 350);

    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    if (dx > 12 || dy > 12) {
      // Drag & drop release
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const slotEl = el?.closest('[data-slot-idx]');
      if (slotEl) {
        const slotIdx = parseInt(slotEl.getAttribute('data-slot-idx'), 10);
        placeTileInSlot(touchDragTile, slotIdx);
        setSelectedSlotIdx(null);
      }
    } else {
      // Tap to place
      handleTileTap(touchDragTile);
    }

    setTouchDragTile(null);
    setTouchPos(null);
  };

  // Submit and verify phrase
  const handleUnlockSubmit = () => {
    if (isSphereOpen || isOpeningAnim) return;

    const currentPhrase = slots.map((s) => (s ? s.letter : '')).join('');

    if (currentPhrase.length < 14) {
      soundService.playError();
      hapticService.error();
      setErrorMsg(`Please fill all 14 letter boxes! (${14 - currentPhrase.length} remaining)`);
      return;
    }

    if (currentPhrase === NORMALIZED_TARGET) {
      // Solved!
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
      // Incorrect
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
    const solvedSlots = [
      COLLECTED_TILES.find((t) => t.id === 't-9'), // D
      COLLECTED_TILES.find((t) => t.id === 't-1'), // A
      COLLECTED_TILES.find((t) => t.id === 't-8'), // T
      COLLECTED_TILES.find((t) => t.id === 't-7'), // A
      COLLECTED_TILES.find((t) => t.id === 't-13'), // V
      COLLECTED_TILES.find((t) => t.id === 't-10'), // A
      COLLECTED_TILES.find((t) => t.id === 't-6'), // L
      COLLECTED_TILES.find((t) => t.id === 't-5'), // U
      COLLECTED_TILES.find((t) => t.id === 't-4'), // E
      COLLECTED_TILES.find((t) => t.id === 't-2'), // C
      COLLECTED_TILES.find((t) => t.id === 't-0'), // H
      COLLECTED_TILES.find((t) => t.id === 't-11'), // A
      COLLECTED_TILES.find((t) => t.id === 't-12'), // I
      COLLECTED_TILES.find((t) => t.id === 't-3'), // N
    ];
    setSlots(solvedSlots);
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

  // Render a single target box slot
  const renderBoxSlot = (slotIdx) => {
    const tile = slots[slotIdx];
    const isSelected = selectedSlotIdx === slotIdx;

    return (
      <div
        key={slotIdx}
        data-slot-idx={slotIdx}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnSlot(slotIdx, e)}
        onClick={() => {
          if (tile) {
            removeTileFromSlot(slotIdx);
            setSelectedSlotIdx(slotIdx);
          } else {
            setSelectedSlotIdx(selectedSlotIdx === slotIdx ? null : slotIdx);
          }
        }}
        className={`w-7 h-9 sm:w-8 sm:h-10 rounded-xl border-2 flex items-center justify-center font-mono font-black text-sm sm:text-base select-none touch-none transition-all ${
          tile
            ? 'bg-teal-50 border-[#009488] text-[#009488] shadow-xs cursor-pointer active:scale-95'
            : isSelected
            ? 'bg-amber-50 border-[#F9BD20] ring-2 ring-[#F9BD20]/60 text-amber-900 cursor-pointer animate-pulse'
            : 'bg-white border-dashed border-slate-300 text-slate-300 hover:border-[#F9BD20] cursor-pointer'
        }`}
        title={tile ? `${tile.letter} (Tap to remove)` : isSelected ? 'Selected box (Tap a letter)' : 'Empty box (Tap to select)'}
      >
        {tile ? tile.letter : ''}
      </div>
    );
  };

  return (
    <div className="px-4 py-4 max-w-md mx-auto space-y-4">
      {/* Floating Drag Avatar for Touch Dragging on Mobile */}
      {touchDragTile && touchPos && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#F9BD20] text-slate-950 font-mono font-black text-base flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-[#009488]/30 scale-125"
          style={{ left: touchPos.x, top: touchPos.y }}
        >
          {touchDragTile.letter}
        </div>
      )}

      {/* Hero Badge */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#F9BD20] text-[#9E6E00] text-xs font-black shadow-xs">
          <Globe2 className="w-3.5 h-3.5 text-[#009488]" />
          <span>The Datasphere Chamber</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isSphereOpen ? 'Datasphere Unlocked!' : 'Unlock The Datasphere'}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-bold">
          {isSphereOpen 
            ? 'Physical safe code revealed below.'
            : 'Solve the riddle using collected letters.'}
        </p>
      </div>

      {/* 3D Animated Datasphere Graphic */}
      <div className="relative py-5 flex flex-col items-center justify-center">
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Orbital Ring 1 - Cyan */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 animate-sphere-orbit pointer-events-none shadow-[0_0_15px_rgba(34,211,238,0.35)]" 
            style={{ width: '100%', height: '100%' }}
          />
          {/* Orbital Ring 2 - Indigo */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/60 animate-sphere-reverse pointer-events-none shadow-[0_0_15px_rgba(129,140,248,0.35)]" 
            style={{ width: '100%', height: '100%' }}
          />

          {/* Core Orb */}
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

      {/* State A: Sealed -> Question, Target Boxes, and Drag Letter Tiles */}
      {!isSphereOpen ? (
        <div className="bg-white border-2 border-[#009488]/30 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
          {/* Question / Riddle Card */}
          <div className="bg-[#FFFDF5] border-2 border-[#F9BD20] rounded-2xl p-4 text-center shadow-xs space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-[#9E6E00] px-2.5 py-0.5 rounded-full bg-amber-100/70 border border-amber-300">
              <span>🧩</span>
              <span>The Datasphere Riddle</span>
            </span>
            <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">
              "Something of worth, built from links which takes data from raw to ready."
            </p>
          </div>

          {/* Simple Target Boxes with Spaces (No Word 1, 0/4, etc.) */}
          <div className="bg-[#F8FAFA] border-2 border-slate-200 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Tap letters to fill (or drag)
              </span>
              {placedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[10px] font-mono font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Boxes Groupings with Spaces between words */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2.5 py-1">
              {/* Word 1: 4 Boxes */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[0, 1, 2, 3].map((idx) => renderBoxSlot(idx))}
              </div>

              {/* Space Separator */}
              <div className="w-1.5 sm:w-2" />

              {/* Word 2: 5 Boxes */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[4, 5, 6, 7, 8].map((idx) => renderBoxSlot(idx))}
              </div>

              {/* Space Separator */}
              <div className="w-1.5 sm:w-2" />

              {/* Word 3: 5 Boxes */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[9, 10, 11, 12, 13].map((idx) => renderBoxSlot(idx))}
              </div>
            </div>
          </div>

          {/* Collected Letter Tiles (Draggable / Tappable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-0.5">
              <span className="font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#F9BD20]" />
                Collected Letters
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                placedCount === 14 
                  ? 'bg-teal-50 text-[#009488] border border-[#009488]/30 font-black' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {placedCount === 14 ? 'All 14 Placed ✓' : `${14 - placedCount} Left`}
              </span>
            </div>

            {/* 14 Letter Tiles Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {COLLECTED_TILES.map((tile) => {
                const isUsed = usedTileIds.has(tile.id);

                return (
                  <div
                    key={tile.id}
                    draggable={!isUsed}
                    onDragStart={(e) => handleDragStart(tile, e)}
                    onTouchStart={(e) => {
                      if (!isUsed) handleTouchStart(tile, e);
                    }}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => {
                      if (!isUsed && !justTouchedRef.current) handleTileTap(tile);
                    }}
                    className={`h-10 sm:h-11 rounded-xl flex items-center justify-center font-mono font-black text-sm sm:text-base select-none touch-none transition-all ${
                      isUsed
                        ? 'bg-slate-100 border-2 border-dashed border-slate-200 text-slate-300 opacity-40 cursor-default scale-95'
                        : 'bg-[#FFFDF5] border-2 border-[#F9BD20] text-[#B45309] shadow-xs hover:border-[#009488] hover:text-[#009488] active:scale-95 cursor-grab active:cursor-grabbing'
                    }`}
                    title={isUsed ? `${tile.letter} (Placed in box)` : `Tap to place ${tile.letter} (or drag)`}
                  >
                    {tile.letter}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Unlock Datasphere Button */}
          <button
            type="button"
            onClick={handleUnlockSubmit}
            disabled={isOpeningAnim || placedCount === 0}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-50 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[#F9BD20]" />
            <span>Unlock Datasphere</span>
          </button>

          {/* Simple Decluttered Clue & Hint Section */}
          <div className="pt-0.5">
            {hintLevel === 0 ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleBuyHint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFFDF5] hover:bg-[#FEF9C3] border border-[#F9BD20] text-[#9E6E00] hover:text-[#B45309] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
                  <span>Need a Hint? (-5 pts)</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#F9BD20] space-y-1.5 text-xs shadow-2xs animate-fade-in">
                <div className="flex items-center justify-between text-[#9E6E00] font-black text-[11px] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 fill-[#F9BD20]" />
                    <span>Hints</span>
                  </span>
                  {hintLevel < 2 && (
                    <button
                      type="button"
                      onClick={handleBuyHint}
                      className="text-[#9E6E00] hover:text-[#B45309] underline font-bold lowercase text-[11px] cursor-pointer"
                    >
                      get 2nd hint (-5 pts)
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-slate-800 font-medium pl-1">
                  <p className="flex items-center gap-1.5">
                    <span className="text-[#009488] font-bold">1.</span>
                    <span>First word is <strong className="font-mono text-[#009488] font-bold">DATA</strong></span>
                  </p>
                  {hintLevel >= 2 && (
                    <p className="flex items-center gap-1.5">
                      <span className="text-[#009488] font-bold">2.</span>
                      <span>Third word is <span className="text-base">⛓️</span></span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dev Helper Options */}
          {isDevHelperEnabled() && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center space-x-1 text-[#878787] hover:text-[#B45309]"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
                <span>{showHint ? 'Hide Clue' : 'Target Phrase'}</span>
              </button>

              <button
                type="button"
                onClick={handleAutoSolve}
                className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                ⚡ Quick Open Datasphere ➔
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
            className="w-full py-3.5 px-4 rounded-2xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#009488]/25 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#F9BD20]" />
            <span>View Final Leaderboard</span>
          </button>
        </div>
      )}
    </div>
  );
}
