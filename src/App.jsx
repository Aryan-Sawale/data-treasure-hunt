import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VaultHud from './components/VaultHud';
import ProgressBar from './components/ProgressBar';
import WelcomeScreen from './components/WelcomeScreen';
import PuzzleContainer from './components/PuzzleContainer';
import TeamPresentationCard from './components/TeamPresentationCard';
import VaultScreen from './components/VaultScreen';
import FacilitatorModal from './components/FacilitatorModal';
import LeaderboardModal from './components/LeaderboardModal';
import PublicLeaderboard from './components/PublicLeaderboard';
import AdminDashboard from './components/AdminDashboard';
import { QUEST_CONFIG, isDevHelperEnabled } from './config/questConfig';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';
import { apiService, getPlayerName } from './services/apiService';
import { Trophy, Sparkles } from 'lucide-react';

const getInitialRoute = () => {
  if (typeof window === 'undefined') return 'quest';
  const path = (window.location.pathname || '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();

  if (path.includes('/leaderboard') || hash.includes('leaderboard')) {
    return 'leaderboard';
  }
  if (path.includes('/admin') || hash.includes('admin')) {
    return 'admin';
  }
  return 'quest';
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [state, setState] = useState(() => storageService.loadState());
  const [isMuted, setIsMuted] = useState(() => soundService.isMuted());
  const [isFacilitatorOpen, setIsFacilitatorOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [playerRank, setPlayerRank] = useState(null);
  const [scoreToast, setScoreToast] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  const totalTeams = QUEST_CONFIG.teams.length;
  const vaultStage = totalTeams + 1; // Stage 5 is Vault

  // Listen for browser navigation (popstate and hashchange)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getInitialRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route) => {
    if (route === 'leaderboard') {
      window.location.hash = 'leaderboard';
      setCurrentRoute('leaderboard');
    } else if (route === 'admin') {
      window.location.hash = 'admin';
      setCurrentRoute('admin');
    } else {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
      setCurrentRoute('quest');
    }
  };

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    storageService.saveState(state);
  }, [state]);

  // Initial sync & proactive health check with backend
  useEffect(() => {
    // 1. Health check to test connectivity
    apiService.checkHealth().then(status => {
      setIsBackendOnline(status.online);
    });

    // 2. Initial player sync
    const existingName = getPlayerName();
    if (existingName) {
      apiService.joinGame(existingName).then((res) => {
        if (res.player) {
          setPlayerScore(res.player.total_score || 0);
          setPlayerRank(res.player.rank || 1);
        }
      });
    }

    // 3. Periodic rank and score polling every 8 seconds
    const interval = setInterval(() => {
      const name = getPlayerName();
      if (name) {
        apiService.getPlayer().then(player => {
          if (player) {
            setPlayerScore(player.total_score);
            setPlayerRank(player.rank);
          }
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const handleStartQuest = async (name) => {
    // Register/sync with backend
    const res = await apiService.joinGame(name);
    if (res.player) {
      setPlayerScore(res.player.total_score || 0);
      setPlayerRank(res.player.rank || 1);
    }

    setState(prev => ({
      ...prev,
      stage: 1,
      step: 'PUZZLE'
    }));
  };

  // Called when a team's puzzle is solved
  const handlePuzzleSolved = async () => {
    const currentTeamId = state.stage;

    // Award competitive rank-based points
    const milestoneKey = `PUZZLE_${currentTeamId}`;
    const res = await apiService.completeMilestone(milestoneKey, currentTeamId);

    if (res.pointsAwarded > 0) {
      setPlayerScore(res.totalScore);
      setScoreToast({
        points: res.pointsAwarded,
        rank: res.rankOrder,
        title: `Stop #${currentTeamId} Puzzle Solved`
      });
      setTimeout(() => setScoreToast(null), 3500);
    }

    setState(prev => ({
      ...prev,
      step: 'TEAM_REVEALED',
      solvedPuzzles: Array.from(new Set([...prev.solvedPuzzles, currentTeamId]))
    }));
  };

  // Called when a presentation is verified
  const handleVerifyPresentation = async (teamId, digitIndex, digitChar) => {
    // Award competitive rank-based points
    const milestoneKey = `CODE_${teamId}`;
    const res = await apiService.completeMilestone(milestoneKey, teamId);

    if (res.pointsAwarded > 0) {
      setPlayerScore(res.totalScore);
      setScoreToast({
        points: res.pointsAwarded,
        rank: res.rankOrder,
        title: `Stop #${teamId} Code Verified`
      });
      setTimeout(() => setScoreToast(null), 3500);
    }

    setState(prev => {
      const nextUnlocked = { ...prev.unlockedDigits };
      if (digitIndex !== null && digitIndex !== undefined && digitChar) {
        nextUnlocked[digitIndex] = digitChar;
      }
      return {
        ...prev,
        verifiedPresentations: Array.from(new Set([...prev.verifiedPresentations, teamId])),
        unlockedDigits: nextUnlocked
      };
    });
  };

  // Move from presentation to next team's puzzle or vault
  const handleProceedToNext = () => {
    if (state.stage < totalTeams) {
      setState(prev => ({
        ...prev,
        stage: prev.stage + 1,
        step: 'PUZZLE'
      }));
    } else {
      // All 4 teams completed! Proceed to Vault
      apiService.completeMilestone('VAULT_UNLOCKED', vaultStage, true);
      setState(prev => ({
        ...prev,
        stage: vaultStage,
        step: 'VAULT',
        isVaultCracked: true
      }));
    }
  };

  // User clicked on a progress bar stage
  const handleSelectStage = (targetStage) => {
    if (targetStage === vaultStage) {
      setState(prev => ({ ...prev, stage: vaultStage, step: 'VAULT', isVaultCracked: true }));
      return;
    }

    const isSolved = state.solvedPuzzles.includes(targetStage);
    const isVerified = state.verifiedPresentations.includes(targetStage);

    setState(prev => ({
      ...prev,
      stage: targetStage,
      step: isVerified || isSolved ? 'TEAM_REVEALED' : 'PUZZLE'
    }));
  };

  // Reset entire quest
  const handleResetQuest = () => {
    const reset = storageService.clearState();
    setState(reset);
    setPlayerScore(0);
    setPlayerRank(1);
  };

  // Facilitator overrides
  const handleUpdateVaultCode = (newCode) => {
    setState(prev => {
      const updatedDigits = {};
      Object.keys(prev.unlockedDigits).forEach(idx => {
        updatedDigits[idx] = newCode[parseInt(idx)];
      });

      return {
        ...prev,
        vaultCode: newCode,
        unlockedDigits: updatedDigits
      };
    });
  };

  const handleJumpToStage = (targetStage, stepType) => {
    setState(prev => ({
      ...prev,
      stage: targetStage,
      step: stepType === 'WELCOME' ? 'PUZZLE' : stepType,
      isVaultCracked: targetStage === vaultStage ? true : prev.isVaultCracked
    }));
    setIsFacilitatorOpen(false);
  };

  // Route: Public Standalone Leaderboard
  if (currentRoute === 'leaderboard') {
    return (
      <PublicLeaderboard
        onNavigateHome={() => navigateTo('quest')}
      />
    );
  }

  // Route: Facilitator Admin Dashboard
  if (currentRoute === 'admin') {
    return (
      <AdminDashboard
        onNavigateHome={() => navigateTo('quest')}
        onNavigateLeaderboard={() => navigateTo('leaderboard')}
      />
    );
  }

  const currentTeam = QUEST_CONFIG.teams.find(t => t.id === state.stage);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-800 flex flex-col justify-between selection:bg-[#009488] selection:text-white relative">
      {/* Real-time Floating Score Toast (Bottom-centered, flexbox aligned, zero clipping) */}
      {scoreToast && (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto bg-[#009488] text-white px-3.5 py-2 rounded-2xl shadow-2xl flex items-center space-x-2.5 border-2 border-[#F9BD20] animate-bounce max-w-[92vw] sm:max-w-md">
            <div className="w-7 h-7 rounded-lg bg-[#F9BD20] text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span className="font-mono font-black text-sm text-[#F9BD20]">
                  +{scoreToast.points} PTS!
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-black whitespace-nowrap">
                  {scoreToast.rank === 1 ? '🥇 1st Solver!' : scoreToast.rank === 2 ? '🥈 2nd Solver!' : scoreToast.rank === 3 ? '🥉 3rd Solver!' : 'Solved!'}
                </span>
              </div>
              <p className="text-[10px] text-white/90 font-medium truncate max-w-[210px] sm:max-w-xs">
                {scoreToast.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* App Header */}
      <Header
        stage={state.stage}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenFacilitator={() => setIsFacilitatorOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        playerScore={playerScore}
        playerRank={playerRank}
        vaultUnlocked={state.isVaultCracked}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {state.stage === 0 ? (
          <WelcomeScreen onStart={handleStartQuest} />
        ) : (
          <>
            {/* Top Vault Lock HUD */}
            <VaultHud
              unlockedDigits={state.unlockedDigits}
              vaultCode={state.vaultCode}
              onOpenVaultPreview={() => handleSelectStage(vaultStage)}
            />

            {/* Gamified Stage Path Progress Bar */}
            <ProgressBar
              currentStage={state.stage}
              completedPresentations={state.verifiedPresentations}
              solvedPuzzles={state.solvedPuzzles}
              onSelectStage={handleSelectStage}
            />

            {/* Screen Content based on Stage & Step */}
            {state.stage >= 1 && state.stage <= totalTeams && (
              <>
                {state.step === 'PUZZLE' ? (
                  <PuzzleContainer
                    currentStage={state.stage}
                    onPuzzleSolved={handlePuzzleSolved}
                  />
                ) : (
                  <TeamPresentationCard
                    team={currentTeam}
                    vaultCode={state.vaultCode}
                    isPresentationDone={state.verifiedPresentations.includes(state.stage)}
                    onVerifyPresentation={handleVerifyPresentation}
                    onProceedToNext={handleProceedToNext}
                  />
                )}
              </>
            )}

            {/* Final Vault Screen (Congratulations & Master Padlock Code) */}
            {state.stage === vaultStage && (
              <VaultScreen
                vaultCode={state.vaultCode}
                playerScore={playerScore}
                playerRank={playerRank}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onResetQuest={handleResetQuest}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Branding with Quick Links */}
      <footer className="py-3 px-4 border-t border-[#009488]/15 bg-[#F8FAFA] text-center text-[11px] text-[#878787]">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p>ABN AMRO Data & Analytics • Client Quest</p>
          <div className="flex items-center space-x-3 text-[10px]">
            <button
              onClick={() => navigateTo('leaderboard')}
              className="hover:text-[#009488] font-bold underline"
            >
              Leaderboard
            </button>
            {isDevHelperEnabled() && (
              <>
                <span>•</span>
                <button
                  onClick={() => navigateTo('admin')}
                  className="hover:text-[#009488] font-bold"
                >
                  Facilitator
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Facilitator / Host Settings Modal */}
      <FacilitatorModal
        isOpen={isFacilitatorOpen}
        onClose={() => setIsFacilitatorOpen(false)}
        currentStage={state.stage}
        vaultCode={state.vaultCode}
        onUpdateVaultCode={handleUpdateVaultCode}
        onJumpToStage={handleJumpToStage}
        onReset={handleResetQuest}
        onOpenAdmin={() => navigateTo('admin')}
      />

      {/* Live Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onOpenFullscreen={() => navigateTo('leaderboard')}
      />
    </div>
  );
}
