import React from 'react';
import { Sparkles, Bot, LogOut, Shield, User as UserIcon, BookOpen, Layers } from 'lucide-react';
import { User } from '../types.js';

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
  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Tagline */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-lg tracking-tight">EdPro</span>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                OpenSource
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Personalized Education for Every Mind</p>
          </div>
        </div>

        {/* Center Nav Views (When logged in) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            {user.role === 'STUDENT' && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Learning Track
              </button>
            )}

            {(user.role === 'TEACHER' || user.role === 'ADMIN') && (
              <button
                onClick={() => onNavigate('teacher')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentView === 'teacher' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Teacher Portal
              </button>
            )}

            {user.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentView === 'admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Compliance Center
              </button>
            )}
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Ask Tutor button */}
          <button
            onClick={onOpenTutor}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-sm"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>EdBot</span>
          </button>

          {/* Quick Demo Switcher Dropdown */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-[11px]">
            <span className="text-slate-500 font-mono text-[10px]">Demo:</span>
            <button
              onClick={() => onQuickSwitchUser('leo_artist')}
              className={`px-1.5 py-0.5 rounded font-mono ${
                user?.username === 'leo_artist' ? 'bg-pink-600/30 text-pink-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Leo (Art)
            </button>
            <button
              onClick={() => onQuickSwitchUser('maya_games')}
              className={`px-1.5 py-0.5 rounded font-mono ${
                user?.username === 'maya_games' ? 'bg-blue-600/30 text-blue-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Maya (Game)
            </button>
            <button
              onClick={() => onQuickSwitchUser('teacher_carter')}
              className={`px-1.5 py-0.5 rounded font-mono ${
                user?.username === 'teacher_carter' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Teacher
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-white block leading-tight">{user.displayName}</span>
                <span className="text-[10px] text-slate-400 font-mono">{user.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
