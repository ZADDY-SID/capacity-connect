import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BookMarked,
  BookOpen,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  PlusCircle,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (page: string, params?: any) => void;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onNavigate,
  title,
  subtitle,
}) => {
  const { user, logout, demoLogin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onNavigate('landing');
  };

  const handleRoleSwitch = async (role: 'trainee' | 'trainer' | 'admin') => {
    try {
      await demoLogin(role);
      if (role === 'trainee') onNavigate('trainee-dashboard');
      else if (role === 'trainer') onNavigate('trainer-dashboard');
      else if (role === 'admin') onNavigate('admin-dashboard');
    } catch (err) {
      console.error('Role switch failed', err);
    }
  };

  // Trainee navigation items
  const traineeNav = [
    { id: 'trainee-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses-browse', label: 'Browse Courses', icon: BookOpen },
    { id: 'trainee-my-courses', label: 'My Learning', icon: BookMarked },
    { id: 'trainee-progress', label: 'Progress & Analytics', icon: TrendingUp },
    { id: 'trainee-certificates', label: 'Certificates', icon: Award },
  ];

  // Trainer navigation items
  const trainerNav = [
    { id: 'trainer-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trainer-courses', label: 'Course Manager', icon: Layers },
    { id: 'trainer-quizzes', label: 'Quiz Builder', icon: HelpCircle },
    { id: 'trainer-students', label: 'Student Performance', icon: Users },
    { id: 'trainer-analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Admin navigation items
  const adminNav = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-courses', label: 'Course Catalog', icon: Layers },
    { id: 'admin-analytics', label: 'System Analytics', icon: PieChart },
  ];

  const currentNav =
    user?.role === 'trainer' ? trainerNav : user?.role === 'admin' ? adminNav : traineeNav;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-white text-sm">CAPACITY CONNECT</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 rounded-lg hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo header */}
          <div
            onClick={() => onNavigate('landing')}
            className="p-5 border-b border-slate-800 flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-105 transition">
              C
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight flex items-center gap-1">
                <span>CAPACITY</span>
                <span className="text-brand-400">CONNECT</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {user?.role} portal
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-950/80 text-brand-300 font-semibold border border-brand-800/80 shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Switcher */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-3">
          {/* Quick Demo Switcher within portal */}
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 px-1 mb-1.5">
              <span>Switch View</span>
              <Sparkles className="w-3 h-3 text-brand-400" />
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleRoleSwitch('trainee')}
                className={`py-1 px-1.5 text-[11px] rounded font-medium transition text-center ${
                  user?.role === 'trainee'
                    ? 'bg-sky-950 text-sky-300 font-bold border border-sky-800'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Switch to Trainee View"
              >
                Trainee
              </button>
              <button
                onClick={() => handleRoleSwitch('trainer')}
                className={`py-1 px-1.5 text-[11px] rounded font-medium transition text-center ${
                  user?.role === 'trainer'
                    ? 'bg-brand-950 text-brand-300 font-bold border border-brand-800'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Switch to Trainer View"
              >
                Trainer
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`py-1 px-1.5 text-[11px] rounded font-medium transition text-center ${
                  user?.role === 'admin'
                    ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Switch to Admin View"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Current User Card */}
          <div className="flex items-center justify-between px-2 py-1.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-slate-300 text-xs uppercase overflow-hidden border border-slate-700">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
        {/* Top bar */}
        <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-xs backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {title || 'Dashboard'}
            </h1>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Site</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-xs font-medium text-slate-400">
              Role:{' '}
              <strong className="text-brand-400 uppercase tracking-wide">
                {user?.role}
              </strong>
            </span>
          </div>
        </header>

        {/* Page Inner Container */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
};
