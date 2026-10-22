import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb, Search, RefreshCw } from 'lucide-react';
import { soundService } from '../../services/soundService';
import { hapticService } from '../../services/hapticService';

const SAMPLE_RECORDS = [
  {
    id: 'TX-801',
    isAnomaly: false,
    label: 'Albert Heijn PIN',
    iban: 'NL91 ABNA 0417 2348 12',
    amount: '€45.20',
    time: '14:22:10 CET',
    status: 'CLEAN'
  },
  {
    id: 'TX-802',
    isAnomaly: true,
    defect: 'Invalid Country Prefix (Not SEPA/NL)',
    label: 'SEPA Transfer',
    iban: 'XX99 FAIL 4040 4012 99',
    amount: '€1,200.00',
    time: '14:22:15 CET',
    status: 'CORRUPTED'
  },
  {
    id: 'TX-803',
    isAnomaly: false,
    label: 'Monthly Salary Credit',
    iban: 'NL22 RABO 0123 9847 21',
    amount: '€3,450.00',
    time: '14:22:20 CET',
    status: 'CLEAN'
  },
  {
    id: 'TX-804',
    isAnomaly: true,
    defect: 'Buffer Underflow: Negative Balance Overflow',
    label: 'Savings Withdrawal',
    iban: 'NL44 INGB 0671 9283 74',
    amount: '-€99,999,999.00',
    time: '14:22:24 CET',
    status: 'CORRUPTED'
  },
  {
    id: 'TX-805',
    isAnomaly: false,
    label: 'Tikkie Reimbursement',
    iban: 'NL18 SNSB 0892 1122 33',
    amount: '€15.00',
    time: '14:22:28 CET',
    status: 'CLEAN'
  },
  {
    id: 'TX-806',
    isAnomaly: true,
    defect: 'Time Drift: Future Timestamp (Year 2099)',
    label: 'Mortgage Amortization',
    iban: 'NL07 TRIO 0391 8273 64',
    amount: '€850.00',
    time: '2099-12-31 23:59',
    status: 'CORRUPTED'
  },
  {
    id: 'TX-807',
    isAnomaly: true,
    defect: 'Corrupt Float: NaN (Not-a-Number) Null Value',
    label: 'Foreign FX Swap',
    iban: 'NL55 KNAB 0102 9384 75',
    amount: 'NaN EUR',
    time: '14:22:35 CET',
    status: 'CORRUPTED'
  }
];

