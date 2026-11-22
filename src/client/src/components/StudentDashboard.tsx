import React, { useState, useEffect } from 'react';
import {
  Palette,
  Gamepad2,
  Music,
  Compass,
  Sliders,
  Sparkles,
  Flame,
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { User, Course } from '../types.js';
import { fetchCourses, updateProfile } from '../api.js';

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

  const getPassionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Palette':
        return <Palette className="w-5 h-5 text-pink-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-blue-400" />;
      default:
        return <Music className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full">
                Personalized Learning Pathway
              </span>
              <span className="text-xs text-slate-400">• Age {user.age || 11}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, {user.displayName}! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              We personalize your education around what makes you curious. If algebra drills aren't your passion, you master proportions, symmetry, and logic through <span className="text-pink-400 font-semibold">Visual Arts</span> and <span className="text-blue-400 font-semibold">Game Design</span>!
            </p>
          </div>

          {/* Gamified Stats */}
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Flame className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-bold">Streak</span>
                <span className="text-sm font-black text-amber-400 font-mono">4 Days 🔥</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-bold">Level</span>
                <span className="text-sm font-black text-indigo-400 font-mono">Artisan 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Allocation Slider: Passion vs Abstract Core */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Personalized Focus Allocation</h3>
              <p className="text-xs text-slate-400">
                You control the balance between Creative Passion Projects and Applied Core Studies
              </p>
            </div>
          </div>
          {isSavingFocus && <span className="text-xs font-mono text-indigo-400 animate-pulse">Saving balance...</span>}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-pink-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Creative Arts & Design ({focusArt}%)
            </span>
            <span className="text-blue-400 flex items-center gap-1.5">
              Applied Math & Logic ({focusMath}%) <Gamepad2 className="w-4 h-4" />
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="80"
            step="5"
            value={focusArt}
            onChange={(e) => handleFocusSliderChange(parseInt(e.target.value, 10))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>More Studio Arts</span>
            <span>Balanced 50/50</span>
            <span>More Applied Code</span>
          </div>
        </div>
      </div>

      {/* Course Curriculums (6-Lesson Units) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Your Curated Learning Programs</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {courses.length} Active Tracks
              </span>
            </h2>
            <p className="text-xs text-slate-400">Each track includes 6 engaging lectures followed by an online Milestone Test</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const currentLesson = course.progress?.currentLesson || 1;
            const completedCount = course.progress?.completedLessons?.length || 0;
            const percent = Math.round((completedCount / 6) * 100);

            return (
              <div
                key={course.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
                        {getPassionIcon(course.icon_name)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                          {course.passion_cluster}
                        </span>
                        <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-6">
                    {course.description}
                  </p>

                  {/* 6-Lesson Progress Bar */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                      <span>Progress: Lesson {currentLesson} of 6</span>
                      <span className="font-mono text-indigo-400">{percent}%</span>
                    </div>

                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 8)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>6 Micro-Lectures</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <Award className="w-3 h-3" /> Milestone 7 Test
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Continue Lesson {currentLesson}</span>
                  </button>

                  <button
                    onClick={() => onSelectMilestone(course.id)}
                    className="px-3 py-2.5 bg-slate-950 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Take Milestone 7 Online Test"
                  >
                    <Award className="w-4 h-4" />
                    <span>Test</span>
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
