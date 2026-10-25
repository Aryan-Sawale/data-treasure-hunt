import React, { useState, useEffect } from 'react';
import { Trophy, X, RefreshCw, Medal, Crown, Sparkles, User, ExternalLink } from 'lucide-react';
import { apiService, getPlayerId, getPlayerName } from '../services/apiService';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function LeaderboardModal({ isOpen, onClose, onOpenFullscreen }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const currentPlayerId = getPlayerId();

  const fetchScores = async () => {
    setIsLoading(true);
    const result = await apiService.getLeaderboard();
    setData(result);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchScores();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    soundService.playClick();
    hapticService.light();
    fetchScores();
  };

  const handleClose = () => {
    soundService.playClick();
    hapticService.light();
    onClose();
  };

  const leaderboard = data?.leaderboard || [];
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white border-2 border-[#009488]/30 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header Bar */}
        <div className="p-4 bg-gradient-to-r from-[#009488] to-[#007066] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F9BD20] text-slate-950 flex items-center justify-center font-black shadow-md shadow-[#F9BD20]/30">
              <Trophy className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-wide">Live Expedition Leaderboard</h3>
              <p className="text-[11px] text-white/80">
                {data?.total_players || 0} competitive solvers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              title="Refresh scores"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Scrollable */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Top 3 Podium (If at least 1 player) */}
          {leaderboard.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2 pb-1 items-end">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                {top2 ? (
                  <div className={`w-full p-2.5 rounded-2xl border text-center transition-all ${
                    top2.player_id === currentPlayerId ? 'bg-[#FFFDF5] border-[#F9BD20] shadow-sm' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-1 text-xs font-black">
                      🥈
                    </div>
                    <span className="text-xs font-black text-slate-900 block truncate max-w-[80px]">
                      {top2.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#009488]">
                      {top2.total_score} pts
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-16 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs">
                    2nd
                  </div>
                )}
              </div>

              {/* 1st Place (Taller Center) */}
              <div className="flex flex-col items-center -mt-2">
                {top1 && (
                  <div className={`w-full p-3 rounded-2xl border-2 text-center transition-all ${
                    top1.player_id === currentPlayerId ? 'bg-[#FFFDF5] border-[#F9BD20] shadow-md ring-2 ring-[#F9BD20]/40' : 'bg-[#FFFDF5] border-[#F9BD20] shadow-sm'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-[#F9BD20] text-slate-950 flex items-center justify-center mx-auto mb-1 text-sm font-black shadow-xs animate-bounce">
                      👑
                    </div>
                    <span className="text-xs font-black text-slate-950 block truncate max-w-[90px]">
                      {top1.name}
                    </span>
                    <span className="text-xs font-mono font-black text-[#B45309]">
                      {top1.total_score} pts
                    </span>
                  </div>
                )}
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                {top3 ? (
                  <div className={`w-full p-2.5 rounded-2xl border text-center transition-all ${
                    top3.player_id === currentPlayerId ? 'bg-[#FFFDF5] border-[#F9BD20] shadow-sm' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-1 text-xs font-black">
                      🥉
                    </div>
                    <span className="text-xs font-black text-slate-900 block truncate max-w-[80px]">
                      {top3.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#009488]">
                      {top3.total_score} pts
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-16 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs">
                    3rd
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Rankings List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
              All Rankings
            </span>

            {leaderboard.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No solvers yet. Be the first to solve a puzzle!
              </div>
            ) : (
              leaderboard.map((item) => {
                const isCurrent = item.player_id === currentPlayerId;

                return (
                  <div
                    key={item.player_id}
                    className={`p-2.5 px-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#F0FDF4] border-2 border-[#009488] shadow-xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 text-center font-mono font-black text-xs ${
                        item.rank === 1 ? 'text-[#B45309]' : item.rank === 2 ? 'text-slate-600' : item.rank === 3 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        #{item.rank}
                      </span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-xs text-slate-900">
                            {item.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-black uppercase bg-[#009488] text-white px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#878787]">
                          {item.milestones_count} stops completed
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-[#009488]">
                        {item.total_score} pts
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Score Rules & Link to Fullscreen */}
        <div className="p-3 bg-[#F8FAFA] border-t border-slate-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F9BD20]" />
              <span>1st: 100 • 2nd: 80 • 3rd: 65 • 4th+: 50 pts</span>
            </div>
            {data?.current_player_rank && (
              <span className="font-bold text-[#009488]">
                Your Rank: #{data.current_player_rank}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onClose();
              if (onOpenFullscreen) onOpenFullscreen();
              else window.location.assign('#leaderboard');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#FFFDF5] hover:bg-[#FEF9C3] border border-[#F9BD20] text-slate-900 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#9E6E00]" />
            <span>Open Standalone /leaderboard Page</span>
          </button>
        </div>
      </div>
    </div>
  );
}

