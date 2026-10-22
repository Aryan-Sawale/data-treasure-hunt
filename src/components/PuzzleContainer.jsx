import React from 'react';
import Puzzle1Platform from './puzzles/Puzzle1Platform';
import Puzzle2Quality from './puzzles/Puzzle2Quality';
import Puzzle3Governance from './puzzles/Puzzle3Governance';
import Puzzle4Delivery from './puzzles/Puzzle4Delivery';
import Puzzle5Analytics from './puzzles/Puzzle5Analytics';
import { Sparkles, HelpCircle } from 'lucide-react';

export default function PuzzleContainer({ currentStage, onPuzzleSolved }) {
  const renderPuzzle = () => {
    switch (currentStage) {
      case 1:
        return <Puzzle1Platform onSolved={onPuzzleSolved} />;
      case 2:
        return <Puzzle2Quality onSolved={onPuzzleSolved} />;
      case 3:
        return <Puzzle3Governance onSolved={onPuzzleSolved} />;
      case 4:
        return <Puzzle4Delivery onSolved={onPuzzleSolved} />;
      case 5:
        return <Puzzle5Analytics onSolved={onPuzzleSolved} />;
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

