import React, { useState } from 'react';
import { X, Lock, User as UserIcon, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { User } from '../types.js';
import { loginUser, registerUser } from '../api.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('leo_artist');
  const [password, setPassword] = useState<string>('EdProPass123!');
  const [displayName, setDisplayName] = useState<string>('Leo Chen');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [age, setAge] = useState<number>(11);
  const [passionTrack, setPassionTrack] = useState<string>('visual_arts');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (isRegister) {
        user = await registerUser({
          username,
          password,
          displayName,
          role,
          age,
          passionTrack
        });
      } else {
        user = await loginUser(username, password);
      }
      setLoading(false);
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication error.');
    }
  };

  const setDemoAccount = (u: string, p: string) => {
    setIsRegister(false);
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{isRegister ? 'Join EdPro' : 'Welcome to EdPro'}</h2>
            <p className="text-xs text-slate-400">
              {isRegister ? 'Create your personalized learner account' : 'Sign in to continue your track'}
            </p>
          </div>
        </div>

        {/* 1-Click Demo Profiles */}
        {!isRegister && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 mb-5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">
              Instant 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('leo_artist', 'EdProPass123!')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/40 text-center transition-all"
              >
                <span className="text-xs font-bold text-pink-300 block">Leo Chen</span>
                <span className="text-[9px] text-slate-400 font-mono">Student (Art)</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('maya_games', 'EdProPass123!')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/40 text-center transition-all"
              >
                <span className="text-xs font-bold text-blue-300 block">Maya R.</span>
                <span className="text-[9px] text-slate-400 font-mono">Student (Game)</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('teacher_carter', 'EdProPass123!')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-center transition-all"
              >
                <span className="text-xs font-bold text-emerald-300 block">Ms. Carter</span>
                <span className="text-[9px] text-slate-400 font-mono">Teacher</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/50 border border-rose-900/60 text-rose-300 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. leo_artist"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Leo C."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="STUDENT">Student / Kid</option>
                    <option value="TEACHER">Teacher / Coach</option>
                    <option value="ADMIN">School Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Age ({age} yrs)</label>
                  <input
                    type="range"
                    min="6"
                    max="17"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer mt-2"
                  />
                </div>
              </div>

              {age < 13 && (
                <div className="bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-xl text-[11px] text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>COPPA Protected: Zero email collected, school official consent applied.</span>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create My Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register free"}
          </button>
        </div>
      </div>
    </div>
  );
};
