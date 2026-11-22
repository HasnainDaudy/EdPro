import React, { useState } from 'react';
import { X, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black text-sm">
            EP
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900">
              {isRegister ? 'Join EdPro' : 'Sign in to EdPro'}
            </h2>
            <p className="text-xs text-stone-500">
              {isRegister ? 'Set up your personalized learner profile' : 'Access your active learning tracks'}
            </p>
          </div>
        </div>

        {/* 1-Click Demo Profiles */}
        {!isRegister && (
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 mb-5">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-2">
              Instant 1-Click Demo Profiles
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('leo_artist', 'EdProPass123!')}
                className="p-2 rounded-xl bg-white hover:bg-orange-50 border border-stone-200 hover:border-[#D94826] text-center transition-all shadow-2xs"
              >
                <span className="text-xs font-bold text-stone-900 block">Leo Chen</span>
                <span className="text-[9px] text-[#D94826] font-mono font-bold">Art (11)</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('maya_games', 'EdProPass123!')}
                className="p-2 rounded-xl bg-white hover:bg-blue-50 border border-stone-200 hover:border-[#1D4ED8] text-center transition-all shadow-2xs"
              >
                <span className="text-xs font-bold text-stone-900 block">Maya R.</span>
                <span className="text-[9px] text-[#1D4ED8] font-mono font-bold">Game (12)</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount('teacher_carter', 'EdProPass123!')}
                className="p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-[#15803D] text-center transition-all shadow-2xs"
              >
                <span className="text-xs font-bold text-stone-900 block">Ms. Carter</span>
                <span className="text-[9px] text-[#15803D] font-mono font-bold">Teacher</span>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. leo_artist"
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name or Pseudonym</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Leo C."
                  className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 focus:border-stone-900 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none"
                  >
                    <option value="STUDENT">Student / Learner</option>
                    <option value="TEACHER">Teacher / Coach</option>
                    <option value="ADMIN">School Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Age ({age} yrs)</label>
                  <input
                    type="range"
                    min="6"
                    max="17"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full accent-stone-900 cursor-pointer mt-2"
                  />
                </div>
              </div>

              {age < 13 && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>COPPA Protected: Zero email collected, school official consent applied.</span>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-studio transition-all mt-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-stone-600 hover:text-stone-900 font-semibold transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register free"}
          </button>
        </div>
      </div>
    </div>
  );
};
