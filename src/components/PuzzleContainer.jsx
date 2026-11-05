import React, { useState, useEffect } from 'react';
import Puzzle0CapabilityMatch from './puzzles/Puzzle0CapabilityMatch';
import Puzzle1EmojiPhrase from './puzzles/Puzzle1EmojiPhrase';
import Puzzle1LakehouseAsteroids from './puzzles/Puzzle1LakehouseAsteroids';
import Puzzle1LakehouseSweeper from './puzzles/Puzzle1LakehouseSweeper';
import Puzzle1Platform from './puzzles/Puzzle1Platform';
import Puzzle1LakehouseSnake from './puzzles/Puzzle1LakehouseSnake';
import Puzzle2AnomalyWhack from './puzzles/Puzzle2AnomalyWhack';
import Puzzle2Quality from './puzzles/Puzzle2Quality';
import Puzzle2WordSearch from './puzzles/Puzzle2WordSearch';
import Puzzle3LineageSimon from './puzzles/Puzzle3LineageSimon';
import Puzzle3Governance from './puzzles/Puzzle3Governance';
import Puzzle3BdmBreakout from './puzzles/Puzzle3BdmBreakout';
import ChallengeTimerBanner from './ChallengeTimerBanner';
import { isDevHelperEnabled, TIMED_CHALLENGES } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';
import { FastForward } from 'lucide-react';

