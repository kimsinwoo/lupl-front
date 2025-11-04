import api from '../utils/api';

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images: any;
  };
  variant?: {
    size: string;
    color: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  userId: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  shippingName: string;
  shippingPhone: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry?: string;
  notes?: string;
  paymentMethod?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return api.post('/orders', data);
  },

  getMyOrders: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> => {
    return api.get('/orders', { params });
  },

  getOrderById: async (orderId: string): Promise<OrderResponse> => {
    return api.get(`/orders/${orderId}`);
  },

  cancelOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    return api.put(`/orders/${orderId}/cancel`);
  },
};

