import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
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

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/token/refresh`, {
              refresh_token: refreshToken,
            });

            const { access_token } = response.data;
            localStorage.setItem('access_token', access_token);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (username: string, email: string, password: string, confirm_password: string) =>
    api.post('/auth/registration', { username, email, password, confirm_password }),

  login: (username: string, password: string) => {
    // OAuth2 requires form data, not JSON
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return axios.post(`${API_BASE_URL}/auth/token`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  getCurrentUser: () =>
    api.get('/auth/me'),
};

// Video API
// NOTE: These endpoints are not yet implemented in the backend (ytb-api)
// The backend currently only has GET /studio/info endpoint
// All video endpoints below need to be implemented in the backend first
export const videoAPI = {
  // TODO: Backend implementation required
  getVideos: () =>
    api.get('/studio/videos'),

  getVideo: (id: string) =>
    api.get(`/studio/videos/${id}`),

  getMyVideos: () =>
    api.get('/studio/videos/my-videos'),

  createVideo: (data: {
    title: string;
    description?: string;
    thumbnail_url?: string;
  }) =>
    api.post('/studio/videos', data),

  updateVideo: (id: string, data: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
  }) =>
    api.patch(`/studio/videos/${id}`, data),

  deleteVideo: (id: string) =>
    api.delete(`/studio/videos/${id}`),

  getPresignedUploadUrl: (filename: string, content_type: string) =>
    api.get('/studio/videos/presigned-upload-url', {
      params: { filename, content_type },
    }),

  markUploadComplete: (id: string, video_url: string) =>
    api.patch(`/studio/videos/${id}/upload-complete`, { video_url }),
};

export default api;
