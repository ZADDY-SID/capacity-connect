import React, { useState } from 'react';
import { BookOpen, ChevronRight, LogIn, Menu, Shield, User, UserCheck, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickLoginOpen, setQuickLoginOpen] = useState(false);

  const handleDemoSwitch = async (role: 'trainee' | 'trainer' | 'admin') => {
    try {
      await demoLogin(role);
      setQuickLoginOpen(false);
      setMobileMenuOpen(false);
      if (role === 'trainee') onNavigate('trainee-dashboard');
      else if (role === 'trainer') onNavigate('trainer-dashboard');
      else if (role === 'admin') onNavigate('admin-dashboard');
    } catch (err) {
      console.error('Demo login failed', err);
    }
  };

  const getDashboardTarget = () => {
    if (!user) return 'login';
    if (user.role === 'trainer') return 'trainer-dashboard';
    if (user.role === 'admin') return 'admin-dashboard';
    return 'trainee-dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
            C
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand-600 transition flex items-center gap-1.5">
              <span>CAPACITY</span>
              <span className="text-brand-600 font-extrabold">CONNECT</span>
            </div>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-0.5">
              Learn • Grow • Achieve
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => onNavigate('landing')}
            className={`text-sm font-medium transition ${
              currentPage === 'landing' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('courses-browse')}
            className={`text-sm font-medium transition ${
              currentPage === 'courses-browse' ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Features
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setQuickLoginOpen(!quickLoginOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition shadow-sm"
              title="One-click switch demo accounts for evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Demo Roles</span>
            </button>

            {quickLoginOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Instant Demo Switch
                </div>
                <button
                  onClick={() => handleDemoSwitch('trainee')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-sky-500" />
                    <span>Trainee Demo</span>
                  </div>
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">Learner</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch('trainer')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                    <span>Trainer Demo</span>
                  </div>
                  <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">Teacher</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch('admin')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Admin Demo</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Admin</span>
                </button>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate(getDashboardTarget())}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-sm"
              >
                <span>Dashboard</span>
                <span className="capitalize text-xs bg-slate-800 text-brand-300 px-2 py-0.5 rounded-full border border-slate-700">
                  {user.role}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="text-sm font-medium text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg transition"
              >
                Log In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm shadow-brand-500/25"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('courses-browse'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 text-base font-medium text-slate-700 rounded-lg hover:bg-slate-50"
            >
              Browse Courses
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Instant Demo Switch
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoSwitch('trainee')}
                className="p-2 text-center bg-sky-50 text-sky-800 rounded-lg text-xs font-semibold"
              >
                Trainee
              </button>
              <button
                onClick={() => handleDemoSwitch('trainer')}
                className="p-2 text-center bg-brand-50 text-brand-800 rounded-lg text-xs font-semibold"
              >
                Trainer
              </button>
              <button
                onClick={() => handleDemoSwitch('admin')}
                className="p-2 text-center bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <button
                onClick={() => { onNavigate(getDashboardTarget()); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
              >
                <span>Go to {user.role} Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-4 bg-brand-600 text-white rounded-xl font-semibold text-sm text-center"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
