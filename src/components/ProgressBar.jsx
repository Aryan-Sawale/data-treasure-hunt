import React from 'react';
import { Check, Lock } from 'lucide-react';
import { QUEST_CONFIG } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function ProgressBar({
  currentStage,
  completedPresentations = [],
  solvedPuzzles = [],
  onSelectStage
}) {
  const teams = QUEST_CONFIG.teams;
  const totalTeams = teams.length;
  const vaultStage = totalTeams + 1;

  const handleStageClick = (stageId) => {
    if (stageId <= currentStage) {
      soundService.playClick();
      hapticService.light();
      if (onSelectStage) {
        onSelectStage(stageId);
      }
    }
  };

  const teamDisplayNames = {
    1: 'Marketplace',
    2: 'Data Lake',
    3: 'Quality',
    4: 'Lineage'
  };

  return (
    <div className="mx-4 mt-3 mb-2">
      <div className="flex items-center justify-between text-xs mb-1.5 px-1">
        <span className="font-bold uppercase tracking-wider text-[#009488]">
          Expedition Path
        </span>
        <span className="font-mono text-xs font-black bg-[#F9BD20] text-slate-950 px-2 py-0.5 rounded shadow-xs">
          Stop {Math.min(currentStage, totalTeams)} of {totalTeams}
        </span>
      </div>

      {/* Steps Row */}
      <div className="flex items-center justify-between relative">
        {/* Continuous connector line behind nodes */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 -z-0" />

        {teams.map((team) => {
          const stageId = team.id;
          const isDone = completedPresentations.includes(stageId);
          const isSolved = solvedPuzzles.includes(stageId);
          const isCurrent = currentStage === stageId;
          const isLocked = stageId > currentStage;
          const isRevealed = isSolved || isDone;

          const label = isRevealed ? (teamDisplayNames[stageId] || team.shortName) : `Stop ${stageId}`;

          return (
            <button
              key={team.id}
              onClick={() => handleStageClick(stageId)}
              disabled={isLocked}
              className={`relative z-10 flex flex-col items-center group focus:outline-none transition-all ${
                isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-95'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? 'bg-[#009488] text-white shadow-md shadow-[#009488]/30'
                    : isCurrent
                    ? 'bg-[#F9BD20] text-slate-950 ring-4 ring-[#F9BD20]/40 shadow-lg shadow-[#F9BD20]/50 animate-pulse font-black'
                    : isRevealed
                    ? 'bg-[#F0FDF4] text-[#009488] border-2 border-[#009488]'
                    : 'bg-[#F8FAFA] text-[#878787] border border-slate-300'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span className="text-sm font-black">{stageId}</span>
                ) : isRevealed ? (
                  <span className="text-xs">{team.badge}</span>
                ) : (
                  <Lock className="w-3 h-3 text-[#878787]" />
                )}
              </div>

              <span
                className={`text-[9px] font-medium mt-1 truncate max-w-[58px] text-center transition-all ${
                  isCurrent
                    ? 'text-[#B45309] font-black'
                    : isRevealed
                    ? 'text-[#009488] font-bold'
                    : 'text-[#878787]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* Vault Finish Node */}
        <button
          onClick={() => handleStageClick(vaultStage)}
          disabled={currentStage < vaultStage && completedPresentations.length < totalTeams}
          className={`relative z-10 flex flex-col items-center transition-all ${
            completedPresentations.length >= totalTeams
              ? 'cursor-pointer active:scale-95'
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
              currentStage >= vaultStage || completedPresentations.length >= totalTeams
                ? 'bg-[#F9BD20] text-slate-950 font-black ring-4 ring-[#F9BD20]/50 shadow-lg shadow-[#F9BD20]/60'
                : 'bg-[#F8FAFA] text-[#878787] border border-slate-300'
            }`}
          >
            🌐
          </div>
          <span className="text-[9px] font-black mt-1 text-[#B45309]">
            Sphere
          </span>
        </button>
      </div>
    </div>
  );
}