export default function Puzzle2Quality({ onSolved }) {
  const [quarantined, setQuarantined] = useState(new Set());
  const [showHint, setShowHint] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const totalAnomalies = SAMPLE_RECORDS.filter(r => r.isAnomaly).length; // 4
  const currentCaught = quarantined.size;
  const integrityScore = Math.min(100, Math.round(60 + (currentCaught / totalAnomalies) * 40));

  const handleRowClick = (record) => {
    if (quarantined.has(record.id)) return;

    if (record.isAnomaly) {
      soundService.playSuccess();
      hapticService.success();
      const updated = new Set(quarantined);
      updated.add(record.id);
      setQuarantined(updated);
      setFeedbackMsg({
        type: 'success',
        text: `Defect Caught! ${record.defect}`
      });

      if (updated.size === totalAnomalies) {
        setTimeout(() => {
          onSolved();
        }, 1200);
      }
    } else {
      soundService.playError();
      hapticService.error();
      setFeedbackMsg({
        type: 'warning',
        text: `Valid Record! ${record.iban} has normal syntax. Look for errors.`
      });
    }
  };

  const handleAutoSolve = () => {
    soundService.playSuccess();
    hapticService.medium();
    const all = new Set(SAMPLE_RECORDS.filter(r => r.isAnomaly).map(r => r.id));
    setQuarantined(all);
    setFeedbackMsg({
      type: 'success',
      text: 'All anomalies quarantined automatically!'
    });
    setTimeout(() => {
      onSolved();
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Objective Card */}
      <div className="glass-card p-3.5 rounded-xl border border-[#009488]/20 bg-white">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-[#009488] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#009488]" />
            Quality Challenge: The Anomaly Hunter
          </span>
          <span className="font-mono text-[10px] bg-[#009488]/10 px-2 py-0.5 rounded text-[#009488] font-bold">
            {currentCaught}/{totalAnomalies} Quarantined
          </span>
        </div>
        <p className="text-xs text-slate-600">
          Tap the <strong className="text-rose-600">4 defective banking asset records</strong> below to purge corrupt data and restore 100% regulatory data health.
        </p>
      </div>

      {/* Real-time Data Integrity Meter */}
      <div className="bg-[#F8FAFA] p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#878787]">DATA INTEGRITY SCORE</span>
          <span className={`font-bold ${integrityScore === 100 ? 'text-[#009488] font-extrabold animate-pulse' : 'text-[#F9BD20]'}`}>
            {integrityScore}% {integrityScore === 100 ? '• ABN AMRO CERTIFIED' : '• AUDIT WARNING'}
          </span>
        </div>
        
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              integrityScore === 100
                ? 'bg-gradient-to-r from-[#009488] to-[#00B3A4] shadow-md'
                : 'bg-gradient-to-r from-[#F9BD20] to-[#E5AC15]'
            }`}
            style={{ width: `${integrityScore}%` }}
          />
        </div>

        {/* Live Feedback Toast */}
        {feedbackMsg && (
          <div className={`text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1.5 animate-fade-in ${
            feedbackMsg.type === 'success' 
              ? 'bg-[#F0FDF4] text-[#009488] border border-[#009488]/30' 
              : 'bg-[#FFFBEB] text-[#D97706] border border-[#F59E0B]/30'
          }`}>
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
            <span className="truncate">{feedbackMsg.text}</span>
          </div>
        )}
      </div>

      {/* Transaction Records List */}
      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {SAMPLE_RECORDS.map((rec) => {
          const isCaught = quarantined.has(rec.id);

          return (
            <div
              key={rec.id}
              onClick={() => handleRowClick(rec)}
              className={`p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-98 shadow-sm ${
                isCaught
                  ? 'bg-[#F0FDF4] border-2 border-[#009488]'
                  : 'bg-white border-slate-200 hover:border-[#009488]/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[#878787] font-semibold">{rec.id}</span>
                <span className="text-slate-800 font-semibold">{rec.label}</span>
                {isCaught ? (
                  <span className="text-[10px] font-mono bg-[#009488] text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    QUARANTINED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#878787] bg-slate-100 px-1.5 py-0.5 rounded">
                    {rec.time}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className={`text-[11px] ${rec.isAnomaly && !isCaught ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}>
                  {rec.iban}
                </span>
                <span className={`font-bold ${rec.isAnomaly && !isCaught ? 'text-rose-600' : 'text-[#009488]'}`}>
                  {rec.amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls & Hints */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center space-x-1.5 text-[#878787] hover:text-[#009488] px-3 py-1.5 rounded-lg bg-white border border-slate-200 active:scale-95 transition-all shadow-sm"
        >
          <Lightbulb className="w-3.5 h-3.5 text-[#F9BD20]" />
          <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
        </button>

        <button
          onClick={handleAutoSolve}
          className="text-[#878787] hover:text-[#009488] text-[11px] px-2 py-1 rounded underline"
        >
          Auto Cleanse
        </button>
      </div>

      {showHint && (
        <div className="p-3 rounded-xl bg-[#F8FAFA] border border-[#009488]/30 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-[#009488]">💡 Data Quality Hint:</p>
          <p className="text-slate-600">
            Check for invalid IBAN codes that don't start with 'NL', impossible negative balances (-€99,999,999), futuristic timestamps from year 2099, and amount 'NaN EUR'!
          </p>
        </div>
      )}
    </div>
  );
}

