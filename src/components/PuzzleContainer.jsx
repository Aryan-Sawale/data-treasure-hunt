import React from 'react';
import Puzzle1EmojiPhrase from './puzzles/Puzzle1EmojiPhrase';
import Puzzle1Platform from './puzzles/Puzzle1Platform';
import Puzzle2Quality from './puzzles/Puzzle2Quality';
import Puzzle3Governance from './puzzles/Puzzle3Governance';
import { isDevHelperEnabled } from '../config/questConfig';

export default function PuzzleContainer({ currentStage, onPuzzleSolved, onPenalty }) {
  const renderPuzzle = () => {
    switch (currentStage) {
      case 1:
        // Stop 1: Data Marketplace (Emoji Phrase Guess)
        return <Puzzle1EmojiPhrase onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 2:
        // Stop 2: Enterprise Data Lake (Memory Matching Game)
        return <Puzzle1Platform onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 3:
        // Stop 3: Enterprise Data Assets & Data Quality (Corrupted Record Audit)
        return <Puzzle2Quality onSolved={onPuzzleSolved} onPenalty={onPenalty} />;
      case 4:
        // Stop 4: BDM and Data Lineage (Sequence Game)
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
