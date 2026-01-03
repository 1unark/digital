import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register/', { username, email, password }),
  
  getProfile: (userId: number) =>
    api.get(`/auth/profile/${userId}/`),
};

// Posts API
export const postsAPI = {
  getAll: (page = 1) =>
    api.get('/posts/', { params: { page } }),
  
  getById: (id: number) =>
    api.get(`/posts/${id}/`),
  
  create: (formData: FormData) =>
    api.post('/posts/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  delete: (id: number) =>
    api.delete(`/posts/${id}/`),
};

// Votes API
export const votesAPI = {
  vote: (postId: number, voteType: 1 | 2) =>
    api.post(`/votes/${postId}/`, { vote_type: voteType }),
  
  removeVote: (postId: number) =>
    api.delete(`/votes/${postId}/delete/`),
};

export default api;