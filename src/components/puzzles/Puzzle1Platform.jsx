import React, { useState, useEffect } from 'react';
import { RotateCw, CheckCircle2, Lightbulb, Zap, Server, Database } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

// Tile definitions: connections [top, right, bottom, left] at 0 deg
// 0: top, 1: right, 2: bottom, 3: left
const INITIAL_TILES = [
  // Row 0
  { id: 0, type: 'corner', base: [0, 1, 1, 0], rot: 1 }, // target: [0, 1, 1, 0] or [0, 1, 0, 0]
  { id: 1, type: 'straight', base: [0, 1, 0, 1], rot: 1 },
  { id: 2, type: 'corner', base: [0, 0, 1, 1], rot: 2 },
  // Row 1
  { id: 3, type: 'straight', base: [1, 0, 1, 0], rot: 1 },
  { id: 4, type: 'cross', base: [1, 1, 1, 1], rot: 0 },
  { id: 5, type: 'straight', base: [1, 0, 1, 0], rot: 1 },
  // Row 2
  { id: 6, type: 'corner', base: [1, 1, 0, 0], rot: 3 },
  { id: 7, type: 'straight', base: [0, 1, 0, 1], rot: 1 },
  { id: 8, type: 'corner', base: [1, 0, 0, 1], rot: 2 }
];

// Target rotations that guarantee a valid connected path from (0,0) to (2,2)
// Path: (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) OR (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2)
const SOLUTION_ROTATIONS = [0, 0, 0, 0, 0, 0, 0, 0, 0];

