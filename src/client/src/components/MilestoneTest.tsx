import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Send,
  AlertCircle,
  FileCheck,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, MilestoneAssessment } from '../types.js';
import { fetchMilestoneAssessment, submitMilestoneAssessment } from '../api.js';

interface MilestoneTestProps {
  user: User | null;
  courseId: string;
  onBack: () => void;
}

export const MilestoneTest: React.FC<MilestoneTestProps> = ({ user, courseId, onBack }) => {
  const [assessment, setAssessment] = useState<MilestoneAssessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [artifactTitle, setArtifactTitle] = useState<string>('');
  const [artifactDescription, setArtifactDescription] = useState<string>('');
  const [artifactUrl, setArtifactUrl] = useState<string>('');
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchMilestoneAssessment(courseId)
      .then((data) => {
        setAssessment(data.assessment);
        if (data.previousSubmission) {
          setPreviousSubmission(data.previousSubmission);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load assessment:', err);
        setLoading(false);
      });
  }, [courseId]);

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    if (submittedResult) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment) return;

    // Verify all 6 questions answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < assessment.questions.length) {
      alert(`Please answer all ${assessment.questions.length} questions before submitting!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitMilestoneAssessment(courseId, {
        answers,
        artifactTitle: artifactTitle || 'My Creative Milestone Submission',
        artifactDescription,
        artifactUrl
      });

      setSubmittedResult(result);
      setIsSubmitting(false);

      if (result.passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setIsSubmitting(false);
      alert(err.message || 'Submission failed.');
    }
  };

  if (loading || !assessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Course Lessons</span>
      </button>

      {/* Assessment Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Milestone 7 Milestone Evaluation
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">{assessment.title}</h1>
          </div>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">{assessment.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> Untimed & Growth-Focused
          </span>
          <span>•</span>
          <span>Passing Score: {assessment.passingScore}%</span>
        </div>
      </div>

      {/* Existing Submission Banner (if reviewed by teacher) */}
      {previousSubmission && !submittedResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Previous Milestone Submission</h3>
            </div>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-mono">
              Auto Score: {previousSubmission.autoScore}%
            </span>
          </div>

          <div className="mt-3 text-xs text-slate-300 space-y-2">
            <div>
              <strong className="text-slate-100">Artifact:</strong> {previousSubmission.artifactTitle}
            </div>
            {previousSubmission.teacherGrade !== null ? (
              <div className="bg-emerald-950/40 border border-emerald-900/40 p-4 rounded-xl mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Teacher Review Completed
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    Grade: {previousSubmission.teacherGrade} / 100
                  </span>
                </div>
                <p className="text-emerald-200 mt-1 italic">"{previousSubmission.teacherFeedback}"</p>
              </div>
            ) : (
              <div className="text-amber-400/80 text-[11px] mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Submitted and awaiting teacher review. You may retake the test below to improve your score!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Immediate Result Card */}
      {submittedResult && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                🎉
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">Milestone Test Completed!</h3>
                <p className="text-xs text-emerald-400">
                  {submittedResult.passed ? 'Demonstrated Competency! Excellent Work!' : 'Good effort! Review the diagnostic hints below.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white font-mono">{submittedResult.autoScore}%</span>
              <span className="block text-[10px] text-slate-400">Interactive Score</span>
            </div>
          </div>

          {/* Diagnostic Explanations */}
          <div className="mt-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnostic Explanations</h4>
            {submittedResult.questionFeedback?.map((fb: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  fb.isCorrect ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' : 'bg-rose-950/20 border-rose-900/40 text-rose-200'
                }`}
              >
                <span className="font-mono shrink-0 font-bold">Q{idx + 1}:</span>
                <div className="space-y-0.5">
                  <div className="font-medium text-slate-100">{fb.prompt}</div>
                  <div className="text-[11px] opacity-80">{fb.explanation}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onBack}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              Back to Course Home
            </button>
          </div>
        </div>
      )}

      {/* Online Assessment Form */}
      {!submittedResult && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: 6 Interactive Questions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Part 1: Conceptual Mastery Questions</span>
                <span className="text-xs font-normal text-slate-400">({assessment.questions.length} questions)</span>
              </h2>
              <span className="text-xs font-mono text-indigo-400">
                {Object.keys(answers).length} of {assessment.questions.length} answered
              </span>
            </div>

            {assessment.questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-300 font-mono text-[10px] flex items-center justify-center shrink-0">
                    {qIdx + 1}
                  </span>
                  <span>{q.prompt}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        type="button"
                        key={optIdx}
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        className={`p-3 rounded-lg border text-left text-xs transition-all flex items-start gap-2 ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono text-[10px] opacity-60">[{String.fromCharCode(65 + optIdx)}]</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: Authentic Performance Task (Creative Project Submission) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="pb-4 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-pink-400 font-bold">
                Part 2: Authentic Performance Task
              </span>
              <h2 className="text-base font-bold text-white mt-1">Submit Your Creative Artifact</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{assessment.performanceTask?.prompt}</p>
            </div>

            {/* Rubric Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {assessment.performanceTask?.rubric?.map((r, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <div className="flex justify-between items-center text-slate-200 font-semibold mb-1">
                    <span>{r.criteria}</span>
                    <span className="text-[10px] text-amber-400 font-mono">{r.maxPoints} pts</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{r.description}</p>
                </div>
              ))}
            </div>

            {/* Submission Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Artifact Title</label>
                <input
                  type="text"
                  required
                  value={artifactTitle}
                  onChange={(e) => setArtifactTitle(e.target.value)}
                  placeholder="e.g. Leonardo's Modern Geometry Canvas or Jump Physics Level 1"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Artist / Engineer Statement</label>
                <textarea
                  rows={3}
                  required
                  value={artifactDescription}
                  onChange={(e) => setArtifactDescription(e.target.value)}
                  placeholder="Explain how you applied the concepts from the 6 lessons in your design..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Link / Sandbox URL (Optional)</label>
                <input
                  type="url"
                  value={artifactUrl}
                  onChange={(e) => setArtifactUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Evaluating Assessment...' : 'Submit Milestone Assessment'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
