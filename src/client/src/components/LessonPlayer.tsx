import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Video,
  PlayCircle,
  FileText,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  Bot,
  Sparkles,
  Clock,
  Heart,
  RotateCcw,
  Compass,
  Footprints,
  UtensilsCrossed,
  Star,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, LessonDetail } from '../types.js';
import { fetchLesson, completeLesson } from '../api.js';
import { ColorWheelSimulation } from './simulations/ColorWheelSimulation.js';
import { CoordinateGameSimulation } from './simulations/CoordinateGameSimulation.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { HeartAndMindModal } from './HeartAndMindModal.js';
import { FamilyDinnerCardModal } from './FamilyDinnerCardModal.js';
import { MarkdownContent } from './MarkdownContent.js';

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
  const [activeModality, setActiveModality] = useState<'reader' | 'simulation' | 'video' | 'audio' | 'worksheet' | 'quest'>('reader');
  const [pulseChoice, setPulseChoice] = useState<number | null>(null);
  const [pulseAnswered, setPulseAnswered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Micro-Chunk Pacer Timer State (5 minutes = 300s)
  const [chunkSecondsLeft, setChunkSecondsLeft] = useState<number>(300);
  const [isChunkActive, setIsChunkActive] = useState<boolean>(true);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState<boolean>(false);
  const [breakTimer, setBreakTimer] = useState<number>(60);

  // Human Flourishing Modals State
  const [isHeartAndMindOpen, setIsHeartAndMindOpen] = useState<boolean>(false);
  const [isFamilyCardOpen, setIsFamilyCardOpen] = useState<boolean>(false);

  // Off-Screen Physical Quest State
  const [questStepsCompleted, setQuestStepsCompleted] = useState<Record<number, boolean>>({});
  const [isQuestFinished, setIsQuestFinished] = useState<boolean>(false);

  const {
    renderBionic,
    bionicReading,
    speakText,
    stopSpeaking,
    isSpeaking,
    cognitivePacing,
    t
  } = useAccessibility();

  useEffect(() => {
    setLoading(true);
    setPulseChoice(null);
    setPulseAnswered(false);
    setQuestStepsCompleted({});
    setIsQuestFinished(false);
    stopSpeaking();

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

  // Micro-Chunk Countdown Loop
  useEffect(() => {
    if (cognitivePacing !== 'micro_chunk' || !isChunkActive || isBreakModalOpen) return;

    const interval = setInterval(() => {
      setChunkSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsBreakModalOpen(true);
          setBreakTimer(60);
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cognitivePacing, isChunkActive, isBreakModalOpen]);

  // Break Timer Countdown Loop
  useEffect(() => {
    if (!isBreakModalOpen) return;

    const interval = setInterval(() => {
      setBreakTimer((prev) => {
        if (prev <= 1) {
          setIsBreakModalOpen(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreakModalOpen]);

  const handleOpenHeartAndMind = () => {
    stopSpeaking();
    setIsHeartAndMindOpen(true);
  };

  const finalizeCompleteAndNext = async () => {
    setIsHeartAndMindOpen(false);
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

  const handleToggleQuestStep = (stepIdx: number) => {
    setQuestStepsCompleted((prev) => ({
      ...prev,
      [stepIdx]: !prev[stepIdx]
    }));
  };

  const handleFinishQuest = () => {
    setIsQuestFinished(true);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

  // Domain-specific off-screen quests
  const isArtsTrack = lesson.title.toLowerCase().includes('color') || lesson.title.toLowerCase().includes('geometry') || lesson.title.toLowerCase().includes('tessellation');

  const questSteps = isArtsTrack
    ? [
        'Close or dim your laptop screen. Step outdoors, onto a balcony, or look through an open window for 3 minutes.',
        'Find 3 physical objects in the real world with distinct geometric shapes or contrasting natural colors (e.g., a green leaf against brown bark, a circular coin, or brick lines).',
        'Trace their physical edges with your finger. Notice how real daylight creates natural light and shadow gradients.',
        'Use physical pencil and paper to sketch a 60-second quick drawing of the shapes you just discovered.'
      ]
    : [
        'Step away from your keyboard and stand up to stretch your spine and shoulders.',
        'Take a piece of scrap paper and a small physical coin or key.',
        'Draw a simple 4x4 coordinate grid on the paper with axes labeled 0, 1, 2, 3.',
        'Physically slide your coin across coordinates: start at (0, 0), move to (2, 1), and jump to (3, 3). Feel how 2D vectors work in real space!'
      ];

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <button
          onClick={() => {
            stopSpeaking();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Course Dashboard</span>
        </button>

        {/* 6-Lecture Sequence Buttons */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isCurrent = currentLessonNum === num;
            return (
              <button
                key={num}
                onClick={() => {
                  stopSpeaking();
                  setCurrentLessonNum(num);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isCurrent
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
                }`}
              >
                <span>Part {num}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Family Card & Socratic Bot */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFamilyCardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-xs transition-colors"
            title="Tonight's Family Dinner Table Card"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#D94826]" />
            <span className="hidden md:inline">Tonight's Dinner Card</span>
          </button>

          <button
            onClick={onOpenTutor}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors shadow-xs w-fit"
          >
            <Bot className="w-4 h-4 text-[#D94826]" />
            <span>Need help with Part {currentLessonNum}?</span>
          </button>
        </div>
      </div>

      {/* ADHD Micro-Chunk Pacer Bar */}
      {cognitivePacing === 'micro_chunk' && (
        <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl flex items-center justify-between animate-fade-in text-xs">
          <div className="flex items-center gap-2.5 text-amber-950 font-medium">
            <Clock className="w-4 h-4 text-[#D94826]" />
            <span>
              <strong>Micro-Chunk Pacer:</strong> {formatTimer(chunkSecondsLeft)} remaining until 60-second breathing reset
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChunkActive(!isChunkActive)}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100"
            >
              {isChunkActive ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => {
                setIsBreakModalOpen(true);
                setBreakTimer(60);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-900 text-white font-semibold hover:bg-amber-800"
            >
              Take Break Now
            </button>
          </div>
        </div>
      )}

      {/* Lesson Title & Overview */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase bg-[#D94826]/10 text-[#D94826] px-2 py-0.5 rounded font-extrabold tracking-wide">
            Lecture {lesson.lessonNumber} of 6
          </span>
          <span className="text-xs text-stone-400">•</span>
          <span className="text-xs text-stone-500 font-mono">Estimated 10-15 Min Mastery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Multi-Modal Representation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto">
        {[
          { key: 'reader', label: 'Interactive Reader', icon: BookOpen },
          { key: 'simulation', label: 'Tactile Simulation', icon: Sparkles },
          { key: 'quest', label: 'Off-Screen Physical Quest', icon: Compass },
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
              {tab.key === 'quest' && (
                <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                  Kinesthetic
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Modality View Content */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio min-h-[380px]">
        {/* Modality 1: Interactive Reader */}
        {activeModality === 'reader' && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#D94826] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs uppercase font-extrabold text-stone-900 tracking-wide block">
                    Studio Learning Goal
                  </strong>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{lesson.objective}</p>
                </div>
              </div>

              {/* Read Aloud TTS Controller */}
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    speakText(`${lesson.title}. ${lesson.readerContent}`);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 ml-4 transition-all ${
                  isSpeaking
                    ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                    : 'bg-white border-stone-300 hover:bg-stone-100 text-stone-800'
                }`}
                title={isSpeaking ? 'Stop reading' : 'Read lecture text aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4 text-amber-800" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-stone-700" />
                    <span>{t.readAloud}</span>
                  </>
                )}
              </button>
            </div>

            {/* Formatted Markdown Reader with Bionic Support */}
            <div className="text-stone-800 text-sm leading-relaxed">
              <MarkdownContent content={lesson.readerContent} bionic={bionicReading} />
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

        {/* Modality 3: Off-Screen Physical & Nature Grounding Quest */}
        {activeModality === 'quest' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <Compass className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded font-bold">
                  Tactile & Nature Grounding Quest
                </span>
                <h3 className="text-base font-extrabold text-stone-900 mt-1">
                  Kinesthetic Mission: Step Into the Physical World
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Real knowledge connects with your physical senses. Complete this 10-minute off-screen quest to experience the concepts in the tactile world around you.
                </p>
              </div>
            </div>

            {/* Step-by-Step Checklist */}
            <div className="space-y-3">
              {questSteps.map((stepText, idx) => {
                const isChecked = !!questStepsCompleted[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleQuestStep(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                      isChecked
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-xs'
                        : 'bg-stone-50 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-stone-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-stone-900 block mb-0.5">
                        Mission Step {idx + 1}
                      </span>
                      <p className={`leading-relaxed ${isChecked ? 'text-emerald-950 font-medium' : 'text-stone-700'}`}>
                        {stepText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion Trigger */}
            <div className="pt-2 flex flex-col items-center gap-3">
              {!isQuestFinished ? (
                <button
                  type="button"
                  onClick={handleFinishQuest}
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-studio transition-all"
                >
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  <span>I Completed My Off-Screen Quest!</span>
                </button>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-amber-900 animate-fade-in">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-600 shrink-0" />
                  <span>Kinesthetic Explorer Badge Earned! Your physical connection deepens your understanding.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modality 4: Video Masterclass */}
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

        {/* Modality 5: Audio Companion */}
        {activeModality === 'audio' && (
          <div className="max-w-2xl mx-auto bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-stone-200 text-stone-700 rounded-full flex items-center justify-center mx-auto">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-sm">Audio Synthesis Briefing</h3>
            <p className="text-xs text-stone-600 bg-white p-4 rounded-xl border border-stone-200 text-left leading-relaxed">
              "{lesson.audioSummaryText}"
            </p>
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speakText(lesson.audioSummaryText);
                }
              }}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{isSpeaking ? 'Pause Audio Companion' : 'Listen to Audio Companion'}</span>
            </button>
          </div>
        )}

        {/* Modality 6: Printable Worksheet */}
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
          onClick={() => {
            stopSpeaking();
            setCurrentLessonNum((prev) => Math.max(prev - 1, 1));
          }}
          className="px-4 py-2.5 bg-white hover:bg-stone-50 disabled:opacity-30 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-stone-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Lecture</span>
        </button>

        <button
          onClick={handleOpenHeartAndMind}
          className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-studio transition-all"
        >
          <span>{currentLessonNum < 6 ? 'Complete Lecture & Reflect' : 'Complete & Proceed to Milestone 7'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Heart & Mind Metacognitive Journal Modal */}
      <HeartAndMindModal
        isOpen={isHeartAndMindOpen}
        onClose={finalizeCompleteAndNext}
        onComplete={() => {}}
        lessonTitle={lesson.title}
        studentName={user?.displayName || 'Learner'}
        onOpenFamilyCard={() => setIsFamilyCardOpen(true)}
      />

      {/* Family Dinner Table Conversation Bridge Modal */}
      <FamilyDinnerCardModal
        isOpen={isFamilyCardOpen}
        onClose={() => setIsFamilyCardOpen(false)}
        studentName={user?.displayName || 'Your Learner'}
        courseTitle={isArtsTrack ? 'Studio Visual Arts Track' : 'Game Mechanics & Code Track'}
        lessonTitle={lesson.title}
      />

      {/* 60-Second Co-Regulation Mindfulness Modal for ADHD Micro-Chunking */}
      {isBreakModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 p-8 max-w-md w-full shadow-studio-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200 animate-pulse">
              <Heart className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                ADHD Executive Reset
              </span>
              <h2 className="text-xl font-extrabold text-stone-900 mt-2">60-Second Brain Reset</h2>
              <p className="text-xs text-stone-600 mt-1">
                You focused with great energy! Stand up, stretch your shoulders, take a deep breath, or drink water.
              </p>
            </div>

            {/* Breathing Animation / Counter */}
            <div className="py-4">
              <div className="w-24 h-24 rounded-full border-4 border-emerald-500 border-t-emerald-200 animate-spin mx-auto flex items-center justify-center">
                <span className="font-mono text-2xl font-black text-stone-800">{breakTimer}s</span>
              </div>
              <p className="text-xs text-stone-400 mt-3 font-medium">Breathe in 4s... Hold 4s... Breathe out 4s</p>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={() => {
                  setIsBreakModalOpen(false);
                  setChunkSecondsLeft(300);
                }}
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
              >
                I'm Ready to Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
