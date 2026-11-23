import React, { useState } from 'react';
import { MessageSquareHeart, Copy, Check, Printer, X, Heart, Sparkles, UtensilsCrossed } from 'lucide-react';

interface FamilyDinnerCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  courseTitle?: string;
  lessonTitle?: string;
  domain?: string;
}

export const FamilyDinnerCardModal: React.FC<FamilyDinnerCardModalProps> = ({
  isOpen,
  onClose,
  studentName = 'Your Learner',
  courseTitle = 'Creative Studio Track',
  lessonTitle = 'Foundational Concepts',
  domain = 'Visual Arts & Applied Logic'
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const dinnerQuestion = `Tonight at dinner, ask ${studentName}:
"If you could use the ideas you explored in '${lessonTitle}' to design something completely new for the world, what would it look like?"`;

  const parentTip = `Parent & Mentor Note:
Resist the urge to quiz, correct, or grade your child's answers. Instead, listen with genuine curiosity and let ${studentName} be the expert teacher at your table. For differently abled and neurodivergent kids, feeling their thoughts valued at home transforms academic anxiety into lifelong self-worth.`;

  const fullShareText = `🍽️ EDPRO FAMILY DINNER TABLE CONVERSATION CARD
For: ${studentName}
Topic: ${lessonTitle} (${courseTitle})

QUESTION FOR TONIGHT:
${dinnerQuestion}

WHY THIS MATTERS:
${parentTip}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-stone-200 shadow-studio-lg max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-label="Family Dinner Table Conversation Card"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-5 h-5 text-[#D94826]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
                  Family Dinner Table Bridge
                </h2>
                <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                  Connection
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Transform homework friction into family bonding.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable/Shareable Postcard */}
        <div className="mt-5 p-6 rounded-2xl bg-[#FFFDF9] border-2 border-dashed border-amber-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>EDPRO FAMILY CARD</span>
            <span className="text-[#D94826] font-bold">{courseTitle}</span>
          </div>

          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              Tonight's Dinner Table Prompt
            </span>
            <p className="text-sm sm:text-base font-extrabold text-stone-900 mt-1 leading-snug">
              {dinnerQuestion}
            </p>
          </div>

          <div className="pt-3 border-t border-amber-100">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-900 block mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#D94826]" />
              Parent & Caregiver Guidance
            </span>
            <p className="text-xs text-stone-600 leading-relaxed italic">
              "{parentTip}"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Index Card</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Card Text!' : 'Copy to Share via SMS / Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
