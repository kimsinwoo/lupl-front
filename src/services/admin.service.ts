import api from '../utils/api';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  todaySales: number;
  monthSales: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: any[];
  recentUsers: any[];
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  images: any;
  category: any;
  status: string;
  featured: boolean;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

export const adminService = {
  // Dashboard
  getDashboard: async (): Promise<DashboardData> => {
    return api.get('/admin/dashboard');
  },

  // Orders
  getAllOrders: async (): Promise<AdminOrder[]> => {
    const response = await api.get('/admin/orders');
    return response.data || response;
  },

  getOrderById: async (id: string): Promise<AdminOrder> => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data || response;
  },

  updateOrderStatus: async (id: string, status: string, paymentStatus?: string): Promise<AdminOrder> => {
    const response = await api.put(`/admin/orders/${id}/status`, { status, paymentStatus });
    return response.data || response;
  },

  updateShippingInfo: async (id: string, shippingInfo: any): Promise<AdminOrder> => {
    const response = await api.put(`/admin/orders/${id}/shipping`, shippingInfo);
    return response.data || response;
  },

  // Products
  getAllProducts: async (): Promise<AdminProduct[]> => {
    const response = await api.get('/products');
    return response.data || response;
  },

  createProduct: async (productData: any): Promise<AdminProduct> => {
    const response = await api.post('/admin/products', productData);
    return response.data || response;
  },

  updateProduct: async (id: string, productData: any): Promise<AdminProduct> => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data || response;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },

  // Users
  getAllUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users');
    return response.data || response;
  },

  getUserById: async (id: string): Promise<AdminUser> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data || response;
  },

  updateUserRole: async (id: string, role: string): Promise<AdminUser> => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data || response;
  },

  updateUserStatus: async (id: string, status: any): Promise<AdminUser> => {
    const response = await api.put(`/admin/users/${id}/status`, status);
    return response.data || response;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // Analytics
  getAnalytics: async (): Promise<any> => {
    return api.get('/admin/analytics');
  },

  // Reviews
  getAllReviews: async (): Promise<any[]> => {
    const response = await api.get('/admin/reviews');
    return response.data || response;
  },

  updateReviewStatus: async (id: string, status: any): Promise<any> => {
    const response = await api.put(`/admin/reviews/${id}/status`, status);
    return response.data || response;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/admin/reviews/${id}`);
  },
};

