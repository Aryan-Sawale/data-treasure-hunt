import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, Play, ShieldAlert, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';
import { isDevHelperEnabled } from '../../config/questConfig';

const TARGET_ASTEROIDS = 10;
const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 400;

const ASTEROID_LABELS = [
  'Corrupt Parquet',
  'Zombie Stream',
  'Schema Drift',
  'Deadlock Block',
  'Orphan Delta',
  'Null Buffer',
  'Lagging Ingestion',
];

export default function Puzzle1LakehouseAsteroids({ onSolved, onPenalty }) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);

  const canvasRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const completionBannerRef = useRef(null);
  const animFrameRef = useRef(null);
  const gameStateRef = useRef({
    shipX: CANVAS_WIDTH / 2,
    targetShipX: CANVAS_WIDTH / 2,
    holdSteerDir: 0,
    lasers: [],
    asteroids: [],
    particles: [],
    stars: [],
    lastShotTime: 0,
    lastSpawnTime: 0,
    score: 0,
    isOver: false,
  });

  // Initialize stars once
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 0.5 + Math.random() * 1.5,
        size: Math.random() < 0.2 ? 2 : 1,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
    gameStateRef.current.stars = stars;
  }, []);

  // Draw paused preview frame before game starts so user can get used to the screen
  useEffect(() => {
    if (gameStarted || isSuccess) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Deep space background
    ctx.fillStyle = '#021B19';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Starfield
    (gameStateRef.current.stars || []).forEach((star) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Ingestion buffer boundary
    ctx.strokeStyle = 'rgba(0, 148, 136, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - 22);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 22);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(0, 148, 136, 0.7)';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▼ DATA LAKE INGESTION BOUNDARY ▼', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);

    // Sample preview asteroids (floating in space)
    const previewAsteroids = [
      { x: 75, y: 80, radius: 24, label: 'Corrupt Parquet' },
      { x: 275, y: 105, radius: 22, label: 'Schema Drift' },
      { x: 175, y: 170, radius: 25, label: 'Zombie Stream' },
    ];

    previewAsteroids.forEach((ast) => {
      ctx.save();
      ctx.translate(ast.x, ast.y);

      // Glow backing
      ctx.shadowColor = '#F43F5E';
      ctx.shadowBlur = 10;

      // Asteroid polygon body
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const r = ast.radius * (0.85 + (i % 2 === 0 ? 0.2 : -0.1));
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = '#2A0808';
      ctx.fill();
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label Pill
      ctx.shadowBlur = 0;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textWidth = ctx.measureText(ast.label).width;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(-textWidth / 2 - 3, -6, textWidth + 6, 12);
      ctx.fillStyle = '#FFAEAE';
      ctx.fillText(ast.label, 0, 0);

      ctx.restore();
    });

    // Ready Lasers
    ctx.fillStyle = '#F9BD20';
    ctx.fillRect(CANVAS_WIDTH / 2 - 11, CANVAS_HEIGHT - 70, 3, 14);
    ctx.fillRect(CANVAS_WIDTH / 2 + 8, CANVAS_HEIGHT - 70, 3, 14);

    // Spaceship (Lakehouse Ingestion Pod)
    const sx = CANVAS_WIDTH / 2;
    const sy = CANVAS_HEIGHT - 44;

    // Thruster flame
    ctx.beginPath();
    ctx.moveTo(sx - 5, sy + 18);
    ctx.lineTo(sx + 5, sy + 18);
    ctx.lineTo(sx, sy + 28);
    ctx.closePath();
    ctx.fillStyle = '#F9BD20';
    ctx.fill();

    // Main Ship Body
    ctx.beginPath();
    ctx.moveTo(sx, sy - 14);
    ctx.lineTo(sx + 15, sy + 15);
    ctx.lineTo(sx + 7, sy + 12);
    ctx.lineTo(sx, sy + 8);
    ctx.lineTo(sx - 7, sy + 12);
    ctx.lineTo(sx - 15, sy + 15);
    ctx.closePath();
    ctx.fillStyle = '#009488';
    ctx.fill();
    ctx.strokeStyle = '#00E5D4';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cockpit / Engine Core
    ctx.beginPath();
    ctx.arc(sx, sy + 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#F9BD20';
    ctx.fill();
  }, [gameStarted, isSuccess]);

  // Main game loop running on Canvas
  useEffect(() => {
    if (!gameStarted || isSuccess) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;

    let running = true;

    const spawnAsteroid = (now) => {
      const radius = 20 + Math.random() * 8;
      const x = radius + Math.random() * (CANVAS_WIDTH - radius * 2);
      const label = ASTEROID_LABELS[Math.floor(Math.random() * ASTEROID_LABELS.length)];

      state.asteroids.push({
        x,
        y: -radius,
        radius,
        speed: 1.1 + Math.random() * 0.9,
        angle: 0,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        label,
        points: Array.from({ length: 7 }, (_, i) => {
          const a = (i / 7) * Math.PI * 2;
          const r = radius * (0.8 + Math.random() * 0.35);
          return { x: Math.cos(a) * r, y: Math.sin(a) * r };
        }),
      });
      state.lastSpawnTime = now;
    };

    const spawnParticles = (x, y, count = 10, color = '#F9BD20') => {
      for (let i = 0; i < count; i++) {
        const speed = 1.5 + Math.random() * 3.5;
        const angle = Math.random() * Math.PI * 2;
        state.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.5 + Math.random() * 2,
          life: 1.0,
          decay: 0.03 + Math.random() * 0.03,
          color,
        });
      }
    };

    const loop = (timestamp) => {
      if (!running) return;

      // Apply continuous steering if holding steer buttons
      if (state.holdSteerDir) {
        state.targetShipX = Math.max(
          25,
          Math.min(CANVAS_WIDTH - 25, state.targetShipX + state.holdSteerDir * 6.5)
        );
      }

      // Smooth ship movement toward target
      state.shipX += (state.targetShipX - state.shipX) * 0.22;
      state.shipX = Math.max(25, Math.min(CANVAS_WIDTH - 25, state.shipX));

      // Auto-fire twin lasers every 260ms
      if (timestamp - state.lastShotTime > 260) {
        state.lasers.push({ x: state.shipX - 10, y: CANVAS_HEIGHT - 48, vy: -7.5 });
        state.lasers.push({ x: state.shipX + 10, y: CANVAS_HEIGHT - 48, vy: -7.5 });
        state.lastShotTime = timestamp;
        soundService.playLaser();
      }

      // Spawn asteroids every 1100ms
      if (timestamp - state.lastSpawnTime > 1100) {
        spawnAsteroid(timestamp);
      }

      // Clear canvas
      ctx.fillStyle = '#021B19';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw streaming data grid lines (background)
      ctx.strokeStyle = 'rgba(0, 148, 136, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 30; x < CANVAS_WIDTH; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Update & draw background stars / data packets
      ctx.fillStyle = '#00E5D4';
      state.stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) star.y = 0;
        ctx.globalAlpha = star.alpha;
        ctx.fillRect(star.x, star.y, star.size, star.size * 2);
      });
      ctx.globalAlpha = 1.0;

      // Update & draw lasers
      ctx.fillStyle = '#00E5D4';
      ctx.shadowColor = '#00E5D4';
      ctx.shadowBlur = 8;
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const laser = state.lasers[i];
        laser.y += laser.vy;

        ctx.fillRect(laser.x - 1.5, laser.y - 6, 3, 10);

        if (laser.y < -10) {
          state.lasers.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0;

      // Update & draw asteroids
      for (let i = state.asteroids.length - 1; i >= 0; i--) {
        const a = state.asteroids[i];
        a.y += a.speed;
        a.angle += a.rotSpeed;

        // Collision check with lasers
        let destroyed = false;
        for (let j = state.lasers.length - 1; j >= 0; j--) {
          const l = state.lasers[j];
          const dist = Math.hypot(a.x - l.x, a.y - l.y);
          if (dist < a.radius + 4) {
            // Laser hit!
            state.lasers.splice(j, 1);
            destroyed = true;
            break;
          }
        }

        if (destroyed) {
          spawnParticles(a.x, a.y, 14, '#F9BD20');
          spawnParticles(a.x, a.y, 6, '#00E5D4');
          soundService.playExplosion();
          hapticService.medium();

          state.asteroids.splice(i, 1);
          state.score += 1;
          const newScore = state.score;
          setScore(newScore);

          if (newScore >= TARGET_ASTEROIDS) {
            // Victory!
            running = false;
            setIsSuccess(true);
            setGameStarted(false);
            soundService.playSuccess();
            hapticService.success();

            // Auto-scroll to completion banner & proceed button
            setTimeout(() => {
              if (completionBannerRef.current) {
                completionBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 80);
            return;
          }
          continue;
        }

        // Check if breached Lakehouse buffer (bottom)
        if (a.y > CANVAS_HEIGHT - 20) {
          spawnParticles(a.x, CANVAS_HEIGHT - 10, 8, '#EF4444');
          soundService.playError();
          hapticService.light();

          if (onPenalty) {
            onPenalty(5, 'Data Lake Boundary Breach');
          }

          setErrorMsg('⚠️ Debris breached Lakehouse boundary (-5 pts)! Keep blasting!');
          setIsBoardShaking(true);
          setTimeout(() => setIsBoardShaking(false), 500);

          state.asteroids.splice(i, 1);
          continue;
        }

        // Draw asteroid
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.angle);

        // Body
        ctx.beginPath();
        a.points.forEach((pt, pIdx) => {
          if (pIdx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = '#475569';
        ctx.fill();
        ctx.strokeStyle = '#F9BD20';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Core icon
        ctx.restore();

        // Label above
        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(a.label, a.x, a.y - a.radius - 4);
      }

      // Update & draw particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Draw bottom Lakehouse buffer boundary
      ctx.strokeStyle = 'rgba(0, 148, 136, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - 22);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 22);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(0, 148, 136, 0.7)';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▼ DATA LAKE INGESTION BOUNDARY ▼', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10);

      // Draw Spaceship (Lakehouse Ingestion Pod)
      const sx = state.shipX;
      const sy = CANVAS_HEIGHT - 44;

      // Thruster flame
      ctx.beginPath();
      ctx.moveTo(sx - 5, sy + 18);
      ctx.lineTo(sx + 5, sy + 18);
      ctx.lineTo(sx, sy + 26 + (Math.sin(timestamp * 0.05) * 4));
      ctx.closePath();
      ctx.fillStyle = '#F9BD20';
      ctx.fill();

      // Main Ship Body
      ctx.beginPath();
      ctx.moveTo(sx, sy - 14); // Nose
      ctx.lineTo(sx + 15, sy + 15); // Right wing
      ctx.lineTo(sx + 7, sy + 12);
      ctx.lineTo(sx, sy + 8);
      ctx.lineTo(sx - 7, sy + 12);
      ctx.lineTo(sx - 15, sy + 15); // Left wing
      ctx.closePath();
      ctx.fillStyle = '#009488';
      ctx.fill();
      ctx.strokeStyle = '#00E5D4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cockpit / Engine Core
      ctx.beginPath();
      ctx.arc(sx, sy + 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#F9BD20';
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameStarted, isSuccess, onPenalty]);

  // Touch & Mouse Movement Handlers
  const handlePointerMove = (e) => {
    if (!gameStarted || isSuccess) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;

    gameStateRef.current.targetShipX = Math.max(25, Math.min(CANVAS_WIDTH - 25, relativeX));
  };

  const handleStartHold = (dir) => {
    if (!gameStarted || isSuccess) return;
    gameStateRef.current.holdSteerDir = dir;
    gameStateRef.current.targetShipX = Math.max(
      25,
      Math.min(CANVAS_WIDTH - 25, gameStateRef.current.targetShipX + dir * 26)
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

  // Start game handler
  const handleStartGame = () => {
    soundService.playSuccess();
    hapticService.medium();

    gameStateRef.current = {
      shipX: CANVAS_WIDTH / 2,
      targetShipX: CANVAS_WIDTH / 2,
      holdSteerDir: 0,
      lasers: [],
      asteroids: [],
      particles: [],
      stars: gameStateRef.current.stars,
      lastShotTime: 0,
      lastSpawnTime: 0,
      score: 0,
      isOver: false,
    };

    setScore(0);
    setErrorMsg(null);
    setGameStarted(true);
    setIsSuccess(false);

    // Automatically scroll to bottom so the game arena and steer buttons are in perfect view
    const scrollToGame = () => {
      if (bottomAnchorRef.current) {
        bottomAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight || document.body.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    setTimeout(scrollToGame, 60);
    setTimeout(scrollToGame, 220);
  };

  // Dev Quick Complete
  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    setScore(TARGET_ASTEROIDS);
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
      {/* Header & Concise Prompt */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-1.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 3
          </span>
          <span
            className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-lg border ${
              isSuccess
                ? 'bg-[#F0FDF4] border-[#009488]/40 text-[#009488]'
                : !gameStarted
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-amber-100/60 border-amber-300 text-amber-900'
            }`}
          >
            {score}/{TARGET_ASTEROIDS} Asteroids Neutralized
          </span>
        </div>

        {/* Title with icon & Green brand styling */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <span>Lakehouse Stream Defender</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Drag the ship or use buttons to steer and destroy all asteroids!
          </p>
        </div>
      </div>

      {/* Start Button (If Not Started Yet) */}
      {!gameStarted && !isSuccess && (
        <button
          type="button"
          onClick={handleStartGame}
          className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current text-[#F9BD20]" />
          <span>Launch Lakehouse Defender (Blast {TARGET_ASTEROIDS} Asteroids)</span>
        </button>
      )}

      {/* Arcade Canvas Game Arena */}
      <div
        className={`relative w-full max-w-sm mx-auto aspect-[360/400] rounded-2xl overflow-hidden border-2 border-[#009488]/50 shadow-xl bg-[#021B19] transition-transform ${
          gameStarted && !isSuccess ? 'touch-none' : 'touch-auto'
        } ${isBoardShaking ? 'animate-shake' : ''}`}
        onTouchMove={gameStarted && !isSuccess ? handlePointerMove : undefined}
        onTouchStart={gameStarted && !isSuccess ? handlePointerMove : undefined}
        onMouseMove={gameStarted && !isSuccess ? handlePointerMove : undefined}
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
              aria-label="Play Stream Defender"
            >
              <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white translate-x-0.5 group-hover:scale-110 transition-transform" />
            </button>

            <div className="bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center max-w-[280px]">
              <span className="text-white font-black text-xs sm:text-sm block">
                Tap Play to Start
              </span>
              <span className="text-[10px] text-slate-300 font-medium block mt-0.5">
                Steer your ship to blast incoming rogue data blocks!
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
            <span>Hold Steer Left</span>
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
            <span>Hold Steer Right</span>
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

      {/* Error / Breach notification */}
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
            <span>Lakehouse Stream Secured!</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            All 10 rogue data asteroids neutralized. Proceeding to Memory Matching...
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
            Target: Blast {TARGET_ASTEROIDS} Asteroids
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
