import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Lightbulb, Coffee, Calendar, DollarSign, Hotel, Mail, Users, Check } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { isDevHelperEnabled } from '../../config/questConfig';
import { hapticService } from '../../services/hapticService';

const BUSINESS_RECORDS = [
  {
    id: 'rec-1',
    label: 'Client Coffee Meeting',
    account: 'NL91 ABNA 0417',
    detail: 'Receipt: 14:15 CET',
    amount: '€12.50',
    icon: Coffee,
    isCorrupted: false
  },
  {
    id: 'rec-2',
    label: 'Office Lease Invoice',
    account: 'NL22 INGB 0123',
    detail: 'Due Date: 31-Feb-2026',
    amount: '€4,200.00',
    icon: Calendar,
    isCorrupted: true,
    errorReason: 'Calendar Error: February 31st does not exist!'
  },
  {
    id: 'rec-3',
    label: 'Corporate Wire Transfer',
    account: 'NL55 RABO 0984',
    detail: 'SEPA Outgoing Payment',
    amount: '-€85,000.00',
    icon: DollarSign,
    isCorrupted: true,
    errorReason: 'Balance Error: Outgoing payment cannot be negative!'
  },
  {
    id: 'rec-4',
    label: 'Business Travel Hotel',
    account: 'NL88 ABNA 0551',
    detail: 'Amsterdam Schiphol Stay',
    amount: '€185.00',
    icon: Hotel,
    isCorrupted: false
  },
  {
    id: 'rec-5',
    label: 'Client Advisory Notice',
    account: 'NL12 SNSB 0772',
    detail: 'Email: sarah@@@abnamro...',
    amount: '€0.00',
    icon: Mail,
    isCorrupted: true,
    errorReason: 'Syntax Error: Invalid email with triple @@@!'
  },
  {
    id: 'rec-6',
    label: 'Monthly Staff Payroll',
    account: 'NL33 TRIO 0883',
    detail: 'Direct Deposit Transfer',
    amount: '€3,450.00',
    icon: Users,
    isCorrupted: false
  }
];

