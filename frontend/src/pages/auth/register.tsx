import React, { useState } from 'react';
import { ArrowRight, GraduationCap, Lock, Mail, ShieldAlert, User, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/auth-context';

interface RegisterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'trainee' | 'trainer'>('trainee');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await register({ name, email, password, role });
      if (user.role === 'trainer') onNavigate('trainer-dashboard');
      else onNavigate('trainee-dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-md shadow-brand-500/20 mb-3">
            C
          </div>
          <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400 mt-1">Start your journey with Capacity Connect</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('trainee')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                  role === 'trainee'
                    ? 'border-brand-500 bg-brand-950/80 ring-2 ring-brand-500/20'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <GraduationCap className={`w-4 h-4 ${role === 'trainee' ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>Trainee</span>
                </div>
                <p className="text-[11px] text-slate-400">Enroll & learn courses</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('trainer')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                  role === 'trainer'
                    ? 'border-brand-500 bg-brand-950/80 ring-2 ring-brand-500/20'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                  <UserCheck className={`w-4 h-4 ${role === 'trainer' ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>Trainer</span>
                </div>
                <p className="text-[11px] text-slate-400">Create & teach courses</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-brand-400 font-semibold hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};
