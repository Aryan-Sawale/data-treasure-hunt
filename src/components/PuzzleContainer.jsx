import React from 'react';
import Puzzle1Platform from './puzzles/Puzzle1Platform';
import Puzzle2Quality from './puzzles/Puzzle2Quality';
import Puzzle3Governance from './puzzles/Puzzle3Governance';
import Puzzle4Delivery from './puzzles/Puzzle4Delivery';

export default function PuzzleContainer({ currentStage, onPuzzleSolved }) {
  const renderPuzzle = () => {
    switch (currentStage) {
      case 1:
        // Team 1: Metadata and governance solutions
        return <Puzzle3Governance onSolved={onPuzzleSolved} />;
      case 2:
        // Team 2: Enterprise Data Lake
        return <Puzzle1Platform onSolved={onPuzzleSolved} />;
      case 3:
        // Team 3: Data Marketplace & Data Lineage
        return <Puzzle4Delivery onSolved={onPuzzleSolved} />;
      case 4:
        // Team 4: Enterprise Data Assets & Data Quality
        return <Puzzle2Quality onSolved={onPuzzleSolved} />;
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
