import React, { useState, useEffect } from 'react';
import {
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
        <div className="w-8 h-8 border-3 border-stone-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Course Lectures</span>
      </button>

      {/* Header Card */}
      <div className="bg-white border border-stone-200 border-t-4 border-t-[#B45309] rounded-3xl p-6 sm:p-8 shadow-studio space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-[#B45309] rounded-xl border border-amber-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
              Milestone 7 Evaluation
            </span>
            <h1 className="text-2xl font-black text-stone-900">{assessment.title}</h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">{assessment.description}</p>
        <div className="pt-2 flex items-center gap-4 text-xs font-medium text-stone-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-stone-400" /> Untimed & Growth-Focused
          </span>
          <span>•</span>
          <span>Passing Score: {assessment.passingScore}%</span>
        </div>
      </div>

      {/* Existing Submission Banner */}
      {previousSubmission && !submittedResult && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-studio space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-stone-700" />
              <h3 className="text-sm font-bold text-stone-900">Recorded Milestone Submission</h3>
            </div>
            <span className="text-xs bg-stone-100 text-stone-800 px-3 py-1 rounded-full font-mono font-bold">
              Auto Score: {previousSubmission.autoScore}%
            </span>
          </div>

          <div className="text-xs text-stone-700 space-y-2">
            <div>
              <strong className="text-stone-900">Artifact:</strong> {previousSubmission.artifactTitle}
            </div>
            {previousSubmission.teacherGrade !== null ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-600" /> Teacher Review Complete
                  </span>
                  <span className="font-mono font-bold text-emerald-950 text-sm">
                    Grade: {previousSubmission.teacherGrade} / 100
                  </span>
                </div>
                <p className="text-emerald-900 mt-1 italic">"{previousSubmission.teacherFeedback}"</p>
              </div>
            ) : (
              <div className="text-amber-800 text-[11px] mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Submitted and currently in the teacher review queue. You may retake the test below to improve your score.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Immediate Result Card */}
      {submittedResult && (
        <div className="bg-white border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-studio space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-black text-stone-900 text-xl">Milestone Test Completed</h3>
              <p className="text-xs text-emerald-700 font-bold mt-0.5">
                {submittedResult.passed ? 'Demonstrated Competency! Excellent Work!' : 'Review the diagnostic explanations below to build intuition.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-stone-900 font-mono">{submittedResult.autoScore}%</span>
              <span className="block text-[10px] text-stone-400 uppercase font-bold">Conceptual Score</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Diagnostic Explanations</h4>
            {submittedResult.questionFeedback?.map((fb: any, idx: number) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  fb.isCorrect ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50/60 border-rose-200 text-rose-950'
                }`}
              >
                <span className="font-mono shrink-0 font-bold">Q{idx + 1}:</span>
                <div className="space-y-0.5">
                  <div className="font-semibold text-stone-900">{fb.prompt}</div>
                  <div className="text-[11px] opacity-80">{fb.explanation}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Back to Course Home
            </button>
          </div>
        </div>
      )}

      {/* Online Assessment Form */}
      {!submittedResult && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Part 1: Conceptual Questions */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="text-sm font-extrabold text-stone-900">
                Part 1: Conceptual Questions ({assessment.questions.length} questions)
              </h2>
              <span className="text-xs font-mono text-stone-500">
                {Object.keys(answers).length} of {assessment.questions.length} answered
              </span>
            </div>

            {assessment.questions.map((q, qIdx) => (
              <div key={q.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-3">
                <div className="flex items-start gap-2 text-xs font-bold text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 font-mono text-[10px] flex items-center justify-center shrink-0">
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
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 font-medium shadow-xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
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

          {/* Part 2: Performance Task Artifact */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-5">
            <div className="pb-4 border-b border-stone-100">
              <h2 className="text-sm font-extrabold text-stone-900">
                Part 2: Authentic Creative Performance Artifact
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{assessment.performanceTask?.prompt}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assessment.performanceTask?.rubric?.map((r, i) => (
                <div key={i} className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                  <div className="flex justify-between items-center text-stone-900 font-bold mb-0.5">
                    <span>{r.criteria}</span>
                    <span className="text-stone-500 font-mono text-[10px]">{r.maxPoints} pts</span>
                  </div>
                  <p className="text-[11px] text-stone-600">{r.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Artifact Title</label>
                <input
                  type="text"
                  required
                  value={artifactTitle}
                  onChange={(e) => setArtifactTitle(e.target.value)}
                  placeholder="e.g. Leonardo's Modern Geometry Canvas or Jump Physics Level 1"
                  className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Artist / Engineer Statement</label>
                <textarea
                  rows={3}
                  required
                  value={artifactDescription}
                  onChange={(e) => setArtifactDescription(e.target.value)}
                  placeholder="Explain how you applied the concepts from the 6 lectures in your project..."
                  className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Project Link / Sandbox URL (Optional)</label>
                <input
                  type="url"
                  value={artifactUrl}
                  onChange={(e) => setArtifactUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-stone-50 border border-stone-300 focus:border-stone-900 rounded-xl px-3.5 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-studio transition-all"
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
