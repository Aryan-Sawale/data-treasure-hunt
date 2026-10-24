import React, { useState, useEffect } from 'react';
import { Lightbulb, RotateCcw, CheckCircle2, Database, CreditCard, Home, Smartphone, Briefcase } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

// 4 Pairs = 8 Cards total
const CARD_PAIRS = [
  { pairId: 1, name: 'Card Payments', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
  { pairId: 2, name: 'Mortgage Loans', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
  { pairId: 3, name: 'Mobile Banking', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50' },
  { pairId: 4, name: 'Savings Ledgers', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function Puzzle1Platform({ onSolved }) {
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
            <Database className="w-4 h-4" />
            Data Lake Memory Match
          </h3>
          <p className="text-xs text-[#878787]">
            Flip cards to match the 4 banking feeds pooling into the lake.
          </p>
        </div>
        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#009488] border border-[#009488]/30">
          {matchedCount}/{totalPairs} Pairs
        </span>
      </div>

      {/* Progress Lake Reservoir Bar */}
      <div className="bg-[#F8FAFA] p-2.5 rounded-2xl border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
          <span className="text-slate-600">LAKE CAPACITY</span>
          <span className="text-[#009488]">
            {matchedCount === totalPairs ? '100% POOLED' : `${matchedCount * 25}% CONNECTED`}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#009488] transition-all duration-500"
            style={{ width: `${(matchedCount / totalPairs) * 100}%` }}
          />
        </div>
      </div>

      {/* 4x2 Cards Grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const isFlipped = flippedIds.includes(card.id) || showHint;
          const isMatched = matchedPairIds.includes(card.pairId);
          const Icon = card.icon;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isMatched || isSuccess || isProcessing}
              className={`h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-1.5 select-none active:scale-95 shadow-xs ${
                isMatched
                  ? 'bg-[#F0FDF4] border-[#009488] scale-[0.98] opacity-90'
                  : isFlipped
                  ? `${card.bg} border-[#009488] scale-102 shadow-md ring-2 ring-[#009488]/20`
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#F9BD20] shadow-xs'
              }`}
            >
              {isFlipped || isMatched ? (
                <div className="flex flex-col items-center text-center animate-fade-in">
                  <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center mb-1`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <span className="text-[10px] font-black text-slate-800 leading-tight truncate max-w-[64px]">
                    {card.name}
                  </span>
                  {isMatched && (
                    <span className="text-[8px] font-black uppercase text-[#009488] mt-0.5">
                      ✓ Linked
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                  <span className="text-xl">🌊</span>
                  <span className="text-[9px] font-mono font-bold text-slate-400">POOL</span>
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

          <button
            onClick={handleHint}
            disabled={isSuccess || showHint}
            className="flex items-center space-x-1 text-[#9E6E00] hover:text-[#B45309] px-2.5 py-1.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/60 active:scale-95 transition-all shadow-xs"
            title="Peak cards for a second"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
            <span className="text-[11px] font-bold">Peek</span>
          </button>
        </div>

        <button
          onClick={handleAutoSolve}
          className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline font-medium"
        >
          Auto Match
        </button>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">All 4 Feeds Connected!</h4>
          <p className="text-[11px] text-slate-600">Enterprise Data Lake (House Hufflepuff) Unlocked</p>
        </div>
      )}
    </div>
  );
}
