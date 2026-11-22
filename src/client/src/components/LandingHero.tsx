import React from 'react';
import {
  Sparkles,
  Palette,
  Gamepad2,
  Music,
  BookOpen,
  Bot,
  ShieldCheck,
  Award,
  ArrowRight,
  Layers,
  Cpu
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
      <section className="relative overflow-hidden py-16 md:py-24 px-4">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300 shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Open-Source Personalized Education Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Every Mind Learns Differently. <br />
            <span className="bg-gradient-to-r from-pink-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Tailor Education to Their Passion.
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop forcing abstract algebra drills onto a child whose soul lights up with visual art. EdPro curates foundational mathematics, logic, and science through <strong>Visual Arts, Game Design, and Sound Engineering</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Launch Interactive Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTutor}
              className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Test Context-Aware EdBot</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="py-12 px-4 border-t border-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: The 6+1 Unit Architecture */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">The 6+1 Unit Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every course unit features exactly 6 multi-modal micro-lectures followed by an interactive online Milestone Test combining conceptual questions and creative project review.
            </p>
          </div>

          {/* Card 2: Context-Aware Socratic AI */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Age-Adaptive Socratic EdBot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never hallucinates or drifts away from the active lesson. Adapts vocabulary from age 6 to 17, and uses guided inquiry instead of giving away direct answers.
            </p>
          </div>

          {/* Card 3: COPPA & FERPA Privacy */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">COPPA & FERPA Compliance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built for schools with minimal PII collection, zero third-party advertising tracking, school official consent workflows, and immutable audit logs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
