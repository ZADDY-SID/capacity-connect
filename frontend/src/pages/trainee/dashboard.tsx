import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  GraduationCap,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { api, CertificateItem } from '../../services/api';
import { useAuth } from '../../context/auth-context';
import { CertificateModal } from '../../components/ui/certificate-view';

interface TraineeDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    stats: {
      enrolled_count: number;
      completed_count: number;
      average_score: number;
      overall_progress: number;
      certificate_count: number;
    };
    enrollments: any[];
    recent_activity: any[];
    certificates: CertificateItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState<CertificateItem | null>(null);

  const loadData = async () => {
    try {
      const res = await api.progress.getTraineeDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    enrolled_count: 0,
    completed_count: 0,
    average_score: 0,
    overall_progress: 0,
    certificate_count: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 text-white shadow-soft-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/60 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trainee Learning Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed font-light">
            You're currently enrolled in {stats.enrolled_count} courses with an overall completion
            rate of {stats.overall_progress}%. Keep learning to unlock your next credential!
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('courses-browse')}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Browse New Courses
            </button>
            <button
              onClick={() => onNavigate('trainee-certificates')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              View My Certificates ({stats.certificate_count})
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Enrolled Courses
            </span>
            <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-800 text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.enrolled_count}</span>
            <span className="text-xs text-slate-400">active programs</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.completed_count}</span>
            <span className="text-xs text-emerald-400 font-medium">courses finished</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Average Quiz Score
            </span>
            <div className="p-2.5 rounded-xl bg-brand-950 border border-brand-800 text-brand-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.average_score}%</span>
            <span className="text-xs text-brand-400 font-medium">assessment mastery</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Certificates Earned
            </span>
            <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{stats.certificate_count}</span>
            <span className="text-xs text-amber-400 font-medium">verified credentials</span>
          </div>
        </div>
      </div>

      {/* Main Enrolled Courses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">My Active Courses</h3>
          <button
            onClick={() => onNavigate('courses-browse')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300"
          >
            Explore Catalog →
          </button>
        </div>

        {data?.enrollments && data.enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.enrollments.map((en) => {
              const course = en.course;
              if (!course) return null;
              const isComplete = en.status === 'completed';

              return (
                <div
                  key={en.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-soft hover:shadow-glow transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-36 bg-slate-950 overflow-hidden">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-slate-950/90 border border-slate-800 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">
                        {course.category}
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        {isComplete ? (
                          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        ) : (
                          <span className="bg-sky-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold shadow-xs">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <h4 className="font-bold text-white text-base line-clamp-1">{course.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                          <span className="text-slate-400">Course Progress</span>
                          <span className="text-brand-400 font-bold">{en.progress_percentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isComplete
                                ? 'bg-emerald-500'
                                : 'bg-gradient-to-r from-brand-500 to-sky-500'
                            }`}
                            style={{ width: `${en.progress_percentage}%` }}
                          />
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400">
                          {en.completed_modules_count} of {en.total_modules_count} modules completed
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => onNavigate('course-player', { courseId: course.id })}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition text-center shadow-xs"
                    >
                      {isComplete ? 'Review Course Material' : 'Continue Learning →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">You are not enrolled in any courses yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Start by discovering available training programs in our catalog.
            </p>
            <button
              onClick={() => onNavigate('courses-browse')}
              className="mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition shadow-xs"
            >
              Browse Catalog
            </button>
          </div>
        )}
      </div>

      {/* Split Section: Recent Activity & Certificates Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Milestones</h3>
            <span className="text-xs text-slate-400">Activity Log</span>
          </div>

          {data?.recent_activity && data.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {data.recent_activity.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      act.type === 'certificate'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-brand-950 text-brand-300 border border-brand-800'
                    }`}
                  >
                    {act.type === 'certificate' ? (
                      <Award className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{act.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.details}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No recent activity recorded yet.</p>
          )}
        </div>

        {/* Certificates Quick Preview */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Earned Credentials</h3>
            <button
              onClick={() => onNavigate('trainee-certificates')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              View All ({data?.certificates.length || 0})
            </button>
          </div>

          {data?.certificates && data.certificates.length > 0 ? (
            <div className="space-y-3">
              {data.certificates.slice(0, 3).map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-brand-500/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{cert.course_title}</p>
                      <p className="text-[10px] text-slate-400">
                        Issued on {cert.issue_date} • ID: {cert.certificate_code}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCert(cert)}
                    className="px-3 py-1.5 bg-brand-950 hover:bg-brand-900 text-brand-300 border border-brand-800 text-xs font-semibold rounded-lg transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">
                Complete all course modules and pass the final assessment to earn your credentials!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {activeCert && (
        <CertificateModal
          certificate={activeCert}
          onClose={() => setActiveCert(null)}
        />
      )}
    </div>
  );
};
