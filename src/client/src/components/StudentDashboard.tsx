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
  Sparkles
} from 'lucide-react';
import { User, Course } from '../types.js';
import { fetchCourses, updateProfile } from '../api.js';
import { useAccessibility } from '../context/AccessibilityContext.js';

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
  const [focusArt, setFocusArt] = useState<number>(user.focusArtRatio ?? 60);
  const [focusMath, setFocusMath] = useState<number>(user.focusMathRatio ?? 40);
  const [isSavingFocus, setIsSavingFocus] = useState<boolean>(false);
  const [selectedPassion, setSelectedPassion] = useState<string>(user.passionTrack ?? 'visual_arts');
  const [loading, setLoading] = useState<boolean>(true);
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
        border: 'border-t-4 border-t-[#D94826]',
        badge: 'bg-orange-50 text-[#D94826]'
      };
    } else if (cluster.includes('Game Design')) {
      return {
        icon: <Gamepad2 className="w-5 h-5 text-[#1D4ED8]" />,
        border: 'border-t-4 border-t-[#1D4ED8]',
        badge: 'bg-blue-50 text-[#1D4ED8]'
      };
    } else {
      return {
        icon: <Music className="w-5 h-5 text-[#B45309]" />,
        border: 'border-t-4 border-t-[#B45309]',
        badge: 'bg-amber-50 text-[#B45309]'
      };
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Student Welcome Header */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Learning Studio: {user.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl leading-relaxed">
              Your personalized curriculum prioritizes applied creative practice over abstract memorization. Geometry, spatial logic, and vectors unfold naturally through your studio work.
            </p>
          </div>

          {/* Clean Metric Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-[#D94826]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Consecutive Days</span>
                <span className="text-xs font-mono font-bold text-stone-900">4 {t.activeSessions}</span>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
              <Award className="w-4 h-4 text-[#1D4ED8]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Current Standing</span>
                <span className="text-xs font-mono font-bold text-stone-900">Artisan Level 3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Focus Allocation Slider */}
        <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-stone-600" />
              <h2 className="text-xs font-bold text-stone-900">{t.curriculumFocus}</h2>
            </div>
            <div className="text-xs font-mono">
              {isSavingFocus ? (
                <span className="text-[#D94826]">Updating profile...</span>
              ) : (
                <span className="text-stone-500">
                  <strong className="text-[#D94826]">{focusArt}%</strong> {t.studioArts} /{' '}
                  <strong className="text-[#1D4ED8]">{focusMath}%</strong> {t.appliedMath}
                </span>
              )}
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-[#D94826] h-full transition-all duration-300"
                style={{ width: `${focusArt}%` }}
              />
              <div
                className="bg-[#1D4ED8] h-full transition-all duration-300"
                style={{ width: `${focusMath}%` }}
              />
            </div>

            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={focusArt}
              onChange={(e) => handleFocusSliderChange(parseInt(e.target.value, 10))}
              className="w-full accent-stone-900 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-stone-500 font-mono">
              <span>Studio & Visual Arts Priority</span>
              <span>Balanced 50 / 50</span>
              <span>Game & Code Priority</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Program Tracks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Active Learning Programs</h2>
            <p className="text-xs text-stone-500">Each track includes 6 focused lectures followed by an online Milestone Test</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const currentLesson = course.progress?.currentLesson || 1;
            const completedCount = course.progress?.completedLessons?.length || 0;
            const percent = Math.round((completedCount / 6) * 100);
            const accent = getPassionAccent(course.passion_cluster);

            return (
              <div
                key={course.id}
                className={`bg-white border border-stone-200 rounded-2xl p-6 shadow-studio flex flex-col justify-between hover:border-stone-300 transition-all ${accent.border}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                        {accent.icon}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${accent.badge}`}>
                          {course.passion_cluster}
                        </span>
                        <h3 className="font-extrabold text-stone-900 text-base mt-1">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2 mb-6">
                    {course.description}
                  </p>

                  {/* 6-Lesson Progress Sequence Indicator */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[11px] text-stone-600 font-semibold">
                      <span>Course Progress: Lecture {currentLesson} of 6</span>
                      <span className="font-mono text-stone-900">{percent}% Completed</span>
                    </div>

                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-stone-900 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 10)}%` }}
                      />
                    </div>

                    {/* Step dots for 6 lessons + milestone */}
                    <div className="flex justify-between items-center pt-1 text-[10px] text-stone-400 font-mono">
                      <span>L1</span>
                      <span>L2</span>
                      <span>L3</span>
                      <span>L4</span>
                      <span>L5</span>
                      <span>L6</span>
                      <span className="font-bold text-amber-700">{t.milestoneTest}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t.openLecture} {currentLesson}</span>
                  </button>

                  <button
                    onClick={() => onSelectMilestone(course.id)}
                    className="px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>{t.milestoneTest}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
