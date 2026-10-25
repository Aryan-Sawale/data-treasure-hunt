import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Lightbulb, Coffee, Calendar, DollarSign, Hotel, Mail, Users, Sparkles } from 'lucide-react';
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

export default function Puzzle2Quality({ onSolved }) {
  const [cleansedIds, setCleansedIds] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalCorrupted = BUSINESS_RECORDS.filter(r => r.isCorrupted).length; // 3
  const cleansedCount = cleansedIds.length;
  const integrityScore = Math.min(100, Math.round(40 + (cleansedCount / totalCorrupted) * 60));

  const handleRecordClick = (record) => {
    if (cleansedIds.includes(record.id) || isSuccess) return;

    if (record.isCorrupted) {
      soundService.playSuccess();
      hapticService.success();
      setWrongId(null);

      const next = [...cleansedIds, record.id];
      setCleansedIds(next);

      if (next.length === totalCorrupted) {
        setIsSuccess(true);
        setTimeout(() => {
          onSolved();
        }, 1200);
      }
    } else {
      soundService.playError();
      hapticService.error();
      setWrongId(record.id);
      setTimeout(() => setWrongId(null), 800);
    }
  };

  const handleHint = () => {
    soundService.playSuccess();
    hapticService.medium();
    setShowHint(true);
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const all = BUSINESS_RECORDS.filter(r => r.isCorrupted).map(r => r.id);
    setCleansedIds(all);
    setIsSuccess(true);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-3.5">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Data Quality Audit
          </h3>
          <p className="text-xs text-[#878787]">
            Tap the 3 records with obvious business errors to cleanse the feed.
          </p>
        </div>
        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-[#F0FDF4] text-[#009488] border border-[#009488]/30">
          {cleansedCount}/{totalCorrupted} Cleansed
        </span>
      </div>

      {/* Real-time Data Integrity Meter */}
      <div className="bg-[#F8FAFA] p-2.5 rounded-2xl border border-slate-200 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold">
          <span className="text-slate-600">DATASET HEALTH SCORE</span>
          <span className={integrityScore === 100 ? 'text-[#009488] font-black animate-pulse' : 'text-[#9E6E00]'}>
            {integrityScore}% {integrityScore === 100 ? '• 100% CERTIFIED' : '• DEFECTS DETECTED'}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-[#009488] transition-all duration-500"
            style={{ width: `${integrityScore}%` }}
          />
        </div>
      </div>

      {/* 6 Business Records List */}
      <div className="space-y-2">
        {BUSINESS_RECORDS.map((rec) => {
          const isCleansed = cleansedIds.includes(rec.id);
          const isWrong = wrongId === rec.id;
          const isHighlightedHint = showHint && rec.isCorrupted && !isCleansed;
          const Icon = rec.icon;

          return (
            <div
              key={rec.id}
              onClick={() => handleRecordClick(rec)}
              className={`p-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-[0.99] flex items-center justify-between shadow-xs ${
                isCleansed
                  ? 'bg-[#F0FDF4] border-[#009488]/50 shadow-xs'
                  : isWrong
                  ? 'bg-rose-50 border-rose-300 animate-shake'
                  : isHighlightedHint
                  ? 'bg-[#FFFDF5] border-[#F9BD20] ring-2 ring-[#F9BD20]/40'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Record Left Info */}
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isCleansed ? 'bg-[#009488]/15 text-[#009488]' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-900 leading-tight">
                      {rec.label}
                    </span>
                    {isCleansed && (
                      <span className="text-[9px] font-black uppercase text-[#009488] bg-[#009488]/10 px-1.5 py-0.2 rounded">
                        Cleaned
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                    {isCleansed ? (
                      <span className="text-[#009488] font-bold">{rec.errorReason}</span>
                    ) : (
                      <span>{rec.detail} • <span className="font-mono text-slate-500 text-[10px]">{rec.account}</span></span>
                    )}
                  </p>
                </div>
              </div>

              {/* Record Right Amount / Status */}
              <div className="text-right shrink-0 ml-2">
                <span className={`font-mono text-xs font-black ${
                  isCleansed
                    ? 'text-[#009488] line-through opacity-70'
                    : rec.isCorrupted
                    ? 'text-slate-900'
                    : 'text-slate-900'
                }`}>
                  {rec.amount}
                </span>
                {isCleansed && (
                  <CheckCircle2 className="w-4 h-4 text-[#009488] ml-auto mt-0.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls & Actions */}
      {isDevHelperEnabled() && (
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={handleHint}
          disabled={isSuccess || showHint}
          className="flex items-center space-x-1.5 text-[#9E6E00] hover:text-[#B45309] px-3 py-1.5 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/60 active:scale-95 transition-all shadow-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>{showHint ? "Hint: Highlighted" : "Hint"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline font-medium"
        >
          Auto Cleanse
        </button>
      </div>
      )}

      {isDevHelperEnabled() && showHint && (
        <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700 animate-fade-in space-y-1">
          <p className="font-bold text-[#9E6E00]">💡 Obvious Error Clues:</p>
          <p className="text-slate-600 text-[11px]">
            1. February 31st date • 2. Negative transfer (-€85k) • 3. Invalid email with triple @@@!
          </p>
        </div>
      )}

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">100% Data Asset Health Restored!</h4>
          <p className="text-[11px] text-slate-600">Enterprise Data Assets & Quality (House Slytherin) Unlocked</p>
        </div>
      )}
    </div>
  );
}
