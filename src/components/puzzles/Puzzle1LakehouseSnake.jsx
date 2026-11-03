import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Play, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const GRID_SIZE = 18;
const CANVAS_SIZE = 360;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE; // 20px per cell
const TICK_MS = 145; // Smooth comfortable mobile snake speed

const EDL_NODES = [
  { id: 1, name: 'Kafka Stream', category: 'Ingestion', icon: '⚡', color: '#009488', desc: 'Real-time file ingestion' },
  { id: 2, name: 'Azure Lake', category: 'Storage', icon: '☁️', color: '#0284C7', desc: 'Scalable data lake storage' },
  { id: 3, name: 'Databricks', category: 'Compute', icon: '🧱', color: '#E11D48', desc: 'High-speed cluster processing' },
  { id: 4, name: 'Unity Catalog', category: 'Governance', icon: '📖', color: '#D97706', desc: 'Unified metadata & access control' },
  { id: 5, name: 'Integrated Datasets', category: 'Data Delivery', icon: '🔗', color: '#059669', desc: 'Cross-domain integrated tables' },
  { id: 6, name: 'Golden Datasets', category: 'Data Delivery', icon: '🏆', color: '#F59E0B', desc: 'Single source of truth data' },
  { id: 7, name: 'Segmentation Engine', category: 'New Capability', icon: '🎯', color: '#8B5CF6', desc: 'Customer segmentation capability' },
];

