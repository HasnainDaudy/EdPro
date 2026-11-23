import React, { useState } from 'react';
import { Sparkles, Heart, Brain, Star, ArrowRight, X, MessageSquareHeart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HeartAndMindModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reflection: { struggleArea: string; strategyUsed: string; gratitudeNote: string }) => void;
  lessonTitle: string;
  studentName?: string;
  onOpenFamilyCard?: () => void;
}

export const HeartAndMindModal: React.FC<HeartAndMindModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  lessonTitle,
  studentName = 'Learner',
  onOpenFamilyCard
}) => {
  const [struggleArea, setStruggleArea] = useState<string>('Making sense of the first abstract step');
  const [strategyUsed, setStrategyUsed] = useState<string>('Taking a deep breath and trying a different perspective');
  const [gratitudeNote, setGratitudeNote] = useState<string>('I am proud that I kept exploring even when it felt new.');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const struggleOptions = [
    'Connecting the new concepts together',
    'Working through the simulation controls',
    'Overcoming an initial mistake without getting frustrated',
    'Staying focused through the reading'
  ];

  const strategyOptions = [
    'Took a calm breath and slowed down',
    'Consulted my Socratic tutor for a hint',
    'Drew or visualized the shapes in my mind',
    'Tested my ideas in the tactile sandbox'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    onComplete({ struggleArea, strategyUsed, gratitudeNote });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-stone-200 shadow-studio-lg max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-label="Heart and Mind Metacognitive Journal"
      >
        {!isSaved ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-stone-900 tracking-tight">
                      Heart & Mind Reflection
                    </h2>
                    <span className="text-[10px] font-mono uppercase bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                      Neuroplasticity
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    For {studentName} • Reflecting on "{lessonTitle}"
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Introductory Guidance */}
            <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
              <Brain className="w-4 h-4 text-[#D94826] shrink-0 mt-0.5" />
              <span>
                <strong>Your brain is like a muscle:</strong> Feeling stuck or stretched is not failure—it is the physical moment your neurons make new connections!
              </span>
            </div>

            {/* Question 1: Productive Struggle */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                1. Where did you feel your brain work hardest or get stretched today?
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {struggleOptions.map((opt, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setStruggleArea(opt)}
                    className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                      struggleArea === opt
                        ? 'border-stone-900 bg-stone-900 text-white font-medium'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Strategies & Grit */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                2. What strategy helped you persist through it?
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {strategyOptions.map((opt, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setStrategyUsed(opt)}
                    className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                      strategyUsed === opt
                        ? 'border-[#D94826] bg-[#D94826] text-white font-medium'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Self-Compassion & Gratitude */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                3. A quiet note of gratitude or self-kindness:
              </label>
              <input
                type="text"
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder="e.g. I am proud I didn't give up when it was hard."
                className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-studio transition-all"
              >
                <span>Save Reflection & Earn Resilience Badge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Celebration View */
          <div className="text-center py-6 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center animate-bounce">
              <Star className="w-8 h-8 fill-amber-500" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-extrabold">
                Character & Grit Unlocked
              </span>
              <h2 className="text-xl font-extrabold text-stone-900 mt-2">
                Resilience & Brain Growth Badge Earned!
              </h2>
              <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1 leading-relaxed">
                You demonstrated intellectual courage by facing a challenge and reflecting on how you overcame it.
              </p>
            </div>

            {/* Family Dinner Card Button */}
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                <MessageSquareHeart className="w-4 h-4 text-[#D94826]" />
                <span>Tonight's Family Dinner Table Card Ready!</span>
              </div>
              <p className="text-xs text-stone-600">
                Share what you discovered with your family tonight without any homework stress or test anxiety.
              </p>
              {onOpenFamilyCard && (
                <button
                  type="button"
                  onClick={onOpenFamilyCard}
                  className="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold transition-colors"
                >
                  View Tonight's Dinner Card
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow-studio"
              >
                Continue to Next Milestone
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
