import React, { useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, ArrowRight, Radio, Flag, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const GRID_SIZE = 5; // 5x5 = 25 cells
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const TOTAL_MINES = 4;
const SAFE_CELLS_COUNT = TOTAL_CELLS - TOTAL_MINES; // 21

// Helper: Get adjacent coordinates for a cell (r, c)
const getNeighbors = (r, c) => {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
};

// Generate fresh empty board (before first click)
const createEmptyBoard = () => {
  const board = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push({
        r,
        c,
        isMine: false,
        adjacentMines: 0,
        isRevealed: false,
        isFlagged: false,
        isHit: false, // true if user clicked this mine
      });
    }
    board.push(row);
  }
  return board;
};

// Populate mines avoiding the first clicked cell and its neighbors
const populateMines = (firstR, firstC) => {
  const forbidden = new Set();
  forbidden.add(`${firstR},${firstC}`);
  getNeighbors(firstR, firstC).forEach(([nr, nc]) => {
    forbidden.add(`${nr},${nc}`);
  });

  const eligible = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!forbidden.has(`${r},${c}`)) {
        eligible.push([r, c]);
      }
    }
  }

  // Shuffle eligible and pick TOTAL_MINES
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }

  const mineCoords = new Set(
    eligible.slice(0, TOTAL_MINES).map(([r, c]) => `${r},${c}`)
  );

  const board = createEmptyBoard();

  // Set mines
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (mineCoords.has(`${r},${c}`)) {
        board[r][c].isMine = true;
      }
    }
  }

  // Compute adjacent mines
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!board[r][c].isMine) {
        let count = 0;
        getNeighbors(r, c).forEach(([nr, nc]) => {
          if (board[nr][nc].isMine) count++;
        });
        board[r][c].adjacentMines = count;
      }
    }
  }

  return board;
};

