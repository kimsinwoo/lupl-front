import api from '../utils/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export const userService = {
  getProfile: async (): Promise<UserResponse> => {
    return api.get('/users/profile');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    return api.put('/users/profile', data);
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return api.put('/users/password', { currentPassword, newPassword });
  },
};

