import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { soundService } from '../services/soundService';
import { hapticService } from '../services/hapticService';

export const CHALLENGE_GUIDES = {
  P1_CAPABILITY_MATCH: {
    title: 'Capability Match',
    badge: 'Stop 1 • Challenge 1',
    objective: 'Match each capability card with its corresponding business description.',
    steps: [
      'Tap a capability card on the left column to select it.',
      'Tap a description card on the right column to pair them together.',
      'Pair all 4 capabilities with their definitions, then tap "Submit Matches" to verify.'
    ]
  },
  P1_EMOJI_PHRASE: {
    title: 'Emoji Phrase Decrypt',
    badge: 'Stop 1 • Challenge 2',
    objective: 'Decrypt the hidden phrase using the clues shown in the word cards.',
    steps: [
      'Review the visual clues and letter counts shown in the 3 word cards at the top.',
      'Tap a word card to select which word you want to guess.',
      'Type your guess in the input box using your keyboard, then tap "Submit Guess" (or press Enter).',
      'Solve all 3 words to complete the challenge.'
    ]
  },
  P2_ASTEROIDS: {
    title: 'Lakehouse Stream Defender',
    badge: 'Stop 2 • Challenge 3',
    objective: 'Destroy 10 incoming data asteroids before your shields are depleted.',
    steps: [
      'Tap the Play button or "Launch Lakehouse Defender" to start the game.',
      'Steer your ship horizontally by holding the "Hold Steer Left" / "Hold Steer Right" buttons, or by dragging directly on the game screen.',
      'Your ship auto-fires twin lasers. Neutralize 10 incoming asteroids to complete the challenge.'
    ]
  },
  P2_MEMORY_PAIRS: {
    title: 'Data Lake Memory Matching',
    badge: 'Stop 2 • Challenge 4',
    objective: 'Locate and match all identical card pairs on the grid.',
    steps: [
      'Tap "Start Memorization" to get an 8-second preview of all card locations before they flip face down.',
      'Tap two face-down cards to reveal them. If they match, they stay face-up; if not, they flip back over.',
      'Find and match all 4 pairs to complete the challenge.'
    ]
  },
  P2_INGESTION_SNAKE: {
    title: 'Pipeline Snake Ingestion',
    badge: 'Stop 2 • Challenge 5',
    objective: 'Collect 7 data packets without colliding with perimeter walls or your trail.',
    steps: [
      'Tap the Play button to start the ingestion stream.',
      'Steer the snake using the on-screen D-pad buttons (▲, ◀, ▼, ▶) or by swiping on the screen.',
      'Collect 7 data packets to complete the challenge. Avoid colliding with the outer walls or your own tail.'
    ]
  },
  P3_ANOMALY_WHACK: {
    title: 'Anomaly Hunter',
    badge: 'Stop 3 • Challenge 6',
    objective: 'Cleanse 8 corrupted data anomalies popping up across the server nodes.',
    steps: [
      'Tap "Start Anomaly Cleansing" to begin the countdown timer.',
      'Quickly tap the corrupted bug and anomaly items as they pop up across the 3x3 grid before they vanish.',
      'Avoid tapping clean data assets. Cleanse 8 corrupted anomalies before time runs out to complete the challenge.'
    ]
  },
  P3_DATA_AUDIT: {
    title: 'Data Quality Audit',
    badge: 'Stop 3 • Challenge 7',
    objective: 'Identify and flag the 3 corrupted transaction records in the ledger.',
    steps: [
      'Inspect each transaction record in the audit list carefully.',
      'Tap the rows that contain erroneous data to select them (exactly 3 records).',
      'Tap "Submit Audit" to verify your audit selection.'
    ]
  },
  P3_WORD_SEARCH: {
    title: 'Governance Word Search',
    badge: 'Stop 3 • Challenge 8',
    objective: 'Find and highlight the 4 hidden words in the letter grid.',
    steps: [
      'Scan the 8x8 letter grid for hidden words.',
      'Tap the first letter of a word to select it, then tap the last letter of that word to highlight the line.',
      'Words can run horizontally, vertically, or diagonally in any direction.',
      'Find all 4 hidden words to complete the challenge.'
    ]
  },
  P4_SIMON_BUTTONS: {
    title: 'Lineage Simon Sequence',
    badge: 'Stop 4 • Challenge 9',
    objective: 'Watch the flashing sequence and repeat it back in the exact same order.',
    steps: [
      'Tap "Start Round" to watch the sequence of buttons light up and play tones.',
      'When the prompt displays "YOUR TURN", tap the buttons in the exact same order.',
      'Complete all 4 progressive rounds to solve the challenge.'
    ]
  },
  P4_LINEAGE_ORDER: {
    title: 'Data Lineage Sequence',
    badge: 'Stop 4 • Challenge 10',
    objective: 'Arrange the 4 lifecycle stages into the correct sequential order from 1 to 4.',
    steps: [
      'Tap a card to select it, then tap another card to swap their positions.',
      'Alternatively, use the ▲ and ▼ arrow buttons on any card to move it up or down.',
      'Once all 4 stages are arranged in order from 1 to 4, tap "Submit Sequence" to verify.'
    ]
  },
  P4_BDM_BREAKOUT: {
    title: 'BDM Breakout',
    badge: 'Stop 4 • Challenge 11',
    objective: 'Deflect the bouncing beacon with your paddle to clear all bricks.',
    steps: [
      'Tap the Play button to launch the beacon from your paddle.',
      'Steer your paddle horizontally by holding the "Hold Steer Left" / "Hold Steer Right" buttons, or by dragging on the game screen.',
      'Deflect the bouncing beacon into the bricks above. Shatter all 12 bricks to complete the challenge.'
    ]
  },
  VAULT: {
    title: 'Datasphere Decryption',
    badge: 'Final Stage • Datasphere',
    objective: 'Arrange your unlocked letter tiles into the slot boxes to reveal the final code.',
    steps: [
      'Tap or drag letter tiles from your collection at the bottom into the empty slot boxes above.',
      'Tap any placed letter in a slot if you want to remove it back to your collection.',
      'Fill all 14 letter boxes, then tap "Unlock Datasphere" to verify your phrase and reveal the vault code.'
    ]
  }
};

