import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Tutoring services
export const tutoringService = {
  startSession: async (topic, syllabusId) => {
    const response = await api.post('/tutoring/session', { topic, syllabusId });
    return response.data;
  },
  sendMessage: async (sessionId, message) => {
    const response = await api.post(`/tutoring/session/${sessionId}/message`, { message });
    return response.data;
  },
  endSession: async (sessionId) => {
    const response = await api.put(`/tutoring/session/${sessionId}/end`);
    return response.data;
  },
  getSessions: async () => {
    const response = await api.get('/tutoring/sessions');
    return response.data;
  },
  // New method for simple chat without session (for testing)
  sendChatMessage: async (message) => {
    const response = await api.post('/tutoring/chat', { message });
    return response.data;
  }
};

// Syllabus services
export const syllabusService = {
  createSyllabus: async (syllabusData) => {
    const response = await api.post('/syllabus', syllabusData);
    return response.data;
  },
  getSyllabus: async (id) => {
    const response = await api.get(`/syllabus/${id}`);
    return response.data;
  },
  getAllSyllabi: async () => {
    const response = await api.get('/syllabus');
    return response.data;
  },
  updateSyllabus: async (id, syllabusData) => {
    const response = await api.put(`/syllabus/${id}`, syllabusData);
    return response.data;
  },
  deleteSyllabus: async (id) => {
    const response = await api.delete(`/syllabus/${id}`);
    return response.data;
  },
};

// Assessment services
export const assessmentService = {
  createAssessment: async (assessmentData) => {
    const response = await api.post('/assessment', assessmentData);
    return response.data;
  },
  getAssessment: async (id) => {
    const response = await api.get(`/assessment/${id}`);
    return response.data;
  },
  submitAssessment: async (id, answers) => {
    const response = await api.post(`/assessment/${id}/submit`, { answers });
    return response.data;
  },
  getAssessmentResults: async (id) => {
    const response = await api.get(`/assessment/${id}/results`);
    return response.data;
  },
};

export default api;
