
const parseUtcDate = (isoString) => {
  if (!isoString) return new Date();
  const normalized = (typeof isoString === 'string' && !isoString.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(isoString))
    ? (isoString + 'Z')
    : isoString;
  return new Date(normalized);
};
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Trash2, 
  LogOut, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ArrowLeft,
  Sparkles,
  BarChart3,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService, getAdminToken } from '../services/apiService';
import { soundService } from '../services/soundService';

export default function AdminDashboard({ onNavigateHome, onNavigateLeaderboard }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAdminToken());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    const res = await apiService.getAdminDashboard();
    if (res.success) {
      setDashboardData(res.data);
      setIsAuthenticated(true);
    } else if (res.unauthorized) {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
      // Auto-poll dashboard telemetry every 5s
      const timer = setInterval(() => {
        apiService.getAdminDashboard().then(res => {
          if (res.success) setDashboardData(res.data);
        });
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) {
      setLoginError('Please enter administrator password');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    const res = await apiService.adminLogin(passwordInput);
    setIsLoggingIn(false);

    if (res.success) {
      soundService.playSuccess();
      setIsAuthenticated(true);
      fetchDashboard();
    } else {
      soundService.playError();
      setLoginError(res.message || 'Incorrect password');
    }
  };

  const handleLogout = () => {
    soundService.playClick();
    apiService.adminLogout();
    setIsAuthenticated(false);
    setDashboardData(null);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    soundService.playClick();
    const success = await apiService.deletePlayer(playerToDelete.id);
    if (success) {
      setActionSuccess(`Player "${playerToDelete.name}" successfully removed.`);
      setTimeout(() => setActionSuccess(''), 3000);
      setPlayerToDelete(null);
      fetchDashboard();
    } else {
      alert('Failed to delete player. Check server connection.');
    }
  };

  const handleResetSession = async (deleteEntirely = false) => {
    soundService.playClick();
    const success = await apiService.resetLeaderboard(deleteEntirely);
    if (success) {
      setActionSuccess(
        deleteEntirely
          ? 'All participants and completions permanently wiped.'
          : 'Scores reset to 0. All players reset to Stage 1.'
      );
      setTimeout(() => setActionSuccess(''), 4000);
      setShowResetModal(false);
      fetchDashboard();
    } else {
      alert('Failed to reset session. Check server connection.');
    }
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFA] flex flex-col justify-between selection:bg-[#009488] selection:text-white">
        <header className="p-4 flex items-center justify-between border-b border-slate-200 bg-white">
          <button
            onClick={() => onNavigateHome ? onNavigateHome() : window.location.assign('./')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#009488] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quest</span>
          </button>
          <span className="text-xs font-mono font-bold text-[#878787]">ABN AMRO Admin Gate</span>
        </header>

        <div className="max-w-md w-full mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl border-2 border-[#009488]/30 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#009488] text-white flex items-center justify-center mx-auto shadow-md shadow-[#009488]/20">
                <Shield className="w-7 h-7 text-[#F9BD20]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Facilitator Console
              </h2>
              <p className="text-xs text-[#878787]">
                Protected administration dashboard for session managers
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-[#009488] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Admin Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Enter facilitator password"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#009488] focus:ring-2 focus:ring-[#009488]/20 text-sm font-bold text-slate-900 bg-[#F8FAFA] focus:bg-white transition-all pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-[11px] text-rose-600 font-bold animate-fade-in">
                    {loginError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-[#009488] hover:bg-[#007E74] text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-[#009488]/20 transition-all active:scale-[0.99]"
              >
                <Lock className="w-4 h-4 text-[#F9BD20]" />
                <span>{isLoggingIn ? 'Verifying...' : 'Access Admin Dashboard'}</span>
              </button>
            </form>
          </div>
        </div>

        <footer className="p-4 text-center text-xs text-[#878787]">
          ABN AMRO Banking Data Expedition • Internal Use Only
        </footer>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  const players = dashboardData?.players || [];
  const milestoneCounts = dashboardData?.milestone_counts || {};

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFA] text-slate-800 flex flex-col justify-between selection:bg-[#009488] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#009488]/20 shadow-xs">
        <div className="h-1 bg-[#009488]" />
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#009488] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-5 h-5 text-[#F9BD20]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-black text-base uppercase tracking-wider text-[#009488]">
                  Facilitator Dashboard
                </h1>
                <span className="bg-[#F9BD20] text-slate-950 px-2 py-0.5 rounded-md font-mono font-black text-[9px] uppercase tracking-wider">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-[#878787] font-medium hidden sm:block">
                Session telemetry, solver milestones, and leaderboard governance
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigateLeaderboard ? onNavigateLeaderboard() : window.location.assign('./#leaderboard')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Public Leaderboard</span>
            </button>

            <button
              onClick={() => onNavigateHome ? onNavigateHome() : window.location.assign('./')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Play Quest</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-2xs"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between animate-fade-in shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold">{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess('')}
              className="text-xs font-black text-emerald-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Telemetry KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#878787]">
                Active Solvers
              </span>
              <Users className="w-4 h-4 text-[#009488]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {dashboardData?.total_players ?? '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Total joined sessions</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#878787]">
                Milestones Solved
              </span>
              <Award className="w-4 h-4 text-[#F9BD20]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {dashboardData?.total_completions ?? '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Across all 4 stops</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#878787]">
                Top Score
              </span>
              <BarChart3 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[#009488]">
              {dashboardData?.top_score ?? 0} <span className="text-xs font-mono font-bold text-[#F9BD20]">PTS</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Highest ranking solver</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#878787]">
                Avg Points
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {dashboardData?.average_score ?? 0} <span className="text-xs font-mono font-bold text-slate-400">PTS</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Per registered participant</p>
          </div>
        </div>

        {/* Milestone Completion Funnel Grid */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wider text-[#009488]">
                Milestone Progress Funnel
              </h3>
              <p className="text-xs text-[#878787]">
                Number of participants who have cracked each puzzle and verified presenter passcodes
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-[#F8FAFA] px-2.5 py-1 rounded-lg border text-slate-600">
              Vault Padlock: <strong className="text-[#009488] font-black">2 - 3 - 7 - 4</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { stop: 1, name: 'Governance', puzzle: 'PUZZLE_1', code: 'CODE_1', word: 'GOVERNANCE', digit: '2' },
              { stop: 2, name: 'Data Lake', puzzle: 'PUZZLE_2', code: 'CODE_2', word: 'LAKEHOUSE', digit: '3' },
              { stop: 3, name: 'Marketplace', puzzle: 'PUZZLE_3', code: 'CODE_3', word: 'MARKETPLACE', digit: '7' },
              { stop: 4, name: 'Quality', puzzle: 'PUZZLE_4', code: 'CODE_4', word: 'INTEGRITY', digit: '4' }
            ].map(m => (
              <div key={m.stop} className="p-3.5 rounded-2xl bg-[#F8FAFA] border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[#009488]">Stop {m.stop}: {m.name}</span>
                  <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                    Digit {m.digit}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>🧩 Puzzle Solved:</span>
                    <strong className="text-slate-900 font-mono">{milestoneCounts[m.puzzle] || 0}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>🔑 Code ({m.word}):</span>
                    <strong className="text-slate-900 font-mono">{milestoneCounts[m.code] || 0}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Roster Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
          {/* Action Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F8FAFA]">
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-slate-900 text-base">Participant Roster</h3>
              <span className="bg-teal-50 text-[#009488] px-2 py-0.5 rounded-full text-xs font-bold border border-[#009488]/30">
                {players.length} Players
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player name..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#009488]"
                />
              </div>

              <button
                onClick={fetchDashboard}
                disabled={isLoading}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-[#009488] text-slate-700 active:scale-95 transition-all shadow-2xs"
                title="Refresh Table"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#009488]' : ''}`} />
              </button>

              <button
                onClick={() => setShowResetModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Reset Session</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {filteredPlayers.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No participants matching query</p>
              <p className="text-xs text-slate-400">Players will automatically populate when they join on the welcome screen.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Player Name</th>
                    <th className="py-3 px-4 text-center">Stage</th>
                    <th className="py-3 px-4">Completed Milestones</th>
                    <th className="py-3 px-4 text-center">Last Active</th>
                    <th className="py-3 px-4 text-right">Score</th>
                    <th className="py-3 px-4 w-12 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-black text-xs ${
                          player.rank === 1 ? 'bg-[#F9BD20] text-slate-950' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {player.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">{player.name}</span>
                          <span className="block font-mono text-[10px] text-slate-400">{player.id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {player.is_vault_cracked ? '🎁 Vault' : `Stage ${player.current_stage}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {player.completions.length === 0 ? (
                            <span className="text-slate-400 italic">None yet</span>
                          ) : (
                            player.completions.map((c, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-50 border border-[#009488]/30 text-[#009488] font-mono text-[10px] font-bold"
                                title={`Awarded ${c.points_awarded} pts (${c.rank_order === 1 ? '1st' : `${c.rank_order}th`} solver)`}
                              >
                                {c.milestone_key.startsWith('PUZZLE') ? '🧩' : '🔑'} {c.milestone_key}
                                <span className="text-[#9E6E00]">+{c.points_awarded}</span>
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                        {parseUtcDate(player.last_active).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-black text-base text-[#009488]">
                          {player.total_score}
                        </span>
                        <span className="text-[10px] text-[#9E6E00] font-bold ml-1">PTS</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setPlayerToDelete(player)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title={`Delete ${player.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Single Player Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-slate-900 text-lg">Remove Participant?</h4>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong className="text-slate-900">"{playerToDelete.name}"</strong>? All their milestone completions and rank points will be permanently deleted.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePlayer}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                Delete Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Session Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#009488]/30 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-black text-slate-900 text-lg">Reset Session Leaderboard</h4>
              <p className="text-xs text-slate-600">
                Choose the reset level for this ABN AMRO treasure hunt session:
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleResetSession(false)}
                className="w-full p-3.5 rounded-2xl bg-[#F8FAFA] hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-all group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900">
                  Option A: Reset Scores & Milestones Only
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Retains player names/logins, but wipes all scores to 0 and resets everybody to Stage 1.
                </div>
              </button>

              <button
                onClick={() => handleResetSession(true)}
                className="w-full p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100 border border-rose-200 text-left transition-all group"
              >
                <div className="font-bold text-xs text-rose-700">
                  Option B: Complete Factory Wipe (Fresh Session)
                </div>
                <div className="text-[11px] text-rose-600/80 mt-0.5">
                  Permanently deletes ALL player accounts, completions, and scores. Ideal for a brand-new visit group.
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowResetModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Cancel / Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 px-4 border-t border-slate-200 bg-white text-center text-xs text-[#878787]">
        ABN AMRO Data & Analytics • Facilitator Operations Console
      </footer>
    </div>
  );
}

