import React, { useState } from 'react';
import { Sparkles, Bot, LogOut, Sliders, Globe, Eye } from 'lucide-react';
import { User } from '../types.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { AccessibilityCockpitModal } from './AccessibilityCockpitModal.js';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenTutor: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onQuickSwitchUser: (username: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onOpenTutor,
  currentView,
  onNavigate,
  onQuickSwitchUser
}) => {
  const [isCockpitOpen, setIsCockpitOpen] = useState<boolean>(false);
  const { t, language, bionicReading, dyslexicFont, sensoryMode, cognitivePacing } = useAccessibility();

  const isAssisted = bionicReading || dyslexicFont || sensoryMode !== 'standard' || cognitivePacing !== 'standard';

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm group-hover:bg-[#D94826] transition-colors">
              EP
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-stone-900 text-lg tracking-tight">EdPro</span>
              <span className="text-[10px] font-mono uppercase bg-stone-100 text-stone-600 font-semibold px-1.5 py-0.5 rounded border border-stone-200">
                Open Source
              </span>
            </div>
          </div>

          {/* Center Nav Views (When authenticated) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600">
              {user.role === 'STUDENT' && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t.learningTrack}
                </button>
              )}

              {(user.role === 'TEACHER' || user.role === 'ADMIN') && (
                <button
                  onClick={() => onNavigate('teacher')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    currentView === 'teacher'
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t.educatorPortal}
                </button>
              )}

              {user.role === 'ADMIN' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    currentView === 'admin'
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-bold'
                      : 'hover:text-stone-900'
                  }`}
                >
                  {t.complianceLedger}
                </button>
              )}
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Accessibility Cockpit Trigger */}
            <button
              onClick={() => setIsCockpitOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isAssisted
                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
              }`}
              title="Sensory & Cognitive Accessibility"
            >
              <Eye className={`w-3.5 h-3.5 ${isAssisted ? 'text-amber-700' : 'text-stone-500'}`} />
              <span className="hidden sm:inline">{t.accessibility}</span>
              {isAssisted && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              )}
            </button>

            {/* Ask Tutor button */}
            <button
              onClick={onOpenTutor}
              className="flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-300 text-stone-800 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Bot className="w-4 h-4 text-[#D94826]" />
              <span className="hidden sm:inline">{t.askEdBot}</span>
            </button>

            {/* Quick Demo Switcher */}
            <div className="hidden xl:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-[11px]">
              <span className="text-stone-400 font-mono text-[10px] px-1.5">Demo:</span>
              <button
                onClick={() => onQuickSwitchUser('leo_artist')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                  user?.username === 'leo_artist'
                    ? 'bg-white text-[#D94826] font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Leo (Art)
              </button>
              <button
                onClick={() => onQuickSwitchUser('maya_games')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                  user?.username === 'maya_games'
                    ? 'bg-white text-[#1D4ED8] font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Maya (Game)
              </button>
              <button
                onClick={() => onQuickSwitchUser('teacher_carter')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                  user?.username === 'teacher_carter'
                    ? 'bg-white text-[#15803D] font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Teacher
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-1">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-stone-900 block leading-tight">{user.displayName}</span>
                  <span className="text-[10px] text-stone-500 font-mono capitalize">{user.role.toLowerCase()}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                {t.signIn}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Accessibility Cockpit Modal */}
      <AccessibilityCockpitModal
        isOpen={isCockpitOpen}
        onClose={() => setIsCockpitOpen(false)}
      />
    </>
  );
};
