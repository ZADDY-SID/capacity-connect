import React, { useEffect, useState } from 'react';
import {
  Award,
  BarChart2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, CertificateItem } from '../../services/api';
import { CertificateModal } from '../../components/ui/certificate-view';

interface ProgressPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<{
    stats: any;
    enrollments: any[];
    recent_activity: any[];
    certificates: CertificateItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.progress.getTraineeDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load progress', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = (data?.enrollments || []).map((en) => ({
    name: en.course?.title?.length > 18 ? en.course.title.slice(0, 18) + '...' : en.course?.title,
    progress: en.progress_percentage,
    completedModules: en.completed_modules_count,
    totalModules: en.total_modules_count,
  }));

  const stats = data?.stats || {
    enrolled_count: 0,
    completed_count: 0,
    average_score: 0,
    overall_progress: 0,
    certificate_count: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl shadow-black/20">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          Personal Analytics
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-3">
          Skill Mastery & Progress Analytics
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Detailed metrics across curriculum modules, assessment outcomes, and certified milestones.
        </p>

        {/* Top metrics strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-medium">Enrolled Courses</span>
            <p className="text-2xl font-black text-slate-100 mt-1">{stats.enrolled_count}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Completed Programs</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.completed_count}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Overall Progress</span>
            <p className="text-2xl font-black text-violet-400 mt-1">{stats.overall_progress}%</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Average Quiz Score</span>
            <p className="text-2xl font-black text-cyan-400 mt-1">{stats.average_score}%</p>
          </div>
        </div>
      </div>

      {/* Progress Chart with Recharts */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-violet-400" />
              <span>Course Completion Comparison</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time completion percentage across courses</p>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Progress']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ color: '#c084fc' }}
                />
                <Bar dataKey="progress" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.progress === 100 ? '#10b981' : '#8b5cf6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-12 text-center">No enrolled course data available.</p>
        )}
      </div>

      {/* Detailed Courses Progress Breakdown Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100">Enrolled Programs Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
              <tr>
                <th className="py-3 px-6">Course Name</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Modules Completed</th>
                <th className="py-3 px-6">Progress</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {(data?.enrollments || []).map((en) => {
                const c = en.course;
                if (!c) return null;
                const isComplete = en.status === 'completed';

                return (
                  <tr key={en.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6 text-slate-100 font-bold">{c.title}</td>
                    <td className="py-4 px-6 text-slate-400">{c.category}</td>
                    <td className="py-4 px-6 text-slate-300">
                      {en.completed_modules_count} / {en.total_modules_count} modules
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isComplete ? 'bg-emerald-400' : 'bg-violet-500'
                            }`}
                            style={{ width: `${en.progress_percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-300">{en.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isComplete
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        }`}
                      >
                        {isComplete ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onNavigate('course-player', { courseId: c.id })}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        Launch
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {activeCert && (
        <CertificateModal
          certificate={activeCert}
          onClose={() => setActiveCert(null)}
        />
      )}
    </div>
  );
};
