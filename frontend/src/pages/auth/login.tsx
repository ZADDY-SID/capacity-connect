import React, { useState } from 'react';
import { ArrowRight, Check, KeyRound, Lock, Mail, ShieldAlert, Sparkles, User, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

interface LoginProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      if (user.role === 'trainer') onNavigate('trainer-dashboard');
      else if (user.role === 'admin') onNavigate('admin-dashboard');
      else onNavigate('trainee-dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'trainee' | 'trainer' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      const user = await demoLogin(role);
      if (user.role === 'trainer') onNavigate('trainer-dashboard');
      else if (user.role === 'admin') onNavigate('admin-dashboard');
      else onNavigate('trainee-dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-md shadow-brand-500/20 mb-3">
            C
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your Capacity Connect workspace</p>
        </div>

        {/* Demo Fast-Login Strip */}
        <div className="mb-6 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Instant Demo Logins</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('trainee')}
              className="py-1.5 px-2 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 font-semibold text-xs rounded-lg border border-sky-800/80 shadow-xs transition text-center"
            >
              Trainee
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('trainer')}
              className="py-1.5 px-2 bg-brand-950/60 hover:bg-brand-900/60 text-brand-300 font-semibold text-xs rounded-lg border border-brand-800/80 shadow-xs transition text-center"
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs rounded-lg border border-emerald-800/80 shadow-xs transition text-center"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Registration footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-brand-400 font-semibold hover:underline"
          >
            Create one now
          </button>
        </p>
      </div>
    </div>
  );
};
