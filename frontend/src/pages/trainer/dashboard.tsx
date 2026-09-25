import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Layers,
  PlusCircle,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/auth-context';

interface TrainerDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anRes, stRes] = await Promise.all([
          api.progress.getTrainerAnalytics(),
          api.progress.getTrainerStudents(),
        ]);
        setAnalytics(anRes);
        setStudents(stRes.students);
      } catch (err) {
        console.error('Failed to load trainer dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = analytics?.stats || {
    total_courses: 0,
    total_students: 0,
    total_enrollments: 0,
    total_quizzes: 0,
    average_score: 0,
    completion_rate: 0,
  };

  const needsAttentionStudents = students.filter((s) => s.needs_attention);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 text-white shadow-xl shadow-black/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trainer Instruction Suite</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">
              Welcome, {user?.name}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed font-light">
              You are managing {stats.total_courses} courses across {stats.total_students} distinct
              students with an average student completion rate of {stats.completion_rate}%.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('trainer-courses')}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-900/30 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Course</span>
            </button>
            <button
              onClick={() => onNavigate('trainer-quizzes')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Manage Quizzes</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{stats.total_courses}</span>
            <span className="text-xs text-slate-400">authored</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Students</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{stats.total_students}</span>
            <span className="text-xs text-slate-400">enrolled</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quizzes</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{stats.total_quizzes}</span>
            <span className="text-xs text-slate-400">assessments</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{stats.average_score}%</span>
            <span className="text-xs text-emerald-400">performance</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-100">{stats.completion_rate}%</span>
            <span className="text-xs text-amber-400">rate</span>
          </div>
        </div>
      </div>

      {/* Needs Attention Alert Callout */}
      {needsAttentionStudents.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/50 text-amber-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-100">
                {needsAttentionStudents.length} Student(s) Require Your Attention
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Automatically flagged by rule: Progress &lt; 40% or Quiz Score &lt; 50%.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('trainer-students')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition flex-shrink-0"
          >
            Review Students
          </button>
        </div>
      )}

      {/* Recent Student Performance Table Preview */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Student Performance Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Active trainees across your curriculum programs</p>
          </div>
          <button
            onClick={() => onNavigate('trainer-students')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            View All Enrolled Students →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-6">Student</th>
                <th className="py-3 px-6">Course</th>
                <th className="py-3 px-6">Progress</th>
                <th className="py-3 px-6">Quiz Score</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {students.slice(0, 5).map((st) => (
                <tr key={st.enrollment_id} className="hover:bg-slate-800/50 transition">
                  <td className="py-4 px-6">
                    <p className="text-slate-100 font-bold">{st.student_name}</p>
                    <p className="text-[10px] text-slate-400">{st.student_email}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{st.course_title}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            st.progress === 100
                              ? 'bg-emerald-400'
                              : st.progress < 40
                              ? 'bg-amber-400'
                              : 'bg-violet-500'
                          }`}
                          style={{ width: `${st.progress}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-300">{st.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`font-semibold ${
                        st.raw_quiz_score !== null && st.raw_quiz_score < 50
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-200'
                      }`}
                    >
                      {st.quiz_score}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {st.needs_attention ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        Needs Attention
                      </span>
                    ) : st.status === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
