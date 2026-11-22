import React from 'react';
import {
  Palette,
  Gamepad2,
  Music,
  ArrowRight,
  Bot,
  ShieldCheck,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';

interface LandingHeroProps {
  onGetStarted: () => void;
  onExploreCourses: () => void;
  onOpenTutor: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onGetStarted,
  onExploreCourses,
  onOpenTutor
}) => {
  return (
    <div className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Thesis & Statement */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-[1.08]">
              Children learn differently. <br />
              Education should follow their curiosity.
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              Standard schooling enforces rigid abstractions where struggling with algebra drills triggers academic disengagement. EdPro allows learners to cultivate their creative passions—visual arts, game mechanics, and acoustics—while mastering foundational logic, coordinates, and geometry through authentic applied practice.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-studio flex items-center gap-2.5 transition-all"
              >
                <span>Explore Learning Pathways</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenTutor}
                className="px-5 py-3.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
              >
                <Bot className="w-4 h-4 text-[#D94826]" />
                <span>Test Socratic EdBot</span>
              </button>
            </div>
          </div>

          {/* Right Column: Tangible Physical Learning Artifact Preview */}
          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 shadow-studio-lg space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-800">Personalized Curriculum Matrix</span>
              <span className="text-[11px] font-mono text-stone-500">6+1 Unit Standard</span>
            </div>

            {/* Visual Focus Allocation demonstration */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5 text-[#D94826]">
                  <Palette className="w-4 h-4" /> Studio Arts (70%)
                </span>
                <span className="flex items-center gap-1.5 text-[#1D4ED8]">
                  Applied Logic (30%) <Gamepad2 className="w-4 h-4" />
                </span>
              </div>

              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-[#D94826] h-full" style={{ width: '70%' }} />
                <div className="bg-[#1D4ED8] h-full" style={{ width: '30%' }} />
              </div>

              <p className="text-[11px] text-stone-500 leading-normal">
                Geometry, vectors, and proportions are woven seamlessly into visual composition rather than taught through isolated textbook drills.
              </p>
            </div>

            {/* Sample Track Rows */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between hover:border-stone-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#D94826] flex items-center justify-center">
                    <Palette className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Color Harmonies & Golden Ratios</h4>
                    <span className="text-[10px] text-stone-500">6 Lectures • 1 Studio Portfolio Project</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-md">Art</span>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-center justify-between hover:border-stone-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">Cartesian Rocket Mechanics & AABB</h4>
                    <span className="text-[10px] text-stone-500">6 Lectures • 1 Level Design Challenge</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-1 rounded-md">Code</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 px-4 sm:px-6 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="space-y-3 p-6 rounded-2xl border border-stone-200/90 bg-[#FAFAF8]">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">The 6+1 Modular Unit</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Structured into 6 focused micro-lectures followed by an interactive milestone evaluation combining conceptual deduction and authentic creative portfolio output.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-3 p-6 rounded-2xl border border-stone-200/90 bg-[#FAFAF8]">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5 text-[#D94826]" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">Socratic EdBot Mentorship</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Grounds conversations in the active topic. Never gives away direct answers, adapting vocabulary across age brackets (Pip 6–9, Nova 10–13, Atlas 14–17).
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-3 p-6 rounded-2xl border border-stone-200/90 bg-[#FAFAF8]">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#15803D]" />
              </div>
              <h3 className="font-extrabold text-stone-900 text-base">COPPA & FERPA Standard</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Engineered for school districts with zero advertising trackers, pseudonymous minors, school-authorized consent state machines, and immutable audit ledgers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
