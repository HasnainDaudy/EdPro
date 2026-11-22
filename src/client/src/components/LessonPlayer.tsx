import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Video,
  PlayCircle,
  FileText,
  Volume2,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  Bot
} from 'lucide-react';
import { User, LessonDetail } from '../types.js';
import { fetchLesson, completeLesson } from '../api.js';
import { ColorWheelSimulation } from './simulations/ColorWheelSimulation.js';
import { CoordinateGameSimulation } from './simulations/CoordinateGameSimulation.js';

interface LessonPlayerProps {
  user: User | null;
  courseId: string;
  initialLessonNumber?: number;
  onBack: () => void;
  onOpenTutor: () => void;
  onGoToMilestone: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  user,
  courseId,
  initialLessonNumber = 1,
  onBack,
  onOpenTutor,
  onGoToMilestone
}) => {
  const [currentLessonNum, setCurrentLessonNum] = useState<number>(initialLessonNumber);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [activeModality, setActiveModality] = useState<'reader' | 'video' | 'simulation' | 'audio' | 'worksheet'>('reader');
  const [pulseChoice, setPulseChoice] = useState<number | null>(null);
  const [pulseAnswered, setPulseAnswered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setPulseChoice(null);
    setPulseAnswered(false);
    setIsCompleted(false);

    fetchLesson(courseId, currentLessonNum)
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load lesson:', err);
        setLoading(false);
      });
  }, [courseId, currentLessonNum]);

  const handleCompleteAndNext = async () => {
    try {
      await completeLesson(courseId, currentLessonNum);
      setIsCompleted(true);
      if (currentLessonNum < 6) {
        setCurrentLessonNum((prev) => prev + 1);
      } else {
        onGoToMilestone();
      }
    } catch (err) {
      console.error('Complete lesson error:', err);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading personalized lesson track...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
      {/* Top Breadcrumb & Quick Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* 6-Lesson Tracker Pill Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isCurrent = currentLessonNum === num;
            return (
              <button
                key={num}
                onClick={() => setCurrentLessonNum(num)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-2 ring-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {num}
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Milestone 7 Button */}
          <button
            onClick={onGoToMilestone}
            className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Milestone 7 Test</span>
          </button>
        </div>

        {/* Ask Tutor Trigger */}
        <button
          onClick={onOpenTutor}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Ask EdBot</span>
        </button>
      </div>

      {/* Lesson Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Lesson {lesson.lessonNumber} of 6
              </span>
              <span className="text-xs text-slate-400">• {lesson.durationMinutes} mins</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{lesson.title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">{lesson.sparkHook}</p>
          </div>

          {/* Key Concept Chips */}
          <div className="flex flex-wrap gap-1.5 md:max-w-xs justify-start md:justify-end">
            {lesson.keyConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Universal Design for Learning (UDL) Modality Switcher */}
      <div className="flex border-b border-slate-800 pb-2 gap-2 overflow-x-auto">
        {[
          { key: 'reader', label: 'Interactive Reader', icon: BookOpen },
          { key: 'simulation', label: 'Hands-On Simulation', icon: PlayCircle },
          { key: 'video', label: 'Video Masterclass', icon: Video },
          { key: 'audio', label: 'Audio Companion', icon: Volume2 },
          { key: 'worksheet', label: 'Printable Practice', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModality === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveModality(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modality View Content */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl min-h-[380px]">
        {/* Modality 1: Interactive Reader */}
        {activeModality === 'reader' && (
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
            <div className="bg-indigo-950/30 border border-indigo-900/40 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white text-xs block uppercase font-bold tracking-wide">Lesson Mission</strong>
                <p className="text-xs text-indigo-200 mt-0.5">{lesson.objective}</p>
              </div>
            </div>

            <div className="whitespace-pre-line text-slate-200 bg-slate-950 p-6 rounded-xl border border-slate-800">
              {lesson.readerContent}
            </div>

            {/* Vocabulary Drawer */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mastery Vocabulary</h4>
              <div className="flex flex-wrap gap-2">
                {lesson.allowedVocab.map((v, i) => (
                  <span key={i} className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-md font-mono">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modality 2: Interactive Simulation Sandbox */}
        {activeModality === 'simulation' && (
          <div>
            {lesson.simulationType === 'coordinate_game' ? (
              <CoordinateGameSimulation />
            ) : (
              <ColorWheelSimulation config={lesson.simulationConfig} />
            )}
          </div>
        )}

        {/* Modality 3: Video Player */}
        {activeModality === 'video' && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
              <iframe
                src={lesson.videoUrl || 'https://www.youtube-nocookie.com/embed/Qj1FK8n7WgY'}
                title={lesson.videoTitle || 'Educational Video'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">{lesson.videoTitle}</p>
          </div>
        )}

        {/* Modality 4: Audio Companion */}
        {activeModality === 'audio' && (
          <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Volume2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">Podcast Narrative Companion</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800 text-left">
              "{lesson.audioSummaryText || 'Tune into this audio briefing to absorb the core concepts through spoken storytelling and music sound design.'}"
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30">
                <PlayCircle className="w-4 h-4" />
                <span>Play 2-Min Audio Briefing</span>
              </button>
            </div>
          </div>
        )}

        {/* Modality 5: Printable Worksheet */}
        {activeModality === 'worksheet' && (
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <span className="font-bold text-white uppercase">{lesson.worksheetTitle}</span>
              <button
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded-lg text-[11px] transition-colors"
              >
                Print / Save PDF
              </button>
            </div>
            {lesson.worksheetMarkdown}
          </div>
        )}
      </div>

      {/* Comprehension Pulse Check (Formative Assessment) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Comprehension Pulse Check</h3>
            <p className="text-[11px] text-slate-400">Zero penalty. Test your intuition before moving forward!</p>
          </div>
        </div>

        <p className="text-xs font-medium text-slate-200 mb-4">{lesson.pulseQuestion.question}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {lesson.pulseQuestion.options.map((opt, idx) => {
            const isSelected = pulseChoice === idx;
            const isCorrect = idx === lesson.pulseQuestion.correctIndex;

            let cardStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
            if (pulseAnswered) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20';
              } else if (isSelected) {
                cardStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
              }
            } else if (isSelected) {
              cardStyle = 'bg-indigo-950/40 border-indigo-500 text-white';
            }

            return (
              <button
                key={idx}
                disabled={pulseAnswered}
                onClick={() => {
                  setPulseChoice(idx);
                  setPulseAnswered(true);
                }}
                className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all ${cardStyle}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-[11px] opacity-60">[{String.fromCharCode(65 + idx)}]</span>
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {pulseAnswered && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              pulseChoice === lesson.pulseQuestion.correctIndex
                ? 'bg-emerald-950/30 border border-emerald-900/40 text-emerald-300'
                : 'bg-amber-950/30 border border-amber-900/40 text-amber-300'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">
                {pulseChoice === lesson.pulseQuestion.correctIndex ? 'Excellent intuition! 🌟' : 'Growth Tip:'}
              </strong>
              <span>{lesson.pulseQuestion.hint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentLessonNum <= 1}
          onClick={() => setCurrentLessonNum((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Lesson</span>
        </button>

        <button
          onClick={handleCompleteAndNext}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
        >
          <span>{currentLessonNum < 6 ? 'Complete & Proceed to Next Lesson' : 'Unlock Milestone 7 Assessment'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
