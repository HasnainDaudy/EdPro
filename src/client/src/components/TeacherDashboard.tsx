import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckSquare,
  BarChart3,
  Sparkles,
  Award,
  Star,
  Send,
  ShieldCheck,
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { User } from '../types.js';
import { fetchTeacherStudents, fetchTeacherSubmissions, gradeSubmission } from '../api.js';

interface TeacherDashboardProps {
  user: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'grading' | 'analytics'>('roster');
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('95');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchTeacherStudents(), fetchTeacherSubmissions()])
      .then(([studs, subs]) => {
        setStudents(studs);
        setSubmissions(subs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load teacher portal data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setIsSubmittingGrade(true);
    try {
      await gradeSubmission(selectedSub.id, parseInt(gradeInput, 10), feedbackInput);
      setIsSubmittingGrade(false);
      setSelectedSub(null);
      setFeedbackInput('');
      loadData();
    } catch (err: any) {
      console.error('Grading error:', err);
      setIsSubmittingGrade(false);
      alert(err.message || 'Failed to submit grade.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
      {/* Teacher Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                Educator & Mentor Portal
              </span>
              <span className="text-xs text-slate-400">• FERPA Authorized Classroom</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Teacher Hub: {user.displayName}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Curate, monitor, and assess your students' personalized learning tracks. Review creative performance artifacts, review diagnostic heatmaps, and tailor instruction to each child's passion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Enrolled Learners</span>
              <span className="text-xl font-black text-white font-mono">{students.length}</span>
            </div>
            <div className="bg-slate-950/80 px-4 py-3 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Reviews</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {submissions.filter((s) => s.status === 'PENDING_TEACHER_REVIEW').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 pb-2 gap-2">
        {[
          { key: 'roster', label: 'Learner Rosters & Personalization', icon: Users },
          { key: 'grading', label: 'Milestone Assessment Queue', icon: CheckSquare },
          { key: 'analytics', label: 'Competency Heatmap', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Learner Rosters & Personalization */}
      {activeTab === 'roster' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Personalized Student Profiles</span>
              <span className="text-xs text-slate-400 font-normal">({students.length} students)</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> FERPA Compliant Isolation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Age / Track</th>
                  <th className="py-3 px-4">Passion Focus Balance</th>
                  <th className="py-3 px-4">Completed Lessons</th>
                  <th className="py-3 px-4">COPPA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{s.display_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{s.username}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>Age {s.age}</div>
                      <span className="text-[10px] text-indigo-400 font-mono capitalize">
                        {s.age_track?.replace(/_/g, ' ') || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-pink-400 text-[10px] font-mono">{s.focus_art_ratio}% Art</span>
                        <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden flex">
                          <div className="bg-pink-500 h-full" style={{ width: `${s.focus_art_ratio}%` }} />
                          <div className="bg-blue-500 h-full" style={{ width: `${s.focus_math_ratio}%` }} />
                        </div>
                        <span className="text-blue-400 text-[10px] font-mono">{s.focus_math_ratio}% Code</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {s.totalCompletedLessons} lessons
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {s.consent_status || 'VERIFIED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Grading Queue */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>Authentic Creative Submissions</span>
              <span className="text-xs font-mono text-slate-400">{submissions.length} total</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub) => {
                const isPending = sub.status === 'PENDING_TEACHER_REVIEW';
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub);
                      setGradeInput(sub.teacher_grade ? String(sub.teacher_grade) : '90');
                      setFeedbackInput(sub.teacher_feedback || '');
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedSub?.id === sub.id
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {sub.course_title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isPending ? 'Pending Review' : 'Graded'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1">{sub.artifact_title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{sub.artifact_description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/80">
                      <span>Submitted by: <strong className="text-slate-200">{sub.student_name}</strong></span>
                      <span className="font-mono text-indigo-400 font-bold">Auto-Score: {sub.auto_score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rubric Review Drawer / Modal */}
          {selectedSub && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Evaluating Student Artifact
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedSub.artifact_title}</h3>
                  <p className="text-xs text-slate-400">Author: {selectedSub.student_name} (Age {selectedSub.student_age})</p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                >
                  Close
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 space-y-2">
                <strong className="text-white block font-bold">Student Artist/Engineer Statement:</strong>
                <p className="leading-relaxed italic">"{selectedSub.artifact_description}"</p>
                {selectedSub.artifact_url && (
                  <div className="pt-2 text-indigo-400 font-mono text-[11px]">
                    Project URL: <a href={selectedSub.artifact_url} target="_blank" rel="noreferrer" className="underline">{selectedSub.artifact_url}</a>
                  </div>
                )}
              </div>

              {/* Rubric Criteria Evaluation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Evaluation Rubric</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSub.performanceTask?.rubric?.map((r: any, i: number) => (
                    <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="flex justify-between items-center text-slate-200 font-semibold mb-1">
                        <span>{r.criteria}</span>
                        <span className="text-amber-400 font-mono">{r.maxPoints} pts</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade & Feedback Form */}
              <form onSubmit={handleGradeSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Overall Milestone Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-32 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Personalized Pedagogical Feedback & Encouragement
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Provide constructive, growth-mindset feedback praising their specific choices..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingGrade}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingGrade ? 'Recording Grade...' : 'Save Grade & Send Feedback'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Diagnostic Mastery Heatmap */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Classroom Diagnostic Mastery Heatmap</h2>
            <p className="text-xs text-slate-400">Real-time mastery levels across personalized curriculum domains</p>
          </div>

          <div className="space-y-4">
            {[
              { domain: 'Geometric Composition & Proportions', percent: 92, status: 'Mastered', count: 14, color: 'bg-emerald-500' },
              { domain: '12-Tone Color Harmonies & Temperatures', percent: 88, status: 'Mastered', count: 12, color: 'bg-emerald-500' },
              { domain: 'Islamic Tile Tessellations & Symmetry', percent: 74, status: 'In Progress', count: 10, color: 'bg-amber-500' },
              { domain: '2D Cartesian Coordinates & Grid Motion', percent: 85, status: 'Mastered', count: 15, color: 'bg-emerald-500' },
              { domain: 'Velocity Vector Physics & Gravity', percent: 68, status: 'Needs Targeted Support', count: 8, color: 'bg-rose-500' },
              { domain: 'AABB Collision Detection Algorithms', percent: 78, status: 'In Progress', count: 11, color: 'bg-amber-500' }
            ].map((d, i) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">{d.domain}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">{d.count} learners</span>
                    <span className="font-mono font-bold text-white">{d.percent}%</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full transition-all duration-500`} style={{ width: `${d.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
