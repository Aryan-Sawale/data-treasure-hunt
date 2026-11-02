import React, { useState } from 'react';
import Puzzle0CapabilityMatch from './puzzles/Puzzle0CapabilityMatch';
import Puzzle1EmojiPhrase from './puzzles/Puzzle1EmojiPhrase';
import Puzzle1LakehouseAsteroids from './puzzles/Puzzle1LakehouseAsteroids';
import Puzzle1LakehouseSweeper from './puzzles/Puzzle1LakehouseSweeper';
import Puzzle1Platform from './puzzles/Puzzle1Platform';
import Puzzle2AnomalyWhack from './puzzles/Puzzle2AnomalyWhack';
import Puzzle2Quality from './puzzles/Puzzle2Quality';
import Puzzle3LineageSimon from './puzzles/Puzzle3LineageSimon';
import Puzzle3Governance from './puzzles/Puzzle3Governance';
import { isDevHelperEnabled } from '../config/questConfig';

export default function PuzzleContainer({ currentStage, onPuzzleSolved, onPenalty }) {
  const [stage1Step, setStage1Step] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dutch_banking_stage1_match_done') === 'true' ? 'EMOJI' : 'MATCH';
    }
    return 'MATCH';
  });

  const [stage2Step, setStage2Step] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dutch_banking_stage2_asteroids_done') === 'true' ? 'MEMORY' : 'ASTEROIDS';
    }
    return 'ASTEROIDS';
  });

  const [stage3Step, setStage3Step] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dutch_banking_stage3_whack_done') === 'true' ? 'AUDIT' : 'WHACK';
    }
    return 'WHACK';
  });

  const [stage4Step, setStage4Step] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dutch_banking_stage4_simon_done') === 'true' ? 'SEQUENCE' : 'MEMORY_BUTTONS';
    }
    return 'MEMORY_BUTTONS';
  });

  const renderPuzzle = () => {
    switch (currentStage) {
      case 1:
        // Stop 1: Data Marketplace (Challenge 1: Capability Matching -> Challenge 2: Emoji Phrase Decrypt)
        if (stage1Step === 'MATCH') {
          return (
            <Puzzle0CapabilityMatch
              onSolved={() => {
                try {
                  localStorage.setItem('dutch_banking_stage1_match_done', 'true');
                } catch (e) {}
                setStage1Step('EMOJI');
              }}
              onPenalty={onPenalty}
            />
          );
        }
        return <Puzzle1EmojiPhrase onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 2:
        // Stop 2: Enterprise Data Lake (Challenge 3: Stream Defender -> Challenge 4: Memory Matching Game)
        if (stage2Step === 'ASTEROIDS') {
          return (
            <Puzzle1LakehouseAsteroids
              onSolved={() => {
                try {
                  localStorage.setItem('dutch_banking_stage2_asteroids_done', 'true');
                } catch (e) {}
                setStage2Step('MEMORY');
              }}
              onPenalty={onPenalty}
            />
          );
        }
        return <Puzzle1Platform onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 3:
        // Stop 3: Enterprise Data Assets & Data Quality (Challenge 5: Anomaly Whacker -> Challenge 6: Corrupted Record Audit)
        if (stage3Step === 'WHACK') {
          return (
            <Puzzle2AnomalyWhack
              onSolved={() => {
                try {
                  localStorage.setItem('dutch_banking_stage3_whack_done', 'true');
                } catch (e) {}
                setStage3Step('AUDIT');
              }}
              onPenalty={onPenalty}
            />
          );
        }
        return <Puzzle2Quality onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 4:
        // Stop 4: BDM and Data Lineage (Challenge 7: Memory Buttons -> Challenge 8: Data Lineage Sequence)
        if (stage4Step === 'MEMORY_BUTTONS') {
          return (
            <Puzzle3LineageSimon
              onSolved={() => {
                try {
                  localStorage.setItem('dutch_banking_stage4_simon_done', 'true');
                } catch (e) {}
                setStage4Step('SEQUENCE');
              }}
              onPenalty={onPenalty}
            />
          );
        }
        return <Puzzle3Governance onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
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
      {renderPuzzle()}
    </div>
  );
}
