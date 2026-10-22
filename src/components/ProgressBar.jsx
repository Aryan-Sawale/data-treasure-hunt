import React from 'react';
import { Check, Lock } from 'lucide-react';
import { QUEST_CONFIG } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function ProgressBar({
  currentStage,
  completedPresentations,
  onSelectStage
}) {
  const teams = QUEST_CONFIG.teams;
  const totalTeams = teams.length;
  const vaultStage = totalTeams + 1;

  const handleStageClick = (stageId) => {
    // Only allow clicking on completed stages or the current stage
    if (stageId <= currentStage) {
      soundService.playClick();
      hapticService.light();
      if (onSelectStage) {
        onSelectStage(stageId);
      }
    }
  };

  return (
    <div className="mx-4 mt-3 mb-2">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 px-1">
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          Expedition Path
        </span>
        <span className="font-mono text-amber-400">
          Stop {Math.min(currentStage, totalTeams)} of {totalTeams}
        </span>
      </div>

      {/* Steps Row */}
      <div className="flex items-center justify-between relative">
        {/* Continuous connector line behind nodes */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 -z-0" />

        {teams.map((team) => {
          const stageId = team.id;
          const isDone = completedPresentations.includes(stageId);
          const isCurrent = currentStage === stageId;
          const isLocked = stageId > currentStage;

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
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : isCurrent
                    ? 'bg-orange-500 text-white ring-4 ring-orange-500/25 shadow-lg shadow-orange-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span>{stageId}</span>
                ) : (
                  <Lock className="w-3 h-3 text-slate-500" />
                )}
              </div>

              <span
                className={`text-[9px] font-medium mt-1 truncate max-w-[56px] text-center ${
                  isCurrent
                    ? 'text-orange-400 font-bold'
                    : isDone
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                {team.shortName.split(' ')[0]}
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
                ? 'bg-amber-400 text-slate-950 font-bold ring-4 ring-amber-400/30 shadow-lg shadow-amber-400/50'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            🎁
          </div>
          <span className="text-[9px] font-bold mt-1 text-amber-400">
            Safe
          </span>
        </button>
      </div>
    </div>
  );
}
