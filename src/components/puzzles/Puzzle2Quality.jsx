import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb, ShoppingBag, Briefcase, Smartphone, Landmark, RefreshCw } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

const SAMPLE_RECORDS = [
  {
    id: 'TX-1',
    label: 'Albert Heijn PIN',
    detail: 'NL91 ABNA 0417 2348',
    amount: '€45.20',
    isAnomaly: false
  },
  {
    id: 'TX-2',
    label: 'SEPA Transfer',
    detail: 'XX99 FAIL 4040 4012',
    amount: '€1,200.00',
    isAnomaly: true,
    reason: 'Invalid IBAN prefix (XX99)'
  },
  {
    id: 'TX-3',
    label: 'Monthly Salary',
    detail: 'NL22 RABO 0123 9847',
    amount: '€3,450.00',
    isAnomaly: false
  },
  {
    id: 'TX-4',
    label: 'Savings Withdrawal',
    detail: 'NL44 INGB 0671 9283',
    amount: '-€99,999,999',
    isAnomaly: true,
    reason: 'Impossible negative balance'
  },
  {
    id: 'TX-5',
    label: 'Tikkie Split',
    detail: 'NL18 SNSB 0892 1122',
    amount: '€15.00',
    isAnomaly: false
  },
  {
    id: 'TX-6',
    label: 'Mortgage Debit',
    detail: 'Date: 2099-12-31',
    amount: '€850.00',
    isAnomaly: true,
    reason: 'Future timestamp (Year 2099)'
  },
  {
    id: 'TX-7',
    label: 'Foreign FX Swap',
    detail: 'NL55 KNAB 0102 9384',
    amount: 'NaN EUR',
    isAnomaly: true,
    reason: 'Corrupt Null/NaN value'
  }
];

export default function Puzzle2Quality({ onSolved }) {
  const [quarantined, setQuarantined] = useState(new Set());
  const [showHint, setShowHint] = useState(false);
  const [errorFlash, setErrorFlash] = useState(null);

  const totalAnomalies = 4;
  const caughtCount = quarantined.size;

  const handleRowClick = (rec) => {
    if (quarantined.has(rec.id)) return;

    if (rec.isAnomaly) {
      soundService.playSuccess();
      hapticService.success();
      const updated = new Set(quarantined);
      updated.add(rec.id);
      setQuarantined(updated);
      setErrorFlash(null);

      if (updated.size === totalAnomalies) {
        setTimeout(() => {
          onSolved();
        }, 1200);
      }
    } else {
      soundService.playError();
      hapticService.error();
      setErrorFlash(rec.id);
      setTimeout(() => setErrorFlash(null), 800);
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const all = new Set(SAMPLE_RECORDS.filter(r => r.isAnomaly).map(r => r.id));
    setQuarantined(all);
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-3">
      {/* Objective Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-black text-[#009488]">Data Quality Cleanse</h3>
          <p className="text-xs text-[#878787]">
            Find and tap the 4 corrupted transaction records.
          </p>
        </div>
        {/* Visual 4-Pip Counter */}
        <div className="flex items-center gap-1 bg-[#F8FAFA] px-2 py-1 rounded-lg border border-slate-200">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx < caughtCount ? 'bg-[#009488] scale-110' : 'bg-slate-300'
              }`}
            />
          ))}
          <span className="text-[10px] font-mono font-black text-slate-700 ml-1">
            {caughtCount}/4
          </span>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="space-y-2">
        {SAMPLE_RECORDS.map((rec) => {
          const isCaught = quarantined.has(rec.id);
          const isWrong = errorFlash === rec.id;

          return (
            <div
              key={rec.id}
              onClick={() => handleRowClick(rec)}
              className={`p-2.5 px-3 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-[0.99] flex items-center justify-between shadow-xs ${
                isCaught
                  ? 'bg-[#F0FDF4] border-[#009488]/50'
                  : isWrong
                  ? 'bg-amber-50 border-amber-400 animate-shake'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    {rec.label}
                  </span>
                  {isCaught && (
                    <span className="text-[9px] font-black uppercase text-[#009488] bg-[#009488]/10 px-1.5 py-0.2 rounded">
                      Purged
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-[#878787] mt-0.5">
                  {isCaught ? (
                    <span className="text-[#009488] font-sans font-semibold">{rec.reason}</span>
                  ) : (
                    rec.detail
                  )}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className={`font-mono text-xs font-black ${
                  isCaught
                    ? 'text-[#009488] line-through opacity-70'
                    : rec.isAnomaly
                    ? 'text-slate-900'
                    : 'text-slate-900'
                }`}>
                  {rec.amount}
                </span>
                {isCaught && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#009488] ml-auto mt-0.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Success Notification */}
      {caughtCount === totalAnomalies && (
        <div className="p-3 rounded-2xl bg-[#F0FDF4] border-2 border-[#009488] text-center animate-fade-in shadow-md">
          <CheckCircle2 className="w-6 h-6 text-[#009488] mx-auto mb-1 animate-bounce" />
          <h4 className="text-xs font-black text-[#009488]">Data Asset Pipeline Cleaned!</h4>
          <p className="text-[11px] text-slate-600">All corrupted records quarantined & purged</p>
        </div>
      )}

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-[#878787] hover:text-[#009488] px-3 py-1.5 rounded-xl bg-white border border-slate-200 active:scale-95 transition-all shadow-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>{showHint ? "Hide Hint" : "Hint"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline font-medium"
        >
          Auto Cleanse
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F9BD20]/50 text-xs text-slate-700 animate-fade-in space-y-1">
          <p className="font-bold text-[#9E6E00]">💡 Data Quality Clues:</p>
          <p className="text-slate-600 text-[11px]">
            Look for: 1. Non-Dutch IBAN (XX99) • 2. Negative amount (-€99M) • 3. Year 2099 date • 4. NaN EUR
          </p>
        </div>
      )}
    </div>
  );
}