export default function Puzzle2Quality({ onSolved, onPenalty }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const totalRequired = 3;

  // Toggle selection on card click (no immediate correctness feedback)
  const handleToggleSelect = (recordId) => {
    if (isSuccess) return;
    soundService.playDialTick();
    hapticService.light();
    setErrorMsg(null);

    setSelectedIds(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        if (prev.length >= totalRequired) {
          // Replace oldest selection or prevent more than 3
          return [...prev.slice(1), recordId];
        }
        return [...prev, recordId];
      }
    });
  };

  // Submit Audit button
  const handleSubmitAudit = () => {
    if (isSuccess || selectedIds.length !== totalRequired) return;

    // Check if all selected records are corrupted
    const corruptedIds = BUSINESS_RECORDS.filter(r => r.isCorrupted).map(r => r.id);
    const allCorrect = selectedIds.length === 3 && selectedIds.every(id => corruptedIds.includes(id));

    if (allCorrect) {
      setIsSuccess(true);
      setErrorMsg(null);
      soundService.playSuccess();
      hapticService.success();
      setTimeout(() => {
        onSolved();
      }, 1500);
    } else {
      soundService.playError();
      hapticService.error();
      setErrorMsg('Audit Failed (-5 pts): Selected records include valid transactions. Find all 3 business anomalies and try again!');
      if (onPenalty) {
        onPenalty(5, 'Failed Data Audit');
      }
    }
  };

  const handleAutoSolve = () => {
    const corruptedIds = BUSINESS_RECORDS.filter(r => r.isCorrupted).map(r => r.id);
    setSelectedIds(corruptedIds);
    setIsSuccess(true);
    setErrorMsg(null);
    soundService.playSuccess();
    hapticService.medium();
    setTimeout(() => {
      onSolved();
    }, 1200);
  };

  return (
    <div className="space-y-3.5">
      {/* Challenge Header & Concise Prompt (Emoji Puzzle Style) */}
      <div className="bg-[#FFFDF5] p-3.5 rounded-2xl border-2 border-[#F9BD20]/70 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-[#9E6E00]">
            Challenge 3 of 4
          </span>
          <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-[#F0FDF4] border border-[#009488]/30 text-[#009488]">
            {selectedIds.length}/{totalRequired} Selected
          </span>
        </div>

        {/* Larger Font, Green Brand Color with Icon */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-xl font-black text-[#009488] leading-tight flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span>Data Quality Audit</span>
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Select the 3 corrupted records and submit.
          </p>
        </div>
      </div>

      {/* Grid of Business Records */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {BUSINESS_RECORDS.map((record) => {
          const isSelected = selectedIds.includes(record.id);
          const Icon = record.icon;

          return (
            <div
              key={record.id}
              onClick={() => handleToggleSelect(record.id)}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative select-none active:scale-[0.98] ${
                isSuccess && record.isCorrupted
                  ? 'bg-[#F0FDF4] border-[#009488] shadow-sm'
                  : isSuccess && !record.isCorrupted
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : isSelected
                  ? 'bg-[#FFFDF5] border-[#F9BD20] ring-2 ring-[#F9BD20]/40 shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? 'bg-[#F9BD20]/20 border-[#F9BD20] text-[#9E6E00]'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {record.label}
                    </h4>
                    <p className="text-xs font-mono font-bold text-slate-500 truncate">
                      {record.account}
                    </p>
                  </div>
                </div>

                {/* Selection Checkbox Pill */}
                <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                  isSuccess && record.isCorrupted
                    ? 'bg-[#009488] border-[#009488] text-white'
                    : isSelected
                    ? 'bg-[#F9BD20] border-[#F9BD20] text-slate-950 font-black'
                    : 'bg-white border-slate-300'
                }`}>
                  {(isSelected || (isSuccess && record.isCorrupted)) && (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                </div>
              </div>

              {/* Record Metadata & Value */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-xs text-slate-600 font-semibold">
                  {record.detail}
                </span>
                <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                  {record.amount}
                </span>
              </div>

              {/* Error Explanation Reveal (Shown ONLY after successful submit) */}
              {isSuccess && record.isCorrupted && (
                <div className="mt-2 p-2 rounded-xl bg-teal-100/60 border border-[#009488]/40 text-xs text-[#007066] font-bold animate-fade-in flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{record.errorReason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Submit Audit Button */}
      <button
        onClick={handleSubmitAudit}
        disabled={isSuccess || selectedIds.length !== totalRequired}
        className="w-full py-3.5 px-4 rounded-xl bg-[#009488] hover:bg-[#007E74] disabled:opacity-40 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md shadow-[#009488]/20 border-b-4 border-[#006E64] active:scale-[0.98] transition-all"
      >
        <ShieldCheck className="w-4 h-4 text-[#F9BD20]" />
        <span>
          {selectedIds.length === totalRequired
            ? 'Submit Audit (3 Records Selected)'
            : `Select ${totalRequired - selectedIds.length} More Record${totalRequired - selectedIds.length === 1 ? '' : 's'}`}
        </span>
      </button>

      {/* Controls & Actions */}
      {isDevHelperEnabled() && (
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center space-x-1 text-[#878787] hover:text-[#B45309]"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
            <span>{showHint ? 'Hide Hint' : 'Inspection Clue'}</span>
          </button>

          <button
            onClick={() => onSolved()}
            className="text-xs font-black bg-amber-400 hover:bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            ⚡ Quick Complete ➔
          </button>
        </div>
      )}

      {isDevHelperEnabled() && showHint && (
        <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700 space-y-1">
          <p className="font-bold text-[#9E6E00]">Data Observability Rules:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
            <li>Check for calendar integrity (February never has 31 days).</li>
            <li>Outbound financial transfers cannot carry negative value.</li>
            <li>Email addresses cannot contain consecutive duplicate @@ symbols.</li>
          </ul>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">All 3 Corrupted Records Cleansed!</h4>
          <p className="text-[11px] text-slate-600">Stop 3: Enterprise Data Assets & Data Quality (House Gryffindor) Unlocked</p>
        </div>
      )}
    </div>
  );
}
