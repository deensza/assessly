import axios, { AxiosInstance } from 'axios';

// === Types ===
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: number;
  created_at: string;
}

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string;
  due_date: string;
  supported_languages: string[];
  time_limit_seconds: number;
  memory_limit_mb: number;
  test_cases?: TestCase[];
}

export interface TestCase {
  id?: number;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  weight: number;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  final_score: number | null;
  plagiarism_score: number | null;
  ai_probability: number | null;
  flagged: boolean;
  submitted_at: string;
  test_results?: TestResult[];
  feedback?: string;
}

export interface TestResult {
  id: number;
  test_case_id: number;
  actual_output: string;
  passed: boolean;
  execution_time_ms: number;
  memory_usage_kb: number;
}

// === Token Management ===
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('assessly_token');
}

export function setToken(token: string): void {
  localStorage.setItem('assessly_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('assessly_token');
  localStorage.removeItem('assessly_user');
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('assessly_user');
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: User): void {
  localStorage.setItem('assessly_user', JSON.stringify(user));
}

// === Axios Instance ===
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://assessly-api.azurewebsites.net/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — her istekte JWT token ekle
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — 401 gelirse token temizle
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// === Auth API ===
export const authApi = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // { token, user }
  },
  async register(name: string, email: string, password: string, role: string) {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  },
  async me() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// === Courses API ===
export const coursesApi = {
  async list() {
    const res = await api.get('/courses');
    return Array.isArray(res.data) ? res.data : (res.data.courses || []);
  },
  async create(title: string, description: string) {
    const res = await api.post('/courses', { title, description });
    return res.data;
  },
  async get(id: number) {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
  async enroll(courseId: number) {
    const res = await api.post(`/courses/${courseId}/enroll`);
    return res.data;
  },
};

// === Assignments API ===
export const assignmentsApi = {
  async list(courseId: number) {
    const res = await api.get(`/assignments/course/${courseId}`);
    return Array.isArray(res.data) ? res.data : (res.data.assignments || []);
  },
  async create(data: {
    course_id: number;
    title: string;
    description: string;
    due_date: string;
    supported_languages: string[];
    time_limit_seconds?: number;
    memory_limit_mb?: number;
    test_cases: { input: string; expected_output: string; is_hidden: boolean; weight: number }[];
  }) {
    const res = await api.post('/assignments', data);
    return res.data;
  },
  async get(id: number) {
    const res = await api.get(`/assignments/${id}`);
    return res.data;
  },
};

// === Submissions API ===
export const submissionsApi = {
  async submit(assignmentId: number, code: string, language: string) {
    const res = await api.post('/submissions', {
      assignment_id: assignmentId,
      code,
      language,
    });
    return res.data;
  },
  async runTests(assignmentId: number, code: string, language: string) {
    const res = await api.post('/submissions/run-tests', {
      assignment_id: assignmentId,
      code,
      language,
    });
    return res.data;
  },
  async get(id: number) {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
  },
  async listByAssignment(assignmentId: number) {
    const res = await api.get(`/submissions/assignment/${assignmentId}`);
    return res.data;
  },
  async listFlagged(assignmentId: number) {
    const res = await api.get(`/submissions/assignment/${assignmentId}/flagged`);
    return res.data;
  },
  async my() {
    const res = await api.get('/submissions/my');
    return res.data;
  },
};

// === Admin API ===
export const adminApi = {
  async getSandboxConfig() {
    const res = await api.get('/admin/sandbox/config');
    return res.data;
  },
  async updateSandboxConfig(data: {
    time_limit_seconds: number;
    memory_limit_mb: number;
    allowed_languages: string[];
  }) {
    const res = await api.put('/admin/sandbox/config', data);
    return res.data;
  },
  async getMoodleConfig() {
    const res = await api.get('/admin/moodle/config');
    return res.data;
  },
  async saveMoodleConfig(apiUrl: string, token: string) {
    const res = await api.put('/admin/moodle/config', {
      api_url: apiUrl,
      token,
    });
    return res.data;
  },
  async testMoodle(apiUrl: string, token: string) {
    const res = await api.post('/admin/moodle/test', {
      api_url: apiUrl,
      token,
    });
    return res.data;
  },
};

export default api;
