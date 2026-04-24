import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally - auto logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

// Events
export const eventsAPI = {
  getOpen: () => api.get('/api/events'),
  getAll: () => api.get('/api/events/all'),
  getMy: () => api.get('/api/events/my'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
  approve: (id) => api.patch(`/api/events/${id}/approve`),
  close: (id) => api.patch(`/api/events/${id}/close`),
  addSubEvent: (id, data) => api.post(`/api/events/${id}/sub-events`, data),
  deleteSubEvent: (subId) => api.delete(`/api/events/sub-events/${subId}`),
};

// Registrations
export const registrationsAPI = {
  register: (eventId) => api.post('/api/registrations', { eventId }),
  myGigs: () => api.get('/api/registrations/my-gigs'),
  eventRegistrations: (eventId) => api.get(`/api/registrations/event/${eventId}`),
  cancel: (eventId) => api.delete(`/api/registrations/${eventId}`),
};

// Attendance
export const attendanceAPI = {
  getSheet: (eventId) => api.get(`/api/attendance/${eventId}`),
  markOne: (eventId, studentId, isPresent) =>
    api.patch(`/api/attendance/${eventId}/mark`, { studentId, isPresent }),
  bulkMark: (eventId, attendanceList) =>
    api.post(`/api/attendance/${eventId}/bulk-mark`, { attendanceList }),
  finalize: (eventId) => api.post(`/api/attendance/${eventId}/finalize`),
  payoutSummary: (eventId) => api.get(`/api/attendance/${eventId}/payout-summary`),
};

// Stats
export const statsAPI = {
  admin: () => api.get('/api/stats/admin'),
  stakeholder: () => api.get('/api/stats/stakeholder'),
  student: () => api.get('/api/stats/student'),
};

export default api;
