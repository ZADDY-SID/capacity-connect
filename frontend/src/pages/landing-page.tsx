import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Layers,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { CursorDrivenParticleTypography } from '@/components/ui/cursor-driven-particle-typography';
import { PixelCanvas } from '@/components/ui/pixel-canvas';
import { api, CourseItem } from '../services/api';

interface LandingPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [featuredCourses, setFeaturedCourses] = useState<CourseItem[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.courses.getAll();
        setFeaturedCourses(res.courses.slice(0, 3));
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Features Particle Typography Exclusively) */}
      {/* ========================================================= */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-slate-950">
        {/* Ambient background radial glow spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-soft text-brand-300 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            <span>Next-Generation Training & Learning Platform</span>
          </div>

          {/* Interactive Particle Typography for "CAPACITY" */}
          <div className="w-full max-w-4xl mx-auto px-2">
            <CursorDrivenParticleTypography
              text="CAPACITY"
              particleDensity={2}
              particleSize={1.2}
              fontSize={110}
            />
          </div>

          {/* CONNECT & Tagline */}
          <div className="-mt-2 md:-mt-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-sky-400">
                CONNECT
              </span>
            </h1>
            <p className="mt-3 text-xl sm:text-2xl font-bold text-slate-200">
              Learn. Grow. Achieve.
            </p>
          </div>

          {/* Supporting Text */}
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            A smarter platform for training, learning, and measurable growth. Seamlessly connecting
            trainees, trainers, and administrators with verifiable skill development.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('courses-browse')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base shadow-glow transition duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Explore Courses</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-800 shadow-soft transition duration-200"
            >
              Get Started
            </button>
          </div>

          {/* Interactive Hint */}
          <p className="mt-3 text-xs text-slate-500 font-mono">
            Hover cursor over CAPACITY text to interact with the particle physics
          </p>

          {/* Platform Stats Strip */}
          <div className="mt-14 pt-8 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Self-Contained & Local</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-400">3 Roles</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Trainee • Trainer • Admin</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-sky-400">Automated</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Assessments & Scores</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-400">Verifiable</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Accredited Certificates</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. PIXELCANVAS FEATURE SHOWCASE CONTAINER */}
      {/* ========================================================= */}
      <section className="py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
            <PixelCanvas
              colors={['#e879f9', '#a78bfa', '#38bdf8', '#22d3ee']}
              speed={0.02}
            />

            {/* Dark overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent pointer-events-none" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-700/60 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generative Canvas Visual Engine</span>
              </span>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl leading-tight">
                Turn Learning into Measurable Progress
              </h3>
              <p className="mt-3 text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Real-time modular tracking, auto-evaluated quizzes, and accredited local certificates unified into an elegant dark-mode learning workspace.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => onNavigate('courses-browse')}
                  className="px-6 py-2.5 bg-white text-slate-950 hover:bg-slate-200 rounded-xl text-xs font-bold transition shadow-lg"
                >
                  Explore Catalog
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-xl text-xs font-semibold transition"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. THREE CORE PILLARS / FEATURES */}
      {/* ========================================================= */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
              Role-Based Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
              One Unified Ecosystem. Three Empowered Roles.
            </h2>
            <p className="text-slate-400 text-base mt-3">
              Designed to create continuous synergy between students acquiring skills, educators authoring content, and leadership evaluating progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Trainee */}
            <div className="group bg-slate-900/90 hover:bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-sky-500/50 shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-950 border border-sky-800 text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Trainee</h3>
                  <span className="text-xs font-semibold text-sky-300 bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-800">
                    Learner
                  </span>
                </div>
                <p className="text-brand-400 font-semibold text-sm mb-4">
                  Learn and track progress.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Browse curated training courses, absorb structured modules, tackle auto-graded quizzes, monitor mastery analytics, and earn verified completion credentials.
                </p>
                <ul className="space-y-2 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Interactive rich module reading</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Automated quizzes with immediate scores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Printable & downloadable certificates</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 hover:border-sky-600 transition flex items-center justify-center gap-2"
              >
                <span>Demo Trainee Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Trainer */}
            <div className="group bg-slate-900/90 hover:bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-brand-500/50 shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Trainer</h3>
                  <span className="text-xs font-semibold text-brand-300 bg-brand-950 px-2.5 py-0.5 rounded-full border border-brand-800">
                    Educator
                  </span>
                </div>
                <p className="text-brand-400 font-semibold text-sm mb-4">
                  Create courses and assess students.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Build multi-module syllabi, formulate assessments with custom scoring, inspect student performance tables, and automatically flag students needing attention.
                </p>
                <ul className="space-y-2 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Full course & module authoring suite</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Question builder with 4-option grading</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Automated "Needs Attention" rule badges</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 hover:border-brand-600 transition flex items-center justify-center gap-2"
              >
                <span>Demo Trainer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: Admin */}
            <div className="group bg-slate-900/90 hover:bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-emerald-500/50 shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Admin</h3>
                  <span className="text-xs font-semibold text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    Executive
                  </span>
                </div>
                <p className="text-brand-400 font-semibold text-sm mb-4">
                  Manage users and platform analytics.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Exercise total governance over platform participants, review course catalogs, toggle user permissions, and view macro analytical charts.
                </p>
                <ul className="space-y-2 text-xs text-slate-400 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>User lifecycle management & activation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Catalog publishing & quality governance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Recharts distribution & enrollment analytics</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-medium text-sm border border-slate-700 hover:border-emerald-600 transition flex items-center justify-center gap-2"
              >
                <span>Demo Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. HOW IT WORKS WORKFLOW */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Structured Methodology
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">How It Works</h2>
            <p className="text-slate-400 text-sm mt-2">
              From instructional design to verified achievement in five integrated stages:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Create',
                desc: 'Trainers design courses, author modules, and configure question banks.',
                icon: Layers,
                color: 'bg-brand-950 text-brand-300 border-brand-800',
              },
              {
                step: '02',
                title: 'Learn',
                desc: 'Trainees consume structured lessons with key takeaways and code samples.',
                icon: BookOpen,
                color: 'bg-sky-950 text-sky-300 border-sky-800',
              },
              {
                step: '03',
                title: 'Assess',
                desc: 'Automated quizzes validate comprehension with rigorous instant scoring.',
                icon: Target,
                color: 'bg-indigo-950 text-indigo-300 border-indigo-800',
              },
              {
                step: '04',
                title: 'Track',
                desc: 'Real-time analytics surface completion rates and students needing support.',
                icon: TrendingUp,
                color: 'bg-amber-950 text-amber-300 border-amber-800',
              },
              {
                step: '05',
                title: 'Achieve',
                desc: 'Eligible students unlock verifiable, printable credentials upon completion.',
                icon: Award,
                color: 'bg-emerald-950 text-emerald-300 border-emerald-800',
              },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-soft flex flex-col justify-between relative group hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-slate-500">{st.step}</span>
                      <div className={`p-2 rounded-lg border ${st.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">{st.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-700">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. SAMPLE COURSES SECTION */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-3 py-1 rounded-full border border-brand-800">
                Curriculum Catalog
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-3">
                Featured Learning Programs
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore hands-on courses designed by verified domain trainers.
              </p>
            </div>
            <button
              onClick={() => onNavigate('courses-browse')}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-brand-400 hover:text-brand-300 transition"
            >
              <span>View All Available Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-soft hover:shadow-glow hover:-translate-y-1 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-950">
                    <img
                      src={c.thumbnail_url}
                      alt={c.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-200 shadow-xs">
                      {c.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-brand-950/90 text-brand-300 border border-brand-800 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-medium shadow-xs">
                      {c.difficulty}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.duration}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.module_count} Modules</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onNavigate('course-detail', { courseId: c.id })}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-brand-600 text-white font-medium text-xs transition text-center shadow-xs"
                  >
                    View Curriculum & Enroll
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. BENEFITS SECTION */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Why Capacity Connect
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Engineered for Real Growth
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Transform passive content consumption into verifiable capability development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                title: 'Structured Learning',
                desc: 'Curated modules that systematically guide trainees from fundamentals to advanced application.',
                icon: Layers,
              },
              {
                title: 'Assessments',
                desc: 'Objective multiple-choice examinations with dynamic answer shuffling and instant score output.',
                icon: Target,
              },
              {
                title: 'Progress Tracking',
                desc: 'Granular completion indicators down to individual module milestones.',
                icon: TrendingUp,
              },
              {
                title: 'Certificates',
                desc: 'Tamper-resistant local certificate generation with verification codes and print exports.',
                icon: Award,
              },
              {
                title: 'Analytics',
                desc: 'Comprehensive performance radar with automatic identification of at-risk students.',
                icon: BarChart3,
              },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-soft text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{b.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FINAL CTA (PixelCanvas backdrop)                       */}
      {/* ========================================================= */}
      <section className="relative py-28 bg-neutral-950 text-white overflow-hidden border-t border-neutral-900">
        <PixelCanvas
          colors={['#e879f9', '#a78bfa', '#38bdf8', '#22d3ee']}
          speed={0.02}
          gap={6}
          pixelSize={4}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/50 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950/80 text-brand-300 border border-brand-700/60 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready To Unlock Your Potential</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to grow your skills?
          </h2>

          <p className="mt-4 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Join Capacity Connect and turn learning into measurable progress.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-base shadow-glow transition duration-200"
            >
              Get Started
            </button>
            <button
              onClick={() => onNavigate('courses-browse')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-base border border-slate-700 transition duration-200"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