export default function PuzzleContainer({
  currentStage,
  onPuzzleSolved,
  onPenalty,
  onMiniGameSolved,
  onMiniGameTimeout,
  activeTimers = [],
  expiredTimers = []
}) {
  const [stage1Step, setStage1Step] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dutch_banking_stage1_match_done') === 'true' ? 'EMOJI' : 'MATCH';
    }
    return 'MATCH';
  });

  const [stage2Step, setStage2Step] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('dutch_banking_stage2_memory_done') === 'true') {
        return 'SNAKE';
      }
      if (localStorage.getItem('dutch_banking_stage2_asteroids_done') === 'true') {
        return 'MEMORY';
      }
    }
    return 'ASTEROIDS';
  });

  const [stage3Step, setStage3Step] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('dutch_banking_stage3_audit_done') === 'true') {
        return 'WORD_SEARCH';
      }
      if (localStorage.getItem('dutch_banking_stage3_whack_done') === 'true') {
        return 'AUDIT';
      }
    }
    return 'WHACK';
  });

  const [stage4Step, setStage4Step] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('dutch_banking_stage4_sequence_done') === 'true') {
        return 'BDM_BREAKOUT';
      }
      if (localStorage.getItem('dutch_banking_stage4_simon_done') === 'true') {
        return 'SEQUENCE';
      }
    }
    return 'MEMORY_BUTTONS';
  });

  const [catchupMessage, setCatchupMessage] = useState(null);

  // Determine currently active challenge ID
  const getCurrentChallengeId = () => {
    switch (currentStage) {
      case 1:
        return stage1Step === 'MATCH' ? 'P1_CAPABILITY_MATCH' : 'P1_EMOJI_PHRASE';
      case 2:
        if (stage2Step === 'ASTEROIDS') return 'P2_ASTEROIDS';
        if (stage2Step === 'MEMORY') return 'P2_MEMORY_PAIRS';
        return 'P2_INGESTION_SNAKE';
      case 3:
        if (stage3Step === 'WHACK') return 'P3_ANOMALY_WHACK';
        if (stage3Step === 'AUDIT') return 'P3_DATA_AUDIT';
        return 'P3_WORD_SEARCH';
      case 4:
        if (stage4Step === 'MEMORY_BUTTONS') return 'P4_SIMON_BUTTONS';
        if (stage4Step === 'SEQUENCE') return 'P4_LINEAGE_ORDER';
        return 'P4_BDM_BREAKOUT';
      default:
        return null;
    }
  };

  const currentChallengeId = getCurrentChallengeId();

  // Handle successful solve
  const handleSolve = async (challengeId, nextAction) => {
    const config = TIMED_CHALLENGES[challengeId];
    if (config?.storageKey) {
      try {
        localStorage.setItem(config.storageKey, 'true');
      } catch (e) {}
    }

    if (onMiniGameSolved) {
      await onMiniGameSolved(challengeId);
    }

    if (nextAction) {
      nextAction();
    }
  };

  // Handle timeout (30s elapsed or room catch-up)
  const handleTimeout = async (challengeId) => {
    soundService.playBuzzer();
    hapticService.error();

    const config = TIMED_CHALLENGES[challengeId];
    if (config?.storageKey) {
      try {
        localStorage.setItem(config.storageKey, 'true');
      } catch (e) {}
    }

    if (onMiniGameTimeout) {
      await onMiniGameTimeout(challengeId);
    }

    // Advance to next step or next stage
    if (config?.nextStep) {
      if (currentStage === 1) setStage1Step(config.nextStep);
      else if (currentStage === 2) setStage2Step(config.nextStep);
      else if (currentStage === 3) setStage3Step(config.nextStep);
      else if (currentStage === 4) setStage4Step(config.nextStep);
    } else {
      onPuzzleSolved();
    }
  };

  // Catch-up logic (Option 1): if player arrives at an already expired challenge
  useEffect(() => {
    if (!currentChallengeId || !expiredTimers || expiredTimers.length === 0) return;
    if (expiredTimers.includes(currentChallengeId)) {
      const challengeTitle = TIMED_CHALLENGES[currentChallengeId]?.title || 'Challenge';
      setCatchupMessage(`Room already completed ${challengeTitle}! Catching up...`);
      const t = setTimeout(() => {
        setCatchupMessage(null);
        handleTimeout(currentChallengeId);
      }, 1300);
      return () => clearTimeout(t);
    }
  }, [currentChallengeId, expiredTimers]);

  // Active timer for current challenge
  const activeTimer = activeTimers?.find((t) => t.challenge_id === currentChallengeId);

  const renderPuzzle = () => {
    switch (currentStage) {
      case 1:
        if (stage1Step === 'MATCH') {
          return (
            <Puzzle0CapabilityMatch
              onSolved={() => handleSolve('P1_CAPABILITY_MATCH', () => setStage1Step('EMOJI'))}
              onPenalty={onPenalty}
            />
          );
        }
        return (
          <Puzzle1EmojiPhrase
            onSolved={() => handleSolve('P1_EMOJI_PHRASE', onPuzzleSolved)}
            onPenalty={onPenalty}
          />
        );
      case 2:
        if (stage2Step === 'ASTEROIDS') {
          return (
            <Puzzle1LakehouseAsteroids
              onSolved={() => handleSolve('P2_ASTEROIDS', () => setStage2Step('MEMORY'))}
              onPenalty={onPenalty}
            />
          );
        }
        if (stage2Step === 'MEMORY') {
          return (
            <Puzzle1Platform
              onSolved={() => handleSolve('P2_MEMORY_PAIRS', () => setStage2Step('SNAKE'))}
              onPenalty={onPenalty}
            />
          );
        }
        return (
          <Puzzle1LakehouseSnake
            onSolved={() => handleSolve('P2_INGESTION_SNAKE', onPuzzleSolved)}
            onPenalty={onPenalty}
          />
        );
      case 3:
        if (stage3Step === 'WHACK') {
          return (
            <Puzzle2AnomalyWhack
              onSolved={() => handleSolve('P3_ANOMALY_WHACK', () => setStage3Step('AUDIT'))}
              onPenalty={onPenalty}
            />
          );
        }
        if (stage3Step === 'AUDIT') {
          return (
            <Puzzle2Quality
              onSolved={() => handleSolve('P3_DATA_AUDIT', () => setStage3Step('WORD_SEARCH'))}
              onPenalty={onPenalty}
            />
          );
        }
        return (
          <Puzzle2WordSearch
            onSolved={() => handleSolve('P3_WORD_SEARCH', onPuzzleSolved)}
            onPenalty={onPenalty}
          />
        );
      case 4:
        if (stage4Step === 'MEMORY_BUTTONS') {
          return (
            <Puzzle3LineageSimon
              onSolved={() => handleSolve('P4_SIMON_BUTTONS', () => setStage4Step('SEQUENCE'))}
              onPenalty={onPenalty}
            />
          );
        }
        if (stage4Step === 'SEQUENCE') {
          return (
            <Puzzle3Governance
              onSolved={() => handleSolve('P4_LINEAGE_ORDER', () => setStage4Step('BDM_BREAKOUT'))}
              onPenalty={onPenalty}
            />
          );
        }
        return (
          <Puzzle3BdmBreakout
            onSolved={() => handleSolve('P4_BDM_BREAKOUT', onPuzzleSolved)}
            onPenalty={onPenalty}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-2 max-w-md mx-auto space-y-2">
      {/* Dev Mode Quick Complete Banner */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between bg-amber-50/90 border border-amber-300 rounded-xl px-3 py-1.5 shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-amber-900 flex items-center gap-1">
            <span>🛠️ DEV TEST</span>
          </span>
          <button
            onClick={() => onPuzzleSolved()}
            className="text-[11px] font-mono font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            title="Immediately advance to next screen without waiting"
          >
            <span>⚡ Quick Complete</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* Catchup Notification Toast */}
      {catchupMessage && (
        <div className="p-3 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-xs flex items-center gap-2 shadow-md animate-fade-in">
          <FastForward className="w-4 h-4 text-amber-700 animate-pulse shrink-0" />
          <span>{catchupMessage}</span>
        </div>
      )}

      {/* 30-Second Rush Countdown Banner */}
      {activeTimer && (
        <ChallengeTimerBanner
          timer={activeTimer}
          challengeTitle={TIMED_CHALLENGES[currentChallengeId]?.title}
          onTimeout={() => handleTimeout(currentChallengeId)}
        />
      )}

      {renderPuzzle()}
    </div>
  );
}
