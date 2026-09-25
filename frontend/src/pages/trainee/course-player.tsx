import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Layers,
  Sparkles,
  Target,
} from 'lucide-react';
import { api, CourseItem, ModuleItem } from '../../services/api';
import { CertificateModal } from '../../components/ui/certificate-view';

interface CoursePlayerProps {
  courseId: number;
  onNavigate: (page: string, params?: any) => void;
}

export const CoursePlayerPage: React.FC<CoursePlayerProps> = ({ courseId, onNavigate }) => {
  const [course, setCourse] = useState<CourseItem | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const loadCourse = async () => {
    try {
      const res = await api.courses.getById(courseId);
      setCourse(res.course);
    } catch (err) {
      console.error('Failed to load course detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl p-10 text-center border border-slate-800">
        <h3 className="text-lg font-bold text-slate-100">Course content unavailable</h3>
        <p className="text-xs text-slate-400 mt-1">This course does not have active modules yet.</p>
        <button
          onClick={() => onNavigate('courses-browse')}
          className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const activeModule: ModuleItem = course.modules[activeModuleIndex];
  const completedIds = course.enrollment?.completed_module_ids || [];
  const isCurrentModuleComplete = completedIds.includes(activeModule.id);
  const totalModules = course.modules.length;
  const completedCount = completedIds.length;
  const progressPct = course.enrollment?.progress_percentage || 0;
  const quiz = course.quizzes && course.quizzes.length > 0 ? course.quizzes[0] : null;

  const handleToggleComplete = async () => {
    setCompleting(true);
    try {
      const res = await api.progress.completeModule(activeModule.id, !isCurrentModuleComplete);
      await loadCourse();
      if (res.certificate_issued && res.certificate) {
        setShowCertModal(true);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update progress');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-100">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('courses-browse')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            title="Back to Courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              {course.category} • {course.difficulty}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {course.title}
            </h2>
          </div>
        </div>

        {/* Progress & Certificate Shortcut */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200">{progressPct}% Complete</span>
            <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800 mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {course.certificate && (
            <button
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>View Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Syllabus Checklist Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                <span>Curriculum Syllabus</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {completedCount}/{totalModules} Complete
              </span>
            </div>

            {/* Modules List */}
            <div className="space-y-1.5">
              {course.modules.map((mod, index) => {
                const isCurrent = index === activeModuleIndex;
                const isDone = completedIds.includes(mod.id);

                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveModuleIndex(index)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 border ${
                      isCurrent
                        ? 'bg-violet-950/50 border-violet-500/60 text-slate-100 shadow-xs'
                        : 'border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-0.5">
                        <span>Module {index + 1}</span>
                        <span>{mod.duration_minutes}m</span>
                      </div>
                      <p className={`text-xs truncate ${isCurrent ? 'font-bold text-violet-300' : 'font-medium'}`}>
                        {mod.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Final Assessment Card */}
            {quiz && (
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-violet-300 text-xs font-bold mb-1">
                    <Target className="w-4 h-4 text-violet-400" />
                    <span>Final Certification Quiz</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Pass with {quiz.passing_percentage}% or higher to unlock your official credential.
                  </p>
                  <button
                    onClick={() => onNavigate('quiz-player', { courseId: course.id, quizId: quiz.id })}
                    className="w-full py-2 px-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Take Final Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Module Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 p-6 sm:p-8">
            {/* Module Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Module {activeModuleIndex + 1} of {totalModules}
                </span>
                <h1 className="text-2xl font-extrabold text-slate-100 mt-1">
                  {activeModule.title}
                </h1>
                {activeModule.description && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">{activeModule.description}</p>
                )}
              </div>

              {/* Module Complete Action */}
              <button
                onClick={handleToggleComplete}
                disabled={completing}
                className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                  isCurrentModuleComplete
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completing
                    ? 'Updating...'
                    : isCurrentModuleComplete
                    ? 'Completed ✓'
                    : 'Mark as Completed'}
                </span>
              </button>
            </div>

            {/* Key Takeaways Callout */}
            {activeModule.key_points && activeModule.key_points.length > 0 && (
              <div className="my-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Points & Core Takeaways</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-200/90 font-medium">
                  {activeModule.key_points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rich Content View */}
            <div className="prose max-w-none text-slate-300 text-sm leading-relaxed space-y-4 my-6 font-sans">
              <div className="whitespace-pre-wrap font-sans text-slate-300">{activeModule.content}</div>
            </div>

            {/* External / Simple Material Link if present */}
            {activeModule.material_url && (
              <div className="mt-8 p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">Supplementary Material</h5>
                    <p className="text-[11px] text-slate-400">Official references and exercise documentation</p>
                  </div>
                </div>
                <a
                  href={activeModule.material_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition shadow-xs"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            )}

            {/* Bottom Nav: Previous & Next Module */}
            <div className="mt-10 pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActiveModuleIndex(Math.max(0, activeModuleIndex - 1))}
                disabled={activeModuleIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Module</span>
              </button>

              {activeModuleIndex < totalModules - 1 ? (
                <button
                  onClick={() => setActiveModuleIndex(activeModuleIndex + 1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition shadow-xs"
                >
                  <span>Next Module</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : quiz ? (
                <button
                  onClick={() => onNavigate('quiz-player', { courseId: course.id, quizId: quiz.id })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition shadow-sm shadow-violet-900/30"
                >
                  <Target className="w-4 h-4" />
                  <span>Start Certification Quiz</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && course.certificate && (
        <CertificateModal
          certificate={course.certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
