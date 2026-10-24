import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VaultHud from './components/VaultHud';
import ProgressBar from './components/ProgressBar';
import WelcomeScreen from './components/WelcomeScreen';
import PuzzleContainer from './components/PuzzleContainer';
import TeamPresentationCard from './components/TeamPresentationCard';
import VaultScreen from './components/VaultScreen';
import FacilitatorModal from './components/FacilitatorModal';
import { QUEST_CONFIG } from './config/questConfig';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';

export default function App() {
  const [state, setState] = useState(() => storageService.loadState());
  const [isMuted, setIsMuted] = useState(() => soundService.isMuted());
  const [isFacilitatorOpen, setIsFacilitatorOpen] = useState(false);

  const totalTeams = QUEST_CONFIG.teams.length;
  const vaultStage = totalTeams + 1; // Stage 5 is Vault

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    storageService.saveState(state);
  }, [state]);

  const handleToggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const handleStartQuest = () => {
    setState(prev => ({
      ...prev,
      stage: 1,
      step: 'PUZZLE'
    }));
  };

  // Called when a team's puzzle is solved
  const handlePuzzleSolved = () => {
    const currentTeamId = state.stage;
    setState(prev => ({
      ...prev,
      step: 'TEAM_REVEALED',
      solvedPuzzles: Array.from(new Set([...prev.solvedPuzzles, currentTeamId]))
    }));
  };

  // Called when a presentation is verified
  const handleVerifyPresentation = (teamId, digitIndex, digitChar) => {
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
      setState(prev => ({
        ...prev,
        stage: vaultStage,
        step: 'VAULT'
      }));
    }
  };

  // User clicked on a progress bar stage
  const handleSelectStage = (targetStage) => {
    if (targetStage === vaultStage) {
      setState(prev => ({ ...prev, stage: vaultStage, step: 'VAULT' }));
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

  // Vault cracked handler
  const handleVaultCracked = () => {
    setState(prev => ({
      ...prev,
      isVaultCracked: true
    }));
  };

  // Reset entire quest
  const handleResetQuest = () => {
    const reset = storageService.clearState();
    setState(reset);
  };

  // Facilitator overrides
  const handleUpdateVaultCode = (newCode) => {
    setState(prev => {
      // Re-map unlocked digits according to new code
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
      step: stepType === 'WELCOME' ? 'PUZZLE' : stepType
    }));
    setIsFacilitatorOpen(false);
  };

  const currentTeam = QUEST_CONFIG.teams.find(t => t.id === state.stage);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-800 flex flex-col justify-between selection:bg-[#009488] selection:text-white">
      {/* App Header */}
      <Header
        stage={state.stage}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenFacilitator={() => setIsFacilitatorOpen(true)}
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

            {/* Final Vault Screen */}
            {state.stage === vaultStage && (
              <VaultScreen
                vaultCode={state.vaultCode}
                unlockedDigits={state.unlockedDigits}
                isVaultCracked={state.isVaultCracked}
                onVaultCracked={handleVaultCracked}
                onResetQuest={handleResetQuest}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="py-3 px-4 border-t border-[#009488]/15 bg-[#F8FAFA] text-center text-[11px] text-[#878787]">
        <p>ABN AMRO Data & Analytics Client Quest • Confidential</p>
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
      />
    </div>
  );
}
