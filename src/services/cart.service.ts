import api from '../utils/api';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: any;
  };
  variant?: {
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
  };
}

export interface CartResponse {
  success: boolean;
  data: {
    items: any[]; // Cart[] from backend
    subtotal: number;
    total: number;
  };
}

export interface AddToCartRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    return api.get('/cart');
  },

  addToCart: async (data: AddToCartRequest): Promise<{ success: boolean; message: string; data: any }> => {
    return api.post('/cart/add', data);
  },

  updateQuantity: async (itemId: string, quantity: number): Promise<{ success: boolean; message: string }> => {
    return api.put(`/cart/update/${itemId}`, { quantity });
  },

  removeFromCart: async (itemId: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/cart/remove/${itemId}`);
  },

  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    return api.delete('/cart/clear');
  },
};

