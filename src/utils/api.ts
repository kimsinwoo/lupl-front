import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // 세션 쿠키 전송
});

// Request 인터셉터 - JWT 토큰 또는 세션 쿠키 사용
apiClient.interceptors.request.use(
  (config) => {
    // JWT 토큰이 localStorage에 있으면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Adding Authorization token to request');
    } else {
      // 토큰이 없으면 세션 쿠키를 사용 (withCredentials: true로 자동 전송)
      console.log('🔐 No token found, using session cookie');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러는 UserContext에서 처리하므로 여기서 리디렉션하지 않음
    return Promise.reject(error);
  }
);

// API 호출 헬퍼 함수들
export const api = {
  get: async <T = any>(url: string, config?: AxiosRequestConfig) => {
    try {
      console.log(`🌐 API GET: ${API_BASE_URL}${url}`, config?.params || '');
      const response = await apiClient.get<T>(url, config);
      console.log(`✅ API Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API GET Error: ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      console.log(`🌐 API POST: ${API_BASE_URL}${url}`, data || '');
      const response = await apiClient.post<T>(url, data, config);
      console.log(`✅ API Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API POST Error: ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      console.log(`🌐 API PUT: ${API_BASE_URL}${url}`, data || '');
      const response = await apiClient.put<T>(url, data, config);
      console.log(`✅ API Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API PUT Error: ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      console.log(`🌐 API PATCH: ${API_BASE_URL}${url}`, data || '');
      const response = await apiClient.patch<T>(url, data, config);
      console.log(`✅ API Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API PATCH Error: ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  delete: async <T = any>(url: string, config?: AxiosRequestConfig) => {
    try {
      console.log(`🌐 API DELETE: ${API_BASE_URL}${url}`);
      const response = await apiClient.delete<T>(url, config);
      console.log(`✅ API Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API DELETE Error: ${url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};

export default apiClient;
