import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/auth-context';
import { Navbar } from './components/layouts/navbar';
import { Footer } from './components/layouts/footer';
import { DashboardLayout } from './components/layouts/dashboard-layout';

// Pages
import { LandingPage } from './pages/landing-page';
import { LoginPage } from './pages/auth/login';
import { RegisterPage } from './pages/auth/register';

// Trainee Pages
import { TraineeDashboard } from './pages/trainee/dashboard';
import { BrowseCoursesPage } from './pages/trainee/browse-courses';
import { CoursePlayerPage } from './pages/trainee/course-player';
import { QuizPlayerPage } from './pages/trainee/quiz-player';
import { ProgressPage } from './pages/trainee/progress-page';
import { CertificatesPage } from './pages/trainee/certificates-page';

// Trainer Pages
import { TrainerDashboard } from './pages/trainer/dashboard';
import { CourseBuilderPage } from './pages/trainer/course-builder';
import { QuizBuilderPage } from './pages/trainer/quiz-builder';
import { StudentsTablePage } from './pages/trainer/students-table';
import { TrainerAnalyticsPage } from './pages/trainer/analytics-page';

// Admin Pages
import { AdminDashboard } from './pages/admin/dashboard';
import { UserManagementPage } from './pages/admin/user-management';
import { AdminCourseManagementPage } from './pages/admin/course-management';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading Capacity Connect...</p>
        </div>
      </div>
    );
  }

  // Dashboard Page Routing for Trainee
  if (currentPage.startsWith('trainee-')) {
    let content = null;
    let title = 'Trainee Portal';
    let subtitle = 'Master your curricula and track certified milestones';

    if (currentPage === 'trainee-dashboard' || currentPage === 'trainee-my-courses') {
      content = <TraineeDashboard onNavigate={handleNavigate} />;
      title = currentPage === 'trainee-my-courses' ? 'My Enrolled Learning' : 'Trainee Learning Hub';
    } else if (currentPage === 'trainee-progress') {
      content = <ProgressPage onNavigate={handleNavigate} />;
      title = 'Personal Progress & Analytics';
    } else if (currentPage === 'trainee-certificates') {
      content = <CertificatesPage onNavigate={handleNavigate} />;
      title = 'Official Certified Credentials';
    }

    return (
      <DashboardLayout
        activeTab={currentPage}
        onNavigate={handleNavigate}
        title={title}
        subtitle={subtitle}
      >
        {content}
      </DashboardLayout>
    );
  }

  // Dashboard Page Routing for Trainer
  if (currentPage.startsWith('trainer-')) {
    let content = null;
    let title = 'Trainer Studio';
    let subtitle = 'Author courses, design assessments, and monitor student comprehension';

    if (currentPage === 'trainer-dashboard') {
      content = <TrainerDashboard onNavigate={handleNavigate} />;
      title = 'Instruction Overview';
    } else if (currentPage === 'trainer-courses') {
      content = <CourseBuilderPage onNavigate={handleNavigate} />;
      title = 'Curriculum & Module Studio';
    } else if (currentPage === 'trainer-quizzes') {
      content = <QuizBuilderPage onNavigate={handleNavigate} />;
      title = 'Certification Assessment Designer';
    } else if (currentPage === 'trainer-students') {
      content = <StudentsTablePage onNavigate={handleNavigate} />;
      title = 'Cohort Student Performance';
    } else if (currentPage === 'trainer-analytics') {
      content = <TrainerAnalyticsPage onNavigate={handleNavigate} />;
      title = 'Instructional Analytics & Funnels';
    }

    return (
      <DashboardLayout
        activeTab={currentPage}
        onNavigate={handleNavigate}
        title={title}
        subtitle={subtitle}
      >
        {content}
      </DashboardLayout>
    );
  }

  // Dashboard Page Routing for Admin
  if (currentPage.startsWith('admin-')) {
    let content = null;
    let title = 'Platform Administration';
    let subtitle = 'System-wide governance, user moderation, and curriculum quality';

    if (currentPage === 'admin-dashboard' || currentPage === 'admin-analytics') {
      content = <AdminDashboard onNavigate={handleNavigate} />;
      title = 'Executive Oversight Dashboard';
    } else if (currentPage === 'admin-users') {
      content = <UserManagementPage onNavigate={handleNavigate} />;
      title = 'User Accounts & Roles';
    } else if (currentPage === 'admin-courses') {
      content = <AdminCourseManagementPage onNavigate={handleNavigate} />;
      title = 'Curriculum Catalog Moderation';
    }

    return (
      <DashboardLayout
        activeTab={currentPage}
        onNavigate={handleNavigate}
        title={title}
        subtitle={subtitle}
      >
        {content}
      </DashboardLayout>
    );
  }

  // Learning / Course Player views
  if (currentPage === 'course-player') {
    return (
      <DashboardLayout
        activeTab="trainee-dashboard"
        onNavigate={handleNavigate}
        title="Interactive Course Player"
        subtitle="Step-by-step modular instruction"
      >
        <CoursePlayerPage
          courseId={pageParams.courseId || 1}
          onNavigate={handleNavigate}
        />
      </DashboardLayout>
    );
  }

  if (currentPage === 'quiz-player') {
    return (
      <DashboardLayout
        activeTab="trainee-dashboard"
        onNavigate={handleNavigate}
        title="Certification Assessment"
        subtitle="Objective multiple-choice evaluation"
      >
        <QuizPlayerPage
          courseId={pageParams.courseId || 1}
          quizId={pageParams.quizId || 1}
          onNavigate={handleNavigate}
        />
      </DashboardLayout>
    );
  }

  // Public views (Landing, Catalog, Login, Register)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentPage === 'courses-browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <BrowseCoursesPage onNavigate={handleNavigate} />
          </div>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
