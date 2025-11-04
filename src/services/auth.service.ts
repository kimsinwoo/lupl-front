import api from '../utils/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name?: string;
      role: string;
    };
  };
  message: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/login', credentials);
    console.log('🔍 Auth service login response (raw):', response);
    console.log('🔍 Response type:', typeof response);
    console.log('🔍 Response keys:', response ? Object.keys(response) : 'null');
    
    // api.post는 response.data를 반환
    // 사용자가 보여준 구조: 전체 Axios 응답 { data: { data: { user, success } }, status, ... }
    // api.post가 반환하는 것: { data: { user, success }, message }
    // 따라서 response.data.user를 확인해야 함
    
    let actualResponse = response;
    let userData = null;
    
    // 구조 1: response가 { data: { user, success }, message } 형태
    if (response && response.data && response.data.user) {
      actualResponse = response;
      userData = response.data.user;
      console.log('✅ Found user in response.data.user');
    }
    // 구조 2: response가 { success: true, data: { user } } 형태
    else if (response && response.success && response.data?.user) {
      actualResponse = response;
      userData = response.data.user;
      console.log('✅ Found user in response.success.data.user');
    }
    // 구조 3: 중첩된 구조 { data: { data: { user } } }
    else if (response && response.data && response.data.data && response.data.data.user) {
      actualResponse = response.data;
      userData = response.data.data.user;
      console.log('✅ Found user in response.data.data.user (nested)');
    }
    // 구조 4: data 자체가 user 객체
    else if (response && response.data && response.data.id && !response.data.user) {
      actualResponse = { success: true, data: { user: response.data }, message: 'Login successful' };
      userData = response.data;
      console.log('✅ Found user in response.data (data is user object)');
    }
    
    console.log('👤 Extracted user data:', userData);
    console.log('🔍 Final actualResponse:', actualResponse);
    
    // 세션 쿠키가 자동으로 설정되므로 user 정보만 저장
    // JWT 토큰도 저장 (백엔드에서 반환하는 경우)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ User saved in auth service:', userData);
      console.log('✅ localStorage user:', localStorage.getItem('user'));
      
      // 토큰이 응답에 포함되어 있으면 저장
      // 백엔드 응답 구조: { success: true, data: { user: {...}, token: "..." }, message: "..." }
      // api.post는 response.data를 반환하므로: { success: true, data: { user: {...}, token: "..." }, message: "..." }
      let token = null;
      
      // 응답 구조 디버깅
      console.log('🔍 Full login response:', JSON.stringify(response, null, 2));
      
      // 다양한 응답 구조에서 토큰 찾기
      if ((response as any).token) {
        token = (response as any).token;
        console.log('✅ Token found in response.token');
      } else if ((response as any).data?.token) {
        token = (response as any).data.token;
        console.log('✅ Token found in response.data.token');
      } else if ((response as any).data?.data?.token) {
        token = (response as any).data.data.token;
        console.log('✅ Token found in response.data.data.token');
      }
      
      if (token) {
        localStorage.setItem('token', token);
        console.log('✅ Token saved in localStorage');
      } else {
        console.warn('⚠️ Token not found in response. Available keys:', Object.keys(response || {}));
        console.warn('⚠️ response.data keys:', response && (response as any).data ? Object.keys((response as any).data) : 'N/A');
      }
    } else {
      console.warn('⚠️ User data not found in response');
      console.warn('⚠️ Full response structure:', JSON.stringify(response, null, 2));
      if (response) {
        console.warn('⚠️ response.data:', response.data);
        console.warn('⚠️ response.data?.data:', (response as any).data?.data);
        console.warn('⚠️ response.data?.data?.user:', (response as any).data?.data?.user);
      }
    }
    
    // actualResponse가 없으면 response를 그대로 반환
    return (actualResponse || response) as AuthResponse;
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<any>('/auth/register', userData);
      
      // Axios 응답 구조 처리
      let actualResponse = response;
      if ((response as any).data && (response as any).data.data) {
        actualResponse = (response as any).data;
      }
      
      // 세션 쿠키가 자동으로 설정되므로 user 정보만 저장
      if (actualResponse.success && actualResponse.data?.user) {
        localStorage.setItem('user', JSON.stringify(actualResponse.data.user));
      }
      
      return actualResponse as AuthResponse;
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Handle API errors - api.post는 axios error를 throw함
      if (error.response) {
        const errorResponse = error.response.data;
        const status = error.response.status;
        
        // Extract error message from response
        let errorMessage = 'Registration failed';
        
        if (errorResponse && typeof errorResponse === 'object') {
          // Structured error response: { success: false, message: "..." }
          if (errorResponse.message) {
            errorMessage = errorResponse.message;
          } else if (errorResponse.error) {
            errorMessage = errorResponse.error;
          }
        } else if (typeof errorResponse === 'string') {
          errorMessage = errorResponse;
        }
        
        // Handle specific status codes
        if (status === 409) {
          // Conflict - email already exists
          errorMessage = errorMessage || 'Email already registered';
        } else if (status === 400) {
          // Bad Request - validation error
          errorMessage = errorMessage || 'Invalid registration data';
        }
        
        throw new Error(errorMessage);
      }
      
      // Network error or other errors
      if (error.message) {
        throw new Error(error.message);
      }
      
      throw new Error('Failed to register. Please try again.');
    }
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // 세션 쿠키는 서버에서 자동으로 삭제됨
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: async (): Promise<boolean> => {
    // 세션 확인을 위해 서버에 요청
    try {
      const response = await api.get('/auth/me');
      return response.success && !!response.data?.user;
    } catch {
      return false;
    }
  },
  
  kakaoLogin: async (accessToken: string): Promise<AuthResponse> => {
    const response = await api.post<any>('/auth/kakao', { accessToken });
    
    // Axios 응답 구조 처리
    let actualResponse = response;
    if ((response as any).data && (response as any).data.data) {
      actualResponse = (response as any).data;
    }
    
    // 세션 쿠키가 자동으로 설정되므로 user 정보와 토큰 저장
    if (actualResponse.success && actualResponse.data?.user) {
      localStorage.setItem('user', JSON.stringify(actualResponse.data.user));
      
      // 토큰 저장
      if (actualResponse.data?.token) {
        localStorage.setItem('token', actualResponse.data.token);
        console.log('✅ Token saved in localStorage (Kakao login)');
      }
    }
    
    return actualResponse as AuthResponse;
  },
  
  // Send verification code for finding user ID
  sendFindIdVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/find-id/send-code', { email });
    return response;
  },
  
  // Find user ID after verification
  findUserId: async (email: string, code: string): Promise<{ success: boolean; data: { email: string }; message: string }> => {
    const response = await api.post('/auth/find-id/verify', { email, code });
    return response;
  },
  
  // Send verification code for password reset
  sendResetPasswordVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/reset-password/send-code', { email });
    return response;
  },
  
  // Reset password after verification
  resetPasswordWithVerification: async (email: string, code: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/reset-password/verify', { email, code, password });
    return response;
  },
};

