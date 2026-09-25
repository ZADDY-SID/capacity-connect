import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  CheckCircle2,
  GraduationCap,
  Layers,
  PieChart,
  Sparkles,
  TrendingUp,
  Users,
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
import { api } from '../../services/api';

interface TrainerAnalyticsProps {
  onNavigate: (page: string, params?: any) => void;
}

export const TrainerAnalyticsPage: React.FC<TrainerAnalyticsProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.progress.getTrainerAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load trainer analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    total_courses: 0,
    total_students: 0,
    total_enrollments: 0,
    total_quizzes: 0,
    average_score: 0,
    completion_rate: 0,
  };

  const coursesChart = data?.courses_chart || [];
  const progressDistribution = data?.progress_distribution || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Executive Reports
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          Instructional Analytics & Funnels
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Evaluate course engagement, graduation funnels, and score distributions across all active cohorts.
        </p>

        {/* 4 Metric Counters */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Enrollments</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_enrollments}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Unique Learners</span>
            <p className="text-2xl font-black text-sky-600 mt-1">{stats.total_students}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Cohort Completion Rate</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completion_rate}%</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Avg Assessment Score</span>
            <p className="text-2xl font-black text-brand-600 mt-1">{stats.average_score}%</p>
          </div>
        </div>
      </div>

      {/* Two Column Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Enrollment vs Completion by Course */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-brand-600" />
                <span>Enrollment vs Completion</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Volume comparison by program</p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursesChart} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend />
                <Bar dataKey="enrollments" fill="#8b5cf6" name="Enrolled" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completions" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Student Progress Distribution Brackets */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-600" />
                <span>Progress Bracket Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Learners partitioned by completion percentage</p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} students`, 'Learners']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]}>
                  {progressDistribution.map((entry: any, index: number) => {
                    const colors = ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
