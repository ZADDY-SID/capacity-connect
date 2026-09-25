import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Sparkles,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { api, CourseItem } from '../../services/api';

interface AdminCourseManagementProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminCourseManagementPage: React.FC<AdminCourseManagementProps> = ({
  onNavigate,
}) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Software Engineering',
    'Web Development',
    'Data Science',
    'DevOps & Cloud',
  ];

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getCourses({
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      setCourses(res.courses);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
  };

  const handleTogglePublish = async (courseId: number) => {
    try {
      await api.admin.toggleCoursePublish(courseId);
      await loadCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publication');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to permanently delete this course and its enrolled progress?')) {
      return;
    }
    try {
      await api.admin.deleteCourse(courseId);
      await loadCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl shadow-black/20">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Catalog Governance
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">
          Curriculum Catalog Moderation
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Review course content, toggle public catalog visibility, and remove unaccredited submissions.
        </p>

        {/* Search & Category Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course title or topics..."
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-violet-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses List Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/80">
                <tr>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Trainer</th>
                  <th className="py-3.5 px-6">Modules</th>
                  <th className="py-3.5 px-6">Enrollments</th>
                  <th className="py-3.5 px-6">Visibility</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-medium">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.thumbnail_url}
                          alt={c.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700 flex-shrink-0"
                        />
                        <div>
                          <p className="text-slate-100 font-bold line-clamp-1">{c.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {c.category} • {c.difficulty}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-300 font-semibold">{c.trainer_name}</td>

                    <td className="py-4 px-6 text-slate-400">{c.module_count} modules</td>

                    <td className="py-4 px-6 text-slate-400">{c.enrollment_count} students</td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          c.is_published
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {c.is_published ? 'Published' : 'Hidden / Draft'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(c.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            c.is_published
                              ? 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-800/60'
                              : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/60'
                          }`}
                        >
                          {c.is_published ? 'Unpublish' : 'Approve & Publish'}
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition"
                          title="Remove Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No courses match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
