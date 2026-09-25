// API Service client communicating with Flask backend

const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  : '/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'trainee' | 'trainer' | 'admin';
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface ModuleItem {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  content: string;
  key_points: string[];
  material_url?: string;
  order_index: number;
  duration_minutes: number;
  created_at: string;
}

export interface QuestionItem {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  marks: number;
  order_index: number;
}

export interface QuizItem {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  passing_percentage: number;
  question_count: number;
  questions?: QuestionItem[];
  attempts?: any[];
  best_score?: number;
  has_passed?: boolean;
}

export interface CourseItem {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  thumbnail_url: string;
  trainer_id: number;
  trainer_name: string;
  is_published: boolean;
  module_count: number;
  quiz_count: number;
  enrollment_count: number;
  created_at: string;
  modules?: ModuleItem[];
  quizzes?: QuizItem[];
  enrollment?: {
    id: number;
    user_id: number;
    status: 'in_progress' | 'completed';
    progress_percentage: number;
    completed_modules_count: number;
    total_modules_count: number;
    completed_module_ids?: number[];
  };
  certificate?: CertificateItem | null;
}

export interface CertificateItem {
  id: number;
  certificate_code: string;
  user_id: number;
  course_id: number;
  trainee_name: string;
  course_title: string;
  trainer_name: string;
  issue_date: string;
  issue_timestamp?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // essential for Flask sessions
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    me: () => request<{ user: User | null }>('/auth/me'),
    login: (credentials: { email: string; password: string }) =>
      request<{ message: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    demoLogin: (role: 'trainee' | 'trainer' | 'admin') =>
      request<{ message: string; user: User }>('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role }),
      }),
    register: (userData: { name: string; email: string; password: string; role: 'trainee' | 'trainer' }) =>
      request<{ message: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
  },

