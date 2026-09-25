import React from 'react';
import { Award, BookOpen, CheckCircle, Heart, Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-md">
                C
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">CAPACITY CONNECT</span>
                <p className="text-xs text-brand-400 font-semibold uppercase tracking-wider">
                  Learn • Grow • Achieve
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              A comprehensive digital training and learning platform connecting Trainees, Trainers, and Administrators with measurable progress.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Local Self-Contained Engine</span>
            </div>
          </div>

          {/* Platform Pillars */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('courses-browse')} className="hover:text-white transition">
                  Browse Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-white transition">
                  Role-Based Workflows
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-white transition">
                  Automated Assessments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-white transition">
                  Verifiable Credentials
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Demo Access */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Demo Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Trainee: trainee@capacityconnect.com</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  <span>Trainer: trainer@capacityconnect.com</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Admin: admin@capacityconnect.com</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Tech Architecture */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Hackathon Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built with React, Vite, Tailwind CSS, Lucide, Recharts, and Flask with SQLite persistence.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Python 3.13</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Flask + SQLite</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Particle Typography</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">PixelCanvas</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Capacity Connect. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for high performance and measurable learning outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
};
