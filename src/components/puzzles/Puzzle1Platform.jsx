import React, { useState } from 'react';
import { CheckCircle2, Layers, UserCheck, Send, Database, HardDrive, Brain, Eye } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { isDevHelperEnabled } from '../../config/questConfig';
import { hapticService } from '../../services/hapticService';

// 4 Pairs = 8 Cards total
const CARD_PAIRS = [
  { pairId: 1, name: 'Provider onboarding', icon: UserCheck, color: 'text-teal-700', bg: 'bg-teal-50' },
  { pairId: 2, name: 'Consumer Delivery', icon: Send, color: 'text-amber-700', bg: 'bg-amber-50' },
  { pairId: 3, name: 'DAS', icon: Database, color: 'text-sky-700', bg: 'bg-sky-50' },
  { pairId: 4, name: 'RDS', icon: HardDrive, color: 'text-emerald-700', bg: 'bg-emerald-50' },
];

/**
 * Fisher-Yates shuffle with strict non-adjacency constraints:
 * 1. No horizontal pairs in any row (r*2 !== r*2 + 1)
 * 2. No sequentially adjacent pairs (i !== i + 1)
 * 3. No vertically adjacent pairs (col r !== col r + 1)
 */
const generateShuffledCards = () => {
  const raw = [];
  CARD_PAIRS.forEach((item) => {
    raw.push({ id: `${item.pairId}-a`, ...item });
    raw.push({ id: `${item.pairId}-b`, ...item });
  });

  for (let attempt = 0; attempt < 500; attempt++) {
    const list = [...raw];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    // 1. Horizontal check: No row has identical pairId
    let hasSideBySide = false;
    for (let r = 0; r < 4; r++) {
      if (list[r * 2].pairId === list[r * 2 + 1].pairId) {
        hasSideBySide = true;
        break;
      }
    }
    if (hasSideBySide) continue;

    // 2. Sequential check: list[i] !== list[i+1]
    let hasSequential = false;
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i].pairId === list[i + 1].pairId) {
        hasSequential = true;
        break;
      }
    }
    if (hasSequential) continue;

    // 3. Vertical check: list[r*2 + c] !== list[(r+1)*2 + c]
    let hasVertical = false;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 3; r++) {
        if (list[r * 2 + c].pairId === list[(r + 1) * 2 + c].pairId) {
          hasVertical = true;
          break;
        }
      }
    }
    if (hasVertical) continue;

    return list;
  }

  // Guaranteed non-adjacent fallback pattern:
  // Row 0: 1, 2 | Row 1: 3, 4 | Row 2: 2, 1 | Row 3: 4, 3
  const pattern = [1, 2, 3, 4, 2, 1, 4, 3];
  const usedA = {};
  return pattern.map((pId) => {
    const item = CARD_PAIRS.find((p) => p.pairId === pId);
    const suffix = usedA[pId] ? 'b' : 'a';
    usedA[pId] = true;
    return { id: `${pId}-${suffix}`, ...item };
  });
};

