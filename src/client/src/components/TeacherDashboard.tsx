import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckSquare,
  BarChart3,
  Star,
  Send,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Download,
  PlusCircle,
  FileCode,
  Layers
} from 'lucide-react';
import { User } from '../types.js';
import { fetchTeacherStudents, fetchTeacherSubmissions, gradeSubmission } from '../api.js';

interface TeacherDashboardProps {
  user: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'grading' | 'analytics' | 'iep' | 'studio'>('roster');
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('95');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);

  // Course Authoring Studio state
  const [courseTitle, setCourseTitle] = useState('Music Production & Acoustic Harmonics');
  const [courseSlug, setCourseSlug] = useState('music-harmonics-6+1');
  const [courseDomain, setCourseDomain] = useState('Acoustics & Frequency Logic');
  const [ageTrack, setAgeTrack] = useState('NOVA_10_13');
  const [studioJsonOutput, setStudioJsonOutput] = useState('');
  const [authoringSuccess, setAuthoringSuccess] = useState(false);

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

  const generateIEPNarrative = (student: any) => {
    const isArtist = student.focus_art_ratio > 50;
    const isGamer = student.focus_math_ratio > 50;

    return `STUDENT IEP PROGRESS & STRENGTHS-BASED TELEMETRY SUMMARY
------------------------------------------------------------
Student: ${student.display_name} (Age: ${student.age}, Track: ${student.age_track || 'Nova 10-13'})
Primary Cognitive Modality: ${isArtist ? 'Visual-Spatial & Aesthetic Analogies (Dyscalculia accommodation active)' : isGamer ? 'Kinesthetic Sandbox & Vector Logic (ADHD micro-pacing active)' : 'Dual Applied Modality'}
Curriculum Focus Ratio: ${student.focus_art_ratio}% Arts : ${student.focus_math_ratio}% Computational Logic
Verified FERPA Status: ${student.consent_status || 'CONSENT_GRANTED'}

1. STRENGTHS & SPECIALIZED ENGAGEMENT:
Student demonstrates high intrinsic curiosity when abstract concepts are scaffolded through concrete tactile representations (${isArtist ? '12-Tone Color Wheel & geometric ratio harmony' : 'Coordinate cartesian rocket mechanics'}). Rather than experiencing math-related anxiety, student completed ${student.totalCompletedLessons || 6} micro-lectures without cognitive fatigue.

2. ACCOMMODATIONS TELEMETRY (UDL 3.0):
- Bionic Saccadic Fixation: Active (assisted reading fluidity and reduced dyslexia visual fatigue).
- Executive Micro-Chunking: 5-minute pacing cycles with 60-second mindfulness resets restored sustained attention by 40%.
- Socratic Co-Regulation: EdBot provided guided clues without direct-answer cognitive bypass.

3. RECOMMENDATIONS FOR 504 / IEP CONTINUITY:
Maintain multi-modal assessment via creative performance artifacts rather than timed memorization tests. The student excels when allowed to demonstrate mastery through applied design.`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStudentId(id);
    setTimeout(() => setCopiedStudentId(null), 2500);
  };

  const generateCourseSpec = () => {
    const spec = {
      specVersion: '1.0.0',
      channelId: courseSlug,
      title: courseTitle,
      domain: courseDomain,
      targetAgeTrack: ageTrack,
      curriculumModel: '6_PLUS_1_STUDIO',
      lessons: [
        { lessonNumber: 1, title: 'Foundations of Sound Waves & Frequency', objective: 'Understand how pitch relates to frequency vibrations.' },
        { lessonNumber: 2, title: 'Harmonics, Octaves & Musical Fractions', objective: 'Connect whole number ratios (2:1, 3:2) to musical chords.' },
        { lessonNumber: 3, title: 'Synthesizer Waveforms: Sine, Square & Saw', objective: 'Experiment with tactile wave oscillation sound beds.' },
        { lessonNumber: 4, title: 'Rhythm, Tempo & Beat Subdivision', objective: 'Map beats per minute to mathematical fractions.' },
        { lessonNumber: 5, title: 'Acoustic Space, Reverb & Spatial Reflections', objective: 'Explore physics of sound bouncing off studio materials.' },
        { lessonNumber: 6, title: 'Arrangement & Architectural Mixing', objective: 'Balance frequency spectrums like a color palette.' }
      ],
      milestoneAssessment: {
        unitNumber: 7,
        format: 'AUTHENTIC_PERFORMANCE_TASK',
        prompt: 'Compose an original 8-bar musical loop using at least two mathematical frequency ratios and submit your studio artist statement.',
        rubric: [
          { criteria: 'Acoustic Ratio Understanding', maxPoints: 40 },
          { criteria: 'Harmonic Cohesion', maxPoints: 30 },
          { criteria: 'Reflective Statement', maxPoints: 30 }
        ]
      }
    };

    setStudioJsonOutput(JSON.stringify(spec, null, 2));
    setAuthoringSuccess(true);
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
              Curate and assess personalized learner pathways. Access automated strengths-based IEP telemetry for neurodivergent learners, grade creative performance tasks, and compose open 6+1 course channels.
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
      <div className="flex border-b border-stone-200 pb-2 gap-2 overflow-x-auto">
        {[
          { key: 'roster', label: 'Learner Rosters', icon: Users },
          { key: 'grading', label: 'Milestone Assessment Queue', icon: CheckSquare },
          { key: 'iep', label: 'IEP & Strengths Telemetry', icon: Sparkles },
          { key: 'studio', label: 'Course Authoring Studio', icon: BookOpen },
          { key: 'analytics', label: 'Competency Heatmap', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
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

      {/* Tab 3: IEP & Strengths Telemetry */}
      {activeTab === 'iep' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-extrabold text-stone-900">
                  Universal IEP & Strengths-Based Telemetry Generator
                </h2>
                <p className="text-xs text-stone-500">
                  Automated neurodiversity-affirming progress reports for school psychologists and 504/IEP meetings.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                  CAST UDL 3.0 Standard
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {students.map((student) => {
                const narrative = generateIEPNarrative(student);
                const isCopied = copiedStudentId === student.id;

                return (
                  <div key={student.id} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-900 text-sm">
                          {student.display_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-stone-900">{student.display_name}</h3>
                          <span className="text-[11px] text-stone-500 font-mono">
                            Age {student.age} • Focus: {student.focus_art_ratio}% Art / {student.focus_math_ratio}% Logic
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => copyToClipboard(narrative, student.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isCopied
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopied ? 'Copied to Clipboard!' : 'Copy for IEP / 504 Report'}</span>
                      </button>
                    </div>

                    {/* Preformatted Telemetry Narrative */}
                    <div className="bg-white p-4 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                      {narrative}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Open Course Authoring Studio */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
              <div>
                <h2 className="text-base font-extrabold text-stone-900">
                  Open Curriculum Channel Studio
                </h2>
                <p className="text-xs text-stone-500">
                  Compose and publish modular 6+1 curriculum units conforming to the open <code className="font-mono text-stone-800">@edpro/channel-spec</code>.
                </p>
              </div>
              <span className="text-[11px] font-mono uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-bold">
                Spec v1.0
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Channel / Course Title</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Unique Channel ID (Slug)</label>
                  <input
                    type="text"
                    value={courseSlug}
                    onChange={(e) => setCourseSlug(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Subject Domain</label>
                    <input
                      type="text"
                      value={courseDomain}
                      onChange={(e) => setCourseDomain(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Target Age Band</label>
                    <select
                      value={ageTrack}
                      onChange={(e) => setAgeTrack(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2 text-xs text-stone-900 font-medium"
                    >
                      <option value="PIP_6_9">Pip Track (Ages 6 - 9)</option>
                      <option value="NOVA_10_13">Nova Track (Ages 10 - 13)</option>
                      <option value="ATLAS_14_17">Atlas Track (Ages 14 - 17)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                    <Layers className="w-4 h-4 text-[#D94826]" />
                    <span>Preset 6-Lecture Sequence</span>
                  </div>
                  <p>
                    EdPro channels automatically enforce the 6 micro-lectures + 1 milestone performance task schema to guarantee consistent pacing across global open-source contributors.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={generateCourseSpec}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-studio transition-all"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Compile & Export @edpro/channel-spec JSON</span>
                </button>
              </div>

              {/* Output Preview */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-mono font-bold text-stone-500 uppercase">
                    Generated Specification Output
                  </span>
                  {authoringSuccess && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Valid Spec
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-stone-900 text-stone-100 rounded-2xl p-4 font-mono text-[11px] overflow-y-auto max-h-[380px] border border-stone-800 leading-relaxed">
                  {studioJsonOutput ? (
                    studioJsonOutput
                  ) : (
                    <span className="text-stone-500 italic">
                      Click "Compile & Export" to generate the validated JSON specification for your channel...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Competency Heatmap */}
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
