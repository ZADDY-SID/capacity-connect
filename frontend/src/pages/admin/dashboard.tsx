import React, { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  PieChart,
  Shield,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/auth-context';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.admin.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load admin analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    total_users: 0,
    trainees: 0,
    trainers: 0,
    admins: 0,
    total_courses: 0,
    published_courses: 0,
    total_enrollments: 0,
    completed_enrollments: 0,
    completion_rate: 0,
    total_certificates: 0,
    average_quiz_score: 0,
  };

  const userDist = data?.user_distribution || [];
  const categoryDist = data?.category_distribution || [];
  const enrollmentStatusDist = data?.enrollment_status_distribution || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-soft-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Administration & Governance</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Executive Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed font-light">
              Full administrative visibility over {stats.total_users} system users, {stats.total_courses} courses,
              and {stats.total_enrollments} active student enrollments.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('admin-users')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => onNavigate('admin-courses')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition border border-white/10 flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4" />
              <span>Course Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Users</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_users}</p>
          <span className="text-[10px] text-slate-400">across 3 roles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Trainees</span>
          <p className="text-2xl font-black text-sky-600 mt-1">{stats.trainees}</p>
          <span className="text-[10px] text-slate-400">active learners</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Trainers</span>
          <p className="text-2xl font-black text-brand-600 mt-1">{stats.trainers}</p>
          <span className="text-[10px] text-slate-400">educators</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Courses</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{stats.total_courses}</p>
          <span className="text-[10px] text-slate-400">{stats.published_courses} published</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Enrollments</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_enrollments}</p>
          <span className="text-[10px] text-slate-400">{stats.completed_enrollments} completed</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Certificates</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.total_certificates}</p>
          <span className="text-[10px] text-slate-400">issued credentials</span>
        </div>
      </div>

      {/* Recharts Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-brand-600" />
            <span>Platform User Distribution</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">Proportion of trainees, trainers, and administrators</p>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userDist} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="role" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} users`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {userDist.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-soft">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Courses by Category</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">Subject area distribution across active catalog</p>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDist} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} courses`, 'Volume']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
