import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Layers,
  PlusCircle,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { api, CourseItem, ModuleItem } from '../../services/api';

interface CourseBuilderProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CourseBuilderPage: React.FC<CourseBuilderProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<CourseItem> | null>(null);

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<ModuleItem> | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await api.courses.getAll({ mine: true });
      setCourses(res.courses);
      if (res.courses.length > 0 && !selectedCourse) {
        // Load details for first course
        const detail = await api.courses.getById(res.courses[0].id);
        setSelectedCourse(detail.course);
      } else if (selectedCourse) {
        const detail = await api.courses.getById(selectedCourse.id);
        setSelectedCourse(detail.course);
      }
    } catch (err) {
      console.error('Failed to load trainer courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSelectCourse = async (courseId: number) => {
    try {
      const detail = await api.courses.getById(courseId);
      setSelectedCourse(detail.course);
    } catch (err) {
      console.error('Failed to fetch course detail', err);
    }
  };

  // Course Actions
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      if (editingCourse.id) {
        await api.courses.update(editingCourse.id, editingCourse);
      } else {
        const res = await api.courses.create(editingCourse);
        setSelectedCourse(res.course);
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      await loadCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course and all its modules?')) return;
    try {
      await api.courses.delete(id);
      setSelectedCourse(null);
      await loadCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (course: CourseItem) => {
    try {
      await api.courses.update(course.id, { is_published: !course.is_published });
      await loadCourses();
    } catch (err: any) {
      alert(err.message || 'Failed to update course status');
    }
  };

  // Module Actions
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !editingModule) return;

    try {
      if (editingModule.id) {
        await api.courses.updateModule(editingModule.id, editingModule);
      } else {
        await api.courses.addModule(selectedCourse.id, editingModule);
      }
      setShowModuleModal(false);
      setEditingModule(null);
      await handleSelectCourse(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to remove this module?')) return;
    try {
      await api.courses.deleteModule(moduleId);
      if (selectedCourse) await handleSelectCourse(selectedCourse.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete module');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl shadow-black/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Instructional Studio
          </span>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-2">Course & Module Manager</h2>
          <p className="text-xs text-slate-400 mt-0.5">Author curricula, edit lesson content, and manage publication states.</p>
        </div>
        <button
          onClick={() => {
            setEditingCourse({
              title: '',
              description: '',
              category: 'Software Engineering',
              difficulty: 'Beginner',
              duration: '4 hours',
              thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
              is_published: true,
            });
            setShowCourseModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-violet-900/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      {/* Two Column Layout: Courses List (left) & Modules of Selected Course (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Courses Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-100">Your Courses ({courses.length})</h3>

          {loading ? (
            <div className="p-8 text-center bg-slate-900 rounded-2xl border border-slate-800">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : courses.length > 0 ? (
            courses.map((c) => {
              const isSelected = selectedCourse?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCourse(c.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-violet-950/50 border-violet-500/60 shadow-xl shadow-black/20'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">
                        {c.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100 mt-0.5 line-clamp-1">{c.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{c.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{c.module_count} Modules</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        c.is_published
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {c.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-900 p-6 rounded-2xl text-center border border-slate-800">
              <p className="text-xs text-slate-400">No courses authored yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: Selected Course Overview & Module Builder */}
        <div className="lg:col-span-8">
          {selectedCourse ? (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl shadow-black/20 p-6 sm:p-8 space-y-6">
              {/* Selected Course Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase">
                      {selectedCourse.category} • {selectedCourse.difficulty}
                    </span>
                    <button
                      onClick={() => handleTogglePublish(selectedCourse)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                        selectedCourse.is_published
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      {selectedCourse.is_published ? 'Published ✓' : 'Draft / Unpublished'}
                    </button>
                  </div>
                  <h3 className="text-2xl font-black text-slate-100 mt-1">{selectedCourse.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedCourse.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingCourse(selectedCourse);
                      setShowCourseModal(true);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
                    title="Edit Course"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(selectedCourse.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modules Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    <span>Curriculum Modules ({selectedCourse.modules?.length || 0})</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Lessons and exercises taught in this program</p>
                </div>
                <button
                  onClick={() => {
                    setEditingModule({
                      title: '',
                      description: '',
                      content: '# Lesson Title\n\nExplain core concept here...',
                      key_points: ['Key concept 1', 'Key concept 2'],
                      material_url: '',
                      duration_minutes: 30,
                    });
                    setShowModuleModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
              </div>

              {/* Modules List */}
              <div className="space-y-3">
                {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                  selectedCourse.modules.map((mod, idx) => (
                    <div
                      key={mod.id}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 transition flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-md bg-violet-500/20 text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-violet-500/30">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="text-sm font-bold text-slate-100">{mod.title}</h5>
                          {mod.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {mod.duration_minutes} min
                            </span>
                            {mod.material_url && (
                              <span className="flex items-center gap-1 text-cyan-400">
                                <ExternalLink className="w-3 h-3" />
                                Resource attached
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingModule(mod);
                            setShowModuleModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-700 transition"
                          title="Edit Module"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/40 transition"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">
                    No modules added to this course yet. Click "Add Module" above to start!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Select a course to view and edit its modules.</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Edit/Create Modal */}
      {showCourseModal && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {editingCourse.id ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingCourse.category || 'Software Engineering'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={editingCourse.difficulty || 'Beginner'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  value={editingCourse.duration || '4 hours'}
                  onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={editingCourse.thumbnail_url || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Edit/Create Modal */}
      {showModuleModal && editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">
                {editingModule.id ? 'Edit Module' : 'Add New Module'}
              </h3>
              <button
                onClick={() => setShowModuleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={editingModule.title || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingModule.description || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lesson Content (Markdown / Text)
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingModule.content || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs font-mono focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Learning Material Resource Link (optional)
                </label>
                <input
                  type="text"
                  value={editingModule.material_url || ''}
                  onChange={(e) => setEditingModule({ ...editingModule, material_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={editingModule.duration_minutes || 30}
                  onChange={(e) =>
                    setEditingModule({ ...editingModule, duration_minutes: parseInt(e.target.value) || 30 })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-xl text-xs focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
