import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  GraduationCap,
  Mail,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { api } from '../../services/api';

interface StudentsTableProps {
  onNavigate: (page: string, params?: any) => void;
}

export const StudentsTablePage: React.FC<StudentsTableProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.progress.getTrainerStudents();
        setStudents(res.students);
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.student_name.toLowerCase().includes(search.toLowerCase()) ||
      st.student_email.toLowerCase().includes(search.toLowerCase()) ||
      st.course_title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Needs Attention' && st.needs_attention) ||
      (statusFilter === 'Completed' && st.status === 'Completed') ||
      (statusFilter === 'On Track' && st.status === 'On Track');

    return matchesSearch && matchesStatus;
  });

  const needsAttentionCount = students.filter((s) => s.needs_attention).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl shadow-black/20">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          Cohort Performance
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
          Enrolled Student Performance Matrix
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Monitor trainee pacing, quiz outcomes, and identify learners who require academic support.
        </p>

        {/* Rule Explanation Banner */}
        <div className="mt-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Automated "Needs Attention" Rule:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
              Progress &lt; 40% OR Quiz Score &lt; 50%
            </span>
          </div>
          <div className="text-slate-400">
            Total requiring support:{' '}
            <strong className="text-amber-400 font-bold">{needsAttentionCount} student(s)</strong>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, or course..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Statuses ({students.length})</option>
            <option value="Needs Attention">Needs Attention ({needsAttentionCount})</option>
            <option value="On Track">On Track</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Progress</th>
                  <th className="py-3.5 px-6">Quiz Score</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {filteredStudents.map((st) => (
                  <tr
                    key={st.enrollment_id}
                    className={`transition ${
                      st.needs_attention ? 'bg-amber-950/20 hover:bg-amber-950/40' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <p className="text-slate-100 font-bold">{st.student_name}</p>
                      <p className="text-[11px] text-slate-400">{st.student_email}</p>
                    </td>

                    <td className="py-4 px-6 text-slate-300 font-semibold">{st.course_title}</td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              st.progress === 100
                                ? 'bg-emerald-400'
                                : st.progress < 40
                                ? 'bg-amber-400'
                                : 'bg-violet-500'
                            }`}
                            style={{ width: `${st.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-200">{st.progress}%</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold ${
                          st.raw_quiz_score !== null && st.raw_quiz_score < 50
                            ? 'text-rose-400'
                            : st.raw_quiz_score !== null && st.raw_quiz_score >= 80
                            ? 'text-emerald-400'
                            : 'text-slate-200'
                        }`}
                      >
                        {st.quiz_score}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {st.needs_attention ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Needs Attention
                        </span>
                      ) : st.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          On Track
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right text-slate-400 text-[11px]">
                      {st.enrolled_at || 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No students match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