export default function Puzzle1LakehouseSweeper({ onSolved, onPenalty }) {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [gameStarted, setGameStarted] = useState(false);
  const [mode, setMode] = useState('SCAN'); // 'SCAN' or 'FLAG'
  const [errorMsg, setErrorMsg] = useState(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Calculate live statistics
  let safeRevealedCount = 0;
  let flagCount = 0;
  let hitMinesCount = 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = board[r][c];
      if (cell.isRevealed && !cell.isMine) safeRevealedCount++;
      if (cell.isFlagged) flagCount++;
      if (cell.isHit) hitMinesCount++;
    }
  }

  // Flood fill reveal when adjacentMines === 0
  const floodFill = useCallback((currentBoard, startR, startC) => {
    const queue = [[startR, startC]];
    const visited = new Set([`${startR},${startC}`]);

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      const cell = currentBoard[r][c];

      cell.isRevealed = true;
      cell.isFlagged = false; // unflag if revealed

      // If this cell has 0 neighboring mines, cascade into neighbors
      if (cell.adjacentMines === 0 && !cell.isMine) {
        const neighbors = getNeighbors(r, c);
        for (const [nr, nc] of neighbors) {
          const key = `${nr},${nc}`;
          if (!visited.has(key)) {
            visited.add(key);
            const nCell = currentBoard[nr][nc];
            if (!nCell.isMine && !nCell.isRevealed) {
              nCell.isRevealed = true;
              nCell.isFlagged = false;
              if (nCell.adjacentMines === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  }, []);

  // Handle cell click
  const handleCellClick = (r, c) => {
    if (isSuccess) return;

    // Handle FLAG mode
    if (mode === 'FLAG') {
      const cell = board[r][c];
      if (cell.isRevealed) return; // cannot flag revealed cell
      soundService.playDialTick();
      hapticService.light();

      setBoard((prev) => {
        const next = prev.map((row) => row.map((c) => ({ ...c })));
        next[r][c].isFlagged = !next[r][c].isFlagged;
        return next;
      });
      return;
    }

    // Handle SCAN mode
    let currentBoard = board;

    // First click: generate mines safely
    if (!gameStarted) {
      currentBoard = populateMines(r, c);
      setGameStarted(true);
    }

    const targetCell = currentBoard[r][c];
    if (targetCell.isRevealed || targetCell.isFlagged) return;

    // Hit a mine (corrupted node)
    if (targetCell.isMine) {
      soundService.playError();
      hapticService.error();
      setIsBoardShaking(true);
      setTimeout(() => setIsBoardShaking(false), 600);

      const nextBoard = currentBoard.map((row) => row.map((cell) => ({ ...cell })));
      nextBoard[r][c].isRevealed = true;
      nextBoard[r][c].isHit = true;
      setBoard(nextBoard);

      setErrorMsg('⚠️ Corrupted cluster node hit! (-5 pts). Node quarantined.');
      if (onPenalty) {
        onPenalty(5, 'Corrupted Data Lake Node');
      }
      return;
    }

    // Safe cell clicked
    soundService.playDialTick();
    hapticService.light();
    if (errorMsg) setErrorMsg(null);

    const nextBoard = currentBoard.map((row) => row.map((cell) => ({ ...cell })));
    floodFill(nextBoard, r, c);

    // Count newly revealed safe cells
    let newSafeRevealed = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (nextBoard[row][col].isRevealed && !nextBoard[row][col].isMine) {
          newSafeRevealed++;
        }
      }
    }

    setBoard(nextBoard);

    // Win condition check
    if (newSafeRevealed >= SAFE_CELLS_COUNT) {
      setIsSuccess(true);
      setErrorMsg(null);
      soundService.playSuccess();
      hapticService.success();
    }
  };

  // Reset puzzle
  const handleReset = () => {
    if (isSuccess) return;
    soundService.playClick();
    hapticService.light();
    setBoard(createEmptyBoard());
    setGameStarted(false);
    setErrorMsg(null);
  };

  // Dev Quick Complete
  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const solvedBoard = populateMines(2, 2);
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!solvedBoard[r][c].isMine) {
          solvedBoard[r][c].isRevealed = true;
        } else {
          solvedBoard[r][c].isFlagged = true;
        }
      }
    }
    setBoard(solvedBoard);
    setGameStarted(true);
    setIsSuccess(true);
  };

  // Badge colors for numbers 1 to 4
  const getNumberColor = (count) => {
    switch (count) {
      case 1:
        return 'text-teal-700 font-black';
      case 2:
        return 'text-emerald-700 font-black';
      case 3:
        return 'text-amber-700 font-black';
      case 4:
        return 'text-rose-700 font-black';
      default:
        return 'text-slate-400 font-bold';
    }
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Header & Concise Prompt */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 3
          </span>
          <span
            className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
              isSuccess
                ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                : 'bg-amber-100/60 border-amber-300 text-amber-900'
            }`}
          >
            {safeRevealedCount}/{SAFE_CELLS_COUNT} Safe Nodes
          </span>
        </div>

        {/* Title with icon & Green brand styling */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🏗️</span>
            <span>Data Lake Node Sweeper</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Scan clean Lakehouse storage partitions and avoid corrupted cluster nodes.
          </p>
        </div>

        {/* Collapsible How to Play Section */}
        <div className="pt-1.5 border-t border-[#F9BD20]/30">
          <button
            type="button"
            onClick={() => {
              setShowHowToPlay(!showHowToPlay);
              soundService.playClick();
              hapticService.light();
            }}
            className="w-full flex items-center justify-between py-1 text-xs font-black text-[#9E6E00] hover:text-[#B45309] transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#F9BD20]" />
              <span>How to Play</span>
            </span>
            {showHowToPlay ? (
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>

          {showHowToPlay && (
            <div className="pt-2 pb-1 space-y-2 text-xs text-slate-700 animate-fade-in border-t border-[#F9BD20]/20 font-medium">
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0">📡</span>
                <span>
                  <strong className="text-slate-900 font-bold">Scan Mode:</strong> Tap any tile to inspect it. Your first tap is always 100% safe and cascades open clean areas!
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0">🔢</span>
                <span>
                  <strong className="text-slate-900 font-bold">Numbers (1, 2, 3):</strong> Reveal exactly how many corrupted nodes touch that tile (including diagonals).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0">🚩</span>
                <span>
                  <strong className="text-slate-900 font-bold">Flag Mode:</strong> Switch to Flag to quarantine tiles you suspect have an anomaly so you don't accidentally tap them.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0">⚠️</span>
                <span>
                  <strong className="text-slate-900 font-bold">Corrupted Nodes:</strong> Tapping an anomaly costs 5 points, isolates the tile, and lets you continue playing.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0">🎯</span>
                <span>
                  <strong className="text-slate-900 font-bold">Goal:</strong> Reveal all 21 safe partitions to complete the scan and proceed to Challenge 4!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: Mode Toggle & Anomaly Counter */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Toggle Mode: Scan vs Flag */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('SCAN');
              soundService.playClick();
              hapticService.light();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mode === 'SCAN'
                ? 'bg-[#009488] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Scan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('FLAG');
              soundService.playClick();
              hapticService.light();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mode === 'FLAG'
                ? 'bg-[#F9BD20] text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Flag ({flagCount})</span>
          </button>
        </div>

        {/* Reset & Status */}
        <div className="flex items-center gap-2">
          {gameStarted && !isSuccess && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-mono font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            ⚠️ {TOTAL_MINES - hitMinesCount} Anomalies
          </span>
        </div>
      </div>

      {/* 5x5 Grid Board */}
      <div
        className={`bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm transition-transform ${
          isBoardShaking ? 'animate-shake' : ''
        }`}
      >
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isRevealed = cell.isRevealed;
              const isFlagged = cell.isFlagged;
              const isMine = cell.isMine;
              const isHit = cell.isHit;
              const count = cell.adjacentMines;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => handleCellClick(r, c)}
                  disabled={isSuccess || (isRevealed && !isHit)}
                  className={`aspect-square rounded-xl text-sm font-mono font-black flex items-center justify-center transition-all select-none relative ${
                    isHit
                      ? 'bg-rose-500 text-white border-2 border-rose-600 shadow-inner animate-pulse'
                      : isRevealed && isMine
                      ? 'bg-rose-100 text-rose-700 border-2 border-rose-300'
                      : isRevealed
                      ? count === 0
                        ? 'bg-[#F0FDF4] border border-[#009488]/25 text-[#009488] shadow-2xs'
                        : 'bg-white border-2 border-slate-200 shadow-2xs'
                      : isFlagged
                      ? 'bg-amber-100 border-2 border-[#F9BD20] text-amber-800 shadow-xs cursor-pointer active:scale-95'
                      : 'bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 border-b-4 active:border-b-2 active:translate-y-0.5 text-slate-400 shadow-2xs cursor-pointer'
                  }`}
                >
                  {isHit ? (
                    <span className="text-base sm:text-lg">💥</span>
                  ) : isFlagged ? (
                    <span className="text-base sm:text-lg">🚩</span>
                  ) : isRevealed ? (
                    isMine ? (
                      <span className="text-base sm:text-lg">⚠️</span>
                    ) : count > 0 ? (
                      <span className={`text-base sm:text-lg ${getNumberColor(count)}`}>
                        {count}
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#009488]/40" />
                    )
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Error / Anomaly alert */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Completion Banner */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center space-y-2.5 animate-fade-in shadow-md">
          <div className="flex items-center justify-center gap-2 text-[#009488] font-black text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-[#009488] animate-bounce" />
            <span>Lakehouse Nodes Operational!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            All clean partitions activated without failure. Proceeding to Memory Matching...
          </p>
          <button
            type="button"
            onClick={onSolved}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Proceed to Challenge 4</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#878787] text-[11px]">
            Target: 21 Safe Nodes
          </span>
          <button
            type="button"
            onClick={handleAutoSolve}
            className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            ⚡ Quick Complete ➔
          </button>
        </div>
      )}
    </div>
  );
}
