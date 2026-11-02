import React, { useState } from 'react';
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
        // Stop 2: Enterprise Data Lake (Challenge 3: Stream Defender -> Challenge 4: Memory Matching -> Challenge 5: Ingestion Snake)
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
        if (stage2Step === 'MEMORY') {
          return (
            <Puzzle1Platform
              onSolved={() => {
                try {
                  localStorage.setItem('dutch_banking_stage2_memory_done', 'true');
                } catch (e) {}
                setStage2Step('SNAKE');
              }}
              onPenalty={onPenalty}
            />
          );
        }
        return <Puzzle1LakehouseSnake onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 3:
        // Stop 3: Enterprise Data Assets & Data Quality (Challenge 5: Whack -> Challenge 6: Audit -> Challenge 7: Word Search)
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
        if (stage3Step === 'AUDIT') {
          return (
            <Puzzle2Quality
              onSolved={() => {
                try {
                  localStorage.setItem('dutch_banking_stage3_audit_done', 'true');
                } catch (e) {}
                setStage3Step('WORD_SEARCH');
              }}
              onPenalty={onPenalty}
            />
          );
        }
        return <Puzzle2WordSearch onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 4:
        // Stop 4: BDM and Data Lineage (Challenge 8: Memory Buttons -> Challenge 9: Lineage Sequence -> Challenge 10: BDM Breakout)
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
        if (stage4Step === 'SEQUENCE') {
          return (
            <Puzzle3Governance
              onSolved={() => {
                try {
                  localStorage.setItem('dutch_banking_stage4_sequence_done', 'true');
                } catch (e) {}
                setStage4Step('BDM_BREAKOUT');
              }}
              onPenalty={onPenalty}
            />
          );
        }
        return <Puzzle3BdmBreakout onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
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
