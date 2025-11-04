import api from '../utils/api';

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku: string;
  slug: string;
  status: string;
  featured: boolean;
  gender?: string;
  images: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
  averageRating?: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: Product | Product[];
}

export const productService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    gender?: string;
    status?: string;
    featured?: boolean;
  }): Promise<ProductsResponse> => {
    return api.get('/products', { params });
  },
  
  getFeatured: async (): Promise<{ success: boolean; data: Product[] }> => {
    return api.get('/products/featured');
  },
  
  getById: async (id: string): Promise<ProductResponse> => {
    return api.get(`/products/${id}`);
  },
  
  search: async (query: string, page?: number, limit?: number): Promise<ProductsResponse> => {
    return api.get('/products/search', { 
      params: { q: query, page, limit } 
    });
  },
  
  getReviews: async (productId: string) => {
    return api.get(`/products/${productId}/reviews`);
  },
  
  getVariantBySizeAndColor: async (productId: string, size: string, color: string) => {
    return api.get(`/products/${productId}/variant`, {
      params: { size, color }
    });
  },
};

