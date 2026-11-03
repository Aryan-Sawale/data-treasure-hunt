import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 420;
const PADDLE_WIDTH = 76;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 6;
const TOTAL_BRICKS = 12;

const INITIAL_BRICKS = [
  // Row 0: BDM Definitions (Meaning) - Emerald/Teal
  { id: 1, label: 'IBAN', tag: 'Meaning', desc: 'Unique Bank Account Identifier', color: '#009488', border: '#006E64' },
  { id: 2, label: 'PARTY', tag: 'Meaning', desc: 'Counterparty / Legal Entity', color: '#009488', border: '#006E64' },
  { id: 3, label: 'RISK', tag: 'Meaning', desc: 'Credit Risk & Net Exposure', color: '#009488', border: '#006E64' },
  { id: 4, label: 'LIMIT', tag: 'Meaning', desc: 'Approved Facility Ceiling', color: '#009488', border: '#006E64' },

  // Row 1: BDM Relations (Context) - Warm Gold
  { id: 5, label: 'OWNS', tag: 'Context', desc: 'Party ➔ Owns Account', color: '#D97706', border: '#B45309' },
  { id: 6, label: 'SECURES', tag: 'Context', desc: 'Collateral ➔ Secures Loan', color: '#D97706', border: '#B45309' },
  { id: 7, label: 'BELONGS', tag: 'Context', desc: 'Entity ➔ Belongs to Group', color: '#D97706', border: '#B45309' },
  { id: 8, label: 'TRADES', tag: 'Context', desc: 'Desk ➔ Trades Instrument', color: '#D97706', border: '#B45309' },

  // Row 2: Shared Banking Data - Cyan/Mint
  { id: 9, label: 'PAYMENT', tag: 'Data', desc: 'SEPA & Instant Transfer', color: '#0284C7', border: '#0369A1' },
  { id: 10, label: 'LEDGER', tag: 'Data', desc: 'General Ledger Balances', color: '#0284C7', border: '#0369A1' },
  { id: 11, label: 'KYC', tag: 'Data', desc: 'Customer Due Diligence', color: '#0284C7', border: '#0369A1' },
  { id: 12, label: 'FACILITY', tag: 'Data', desc: 'Corporate Credit Facility', color: '#0284C7', border: '#0369A1' },
];

