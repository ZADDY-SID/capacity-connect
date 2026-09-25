import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit2,
  HelpCircle,
  PlusCircle,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import { api, CourseItem, QuestionItem, QuizItem } from '../../services/api';

interface QuizBuilderProps {
  onNavigate: (page: string, params?: any) => void;
}

export const QuizBuilderPage: React.FC<QuizBuilderProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Question editing modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<QuestionItem> | null>(null);

  // Quiz config editing
  const [passingPercentage, setPassingPercentage] = useState(60);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [savingQuiz, setSavingQuiz] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getAll({ mine: true });
      setCourses(res.courses);
      if (res.courses.length > 0) {
        setSelectedCourseId(res.courses[0].id);
        await loadQuizForCourse(res.courses[0].id);
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuizForCourse = async (courseId: number) => {
    try {
      const res = await api.quizzes.getForCourse(courseId);
      setQuiz(res.quiz);
      if (res.quiz) {
        setQuizTitle(res.quiz.title);
        setQuizDesc(res.quiz.description || '');
        setPassingPercentage(res.quiz.passing_percentage);
      } else {
        setQuizTitle('Course Final Assessment');
        setQuizDesc('Validate mastery of core concepts.');
        setPassingPercentage(60);
      }
    } catch (err) {
      console.error('Failed to fetch quiz', err);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCourseChange = async (courseId: number) => {
    setSelectedCourseId(courseId);
    await loadQuizForCourse(courseId);
  };

  const handleSaveQuizConfig = async () => {
    if (!selectedCourseId) return;
    setSavingQuiz(true);
    try {
      const res = await api.quizzes.createOrUpdate(selectedCourseId, {
        title: quizTitle,
        description: quizDesc,
        passing_percentage: passingPercentage,
      });
      setQuiz(res.quiz);
      alert('Quiz settings saved successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save quiz settings');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !editingQuestion) return;

    try {
      if (editingQuestion.id) {
        await api.quizzes.updateQuestion(editingQuestion.id, editingQuestion);
      } else {
        await api.quizzes.addQuestion(quiz.id, editingQuestion);
      }
      setShowQuestionModal(false);
      setEditingQuestion(null);
      if (selectedCourseId) await loadQuizForCourse(selectedCourseId);
    } catch (err: any) {
      alert(err.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.quizzes.deleteQuestion(questionId);
      if (selectedCourseId) await loadQuizForCourse(selectedCourseId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl shadow-black/20">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          Assessment Designer
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
          Quiz & Question Bank Builder
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Formulate certification assessments, configure multiple-choice options, set marks, and establish passing thresholds.
        </p>

        {/* Course Select Dropdown */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-300">Target Course:</label>
          <select
            value={selectedCourseId || ''}
            onChange={(e) => handleCourseChange(Number(e.target.value))}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-violet-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quiz Configuration */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" />
              <span>Assessment Settings</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assessment Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instructions / Description</label>
              <textarea
                rows={3}
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Passing Threshold ({passingPercentage}%)
              </label>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>40%</span>
                <span className="text-violet-300">Passing Mark: {passingPercentage}%</span>
                <span>90%</span>
              </div>
            </div>

            <button
              onClick={handleSaveQuizConfig}
              disabled={savingQuiz}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-violet-900/30"
            >
              {savingQuiz ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Right Column: Questions List & Builder */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl shadow-black/20 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-violet-400" />
                  <span>Question Bank ({quiz?.questions?.length || 0})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Objective evaluation questions</p>
              </div>

              <button
                onClick={() => {
                  if (!quiz) {
                    alert('Please save the assessment settings first.');
                    return;
                  }
                  setEditingQuestion({
                    question_text: '',
                    option_a: '',
                    option_b: '',
                    option_c: '',
                    option_d: '',
                    correct_option: 'A',
                    marks: 2,
                  });
                  setShowQuestionModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {quiz?.questions && quiz.questions.length > 0 ? (
                quiz.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md bg-violet-500/20 text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-violet-500/30">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100">{q.question_text}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {q.marks} marks
                        </span>
                        <button
                          onClick={() => {
                            setEditingQuestion(q);
                            setShowQuestionModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { k: 'A', text: q.option_a },
                        { k: 'B', text: q.option_b },
                        { k: 'C', text: q.option_c },
                        { k: 'D', text: q.option_d },
                      ].map((opt) => {
                        const isCorrect = q.correct_option === opt.k;
                        return (
                          <div
                            key={opt.k}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 font-semibold'
                                : 'bg-slate-800 border-slate-700/80 text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {opt.k}
                            </span>
                            <span className="truncate">{opt.text}</span>
                            {isCorrect && (
                              <span className="ml-auto text-[10px] font-bold text-emerald-400">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-10">
                  No questions formulated for this assessment yet. Click "Add Question" to begin.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {editingQuestion.id ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Question Prompt</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.question_text || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_text: e.target.value })
                  }
                  placeholder="e.g. Which keyword is used to declare a function in Python?"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Option A</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_a || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_a: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Option B</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_b || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_b: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Option C</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_c || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_c: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300">Option D</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.option_d || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, option_d: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correct Answer</label>
                  <select
                    value={editingQuestion.correct_option || 'A'}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, correct_option: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-violet-300 font-semibold rounded-xl text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marks</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingQuestion.marks || 2}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, marks: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
