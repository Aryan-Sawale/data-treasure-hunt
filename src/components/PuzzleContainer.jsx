import React from 'react';
import Puzzle1EmojiPhrase from './puzzles/Puzzle1EmojiPhrase';
import Puzzle1Platform from './puzzles/Puzzle1Platform';
import Puzzle2Quality from './puzzles/Puzzle2Quality';
import Puzzle3Governance from './puzzles/Puzzle3Governance';

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
    <div className="px-4 py-2 max-w-md mx-auto">
      {renderPuzzle()}
    </div>
  );
}
