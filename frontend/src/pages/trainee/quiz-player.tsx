import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, QuizItem, CertificateItem } from '../../services/api';
import { CertificateModal } from '../../components/ui/certificate-view';

interface QuizPlayerProps {
  courseId: number;
  quizId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const QuizPlayerPage: React.FC<QuizPlayerProps> = ({ courseId, quizId, onNavigate }) => {
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
    passing_percentage: number;
    attempt_id: number;
    detailed_answers: any[];
    certificate_generated: boolean;
    certificate?: CertificateItem;
  } | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await api.quizzes.getForCourse(courseId);
        setQuiz(res.quiz);
      } catch (err) {
        console.error('Failed to load quiz', err);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
        <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Quiz not available</h3>
        <p className="text-xs text-slate-500 mt-1">This quiz has no questions published yet.</p>
        <button
          onClick={() => onNavigate('course-player', { courseId })}
          className="mt-4 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Course
        </button>
      </div>
    );
  }

  const handleSelectOption = (questionId: number, optionKey: string) => {
    if (result) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = quiz.questions?.length || 0;

    if (answeredCount < totalQuestions) {
      if (!confirm(`You have answered ${answeredCount} of ${totalQuestions} questions. Are you sure you want to submit?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.quizzes.submit(quiz.id, selectedAnswers);
      setResult(res.result);

      if (res.result.passed) {
        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('course-player', { courseId })}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course Modules</span>
          </button>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{quiz.title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Passing Threshold: <strong>{quiz.passing_percentage}%</strong> • {quiz.questions.length} Questions
          </p>
        </div>

        {/* Answered Counter */}
        <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-center">
          <div className="text-xs text-slate-500 font-medium">Answered</div>
          <div className="text-base font-bold text-slate-900">
            {Object.keys(selectedAnswers).length} / {quiz.questions.length}
          </div>
        </div>
      </div>

      {/* Result Display Banner if Submitted */}
      {result && (
        <div
          className={`p-6 rounded-2xl border shadow-soft transition-all duration-300 ${
            result.passed
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
              : 'bg-gradient-to-r from-rose-50 to-amber-50 border-rose-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl ${
                  result.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <div>
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    result.passed
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}
                >
                  {result.passed ? 'Assessment Passed' : 'Assessment Needs Improvement'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  You scored {result.score} of {result.max_score} points ({result.percentage}%)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {result.passed
                    ? 'Outstanding job! You demonstrated mastery of the subject.'
                    : `You need at least ${result.passing_percentage}% to pass. Review the answers below and try again.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {result.certificate && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>
              )}
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Cards List */}
      <div className="space-y-6">
        {quiz.questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const detailedAnswer = result?.detailed_answers?.find((a) => a.question_id === q.id);

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question_text}
                  </h4>
                </div>
                <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
                  {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[
                  { key: 'A', text: q.option_a },
                  { key: 'B', text: q.option_b },
                  { key: 'C', text: q.option_c },
                  { key: 'D', text: q.option_d },
                ].map((opt) => {
                  const isSelected = selected === opt.key;
                  let optStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';

                  if (result && detailedAnswer) {
                    if (opt.key === detailedAnswer.correct_option) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400';
                    } else if (isSelected && !detailedAnswer.is_correct) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-400';
                    }
                  } else if (isSelected) {
                    optStyle = 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20';
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={!!result}
                      onClick={() => handleSelectOption(q.id, opt.key)}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${optStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-xs sm:text-sm font-medium mt-0.5 leading-snug">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Post-submission Review details */}
              {result && detailedAnswer && (
                <div
                  className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
                    detailedAnswer.is_correct
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  <span className="font-semibold">
                    {detailedAnswer.is_correct
                      ? 'Correct! Full marks awarded.'
                      : `Incorrect. Correct answer is option ${detailedAnswer.correct_option}.`}
                  </span>
                  <span>
                    +{detailedAnswer.marks_awarded} / {detailedAnswer.marks_possible}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action */}
      {!result && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-soft flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Ensure you have answered all questions prior to submitting.
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm shadow-brand-500/25 flex items-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Evaluating...' : 'Submit Assessment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && result?.certificate && (
        <CertificateModal
          certificate={result.certificate}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};
