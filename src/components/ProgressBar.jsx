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
      <div className="flex items-center justify-between text-xs text-[#878787] mb-1.5 px-1">
        <span className="font-semibold uppercase tracking-wider text-slate-200">
          Expedition Path
        </span>
        <span className="font-mono text-[#F9BD20] font-bold">
          Stop {Math.min(currentStage, totalTeams)} of {totalTeams}
        </span>
      </div>

      {/* Steps Row */}
      <div className="flex items-center justify-between relative">
        {/* Continuous connector line behind nodes */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-[#073632] -z-0" />

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
                    ? 'bg-[#009488] text-white shadow-md shadow-[#009488]/40'
                    : isCurrent
                    ? 'bg-[#F9BD20] text-slate-950 ring-4 ring-[#F9BD20]/30 shadow-lg shadow-[#F9BD20]/50 animate-pulse font-extrabold'
                    : 'bg-[#04211E] text-[#878787] border border-[#009488]/30'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <span>{stageId}</span>
                ) : (
                  <Lock className="w-3 h-3 text-[#878787]" />
                )}
              </div>

              <span
                className={`text-[9px] font-medium mt-1 truncate max-w-[56px] text-center ${
                  isCurrent
                    ? 'text-[#F9BD20] font-bold'
                    : isDone
                    ? 'text-[#00B3A4]'
                    : 'text-[#878787]'
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
                ? 'bg-[#F9BD20] text-slate-950 font-black ring-4 ring-[#F9BD20]/40 shadow-lg shadow-[#F9BD20]/60'
                : 'bg-[#04211E] text-[#878787] border border-[#009488]/30'
            }`}
          >
            🎁
          </div>
          <span className="text-[9px] font-bold mt-1 text-[#F9BD20]">
            Safe
          </span>
        </button>
      </div>
    </div>
  );
}
