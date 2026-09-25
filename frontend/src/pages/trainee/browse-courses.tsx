import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Layers,
  Search,
  Sparkles,
  User,
} from 'lucide-react';
import { api, CourseItem } from '../../services/api';
import { useAuth } from '../../context/auth-context';

interface BrowseCoursesProps {
  onNavigate: (page: string, params?: any) => void;
}

export const BrowseCoursesPage: React.FC<BrowseCoursesProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const categories = [
    'All',
    'Software Engineering',
    'Web Development',
    'Data Science',
    'DevOps & Cloud',
  ];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getAll({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        search: search.trim() || undefined,
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
  }, [selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCourses();
  };

  const handleEnroll = async (courseId: number) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setEnrollingId(courseId);
    try {
      await api.courses.enroll(courseId);
      // Refresh list to update enrollment status
      await loadCourses();
      onNavigate('course-player', { courseId });
    } catch (err: any) {
      alert(err.message || 'Failed to enroll');
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-soft">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
            Course Explorer
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            Expand Your Capabilities
          </h2>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            Discover industry-aligned courses created by verified trainers. Every course includes structured lessons, interactive assessments, and verifiable certifications.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course title, topics, or keywords..."
              className="w-full pl-11 pr-24 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-lg transition"
            >
              Search
            </button>
          </form>

          {/* Category Dropdown */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  Category: {c}
                </option>
              ))}
            </select>

            {/* Difficulty Dropdown */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
            >
              {difficulties.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  Difficulty: {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = !!course.enrollment;
            const isComplete = course.enrollment?.status === 'completed';

            return (
              <div
                key={course.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-soft hover:shadow-glow hover:-translate-y-1 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail & Badges */}
                  <div className="relative h-44 bg-slate-950 overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-200 shadow-xs">
                      {course.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-brand-950/90 text-brand-300 border border-brand-800 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium shadow-xs">
                      {course.difficulty}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-medium text-slate-300">{course.trainer_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{course.duration}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          <span>{course.module_count} Modules</span>
                        </span>
                      </div>
                    </div>

                    {/* If enrolled, show current progress bar */}
                    {isEnrolled && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-400">Your Progress</span>
                          <span className="text-brand-400 font-bold">
                            {course.enrollment?.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isComplete ? 'bg-emerald-500' : 'bg-brand-500'
                            }`}
                            style={{ width: `${course.enrollment?.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-6 pt-0">
                  {isEnrolled ? (
                    <button
                      onClick={() => onNavigate('course-player', { courseId: course.id })}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>{isComplete ? 'Review Course' : 'Continue Learning'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-glow disabled:opacity-50"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{enrollingId === course.id ? 'Enrolling...' : 'Enroll in Course'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No courses match your filter</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or choosing a different category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSearch('');
            }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
