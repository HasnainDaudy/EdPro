import React, { useState, useEffect } from 'react';
import { User } from './types.js';
import { fetchCurrentUser, logoutUser, loginUser } from './api.js';
import { Navbar } from './components/Navbar.js';
import { LandingHero } from './components/LandingHero.js';
import { AuthModal } from './components/AuthModal.js';
import { StudentDashboard } from './components/StudentDashboard.js';
import { LessonPlayer } from './components/LessonPlayer.js';
import { MilestoneTest } from './components/MilestoneTest.js';
import { TeacherDashboard } from './components/TeacherDashboard.js';
import { AdminPrivacyPortal } from './components/AdminPrivacyPortal.js';
import { SocraticTutorDrawer } from './components/SocraticTutorDrawer.js';
import { Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeCourseId, setActiveCourseId] = useState<string>('');
  const [activeCourseTitle, setActiveCourseTitle] = useState<string>('');
  const [activeLessonNumber, setActiveLessonNumber] = useState<number>(1);
  const [activeLessonTitle, setActiveLessonTitle] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => {
        if (u) {
          setUser(u);
          if (u.role === 'TEACHER') setCurrentView('teacher');
          else if (u.role === 'ADMIN') setCurrentView('admin');
          else setCurrentView('dashboard');
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setCurrentView('home');
  };

  const handleQuickSwitchUser = async (username: string) => {
    try {
      const u = await loginUser(username, 'EdProPass123!');
      setUser(u);
      if (u.role === 'TEACHER') setCurrentView('teacher');
      else if (u.role === 'ADMIN') setCurrentView('admin');
      else setCurrentView('dashboard');
    } catch (err) {
      console.error('Quick switch error:', err);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseId(courseId);
    setActiveLessonNumber(1);
    setCurrentView('lesson');
  };

  const handleSelectMilestone = (courseId: string) => {
    setActiveCourseId(courseId);
    setCurrentView('milestone');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-stone-800 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-stone-500">Loading EdPro Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-stone-900">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenTutor={() => setIsTutorOpen(true)}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onQuickSwitchUser={handleQuickSwitchUser}
      />

      <main className="flex-1 flex flex-col">
        {currentView === 'home' && !user && (
          <LandingHero
            onGetStarted={() => setIsAuthOpen(true)}
            onExploreCourses={() => setIsAuthOpen(true)}
            onOpenTutor={() => setIsTutorOpen(true)}
          />
        )}

        {currentView === 'home' && user && (
          <StudentDashboard
            user={user}
            onSelectCourse={handleSelectCourse}
            onSelectMilestone={handleSelectMilestone}
            onOpenTutor={() => setIsTutorOpen(true)}
          />
        )}

        {currentView === 'dashboard' && user && (
          <StudentDashboard
            user={user}
            onSelectCourse={handleSelectCourse}
            onSelectMilestone={handleSelectMilestone}
            onOpenTutor={() => setIsTutorOpen(true)}
          />
        )}

        {currentView === 'lesson' && activeCourseId && (
          <LessonPlayer
            user={user}
            courseId={activeCourseId}
            initialLessonNumber={activeLessonNumber}
            onBack={() => setCurrentView('dashboard')}
            onOpenTutor={() => setIsTutorOpen(true)}
            onGoToMilestone={() => setCurrentView('milestone')}
            onLessonChange={(num, lTitle, cTitle) => {
              setActiveLessonNumber(num);
              if (lTitle) setActiveLessonTitle(lTitle);
              if (cTitle) setActiveCourseTitle(cTitle);
            }}
          />
        )}

        {currentView === 'milestone' && activeCourseId && (
          <MilestoneTest
            user={user}
            courseId={activeCourseId}
            onBack={() => setCurrentView('lesson')}
          />
        )}

        {currentView === 'teacher' && user && (
          <TeacherDashboard user={user} />
        )}

        {currentView === 'admin' && user && (
          <AdminPrivacyPortal user={user} />
        )}
      </main>

      {/* Socratic Tutor Drawer */}
      <SocraticTutorDrawer
        user={user}
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        courseId={activeCourseId}
        courseTitle={activeCourseTitle}
        lessonNumber={activeLessonNumber}
        lessonTitle={activeLessonTitle}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          if (u.role === 'TEACHER') setCurrentView('teacher');
          else if (u.role === 'ADMIN') setCurrentView('admin');
          else setCurrentView('dashboard');
        }}
      />

      {/* Clean Studio Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 px-4 sm:px-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-stone-900">EdPro</span>
            <span>•</span>
            <span>AGPL-3.0 Open-Source K-12 Educational Infrastructure</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-700" /> COPPA & FERPA Standard
            </span>
            <span>•</span>
            <span>Zero Third-Party Advertising Trackers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