export default function HowToPlayAccordion({ challengeId }) {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-collapse when user transitions to a different challenge
  useEffect(() => {
    setIsOpen(false);
  }, [challengeId]);

  const guide = CHALLENGE_GUIDES[challengeId];
  if (!guide) return null;

  const handleToggle = () => {
    soundService.playClick();
    hapticService.light();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="pt-2 pb-1">
      <div className="bg-[#FFFDF5] rounded-2xl border-2 border-[#F9BD20]/50 overflow-hidden shadow-xs transition-all">
        {/* Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#FEF9C3]/40 transition-colors select-none cursor-pointer"
          aria-expanded={isOpen}
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#F9BD20]/25 text-[#9E6E00] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 text-[#9E6E00] stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black uppercase tracking-wider text-[#9E6E00] block truncate">
                How to Play: {guide.title}
              </span>
              <span className="text-[10px] font-bold text-slate-500 block truncate">
                {guide.badge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-[#009488] shrink-0 pl-2">
            <span>{isOpen ? 'Hide' : 'Instructions'}</span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#F9BD20]/30 animate-fade-in text-xs">
            {/* Objective */}
            <div className="p-2.5 rounded-xl bg-white border border-[#F9BD20]/40 flex items-start space-x-2 shadow-2xs">
              <Target className="w-4 h-4 text-[#009488] shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-black text-slate-900 block text-[11px] uppercase tracking-wider">
                  Objective
                </span>
                <span className="font-semibold text-slate-700">{guide.objective}</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-2">
              <span className="font-black text-slate-900 block text-[11px] uppercase tracking-wider">
                Step-by-Step Rules
              </span>
              <div className="space-y-2">
                {guide.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#009488] text-white font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 font-medium leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