  // Courses
  courses: {
    getAll: (params?: { category?: string; difficulty?: string; search?: string; mine?: boolean }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append('category', params.category);
      if (params?.difficulty) searchParams.append('difficulty', params.difficulty);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.mine) searchParams.append('mine', 'true');
      const q = searchParams.toString();
      return request<{ courses: CourseItem[] }>(`/courses${q ? `?${q}` : ''}`);
    },
    getById: (id: number) => request<{ course: CourseItem }>(`/courses/${id}`),
    create: (courseData: Partial<CourseItem>) =>
      request<{ message: string; course: CourseItem }>('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      }),
    update: (id: number, courseData: Partial<CourseItem>) =>
      request<{ message: string; course: CourseItem }>(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      }),
    delete: (id: number) =>
      request<{ message: string }>(`/courses/${id}`, {
        method: 'DELETE',
      }),
    enroll: (id: number) =>
      request<{ message: string; enrollment: any }>(`/courses/${id}/enroll`, {
        method: 'POST',
      }),
    addModule: (courseId: number, moduleData: Partial<ModuleItem>) =>
      request<{ message: string; module: ModuleItem }>(`/courses/${courseId}/modules`, {
        method: 'POST',
        body: JSON.stringify(moduleData),
      }),
    updateModule: (moduleId: number, moduleData: Partial<ModuleItem>) =>
      request<{ message: string; module: ModuleItem }>(`/courses/modules/${moduleId}`, {
        method: 'PUT',
        body: JSON.stringify(moduleData),
      }),
    deleteModule: (moduleId: number) =>
      request<{ message: string }>(`/courses/modules/${moduleId}`, {
        method: 'DELETE',
      }),
  },

  // Quizzes
  quizzes: {
    getForCourse: (courseId: number) => request<{ quiz: QuizItem | null }>(`/quizzes/course/${courseId}`),
    createOrUpdate: (courseId: number, quizData: { title: string; description?: string; passing_percentage: number }) =>
      request<{ message: string; quiz: QuizItem }>(`/quizzes/course/${courseId}`, {
        method: 'POST',
        body: JSON.stringify(quizData),
      }),
    addQuestion: (quizId: number, questionData: Partial<QuestionItem>) =>
      request<{ message: string; question: QuestionItem }>(`/quizzes/${quizId}/questions`, {
        method: 'POST',
        body: JSON.stringify(questionData),
      }),
    updateQuestion: (questionId: number, questionData: Partial<QuestionItem>) =>
      request<{ message: string; question: QuestionItem }>(`/quizzes/questions/${questionId}`, {
        method: 'PUT',
        body: JSON.stringify(questionData),
      }),
    deleteQuestion: (questionId: number) =>
      request<{ message: string }>(`/quizzes/questions/${questionId}`, {
        method: 'DELETE',
      }),
    submit: (quizId: number, answers: Record<string, string>) =>
      request<{
        message: string;
        result: {
          score: number;
          max_score: number;
          percentage: number;
          passed: boolean;
          passing_percentage: number;
          attempt_id: number;
          detailed_answers: any[];
          certificate_generated: boolean;
          certificate?: CertificateItem;
        };
      }>(`/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
  },

  // Progress
  progress: {
    completeModule: (moduleId: number, completed: boolean = true) =>
      request<{
        message: string;
        module_id: number;
        completed: boolean;
        course_progress: number;
        course_completed: boolean;
        certificate_issued: boolean;
        certificate?: CertificateItem;
      }>(`/modules/${moduleId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ completed }),
      }),
    getTraineeDashboard: () =>
      request<{
        stats: {
          enrolled_count: number;
          completed_count: number;
          average_score: number;
          overall_progress: number;
          certificate_count: number;
        };
        enrollments: any[];
        recent_activity: any[];
        certificates: CertificateItem[];
      }>('/trainee/dashboard'),
    getTrainerStudents: () =>
      request<{
        students: {
          enrollment_id: number;
          student_id: number;
          student_name: string;
          student_email: string;
          course_id: number;
          course_title: string;
          progress: number;
          quiz_score: string;
          raw_quiz_score: number | null;
          status: string;
          needs_attention: boolean;
          enrolled_at: string;
        }[];
      }>('/trainer/students'),
    getTrainerAnalytics: () =>
      request<{
        stats: {
          total_courses: number;
          total_students: number;
          total_enrollments: number;
          total_quizzes: number;
          average_score: number;
          completion_rate: number;
        };
        courses_chart: any[];
        progress_distribution: any[];
      }>('/trainer/analytics'),
  },

  // Certificates
  certificates: {
    getAll: () => request<{ certificates: CertificateItem[] }>('/certificates'),
    getById: (id: number) => request<{ certificate: CertificateItem }>(`/certificates/${id}`),
    verify: (code: string) => request<{ valid: boolean; certificate?: CertificateItem; message?: string }>(`/certificates/verify/${code}`),
  },

  // Admin
  admin: {
    getUsers: (params?: { search?: string; role?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.role) q.append('role', params.role);
      const str = q.toString();
      return request<{ users: any[] }>(`/admin/users${str ? `?${str}` : ''}`);
    },
    toggleUserStatus: (userId: number) =>
      request<{ message: string; user: any }>(`/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
      }),
    getCourses: (params?: { search?: string; category?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.category) q.append('category', params.category);
      const str = q.toString();
      return request<{ courses: CourseItem[] }>(`/admin/courses${str ? `?${str}` : ''}`);
    },
    toggleCoursePublish: (courseId: number) =>
      request<{ message: string; course: CourseItem }>(`/admin/courses/${courseId}/toggle-publish`, {
        method: 'PUT',
      }),
    deleteCourse: (courseId: number) =>
      request<{ message: string }>(`/admin/courses/${courseId}`, {
        method: 'DELETE',
      }),
    getAnalytics: () =>
      request<{
        stats: any;
        user_distribution: any[];
        category_distribution: any[];
        enrollment_status_distribution: any[];
      }>('/admin/analytics'),
  },
};
