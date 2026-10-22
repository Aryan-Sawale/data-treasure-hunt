import React, { useState } from 'react';
import { X, Key, RefreshCw, Check, Shield } from 'lucide-react';
import { QUEST_CONFIG } from '../config/questConfig';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export default function FacilitatorModal({
  isOpen,
  onClose,
  currentStage,
  vaultCode,
  onUpdateVaultCode,
  onJumpToStage,
  onReset
}) {
  const [codeDraft, setCodeDraft] = useState(vaultCode);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const vaultStage = QUEST_CONFIG.teams.length + 1;

  if (!isOpen) return null;

  const handleSaveCode = () => {
    if (codeDraft.length === 4 && /^\d+$/.test(codeDraft)) {
      soundService.playSuccess();
      hapticService.success();
      onUpdateVaultCode(codeDraft);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    } else {
      soundService.playError();
      hapticService.error();
      alert("Combination must be exactly 4 numeric digits (e.g. 7394)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#04211E] border border-[#009488]/40 p-5 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#009488]/20">
          <div className="flex items-center space-x-2 text-white">
            <Shield className="w-4 h-4 text-[#F9BD20]" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">
              Facilitator / Host Panel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#878787] hover:text-white hover:bg-[#073632] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Change Physical Safe Code */}
        <div className="bg-[#021715] p-3 rounded-2xl border border-[#009488]/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#F9BD20]" />
              Physical 4-Digit Padlock Code
            </span>
            <span className="text-[10px] text-[#878787]">Match your box</span>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              maxLength={4}
              value={codeDraft}
              onChange={(e) => setCodeDraft(e.target.value.replace(/\D/g, ''))}
              placeholder="4-digit code"
              className="w-24 bg-[#052623] border border-[#009488]/40 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold text-[#F9BD20] tracking-widest focus:outline-none focus:border-[#F9BD20]"
            />
            <button
              onClick={handleSaveCode}
              className="flex-1 py-2 px-3 rounded-xl bg-[#009488] hover:bg-[#00B3A4] text-white font-bold text-xs active:scale-95 transition-all"
            >
              Update Safe Code
            </button>
          </div>

          {showSavedToast && (
            <p className="text-[11px] text-[#00B3A4] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Safe code updated to {codeDraft}!
            </p>
          )}
        </div>

        {/* 2. Jump to Any Stage (For Demo / Rehearsals) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#878787] block px-1">
            Jump to Stage (Demo Mode)
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onJumpToStage(0, 'WELCOME')}
              className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                currentStage === 0
                  ? 'bg-[#009488]/30 border-[#009488] text-[#F9BD20]'
                  : 'bg-[#021715] border-[#009488]/20 text-[#878787] hover:text-white'
              }`}
            >
              0. Welcome Brief
            </button>
            {QUEST_CONFIG.teams.map((t) => (
              <button
                key={t.id}
                onClick={() => onJumpToStage(t.id, 'PUZZLE')}
                className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all truncate ${
                  currentStage === t.id
                    ? 'bg-[#009488]/30 border-[#009488] text-[#F9BD20]'
                    : 'bg-[#021715] border-[#009488]/20 text-[#878787] hover:text-white'
                }`}
              >
                {t.id}. {t.room.replace('House ', '')}
              </button>
            ))}
            <button
              onClick={() => onJumpToStage(vaultStage, 'VAULT')}
              className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                currentStage === vaultStage
                  ? 'bg-[#F9BD20]/25 border-[#F9BD20] text-[#F9BD20]'
                  : 'bg-[#021715] border-[#009488]/20 text-[#F9BD20] hover:text-[#FCD34D]'
              }`}
            >
              🎁 Physical Vault
            </button>
          </div>
        </div>

        {/* 3. Team Secret Words Cheat Sheet */}
        <div className="bg-[#021715] p-3 rounded-2xl border border-[#009488]/30 space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#878787] block">
            Presenter Secret Passcodes:
          </span>
          <div className="space-y-1 text-xs font-mono">
            {QUEST_CONFIG.teams.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-slate-300 py-0.5 border-b border-[#009488]/15 last:border-0">
                <span className="text-[#878787]">{t.room}:</span>
                <span className="font-bold text-[#F9BD20]">{t.presentationSecretCode}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Reset Button */}
        <button
          onClick={() => {
            if (confirm("Reset game progress back to the beginning?")) {
              onReset();
              onClose();
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset All Progress (New Visit)</span>
        </button>
      </div>
    </div>
  );
}