export default function Puzzle1LakehouseSnake({ onSolved, onPenalty }) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [targetNode, setTargetNode] = useState(EDL_NODES[0]);

  const canvasRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const completionBannerRef = useRef(null);
  const gameLoopRef = useRef(null);
  const touchStartRef = useRef(null);

  const gameStateRef = useRef({
    snake: [
      { x: 6, y: 9 },
      { x: 5, y: 9 },
      { x: 4, y: 9 },
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 12, y: 9 },
    particles: [],
    score: 0,
    isOver: false,
    flashBlink: 0,
  });

  // Spawn food on a free cell
  const getRandomFreeCell = (snake) => {
    const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
    const freeCells = [];

    for (let x = 1; x < GRID_SIZE - 1; x++) {
      for (let y = 1; y < GRID_SIZE - 1; y++) {
        if (!occupied.has(`${x},${y}`)) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length === 0) return { x: 2, y: 2 };
    return freeCells[Math.floor(Math.random() * freeCells.length)];
  };

  // Helper to spawn particle sparks when eating node
  const spawnParticles = (x, y, color = '#F9BD20') => {
    const px = x * CELL_SIZE + CELL_SIZE / 2;
    const py = y * CELL_SIZE + CELL_SIZE / 2;
    for (let i = 0; i < 12; i++) {
      const speed = 1.0 + Math.random() * 2.8;
      const angle = Math.random() * Math.PI * 2;
      gameStateRef.current.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.03,
        color,
      });
    }
  };

  // Turn handler with 180-degree reversal prevention
  const changeDirection = (newDir) => {
    if (!gameStarted || isSuccess) return;
    const current = gameStateRef.current.direction;

    // Prevent immediate 180-degree reverse
    if (newDir.x !== 0 && current.x !== 0) return;
    if (newDir.y !== 0 && current.y !== 0) return;

    gameStateRef.current.nextDirection = newDir;
    soundService.playDialTick();
    hapticService.light();
  };

  // Draw paused preview frame before game starts so user can get used to the screen
  useEffect(() => {
    if (gameStarted || isSuccess) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Deep cyber background
    ctx.fillStyle = '#021B19';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Subtle pipeline grid lines
    ctx.strokeStyle = 'rgba(0, 148, 136, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw initial target food node (Kafka Stream) at (12, 9)
    const previewFood = { x: 12, y: 9 };
    const currentNode = EDL_NODES[0];
    const fx = previewFood.x * CELL_SIZE;
    const fy = previewFood.y * CELL_SIZE;

    ctx.save();
    ctx.shadowColor = currentNode.color;
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.roundRect(fx + 2, fy + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6);
    ctx.fillStyle = currentNode.color;
    ctx.fill();

    // Inner icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentNode.icon, fx + CELL_SIZE / 2, fy + CELL_SIZE / 2);
    ctx.restore();

    // Draw initial snake segments at [{ x: 6, y: 9 }, { x: 5, y: 9 }, { x: 4, y: 9 }]
    const previewSnake = [
      { x: 6, y: 9 },
      { x: 5, y: 9 },
      { x: 4, y: 9 },
    ];

    previewSnake.forEach((segment, idx) => {
      const sx = segment.x * CELL_SIZE;
      const sy = segment.y * CELL_SIZE;

      ctx.save();
      if (idx === 0) {
        ctx.fillStyle = '#00B3A4'; // Bright head
      } else {
        ctx.fillStyle = '#009488'; // Body teal
      }

      ctx.beginPath();
      ctx.roundRect(sx + 1.5, sy + 1.5, CELL_SIZE - 3, CELL_SIZE - 3, idx === 0 ? 6 : 4);
      ctx.fill();

      // Eyes on head pointing right
      if (idx === 0) {
        ctx.fillStyle = '#F9BD20';
        const eyeRadius = 1.8;
        const e1x = sx + CELL_SIZE - 4;
        const e1y = sy + 5;
        const e2x = sx + CELL_SIZE - 4;
        const e2y = sy + CELL_SIZE - 5;

        ctx.beginPath();
        ctx.arc(e1x, e1y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(e2x, e2y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }, [gameStarted, isSuccess]);

  // Main snake game tick
  useEffect(() => {
    if (!gameStarted || isSuccess) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    let animId = null;

    const gameTick = () => {
      // Apply next direction
      state.direction = state.nextDirection;
      const head = state.snake[0];

      // Next position with toroidal wrapping around walls
      const nextX = (head.x + state.direction.x + GRID_SIZE) % GRID_SIZE;
      const nextY = (head.y + state.direction.y + GRID_SIZE) % GRID_SIZE;

      // Check self-collision (tail bite)
      let selfBite = false;
      for (let i = 1; i < state.snake.length; i++) {
        if (state.snake[i].x === nextX && state.snake[i].y === nextY) {
          selfBite = true;
          break;
        }
      }

      if (selfBite) {
        // Soft penalty: flash blink and reset snake length without losing collected score!
        soundService.playError();
        hapticService.error();
        state.flashBlink = 5;
        state.snake = [
          { x: 6, y: 9 },
          { x: 5, y: 9 },
          { x: 4, y: 9 },
        ];
        state.direction = { x: 1, y: 0 };
        state.nextDirection = { x: 1, y: 0 };
      } else {
        const newHead = { x: nextX, y: nextY };
        const newSnake = [newHead, ...state.snake];

        // Check food collection
        if (nextX === state.food.x && nextY === state.food.y) {
          // Food ingested!
          const currentNode = EDL_NODES[state.score] || EDL_NODES[0];
          spawnParticles(nextX, nextY, currentNode.color);
          soundService.playSnakeEat();
          hapticService.medium();

          const nextScore = state.score + 1;
          state.score = nextScore;
          setScore(nextScore);

          if (nextScore >= EDL_NODES.length) {
            // All 7 nodes ingested!
            setIsSuccess(true);
            soundService.playSuccess();
            hapticService.success();
            setGameStarted(false);

            setTimeout(() => {
              if (completionBannerRef.current) {
                completionBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
            return;
          } else {
            // Spawn next EDL node
            state.food = getRandomFreeCell(newSnake);
            setTargetNode(EDL_NODES[nextScore]);
          }
        } else {
          // Normal move: pop tail
          newSnake.pop();
        }

        state.snake = newSnake;
      }

      // --- RENDER CANVAS ---
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Deep cyber background
      ctx.fillStyle = '#021B19';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Subtle pipeline grid lines
      ctx.strokeStyle = 'rgba(0, 148, 136, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }

      // Draw Food (EDL Component Node)
      const currentNode = EDL_NODES[state.score] || EDL_NODES[0];
      const fx = state.food.x * CELL_SIZE;
      const fy = state.food.y * CELL_SIZE;

      ctx.save();
      // Pulsing outer aura
      const pulse = 0.5 + Math.sin(Date.now() / 180) * 0.3;
      ctx.shadowColor = currentNode.color;
      ctx.shadowBlur = 12 * pulse;

      ctx.beginPath();
      ctx.roundRect(fx + 2, fy + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6);
      ctx.fillStyle = currentNode.color;
      ctx.fill();

      // Inner icon / symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentNode.icon, fx + CELL_SIZE / 2, fy + CELL_SIZE / 2);
      ctx.restore();

      // Draw Snake Body & Head
      state.snake.forEach((segment, idx) => {
        const sx = segment.x * CELL_SIZE;
        const sy = segment.y * CELL_SIZE;

        ctx.save();
        if (state.flashBlink > 0) {
          ctx.fillStyle = '#E11D48'; // Red flash on bump
        } else if (idx === 0) {
          ctx.fillStyle = '#00B3A4'; // Bright head
        } else {
          ctx.fillStyle = '#009488'; // Body teal
        }

        ctx.beginPath();
        ctx.roundRect(sx + 1.5, sy + 1.5, CELL_SIZE - 3, CELL_SIZE - 3, idx === 0 ? 6 : 4);
        ctx.fill();

        // Eyes on the head
        if (idx === 0 && state.flashBlink === 0) {
          ctx.fillStyle = '#F9BD20';
          const eyeOffset = 4;
          const eyeRadius = 1.8;

          let e1x = sx + CELL_SIZE / 2 - eyeOffset;
          let e1y = sy + CELL_SIZE / 2 - eyeOffset;
          let e2x = sx + CELL_SIZE / 2 + eyeOffset;
          let e2y = sy + CELL_SIZE / 2 - eyeOffset;

          if (state.direction.x === 1) {
            e1x = sx + CELL_SIZE - 4;
            e1y = sy + 5;
            e2x = sx + CELL_SIZE - 4;
            e2y = sy + CELL_SIZE - 5;
          } else if (state.direction.x === -1) {
            e1x = sx + 4;
            e1y = sy + 5;
            e2x = sx + 4;
            e2y = sy + CELL_SIZE - 5;
          } else if (state.direction.y === 1) {
            e1x = sx + 5;
            e1y = sy + CELL_SIZE - 4;
            e2x = sx + CELL_SIZE - 5;
            e2y = sy + CELL_SIZE - 4;
          } else if (state.direction.y === -1) {
            e1x = sx + 5;
            e1y = sy + 4;
            e2x = sx + CELL_SIZE - 5;
            e2y = sy + 4;
          }

          ctx.beginPath();
          ctx.arc(e1x, e1y, eyeRadius, 0, Math.PI * 2);
          ctx.arc(e2x, e2y, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (state.flashBlink > 0) {
        state.flashBlink -= 1;
      }

      // Draw & Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }
    };

    const intervalId = setInterval(gameTick, TICK_MS);
    gameLoopRef.current = intervalId;

    return () => {
      clearInterval(intervalId);
    };
  }, [gameStarted, isSuccess]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || isSuccess) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        changeDirection({ x: 0, y: -1 });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        changeDirection({ x: 0, y: 1 });
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        changeDirection({ x: -1, y: 0 });
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        changeDirection({ x: 1, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isSuccess]);

  // Touch Swipe Handlers on Canvas
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current || !e.changedTouches || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.hypot(dx, dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) changeDirection({ x: 1, y: 0 });
      else changeDirection({ x: -1, y: 0 });
    } else {
      if (dy > 0) changeDirection({ x: 0, y: 1 });
      else changeDirection({ x: 0, y: -1 });
    }
  };

  // Start game handler
  const handleStartGame = () => {
    soundService.playSuccess();
    hapticService.medium();

    gameStateRef.current = {
      snake: [
        { x: 6, y: 9 },
        { x: 5, y: 9 },
        { x: 4, y: 9 },
      ],
      direction: { x: 1, y: 0 },
      nextDirection: { x: 1, y: 0 },
      food: { x: 12, y: 9 },
      particles: [],
      score: 0,
      isOver: false,
      flashBlink: 0,
    };

    setScore(0);
    setErrorMsg(null);
    setTargetNode(EDL_NODES[0]);
    setGameStarted(true);
    setIsSuccess(false);

    // Auto-scroll so D-Pad and arena are in comfortable mobile view
    const scrollToGame = () => {
      if (bottomAnchorRef.current) {
        bottomAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };
    setTimeout(scrollToGame, 60);
    setTimeout(scrollToGame, 220);
  };

  // Dev Quick Complete
  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setScore(EDL_NODES.length);
    setIsSuccess(true);
    setGameStarted(false);

    setTimeout(() => {
      if (completionBannerRef.current) {
        completionBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  return (
    <div className="space-y-3.5 animate-fade-in select-none">
      {/* Header & Prompt */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 5
          </span>
          <span
            className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
              score >= EDL_NODES.length
                ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                : 'bg-amber-100/60 border-amber-300 text-amber-900'
            }`}
          >
            {score}/{EDL_NODES.length} Ingested
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🐍</span>
            <span>Collect All Technologies</span>
          </h2>
          <p className="text-xs text-slate-600 font-bold">
            Swipe or use buttons to steer and collect all 7 EDL data nodes
          </p>
        </div>

        {/* Start Game Button (Pre-Launch) */}
        {!gameStarted && !isSuccess && (
          <button
            type="button"
            onClick={handleStartGame}
            className="w-full py-3 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Pipeline Snake</span>
          </button>
        )}
      </div>

      {/* Target Node Indicator HUD */}
      {gameStarted && targetNode && !isSuccess && (
        <div className="p-2 px-3 rounded-xl bg-slate-900 border border-[#009488]/50 text-xs flex items-center justify-between text-slate-200 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <span
              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0"
              style={{ backgroundColor: `${targetNode.color}25`, border: `1px solid ${targetNode.color}` }}
            >
              {targetNode.icon}
            </span>
            <div className="truncate">
              <span className="font-mono font-black text-white block text-xs">{targetNode.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{targetNode.desc}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0 ml-2">
            Node {score + 1}/7
          </span>
        </div>
      )}

      {/* Snake Game Canvas Arena */}
      <div
        className="relative mx-auto rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-[#021B19] select-none"
        style={{
          width: '100%',
          maxWidth: `${CANVAS_SIZE}px`,
          aspectRatio: '1 / 1',
          touchAction: gameStarted ? 'none' : 'auto',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full block"
        />

        {/* Paused Preview Frame Overlay with Play Button */}
        {!gameStarted && !isSuccess && (
          <div className="absolute inset-0 bg-[#021B19]/50 backdrop-blur-[1.5px] flex flex-col items-center justify-center p-6 text-center space-y-4 select-none animate-fade-in">
            {/* Big Circular Pulsing Play Button */}
            <button
              type="button"
              onClick={handleStartGame}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#009488] hover:bg-[#007E74] text-white flex items-center justify-center shadow-xl shadow-[#009488]/40 border-4 border-white active:scale-95 transition-all cursor-pointer group"
              aria-label="Play Pipeline Snake"
            >
              <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white translate-x-0.5 group-hover:scale-110 transition-transform" />
            </button>

            <div className="bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center max-w-[280px]">
              <span className="text-white font-black text-xs sm:text-sm block">
                Tap Play to Ingest
              </span>
              <span className="text-[10px] text-slate-300 font-medium block mt-0.5">
                Swipe or use buttons to steer and collect all 7 EDL data nodes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ergonomic Mobile D-Pad Controls */}
      {gameStarted && (
        <div className="flex flex-col items-center justify-center gap-5 sm:gap-6 pt-1 select-none">
          {/* UP button */}
          <button
            type="button"
            onPointerDown={() => changeDirection({ x: 0, y: -1 })}
            className="w-14 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 flex items-center justify-center shadow-xs active:scale-95 cursor-pointer select-none"
            aria-label="Up"
          >
            <ChevronUp className="w-6 h-6 text-[#009488] stroke-[3]" />
          </button>

          {/* LEFT, DOWN, RIGHT buttons - Spaced out from the centre */}
          <div className="flex items-center gap-8 sm:gap-10 select-none">
            <button
              type="button"
              onPointerDown={() => changeDirection({ x: -1, y: 0 })}
              className="w-14 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 flex items-center justify-center shadow-xs active:scale-95 cursor-pointer select-none"
              aria-label="Left"
            >
              <ChevronLeft className="w-6 h-6 text-[#009488] stroke-[3]" />
            </button>
            <button
              type="button"
              onPointerDown={() => changeDirection({ x: 0, y: 1 })}
              className="w-14 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 flex items-center justify-center shadow-xs active:scale-95 cursor-pointer select-none"
              aria-label="Down"
            >
              <ChevronDown className="w-6 h-6 text-[#009488] stroke-[3]" />
            </button>
            <button
              type="button"
              onPointerDown={() => changeDirection({ x: 1, y: 0 })}
              className="w-14 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 flex items-center justify-center shadow-xs active:scale-95 cursor-pointer select-none"
              aria-label="Right"
            >
              <ChevronRight className="w-6 h-6 text-[#009488] stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor with finger comfort space */}
      <div
        ref={bottomAnchorRef}
        className={`w-full pointer-events-none transition-all ${
          gameStarted && !isSuccess ? 'h-20 sm:h-24' : 'h-0'
        }`}
      />

      {/* Error alert */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Completion Banner */}
      {isSuccess && (
        <div
          ref={completionBannerRef}
          className="p-4 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center space-y-2.5 animate-fade-in shadow-md"
        >
          <div className="flex items-center justify-center gap-2 text-[#009488] font-black text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-[#009488] animate-bounce" />
            <span>All technologies collected!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Azure, Databricks, Unity Catalog, Kafka, Integrated & Golden datasets, and the new Segmentation capability are fully linked and operational.
          </p>
          <button
            type="button"
            onClick={onSolved}
            className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Proceed to Presentation</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Dev Helper Options */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-[#878787] text-[11px]">
            Target: Ingest {EDL_NODES.length} EDL Nodes
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