export default function Puzzle3BdmBreakout({ onSolved, onPenalty }) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const canvasRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const completionBannerRef = useRef(null);
  const animFrameRef = useRef(null);

  const gameStateRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    targetPaddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    holdSteerDir: 0,
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 48,
      vx: 1.5,
      vy: -2.7,
      active: true,
      stuckToPaddle: true,
    },
    bricks: [],
    particles: [],
    ballTrail: [],
    score: 0,
    isOver: false,
    respawnTimer: 0,
  });

  // Build grid of bricks
  const buildBricks = () => {
    const bricks = [];
    const cols = 4;
    const paddingX = 12;
    const gap = 8;
    const brickWidth = (CANVAS_WIDTH - paddingX * 2 - (cols - 1) * gap) / cols;
    const brickHeight = 26;
    const startY = 46;

    INITIAL_BRICKS.forEach((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = paddingX + col * (brickWidth + gap);
      const y = startY + row * (brickHeight + gap);

      bricks.push({
        ...item,
        x,
        y,
        w: brickWidth,
        h: brickHeight,
        alive: true,
      });
    });

    return bricks;
  };

  // Draw paused preview frame before game starts so user can get used to the screen
  useEffect(() => {
    if (gameStarted || isSuccess) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Deep cyber banking background
    ctx.fillStyle = '#031B19';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle grid backdrop
    ctx.strokeStyle = 'rgba(0, 148, 136, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw all initial bricks
    const previewBricks = buildBricks();
    previewBricks.forEach((b) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 6);
      ctx.fillStyle = b.color;
      ctx.fill();

      // Top highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
      ctx.restore();
    });

    const paddleY = CANVAS_HEIGHT - 32;
    const px = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;

    // Draw Ball resting on paddle
    ctx.save();
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, paddleY - BALL_RADIUS - 2, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#F9BD20';
    ctx.fill();

    // Inner glowing core
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, paddleY - BALL_RADIUS - 2, BALL_RADIUS * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();

    // Draw Paddle
    ctx.save();
    ctx.shadowColor = 'rgba(0, 148, 136, 0.6)';
    ctx.shadowBlur = 10;

    // Paddle body
    ctx.beginPath();
    ctx.roundRect(px, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
    ctx.fillStyle = '#009488';
    ctx.fill();

    // Top energy accent
    ctx.beginPath();
    ctx.roundRect(px + 4, paddleY + 2, PADDLE_WIDTH - 8, 3, 2);
    ctx.fillStyle = '#F9BD20';
    ctx.fill();
    ctx.restore();
  }, [gameStarted, isSuccess]);

  // Helper to spawn hit particles
  const spawnParticles = (x, y, count = 12, color = '#F9BD20') => {
    for (let i = 0; i < count; i++) {
      const speed = 1.2 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        life: 1.0,
        decay: 0.035 + Math.random() * 0.03,
        color,
      });
    }
  };

  // Main canvas animation loop
  useEffect(() => {
    if (!gameStarted || isSuccess) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    let running = true;

    const loop = () => {
      if (!running) return;

      // Apply continuous steering if holding steer buttons
      if (state.holdSteerDir) {
        state.targetPaddleX = Math.max(
          0,
          Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.targetPaddleX + state.holdSteerDir * 6.5)
        );
      }

      // Smooth paddle steering towards target
      state.paddleX += (state.targetPaddleX - state.paddleX) * 0.28;
      state.paddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, state.paddleX));

      // Handle ball movement
      const ball = state.ball;
      const paddleY = CANVAS_HEIGHT - 32;

      if (ball.stuckToPaddle) {
        ball.x = state.paddleX + PADDLE_WIDTH / 2;
        ball.y = paddleY - BALL_RADIUS - 2;
      } else if (ball.active) {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Record ball trail
        state.ballTrail.push({ x: ball.x, y: ball.y, alpha: 0.5 });
        if (state.ballTrail.length > 6) state.ballTrail.shift();

        // Wall collisions
        // Left
        if (ball.x - BALL_RADIUS <= 0) {
          ball.x = BALL_RADIUS;
          ball.vx = Math.abs(ball.vx);
          soundService.playBreakoutBounce('wall');
        }
        // Right
        if (ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - BALL_RADIUS;
          ball.vx = -Math.abs(ball.vx);
          soundService.playBreakoutBounce('wall');
        }
        // Top
        if (ball.y - BALL_RADIUS <= 0) {
          ball.y = BALL_RADIUS;
          ball.vy = Math.abs(ball.vy);
          soundService.playBreakoutBounce('wall');
        }

        // Paddle collision
        if (
          ball.vy > 0 &&
          ball.y + BALL_RADIUS >= paddleY &&
          ball.y - BALL_RADIUS <= paddleY + PADDLE_HEIGHT &&
          ball.x >= state.paddleX - 4 &&
          ball.x <= state.paddleX + PADDLE_WIDTH + 4
        ) {
          ball.y = paddleY - BALL_RADIUS;
          ball.vy = -2.7;

          // Variable bounce angle based on hit offset from paddle center
          const hitOffset = (ball.x - (state.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
          ball.vx = hitOffset * 2.6;
          if (Math.abs(ball.vx) < 0.4) {
            ball.vx = ball.vx >= 0 ? 0.6 : -0.6;
          }

          soundService.playBreakoutBounce('paddle');
          hapticService.light();
        }

        // Brick collisions
        for (let i = 0; i < state.bricks.length; i++) {
          const b = state.bricks[i];
          if (!b.alive) continue;

          // Find closest point to sphere
          const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
          const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.h));
          const dx = ball.x - closestX;
          const dy = ball.y - closestY;

          if (dx * dx + dy * dy <= BALL_RADIUS * BALL_RADIUS) {
            // Hit brick!
            b.alive = false;
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, 14, b.color);
            soundService.playBreakoutBounce('brick');
            hapticService.medium();

            // Deflect ball
            if (Math.abs(dx) > Math.abs(dy)) {
              ball.vx = -ball.vx;
            } else {
              ball.vy = -ball.vy;
            }

            state.score += 1;
            setScore(state.score);

            // Check win condition
            if (state.score >= TOTAL_BRICKS) {
              ball.active = false;
              setIsSuccess(true);
              soundService.playSuccess();
              hapticService.success();
              setGameStarted(false);

              setTimeout(() => {
                if (completionBannerRef.current) {
                  completionBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 120);
            }
            break;
          }
        }

        // Ball fell below canvas (Loss)
        if (ball.y - BALL_RADIUS > CANVAS_HEIGHT) {
          soundService.playError();
          hapticService.error();
          ball.active = false;
          state.respawnTimer = Date.now() + 1000;
        }
      } else if (state.respawnTimer && Date.now() >= state.respawnTimer) {
        // Auto respawn ball on paddle
        ball.active = true;
        ball.stuckToPaddle = false;
        ball.x = state.paddleX + PADDLE_WIDTH / 2;
        ball.y = paddleY - BALL_RADIUS - 4;
        ball.vx = (Math.random() > 0.5 ? 1.5 : -1.5);
        ball.vy = -2.7;
        state.respawnTimer = 0;
      }

      // --- RENDER CANVAS ---
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Deep cyber banking background
      ctx.fillStyle = '#031B19';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle grid backdrop
      ctx.strokeStyle = 'rgba(0, 148, 136, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw Bricks
      state.bricks.forEach((b) => {
        if (!b.alive) return;

        // Brick Body
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 6);
        ctx.fillStyle = b.color;
        ctx.fill();

        // Top highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);

        ctx.restore();
      });

      // Draw Ball Trail
      state.ballTrail.forEach((t, i) => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, BALL_RADIUS * (0.4 + (i / state.ballTrail.length) * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 189, 32, ${(i + 1) * 0.08})`;
        ctx.fill();
      });

      // Draw Ball (BDM Linker Beacon)
      if (ball.active) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#F9BD20';
        ctx.fill();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();
      }

      // Draw Paddle (BDM Context Bar)
      ctx.save();
      const px = state.paddleX;
      const py = paddleY;

      // Glow backing
      ctx.shadowColor = 'rgba(0, 148, 136, 0.6)';
      ctx.shadowBlur = 10;

      // Paddle body
      ctx.beginPath();
      ctx.roundRect(px, py, PADDLE_WIDTH, PADDLE_HEIGHT, 6);
      ctx.fillStyle = '#009488';
      ctx.fill();

      // Top energy accent
      ctx.beginPath();
      ctx.roundRect(px + 4, py + 2, PADDLE_WIDTH - 8, 3, 2);
      ctx.fillStyle = '#F9BD20';
      ctx.fill();

      ctx.restore();

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

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameStarted, isSuccess]);

  // Touch & Pointer Movement Handlers
  const handlePointerMove = (e) => {
    if (!gameStarted || isSuccess) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;

    gameStateRef.current.targetPaddleX = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, relativeX - PADDLE_WIDTH / 2));
  };

  const handleStartHold = (dir) => {
    if (!gameStarted || isSuccess) return;
    gameStateRef.current.holdSteerDir = dir;
    gameStateRef.current.targetPaddleX = Math.max(
      0,
      Math.min(CANVAS_WIDTH - PADDLE_WIDTH, gameStateRef.current.targetPaddleX + dir * 28)
    );
    soundService.playClick();
    hapticService.light();
  };

  const handleStopHold = () => {
    gameStateRef.current.holdSteerDir = 0;
  };

  // Keyboard navigation for holding arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted || isSuccess) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameStateRef.current.holdSteerDir = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        gameStateRef.current.holdSteerDir = 1;
      }
    };

    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        gameStateRef.current.holdSteerDir = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, isSuccess]);

  // Launch / Start Game Handler
  const handleStartGame = () => {
    soundService.playSuccess();
    hapticService.medium();

    const bricks = buildBricks();
    gameStateRef.current = {
      paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      targetPaddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      holdSteerDir: 0,
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 32 - BALL_RADIUS - 4,
        vx: 1.5 * (Math.random() > 0.5 ? 1 : -1),
        vy: -2.7,
        active: true,
        stuckToPaddle: false,
      },
      bricks,
      particles: [],
      ballTrail: [],
      score: 0,
      isOver: false,
      respawnTimer: 0,
    };

    setScore(0);
    setErrorMsg(null);
    setGameStarted(true);
    setIsSuccess(false);

    // Auto scroll game into view
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
    setScore(TOTAL_BRICKS);
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
            Challenge 11
          </span>
          <span
            className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
              score >= TOTAL_BRICKS
                ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                : 'bg-amber-100/60 border-amber-300 text-amber-900'
            }`}
          >
            {score}/{TOTAL_BRICKS} Terms Linked
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🕹️</span>
            <span>BDM Breakout</span>
          </h2>
          <p className="text-xs text-slate-600 font-bold">
            Bounce the beacon and break all boxes
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
            <span>Launch BDM Breakout</span>
          </button>
        )}
      </div>

      {/* Arcade Breakout Game Arena */}
      <div
        className="relative mx-auto rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-[#031B19] select-none"
        style={{
          width: '100%',
          maxWidth: '360px',
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          touchAction: gameStarted ? 'none' : 'auto',
        }}
        onPointerMove={handlePointerMove}
        onTouchMove={handlePointerMove}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
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
              aria-label="Play BDM Breakout"
            >
              <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white translate-x-0.5 group-hover:scale-110 transition-transform" />
            </button>

            <div className="bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center max-w-[280px]">
              <span className="text-white font-black text-xs sm:text-sm block">
                Tap Play to Launch
              </span>
              <span className="text-[10px] text-slate-300 font-medium block mt-0.5">
                Bounce the beacon and break all boxes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Control Buttons (Steer Left / Right) */}
      {gameStarted && (
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <button
            type="button"
            onPointerDown={() => handleStartHold(-1)}
            onPointerUp={handleStopHold}
            onPointerLeave={handleStopHold}
            onPointerCancel={handleStopHold}
            onContextMenu={(e) => e.preventDefault()}
            className="flex-1 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer select-none"
          >
            <ChevronLeft className="w-4 h-4 text-[#009488]" />
            <span>Hold Paddle Left</span>
          </button>
          <button
            type="button"
            onPointerDown={() => handleStartHold(1)}
            onPointerUp={handleStopHold}
            onPointerLeave={handleStopHold}
            onPointerCancel={handleStopHold}
            onContextMenu={(e) => e.preventDefault()}
            className="flex-1 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer select-none"
          >
            <span>Hold Paddle Right</span>
            <ChevronRight className="w-4 h-4 text-[#009488]" />
          </button>
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
            <span>BDM Registered & Certified!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            All banking data is now linked to registered terms and definitions, guaranteeing precise meaning and the right context across the Bank.
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
            Target: Link {TOTAL_BRICKS} BDM Terms
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
