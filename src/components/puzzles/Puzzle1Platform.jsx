import React, { useState } from 'react';
import { Lightbulb, RotateCcw, CheckCircle2, Layers, UserCheck, Send, Database, HardDrive, Sparkles } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { isDevHelperEnabled } from '../../config/questConfig';
import { hapticService } from '../../services/hapticService';

// 4 Pairs = 8 Cards total
const CARD_PAIRS = [
  { pairId: 1, name: 'Provider onboarding', subtitle: 'Ingestion feed', icon: UserCheck, color: 'text-teal-700', bg: 'bg-teal-50' },
  { pairId: 2, name: 'Consumer Delivery', subtitle: 'Downstream pipe', icon: Send, color: 'text-amber-700', bg: 'bg-amber-50' },
  { pairId: 3, name: 'DAS', subtitle: 'Access layer', icon: Database, color: 'text-sky-700', bg: 'bg-sky-50' },
  { pairId: 4, name: 'RDS', subtitle: 'Read storage', icon: HardDrive, color: 'text-emerald-700', bg: 'bg-emerald-50' },
];

export default function Puzzle1Platform({ onSolved, onPenalty }) {
  // Generate 8 cards with random shuffle
  const [cards, setCards] = useState(() => {
    const raw = [];
    CARD_PAIRS.forEach((item) => {
      raw.push({ id: `${item.pairId}-a`, ...item });
      raw.push({ id: `${item.pairId}-b`, ...item });
    });
    return raw.sort(() => Math.random() - 0.5);
  });

  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mismatchCount, setMismatchCount] = useState(0);

  const matchedCount = matchedPairIds.length;
  const totalPairs = CARD_PAIRS.length; // 4

  // Handle card click
  const handleCardClick = (card) => {
    if (isProcessing || isSuccess) return;
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
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
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
        // Not a match: brief pause then flip back
        soundService.playError();
        hapticService.error();

        const newMismatches = mismatchCount + 1;
        setMismatchCount(newMismatches);

        // Deduct penalty after 3 free exploratory attempts
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

  // Hint: briefly reveal all unmatched cards
  const handleHint = () => {
    if (isProcessing || isSuccess) return;
    soundService.playSuccess();
    hapticService.medium();
    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 1200);
  };

  // Reset / Reshuffle
  const handleReset = () => {
    soundService.playClick();
    hapticService.light();
    setCards(prev => [...prev].sort(() => Math.random() - 0.5));
    setFlippedIds([]);
    setMatchedPairIds([]);
    setIsProcessing(false);
  };

  // Auto solve
  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setMatchedPairIds([1, 2, 3, 4]);
    setFlippedIds([]);
    setIsSuccess(true);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-3.5">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488] flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Memory Matching Game
          </h3>
          <p className="text-xs text-[#878787]">
            Find and match all 4 pairs of cards by tapping to flip them.
          </p>
        </div>
        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#009488] border border-[#009488]/30">
          {matchedCount}/{totalPairs} Pairs
        </span>
      </div>

      {/* Progress Matched Bar */}
      <div className="bg-[#F8FAFA] p-2.5 rounded-2xl border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
          <span className="text-slate-600">PAIRS MATCHED</span>
          <span className="text-[#009488]">
            {matchedCount === totalPairs ? 'ALL 4 MATCHED!' : `${matchedCount} OF ${totalPairs} MATCHED`}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#009488] transition-all duration-500"
            style={{ width: `${(matchedCount / totalPairs) * 100}%` }}
          />
        </div>
      </div>

      {/* 2-Column Wide Cards Grid (Full Text Legibility on Mobile) */}
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((card) => {
          const isFlipped = flippedIds.includes(card.id) || showHint;
          const isMatched = matchedPairIds.includes(card.pairId);
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isMatched || isSuccess || isProcessing}
              className={`p-2.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 select-none active:scale-[0.98] shadow-xs text-left min-h-[64px] ${
                isMatched
                  ? 'bg-[#F0FDF4] border-[#009488] opacity-90'
                  : isFlipped
                  ? `${card.bg} border-[#009488] ring-2 ring-[#009488]/20 shadow-md`
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#F9BD20] shadow-xs'
              }`}
            >
              {isFlipped || isMatched ? (
                <div className="flex items-center space-x-2 animate-fade-in w-full">
                  <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center shrink-0 border border-slate-200/50 shadow-2xs`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-extrabold text-slate-900 block leading-tight truncate">
                      {card.name}
                    </span>
                    <span className="text-[9px] text-[#878787] block leading-tight mt-0.5">
                      {isMatched ? (
                        <span className="text-[#009488] font-bold">✓ Matched</span>
                      ) : (
                        card.subtitle
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 w-full py-0.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#009488]/10 to-[#F9BD20]/20 flex items-center justify-center shrink-0 text-sm border border-slate-200">
                    🃏
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block leading-tight">
                      Card
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Tap to Flip
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleReset}
            disabled={isSuccess || matchedCount === 0}
            className="flex items-center space-x-1 text-slate-700 hover:text-rose-600 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 active:scale-95 transition-all shadow-xs disabled:opacity-40"
            title="Reset cards"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Reset</span>
          </button>

          {isDevHelperEnabled() && (
            <button
              onClick={handleHint}
              disabled={isSuccess || showHint}
              className="flex items-center space-x-1 text-[#9E6E00] hover:text-[#B45309] px-2.5 py-1.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/60 active:scale-95 transition-all shadow-xs"
              title="Peek cards for a second"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
              <span className="text-[11px] font-bold">Peek</span>
            </button>
          )}
        </div>

        {isDevHelperEnabled() && (
          <button
            onClick={handleAutoSolve}
            className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline font-medium"
          >
            Auto Match
          </button>
        )}
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">All 4 Pairs Matched!</h4>
          <p className="text-[11px] text-slate-600">Stop 2: Enterprise Data Lake (House Hufflepuff) Unlocked</p>
        </div>
      )}
    </div>
  );
}
