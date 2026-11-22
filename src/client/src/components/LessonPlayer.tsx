import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Video,
  PlayCircle,
  FileText,
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  Bot,
  Sparkles
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
  const [activeModality, setActiveModality] = useState<'reader' | 'simulation' | 'video' | 'audio' | 'worksheet'>('reader');
  const [pulseChoice, setPulseChoice] = useState<number | null>(null);
  const [pulseAnswered, setPulseAnswered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    setPulseChoice(null);
    setPulseAnswered(false);

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
          <div className="w-8 h-8 border-3 border-stone-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-mono">Loading studio lecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Course Dashboard</span>
        </button>

        {/* 6-Lecture Sequence Buttons */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isCurrent = currentLessonNum === num;
            return (
              <button
                key={num}
                onClick={() => setCurrentLessonNum(num)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                {num}
              </button>
            );
          })}

          <div className="h-4 w-px bg-stone-300 mx-1" />

          <button
            onClick={onGoToMilestone}
            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-bold transition-colors"
          >
            Milestone 7 Test
          </button>
        </div>

        <button
          onClick={onOpenTutor}
          className="flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all w-fit"
        >
          <Bot className="w-4 h-4 text-[#D94826]" />
          <span>Ask EdBot</span>
        </button>
      </div>

      {/* Lesson Header Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-3">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 mb-1">
              <span>Lecture {lesson.lessonNumber} of 6</span>
              <span>•</span>
              <span>{lesson.durationMinutes} Minutes</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {lesson.sparkHook}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 md:max-w-xs justify-start md:justify-end pt-1">
            {lesson.keyConcepts.map((concept, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-lg font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Universal Design for Learning (UDL) Modality Switcher */}
      <div className="flex border-b border-stone-200 pb-2 gap-2 overflow-x-auto">
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
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modality View Content */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio min-h-[380px]">
        {/* Modality 1: Interactive Reader */}
        {activeModality === 'reader' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#D94826] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs uppercase font-extrabold text-stone-900 tracking-wide block">
                  Studio Learning Goal
                </strong>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{lesson.objective}</p>
              </div>
            </div>

            <div className="text-stone-800 text-sm leading-relaxed whitespace-pre-line font-normal space-y-3">
              {lesson.readerContent}
            </div>

            {/* Vocabulary Tokens */}
            <div className="pt-6 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Foundational Terminology
              </span>
              <div className="flex flex-wrap gap-2">
                {lesson.allowedVocab.map((v, i) => (
                  <span
                    key={i}
                    className="bg-stone-100 text-stone-800 border border-stone-200 text-xs px-2.5 py-1 rounded-md font-mono"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modality 2: Simulation Sandbox */}
        {activeModality === 'simulation' && (
          <div>
            {lesson.simulationType === 'coordinate_game' ? (
              <CoordinateGameSimulation />
            ) : (
              <ColorWheelSimulation config={lesson.simulationConfig} />
            )}
          </div>
        )}

        {/* Modality 3: Video Masterclass */}
        {activeModality === 'video' && (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-black border border-stone-200 shadow-md">
              <iframe
                src={lesson.videoUrl || 'https://www.youtube-nocookie.com/embed/Qj1FK8n7WgY'}
                title={lesson.videoTitle || 'Educational Video'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-xs text-stone-500 mt-3 text-center">{lesson.videoTitle}</p>
          </div>
        )}

        {/* Modality 4: Audio Companion */}
        {activeModality === 'audio' && (
          <div className="max-w-2xl mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-stone-200 text-stone-700 rounded-full flex items-center justify-center mx-auto">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-sm">Audio Synthesis Briefing</h3>
            <p className="text-xs text-stone-600 bg-white p-4 rounded-xl border border-stone-200 text-left leading-relaxed">
              "{lesson.audioSummaryText}"
            </p>
            <button className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              <span>Listen to 2-Min Audio Companion</span>
            </button>
          </div>
        )}

        {/* Modality 5: Printable Worksheet */}
        {activeModality === 'worksheet' && (
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 font-mono text-xs text-stone-800 leading-relaxed whitespace-pre-wrap">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-4">
              <span className="font-bold uppercase text-stone-900">{lesson.worksheetTitle}</span>
              <button
                onClick={() => window.print()}
                className="bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 px-3 py-1 rounded-lg text-[11px] font-sans font-bold"
              >
                Print / Save PDF
              </button>
            </div>
            {lesson.worksheetMarkdown}
          </div>
        )}
      </div>

      {/* Comprehension Pulse Check (Formative Assessment) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
          <HelpCircle className="w-4 h-4 text-[#D94826]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Comprehension Pulse Check
          </h2>
          <span className="text-[11px] text-stone-500 font-normal ml-auto">Zero-Penalty Check</span>
        </div>

        <p className="text-xs sm:text-sm font-semibold text-stone-900">{lesson.pulseQuestion.question}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lesson.pulseQuestion.options.map((opt, idx) => {
            const isSelected = pulseChoice === idx;
            const isCorrect = idx === lesson.pulseQuestion.correctIndex;

            let cardStyle = 'bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400';
            if (pulseAnswered) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
              } else if (isSelected) {
                cardStyle = 'bg-rose-50 border-rose-400 text-rose-950';
              }
            } else if (isSelected) {
              cardStyle = 'bg-stone-200 border-stone-900 text-stone-900 font-bold';
            }

            return (
              <button
                key={idx}
                disabled={pulseAnswered}
                onClick={() => {
                  setPulseChoice(idx);
                  setPulseAnswered(true);
                }}
                className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${cardStyle}`}
              >
                <span className="font-mono text-[11px] opacity-60">[{String.fromCharCode(65 + idx)}]</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {pulseAnswered && (
          <div
            className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
              pulseChoice === lesson.pulseQuestion.correctIndex
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">
                {pulseChoice === lesson.pulseQuestion.correctIndex ? 'Excellent deduction!' : 'Pedagogical Clue:'}
              </strong>
              <span>{lesson.pulseQuestion.hint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          disabled={currentLessonNum <= 1}
          onClick={() => setCurrentLessonNum((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2.5 bg-white hover:bg-stone-50 disabled:opacity-30 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-stone-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Lecture</span>
        </button>

        <button
          onClick={handleCompleteAndNext}
          className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-studio transition-all"
        >
          <span>{currentLessonNum < 6 ? 'Complete & Open Next Lecture' : 'Proceed to Milestone 7 Evaluation'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
