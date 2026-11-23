import React, { useState, useEffect } from 'react';
import {
  Palette,
  Gamepad2,
  Music,
  Compass,
  Sliders,
  Flame,
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  UtensilsCrossed,
  Layers,
  ChevronRight
} from 'lucide-react';
import { User, Course } from '../types.js';
import { fetchCourses, updateProfile } from '../api.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { FamilyDinnerCardModal } from './FamilyDinnerCardModal.js';

interface StudentDashboardProps {
  user: User;
  onSelectCourse: (courseId: string) => void;
  onSelectMilestone: (courseId: string) => void;
  onOpenTutor: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onSelectCourse,
  onSelectMilestone,
  onOpenTutor
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [focusArt, setFocusArt] = useState<number>(user.focusArtRatio ?? 65);
  const [focusMath, setFocusMath] = useState<number>(user.focusMathRatio ?? 35);
  const [isSavingFocus, setIsSavingFocus] = useState<boolean>(false);
  const [selectedPassion, setSelectedPassion] = useState<string>(user.passionTrack ?? 'visual_arts');
  const [loading, setLoading] = useState<boolean>(true);
  const [isFamilyCardOpen, setIsFamilyCardOpen] = useState<boolean>(false);
  const { t } = useAccessibility();

  useEffect(() => {
    fetchCourses()
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load courses:', err);
        setLoading(false);
      });
  }, []);

  const handleFocusSliderChange = async (newArtRatio: number) => {
    const newMathRatio = 100 - newArtRatio;
    setFocusArt(newArtRatio);
    setFocusMath(newMathRatio);
    setIsSavingFocus(true);
    try {
      await updateProfile({
        focusArtRatio: newArtRatio,
        focusMathRatio: newMathRatio,
        passionTrack: selectedPassion
      });
      setIsSavingFocus(false);
    } catch (err) {
      console.error('Failed to save focus:', err);
      setIsSavingFocus(false);
    }
  };

  const getPassionAccent = (cluster: string) => {
    if (cluster.includes('Visual Arts')) {
      return {
        icon: <Palette className="w-5 h-5 text-[#D94826]" />,
        badgeText: 'Studio Arts & Geometry',
        badgeBg: 'bg-orange-50 text-[#D94826] border-orange-200/80',
        dotColor: 'bg-[#D94826]'
      };
    } else if (cluster.includes('Game Design')) {
      return {
        icon: <Gamepad2 className="w-5 h-5 text-[#1D4ED8]" />,
        badgeText: 'Game Design & Cartesian Physics',
        badgeBg: 'bg-blue-50 text-[#1D4ED8] border-blue-200/80',
        dotColor: 'bg-[#1D4ED8]'
      };
    } else {
      return {
        icon: <Music className="w-5 h-5 text-[#B45309]" />,
        badgeText: 'Music Production & Acoustics',
        badgeBg: 'bg-amber-50 text-[#B45309] border-amber-200/80',
        dotColor: 'bg-[#B45309]'
      };
    }
  };

  return (
    <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* Studio Greeting & Context Banner */}
      <section className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
                Personalized Learning Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl leading-relaxed">
              Your personalized curriculum prioritizes applied creative practice over abstract memorization. Geometry, spatial logic, and vectors unfold naturally through your studio work.
            </p>
          </div>

          {/* Stat Chips Cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-stone-50 border border-stone-200/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <Flame className="w-4 h-4 text-[#D94826]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block leading-tight">
                  Session Streak
                </span>
                <span className="text-xs font-mono font-bold text-stone-900">4 Active Sessions</span>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <Award className="w-4 h-4 text-[#1D4ED8]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block leading-tight">
                  Studio Level
                </span>
                <span className="text-xs font-mono font-bold text-stone-900">Artisan Level 3</span>
              </div>
            </div>

            <button
              onClick={() => setIsFamilyCardOpen(true)}
              className="bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 transition-colors shadow-xs group"
              title="View Tonight's Family Dinner Table Card"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#D94826] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-900 block leading-tight">
                  Family Bridge
                </span>
                <span className="text-xs font-bold text-stone-900">Tonight's Card</span>
              </div>
            </button>
          </div>
        </div>

        {/* Studio Curriculum Focus Fader Console */}
        <div className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-stone-700" />
              <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                {t.curriculumFocus}
              </h2>
            </div>
            <div className="text-xs font-mono">
              {isSavingFocus ? (
                <span className="text-[#D94826] font-semibold">Updating profile preferences...</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#D94826]/10 text-[#D94826] font-bold">
                    {focusArt}% {t.studioArts}
                  </span>
                  <span className="text-stone-300">/</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#1D4ED8]/10 text-[#1D4ED8] font-bold">
                    {focusMath}% {t.appliedMath}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="relative flex items-center">
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={focusArt}
                onChange={(e) => handleFocusSliderChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                aria-label="Curriculum Focus Ratio Slider"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-1">
              <span className="text-[#D94826] font-bold">← Studio Arts & Aesthetic Priority</span>
              <span className="text-stone-400">Balanced (50/50)</span>
              <span className="text-[#1D4ED8] font-bold">Game Engineering & Logic Priority →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Learning Programs */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Active Learning Programs
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Each track includes 6 focused lectures followed by an online Milestone 7 Performance Task
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => {
            const currentLesson = course.progress?.currentLesson || 1;
            const completedCount = course.progress?.completedLessons?.length || 0;
            const percent = Math.round((completedCount / 6) * 100);
            const accent = getPassionAccent(course.passion_cluster);

            return (
              <article
                key={course.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio hover:border-stone-300 hover:shadow-studio-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-center">
                        {accent.icon}
                      </div>
                      <div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${accent.badgeBg}`}>
                          {accent.badgeText}
                        </span>
                        <h3 className="font-extrabold text-stone-900 text-base sm:text-lg mt-1 tracking-tight">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {/* 6-Lesson Progress Sequence Indicator */}
                  <div className="space-y-2.5 mb-6 bg-stone-50/60 p-4 rounded-2xl border border-stone-200/80">
                    <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                      <span>Curriculum Sequence: Lecture {currentLesson} of 6</span>
                      <span className="font-mono font-bold text-stone-900">{percent}% Completed</span>
                    </div>

                    <div className="w-full h-2 bg-stone-200/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-stone-900 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 12)}%` }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="flex justify-between items-center pt-1 text-[10px] font-mono text-stone-500">
                      {[1, 2, 3, 4, 5, 6].map((lNum) => (
                        <span
                          key={lNum}
                          className={`px-1.5 py-0.5 rounded ${
                            completedCount >= lNum
                              ? 'bg-emerald-100 text-emerald-900 font-bold'
                              : currentLesson === lNum
                              ? 'bg-stone-900 text-white font-bold'
                              : 'text-stone-400'
                          }`}
                        >
                          L{lNum}
                        </span>
                      ))}
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                        M7
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Lecture {currentLesson}</span>
                  </button>

                  <button
                    onClick={() => onSelectMilestone(course.id)}
                    className="px-5 py-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>{t.milestoneTest}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Family Dinner Table Conversation Bridge Modal */}
      <FamilyDinnerCardModal
        isOpen={isFamilyCardOpen}
        onClose={() => setIsFamilyCardOpen(false)}
        studentName={user.displayName}
        courseTitle="Personalized Curriculum Track"
        lessonTitle="Recent Studio Explorations"
      />
    </main>
  );
};