export default function Puzzle1Platform({ onSolved }) {
  // Rotations for 9 tiles (0, 1, 2, 3 where angle = rot * 90)
  // Scramble them on initial mount
  const [rotations, setRotations] = useState([1, 1, 2, 1, 0, 1, 3, 1, 2]);
  const [isConnected, setIsConnected] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [connectedNodes, setConnectedNodes] = useState(new Set([0]));

  useEffect(() => {
    evaluateFlow(rotations);
  }, []);

  // Get active openings for a tile given rotation
  const getOpenings = (tileIndex, rot) => {
    const base = INITIAL_TILES[tileIndex].base;
    const shift = rot % 4;
    // Clockwise shift: [T, R, B, L] rotated by 1 -> [L, T, R, B]
    const current = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      current[(i + shift) % 4] = base[i];
    }
    return current;
  };

  // Check connectivity from (0,0) to (2,2)
  const evaluateFlow = (currentRots) => {
    // 3x3 grid: index = row * 3 + col
    const visited = new Set();
    const queue = [0];
    visited.add(0);

    while (queue.length > 0) {
      const curr = queue.shift();
      const row = Math.floor(curr / 3);
      const col = curr % 3;
      const currOpenings = getOpenings(curr, currentRots[curr]);

      // Neighbors:
      // Top: (row - 1, col), index = curr - 3
      if (currOpenings[0] && row > 0) {
        const topIdx = curr - 3;
        const topOpenings = getOpenings(topIdx, currentRots[topIdx]);
        if (topOpenings[2] && !visited.has(topIdx)) {
          visited.add(topIdx);
          queue.push(topIdx);
        }
      }
      // Right: (row, col + 1), index = curr + 1
      if (currOpenings[1] && col < 2) {
        const rightIdx = curr + 1;
        const rightOpenings = getOpenings(rightIdx, currentRots[rightIdx]);
        if (rightOpenings[3] && !visited.has(rightIdx)) {
          visited.add(rightIdx);
          queue.push(rightIdx);
        }
      }
      // Bottom: (row + 1, col), index = curr + 3
      if (currOpenings[2] && row < 2) {
        const botIdx = curr + 3;
        const botOpenings = getOpenings(botIdx, currentRots[botIdx]);
        if (botOpenings[0] && !visited.has(botIdx)) {
          visited.add(botIdx);
          queue.push(botIdx);
        }
      }
      // Left: (row, col - 1), index = curr - 1
      if (currOpenings[3] && col > 0) {
        const leftIdx = curr - 1;
        const leftOpenings = getOpenings(leftIdx, currentRots[leftIdx]);
        if (leftOpenings[1] && !visited.has(leftIdx)) {
          visited.add(leftIdx);
          queue.push(leftIdx);
        }
      }
    }

    setConnectedNodes(visited);

    // If bottom-right sink (8) is visited, we found a path!
    if (visited.has(8)) {
      setIsConnected(true);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1200);
    }
  };

  const handleRotate = (index) => {
    if (isConnected) return;
    soundService.playDialTick();
    hapticService.light();

    setRotations((prev) => {
      const next = [...prev];
      next[index] = (next[index] + 1) % 4;
      evaluateFlow(next);
      return next;
    });
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    // Solution aligning top and right path: (0,0)->(0,1)->(0,2)->(1,2)->(2,2)
    const solved = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    setRotations(solved);
    evaluateFlow(solved);
  };

  return (
    <div className="space-y-4">
      {/* Puzzle Header / Objective */}
      <div className="glass-card p-3.5 rounded-xl border border-white/10">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Platform Challenge: Pipe Flow
          </span>
          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
            3x3 Ingestion Grid
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Rotate the pipeline connectors to channel live transactions from <strong className="text-blue-400">Dutch Core Banking</strong> to the <strong className="text-emerald-400">Cloud Lakehouse</strong>.
        </p>
      </div>

      {/* Connection Endpoints Bar */}
      <div className="flex items-center justify-between px-2 text-xs">
        <div className="flex items-center space-x-1.5 text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/30">
          <Server className="w-3.5 h-3.5" />
          <span>Core SEPA Feeds</span>
        </div>
        <div className="h-[2px] w-12 bg-gradient-to-r from-blue-500 to-emerald-500 opacity-60" />
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
          <Database className="w-3.5 h-3.5" />
          <span>Delta Lakehouse</span>
        </div>
      </div>

      {/* 3x3 Pipe Grid */}
      <div className="relative bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shadow-inner">
        <div className="grid grid-cols-3 gap-2.5 aspect-square max-w-[320px] mx-auto">
          {INITIAL_TILES.map((tile, idx) => {
            const rot = rotations[idx];
            const isLive = connectedNodes.has(idx);

            return (
              <button
                key={tile.id}
                onClick={() => handleRotate(idx)}
                className={`relative rounded-xl border p-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isLive
                    ? 'bg-blue-950/40 border-blue-500/70 shadow-md shadow-blue-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* SVG Pipe Visual */}
                <div 
                  className="w-full h-full flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${rot * 90}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Pipe Body */}
                    {tile.type === 'straight' && (
                      <path
                        d="M 10 50 L 90 50"
                        stroke={isLive ? '#38BDF8' : '#475569'}
                        strokeWidth="20"
                        strokeLinecap="round"
                      />
                    )}
                    {tile.type === 'corner' && (
                      <path
                        d="M 50 10 Q 50 50 90 50"
                        fill="none"
                        stroke={isLive ? '#38BDF8' : '#475569'}
                        strokeWidth="20"
                        strokeLinecap="round"
                      />
                    )}
                    {tile.type === 'cross' && (
                      <>
                        <path
                          d="M 10 50 L 90 50"
                          stroke={isLive ? '#38BDF8' : '#475569'}
                          strokeWidth="20"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 50 10 L 50 90"
                          stroke={isLive ? '#38BDF8' : '#475569'}
                          strokeWidth="20"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {/* Animated Flow Glow Core */}
                    {isLive && (
                      <circle
                        cx="50"
                        cy="50"
                        r="6"
                        fill="#38BDF8"
                        className="animate-ping opacity-75"
                      />
                    )}
                  </svg>
                </div>

                {/* Subtile Rotate Indicator */}
                <div className="absolute bottom-1 right-1 opacity-40">
                  <RotateCw className="w-2.5 h-2.5 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Success Overlay Banner */}
        {isConnected && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <h4 className="text-base font-extrabold text-white">Pipeline Flow Established!</h4>
            <p className="text-xs text-emerald-400 font-mono mt-1">Throughput: 45,000 events/sec</p>
            <p className="text-xs text-slate-300 mt-2">Decrypting Host Team Profile...</p>
          </div>
        )}
      </div>

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-amber-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 active:scale-95 transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-slate-500 hover:text-slate-300 text-[11px] px-2 py-1 rounded"
        >
          Quick Route
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
          <p className="font-semibold">💡 Pipe Flow Hint:</p>
          <p className="text-slate-300">
            Rotate the top-left tile to point rightwards, connect through the top row to the top-right corner, and down to the bottom-right corner node!
          </p>
        </div>
      )}
    </div>
  );
}
