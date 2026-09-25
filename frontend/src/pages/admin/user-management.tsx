import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Mail,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Unlock,
  UserCheck,
  Users,
} from 'lucide-react';
import { api, User } from '../../services/api';
import { useAuth } from '../../context/auth-context';

interface UserManagementProps {
  onNavigate: (page: string, params?: any) => void;
}

export const UserManagementPage: React.FC<UserManagementProps> = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
      });
      setUsers(res.users);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user: any) => {
    if (user.id === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }

    try {
      await api.admin.toggleUserStatus(user.id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl shadow-black/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          User Governance
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
          Platform User Management
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Inspect, filter, and modify account statuses across all registered participants.
        </p>

        {/* Search & Role Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email address..."
              className="w-full pl-10 pr-20 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg font-semibold transition"
            >
              Search
            </button>
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Roles</option>
            <option value="trainee">Trainees</option>
            <option value="trainer">Trainers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Engagement</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs uppercase overflow-hidden">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-100 font-bold">{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`capitalize px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            u.role === 'admin'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : u.role === 'trainer'
                              ? 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        {u.role === 'trainer' && (
                          <span>{u.courses_created_count} Courses Authored</span>
                        )}
                        {u.role === 'trainee' && (
                          <span>
                            {u.enrollments_count} Enrolled • {u.certificates_count} Certs
                          </span>
                        )}
                        {u.role === 'admin' && <span>Global Supervisor</span>}
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            u.is_active
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={isCurrent}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            u.is_active
                              ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/60'
                              : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
                          } disabled:opacity-30 disabled:pointer-events-none`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
