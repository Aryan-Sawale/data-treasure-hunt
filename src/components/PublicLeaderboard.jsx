import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  RefreshCw, 
  Crown, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Users, 
  Flame,
  Award,
  Zap,
  Play,
  Pause
} from 'lucide-react';
import { apiService, getPlayerId } from '../services/apiService';
import { soundService } from '../services/soundService';

export default function PublicLeaderboard({ onNavigateHome }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const currentPlayerId = getPlayerId();

  const fetchScores = async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    const result = await apiService.getLeaderboard(100);
    setData(result);
    setLastUpdated(new Date());
    if (showSpinner) setIsLoading(false);
  };

  useEffect(() => {
    fetchScores(true);
  }, []);

  // Real-time polling every 3 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchScores(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    soundService.playClick();
    fetchScores(true);
  };

  const handleToggleAuto = () => {
    soundService.playClick();
    setAutoRefresh(prev => !prev);
  };

  const leaderboard = data?.leaderboard || [];
  const totalPlayers = data?.total_players || 0;
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  const totalPointsInPlay = leaderboard.reduce((acc, curr) => acc + (curr.total_score || 0), 0);

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    // Ensure string without timezone offset is treated as UTC
    const normalized = (typeof isoString === 'string' && !isoString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoString))
      ? (isoString + 'Z')
      : isoString;
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return 'Just now';

    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 20) return 'Just now';
    if (diffSec < 60) return (diffSec + 's ago');
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return (diffMin + 'm ago');
    return (Math.floor(diffMin / 60) + 'h ago');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFA] text-slate-800 flex flex-col justify-between selection:bg-[#009488] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#009488]/20 shadow-xs">
        <div className="h-1 bg-[#009488]" />
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateHome ? onNavigateHome() : window.location.assign('./')}
              className="p-2 rounded-xl bg-[#F8FAFA] hover:bg-[#FFFDF5] border border-slate-200 hover:border-[#009488] text-slate-700 hover:text-[#009488] transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs"
              title="Return to Quest"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Back to Quest</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#009488] flex items-center justify-center text-white shadow-xs border border-[#007A70]">
                <Trophy className="w-5 h-5 text-[#F9BD20]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-sm sm:text-base tracking-wider uppercase text-[#009488]">
                    Live Expedition Leaderboard
                  </h1>
                  <span className="bg-[#F9BD20] text-slate-950 px-2 py-0.5 rounded-md font-mono font-black text-[9px] uppercase tracking-wider shadow-2xs">
                    ABN AMRO
                  </span>
                </div>
                <p className="text-[11px] text-[#878787] font-medium hidden sm:block">
                  Real-time competitive standings for client treasure hunt
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Live indicator & Refresh */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleAuto}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border shadow-2xs ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={autoRefresh ? 'Auto-refreshing every 3s. Click to pause.' : 'Auto-refresh paused. Click to enable.'}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span className="hidden md:inline font-mono text-[11px]">
                {autoRefresh ? 'LIVE (3s)' : 'PAUSED'}
              </span>
              {autoRefresh ? <Pause className="w-3 h-3 ml-0.5" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-[#FFFDF5] hover:bg-[#FEF9C3] border border-[#F9BD20] text-slate-800 active:scale-95 transition-all shadow-xs"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 text-[#9E6E00] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#009488] flex items-center justify-center font-black">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#878787] uppercase tracking-wider">Total Solvers</p>
              <p className="text-xl font-black text-slate-900">{totalPlayers}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#878787] uppercase tracking-wider">Top Score</p>
              <p className="text-xl font-black text-[#009488]">
                {top1 ? `${top1.total_score} PTS` : '0 PTS'}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#878787] uppercase tracking-wider">Points in Play</p>
              <p className="text-xl font-black text-slate-900">{totalPointsInPlay}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#878787] uppercase tracking-wider">Last Sync</p>
              <p className="text-xs font-mono font-bold text-slate-700">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Connecting...'}
              </p>
            </div>
          </div>
        </div>

        {/* Podium for Top 3 (Projector View) */}
        {leaderboard.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900 via-[#013531] to-[#002623] p-6 sm:p-8 rounded-3xl text-white shadow-xl border-2 border-[#009488]/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-64 h-64 bg-[#009488]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 translate-y-8 -translate-x-8 w-64 h-64 bg-[#F9BD20]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-6 relative">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F9BD20]/20 border border-[#F9BD20] text-[#F9BD20] text-xs font-black mb-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EXPEDITION PODIUM LEADERS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Who Will Open The Vault First?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4 max-w-4xl mx-auto">
              {/* Rank 2 (Silver) */}
              <div className="order-2 sm:order-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-slate-300/30 flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-slate-300 text-slate-900 flex items-center justify-center font-black text-xl shadow-md mb-2">
                  🥈
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                  2nd Place
                </span>
                <p className="font-black text-lg text-white truncate max-w-full">
                  {top2 ? top2.name : 'Waiting...'}
                </p>
                <div className="mt-2 bg-white/15 px-3 py-1 rounded-full text-slate-200 font-mono font-black text-sm">
                  {top2 ? `${top2.total_score} PTS` : '—'}
                </div>
                {top2 && (
                  <span className="text-[10px] text-slate-400 mt-1">
                    {top2.milestones_count} stops solved
                  </span>
                )}
              </div>

              {/* Rank 1 (Gold) */}
              <div className="order-1 sm:order-2 bg-gradient-to-b from-[#F9BD20]/30 to-white/15 backdrop-blur-md p-6 rounded-3xl border-2 border-[#F9BD20] flex flex-col items-center text-center relative -translate-y-2 shadow-2xl hover:scale-[1.03] transition-transform">
                <div className="absolute -top-4 w-9 h-9 rounded-full bg-[#F9BD20] text-slate-950 flex items-center justify-center shadow-lg border-2 border-white">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#F9BD20] text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg mb-2 mt-1">
                  🥇
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F9BD20] font-black">
                  Current Leader
                </span>
                <p className="font-black text-xl sm:text-2xl text-white truncate max-w-full">
                  {top1 ? top1.name : 'Waiting for Solvers...'}
                </p>
                <div className="mt-2 bg-[#F9BD20] text-slate-950 px-4 py-1.5 rounded-full font-mono font-black text-base shadow-md">
                  {top1 ? `${top1.total_score} PTS` : '0 PTS'}
                </div>
                {top1 && (
                  <span className="text-[11px] text-amber-200 mt-1 font-semibold">
                    {top1.milestones_count} stops solved • {formatTimeAgo(top1.last_active)}
                  </span>
                )}
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="order-3 sm:order-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-amber-600/30 flex flex-col items-center text-center relative hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-amber-700/80 text-amber-100 flex items-center justify-center font-black text-xl shadow-md mb-2">
                  🥉
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                  3rd Place
                </span>
                <p className="font-black text-lg text-white truncate max-w-full">
                  {top3 ? top3.name : 'Waiting...'}
                </p>
                <div className="mt-2 bg-white/15 px-3 py-1 rounded-full text-slate-200 font-mono font-black text-sm">
                  {top3 ? `${top3.total_score} PTS` : '—'}
                </div>
                {top3 && (
                  <span className="text-[10px] text-slate-400 mt-1">
                    {top3.milestones_count} stops solved
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complete Standings Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFA]">
            <div>
              <h3 className="font-black text-slate-900 text-base">Complete Standings</h3>
              <p className="text-xs text-[#878787]">
                First solvers to crack puzzles and presentation codes get the highest rewards
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-[#009488]">
              {leaderboard.length} Solvers Registered
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-700">No expedition solvers yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Once participants join and solve their first puzzle, rankings will appear here live!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-3 px-4 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Participant Name</th>
                    <th className="py-3 px-4 text-center">Stops Solved</th>
                    <th className="py-3 px-4 text-center">Last Active</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {leaderboard.map((player) => {
                    const isMe = player.player_id === currentPlayerId;
                    const isTop1 = player.rank === 1;
                    const isTop2 = player.rank === 2;
                    const isTop3 = player.rank === 3;

                    return (
                      <tr
                        key={player.player_id}
                        className={`transition-colors ${
                          isMe
                            ? 'bg-teal-50/70 font-semibold'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-mono font-black text-xs ${
                              isTop1
                                ? 'bg-[#F9BD20] text-slate-950 shadow-xs'
                                : isTop2
                                ? 'bg-slate-200 text-slate-800'
                                : isTop3
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {player.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">
                              {player.name}
                            </span>
                            {isMe && (
                              <span className="bg-[#009488] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                            <Award className="w-3.5 h-3.5 text-[#009488]" />
                            {player.milestones_count}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-[#878787] font-medium">
                          {formatTimeAgo(player.last_active)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-black text-base text-[#009488]">
                            {player.total_score}
                          </span>
                          <span className="text-[10px] text-[#9E6E00] font-bold ml-1">
                            PTS
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-slate-200 bg-white text-center text-xs text-[#878787] flex flex-col sm:flex-row items-center justify-between max-w-6xl w-full mx-auto">
        <p>ABN AMRO Data & Analytics • Live Big Screen Leaderboard</p>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <a
            href="./#admin"
            className="hover:text-[#009488] transition-colors underline font-semibold"
          >
            Facilitator Admin Login
          </a>
          <button
            onClick={() => onNavigateHome ? onNavigateHome() : window.location.assign('./')}
            className="hover:text-[#009488] transition-colors font-semibold"
          >
            Back to Quest
          </button>
        </div>
      </footer>
    </div>
  );
}

