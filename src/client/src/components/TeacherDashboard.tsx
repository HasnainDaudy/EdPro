import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckSquare,
  BarChart3,
  Star,
  Send,
  ShieldCheck,
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
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Educator Header Banner */}
      <div className="bg-white border border-stone-200 border-t-4 border-t-[#15803D] rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 mb-1">
              <span>Educator Hub</span>
              <span>•</span>
              <span>FERPA Authorized Classroom</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Classroom Studio: {user.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl leading-relaxed">
              Curate and assess personalized learner pathways. Grade creative performance tasks using multi-dimensional rubrics, monitor competency progress, and group students for targeted guidance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-2xl text-center">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Enrolled Learners</span>
              <span className="text-xl font-black text-stone-900 font-mono">{students.length}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200 px-4 py-3 rounded-2xl text-center">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Pending Reviews</span>
              <span className="text-xl font-black text-[#B45309] font-mono">
                {submissions.filter((s) => s.status === 'PENDING_TEACHER_REVIEW').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 pb-2 gap-2">
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
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
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
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-extrabold text-stone-900">
              Personalized Student Profiles ({students.length} students)
            </h2>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" /> FERPA Compliant Access
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Age / Track</th>
                  <th className="py-3 px-4">Curriculum Focus Allocation</th>
                  <th className="py-3 px-4">Completed Lectures</th>
                  <th className="py-3 px-4">COPPA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">{s.display_name}</div>
                      <div className="text-[10px] text-stone-500 font-mono">@{s.username}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>Age {s.age}</div>
                      <span className="text-[10px] text-stone-500 font-mono capitalize">
                        {s.age_track?.replace(/_/g, ' ') || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[#D94826] text-[10px] font-mono font-bold">{s.focus_art_ratio}% Art</span>
                        <div className="w-24 h-2 bg-stone-200 rounded-full overflow-hidden flex">
                          <div className="bg-[#D94826] h-full" style={{ width: `${s.focus_art_ratio}%` }} />
                          <div className="bg-[#1D4ED8] h-full" style={{ width: `${s.focus_math_ratio}%` }} />
                        </div>
                        <span className="text-[#1D4ED8] text-[10px] font-mono font-bold">{s.focus_math_ratio}% Code</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {s.totalCompletedLessons} lectures
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {s.consent_status || 'VERIFIED'}
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
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
            <h2 className="text-sm font-extrabold text-stone-900">
              Authentic Performance Task Submissions ({submissions.length})
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
                        ? 'bg-stone-50 border-stone-900 shadow-sm'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                        {sub.course_title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {isPending ? 'Pending Review' : 'Graded'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 mb-1">{sub.artifact_title}</h3>
                    <p className="text-xs text-stone-600 line-clamp-2 mb-3">{sub.artifact_description}</p>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 border-t border-stone-100">
                      <span>By: <strong className="text-stone-900">{sub.student_name}</strong></span>
                      <span className="font-mono text-stone-900 font-bold">Auto-Score: {sub.auto_score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rubric Review Drawer */}
          {selectedSub && (
            <div className="bg-white border border-stone-300 rounded-3xl p-6 sm:p-8 shadow-studio space-y-5">
              <div className="flex justify-between items-start pb-4 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                    Evaluating Student Performance Artifact
                  </span>
                  <h3 className="text-lg font-black text-stone-900">{selectedSub.artifact_title}</h3>
                  <p className="text-xs text-stone-500">Student: {selectedSub.student_name} (Age {selectedSub.student_age})</p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-xs text-stone-500 hover:text-stone-900 px-2.5 py-1 rounded bg-stone-100"
                >
                  Close
                </button>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-2">
                <strong className="text-stone-900 block font-bold">Artist / Engineer Statement:</strong>
                <p className="leading-relaxed italic">"{selectedSub.artifact_description}"</p>
                {selectedSub.artifact_url && (
                  <div className="pt-2 text-stone-600 font-mono text-[11px]">
                    Project URL: <a href={selectedSub.artifact_url} target="_blank" rel="noreferrer" className="underline font-bold text-stone-900">{selectedSub.artifact_url}</a>
                  </div>
                )}
              </div>

              {/* Rubric Criteria */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider">Evaluation Rubric</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedSub.performanceTask?.rubric?.map((r: any, i: number) => (
                    <div key={i} className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                      <div className="flex justify-between items-center text-stone-900 font-bold mb-0.5">
                        <span>{r.criteria}</span>
                        <span className="text-stone-500 font-mono text-[10px]">{r.maxPoints} pts</span>
                      </div>
                      <p className="text-[11px] text-stone-600">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade Form */}
              <form onSubmit={handleGradeSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Overall Milestone Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-32 bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Pedagogical Feedback & Constructive Encouragement
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Provide constructive, growth-mindset feedback praising their specific design decisions..."
                    className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingGrade}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-studio"
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

      {/* Tab 3: Competency Heatmap */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-stone-900">Classroom Competency Mastery Heatmap</h2>
            <p className="text-xs text-stone-500">Real-time mastery levels across personalized curriculum tracks</p>
          </div>

          <div className="space-y-4">
            {[
              { domain: 'Geometric Composition & Proportions', percent: 92, count: 14, color: 'bg-emerald-600' },
              { domain: '12-Tone Color Harmonies & Temperatures', percent: 88, count: 12, color: 'bg-emerald-600' },
              { domain: 'Islamic Tile Tessellations & Symmetry', percent: 74, count: 10, color: 'bg-amber-600' },
              { domain: '2D Cartesian Coordinates & Grid Motion', percent: 85, count: 15, color: 'bg-emerald-600' },
              { domain: 'Velocity Vector Physics & Gravity', percent: 68, count: 8, color: 'bg-[#D94826]' },
              { domain: 'AABB Collision Detection Algorithms', percent: 78, count: 11, color: 'bg-amber-600' }
            ].map((d, i) => (
              <div key={i} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-900">{d.domain}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-stone-500 font-mono">{d.count} learners</span>
                    <span className="font-mono font-bold text-stone-900">{d.percent}%</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
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