export default function Puzzle1Platform({ onSolved, onPenalty }) {
  const [cards] = useState(() => generateShuffledCards());
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mismatchCount, setMismatchCount] = useState(0);

  // 4-second initial memorization preview states
  const [gameStarted, setGameStarted] = useState(false);
  const [isMemorizing, setIsMemorizing] = useState(false);
  const [memorizeSecondsLeft, setMemorizeSecondsLeft] = useState(4);

  // 2-second penalty reshow states (-10 points)
  const [isReshowing, setIsReshowing] = useState(false);
  const [reshowSecondsLeft, setReshowSecondsLeft] = useState(2);

  const matchedCount = matchedPairIds.length;
  const totalPairs = CARD_PAIRS.length; // 4

  // Start 4-second initial memory preview
  const handleStartGame = () => {
    if (isMemorizing || isReshowing || isSuccess) return;
    soundService.playSuccess();
    hapticService.medium();
    setIsMemorizing(true);
    setMemorizeSecondsLeft(4);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 4 - elapsed);
      setMemorizeSecondsLeft(remaining > 0 ? remaining.toFixed(1) : '0.0');
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsMemorizing(false);
      setGameStarted(true);
      soundService.playDialTick();
      hapticService.success();
    }, 4000);
  };

  // Reshow cards for 2 seconds with a 10-point penalty
  const handleReshowCards = () => {
    if (isReshowing || isMemorizing || isProcessing || isSuccess) return;

    soundService.playSuccess();
    hapticService.medium();

    if (onPenalty) {
      onPenalty(10, 'Memory Cards Peek (2s)');
    }

    setIsReshowing(true);
    setReshowSecondsLeft(2);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 2 - elapsed);
      setReshowSecondsLeft(remaining > 0 ? remaining.toFixed(1) : '0.0');
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsReshowing(false);
      soundService.playDialTick();
      hapticService.light();
    }, 2000);
  };

  // Handle card click
  const handleCardClick = (card) => {
    if (isProcessing || isSuccess || isMemorizing || isReshowing) return;

    if (!gameStarted) {
      handleStartGame();
      return;
    }

    if (matchedPairIds.includes(card.pairId)) return;
    if (flippedIds.includes(card.id)) return;

    soundService.playDialTick();
    hapticService.light();

    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    // If 2 cards are flipped, check for match
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard.pairId === secondCard.pairId) {
        soundService.playSuccess();
        hapticService.success();
        const updatedMatches = [...matchedPairIds, firstCard.pairId];
        setMatchedPairIds(updatedMatches);
        setFlippedIds([]);
        setIsProcessing(false);

        if (updatedMatches.length === totalPairs) {
          setIsSuccess(true);
          setTimeout(() => {
            onSolved();
          }, 1200);
        }
      } else {
        soundService.playError();
        hapticService.error();

        const newMismatches = mismatchCount + 1;
        setMismatchCount(newMismatches);

        if (newMismatches > 3 && onPenalty) {
          onPenalty(5, 'Memory Card Mismatch');
        }

        setTimeout(() => {
          setFlippedIds([]);
          setIsProcessing(false);
        }, 750);
      }
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Challenge Header & Concise Prompt (Emoji Puzzle Style) */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 2 of 4
          </span>
          <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#F0FDF4] border border-[#009488]/30 text-[#009488]">
            {matchedCount}/{totalPairs} Pairs
          </span>
        </div>

        {/* Larger Font, Green Brand Color with Icon */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🏗️</span>
            <span>Memory Matching</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Memorize in 4 seconds, then match all 4 pairs.
          </p>
        </div>

        {/* Start Button (Visible before starting) */}
        {!gameStarted && !isMemorizing && (
          <button
            onClick={handleStartGame}
            className="w-full py-3 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#F9BD20]" />
            <span>Show Cards (4s) & Start</span>
          </button>
        )}
      </div>

      {/* 4-Second Initial Memorize Countdown Banner */}
      {isMemorizing && (
        <div className="bg-amber-50 p-3 rounded-2xl border-2 border-[#F9BD20] space-y-1.5 text-center shadow-md animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-900 uppercase">
            <Brain className="w-4 h-4 text-[#009488] animate-bounce" />
            <span>Memorize all 4 pairs!</span>
            <span className="font-mono text-sm bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-amber-800 font-black shadow-xs">
              {memorizeSecondsLeft}s
            </span>
          </div>
          <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#009488] transition-all duration-100 ease-linear"
              style={{ width: `${(memorizeSecondsLeft / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 2-Second Reshow Countdown Banner (-10 pts peek) */}
      {isReshowing && (
        <div className="bg-amber-50 p-3 rounded-2xl border-2 border-[#F9BD20] space-y-1.5 text-center shadow-md animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-amber-900 uppercase">
            <Eye className="w-4 h-4 text-[#009488] animate-bounce" />
            <span>Reshowing Cards (Peek Active)</span>
            <span className="font-mono text-sm bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-amber-800 font-black shadow-xs">
              {reshowSecondsLeft}s
            </span>
          </div>
          <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#009488] transition-all duration-100 ease-linear"
              style={{ width: `${(reshowSecondsLeft / 2) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 2-Column Grid with Larger Fonts & Original Theme */}
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((card) => {
          const isFlipped = isMemorizing || isReshowing || flippedIds.includes(card.id);
          const isMatched = matchedPairIds.includes(card.pairId);
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isMatched || isSuccess || isProcessing || isMemorizing || isReshowing}
              className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 select-none active:scale-[0.98] text-left min-h-[68px] cursor-pointer shadow-xs ${
                isMatched
                  ? 'bg-[#F0FDF4] border-[#009488] opacity-95'
                  : isFlipped
                  ? `${card.bg} border-[#009488] ring-2 ring-[#009488]/20 shadow-md`
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#F9BD20]'
              }`}
            >
              {isFlipped || isMatched ? (
                <div className="flex items-center space-x-2.5 animate-fade-in w-full min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                      isMatched
                        ? 'bg-[#009488]/15 border-[#009488]/40'
                        : `${card.bg} border-slate-200/60`
                    }`}
                  >
                    {isMatched ? (
                      <CheckCircle2 className="w-5 h-5 text-[#009488]" />
                    ) : (
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight truncate">
                      {card.name}
                    </span>
                    {isMatched && (
                      <span className="text-[10px] font-mono text-[#009488] font-bold block mt-0.5">
                        ✓ Matched
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 w-full py-0.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#009488]/10 to-[#F9BD20]/20 flex items-center justify-center shrink-0 text-base border border-slate-200">
                    🃏
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block leading-tight">
                      Card
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {gameStarted ? 'Tap to Flip' : 'Tap to Start'}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs sm:text-sm font-black text-[#009488]">All 4 Pairs Matched!</h4>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Stop 2: Enterprise Data Lake Unlocked
          </p>
        </div>
      )}

      {/* Footer Controls: Reshow for 2s (-10 pts) & Dev Quick Complete */}
      <div className="flex items-center justify-between pt-1">
        <div>
          {gameStarted && !isSuccess && matchedCount < totalPairs && (
            <button
              onClick={handleReshowCards}
              disabled={isReshowing || isProcessing || isSuccess}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#FFFDF5] hover:bg-[#FEF9C3] border-2 border-[#F9BD20] text-[#9E6E00] hover:text-[#B45309] font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Reshow all cards for 2 seconds (-10 points penalty)"
            >
              <Eye className="w-4 h-4 text-[#F9BD20]" />
              <span>Reshow Cards (2s)</span>
              <span className="font-mono text-[10px] bg-[#F9BD20]/25 text-[#B45309] px-1.5 py-0.5 rounded-md font-black">
                -10 pts
              </span>
            </button>
          )}
        </div>

        {isDevHelperEnabled() && (
          <button
            onClick={() => onSolved()}
            className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer ml-auto"
          >
            ⚡ Quick Complete ➔
          </button>
        )}
      </div>
    </div>
  );
}
