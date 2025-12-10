import api from '../utils/api';

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  year?: number;
  images: string[];
  videoUrl?: string;
  featured: boolean;
  category?: PortfolioCategory;
}

export interface PortfolioResponse {
  success: boolean;
  data: PortfolioItem[];
}

export const portfolioService = {
  getCategories: async () => {
    return api.get('/portfolio/categories');
  },
  
  getCategoryItems: async (categoryId: string) => {
    return api.get(`/portfolio/categories/${categoryId}`);
  },
  
  getAllItems: async (): Promise<PortfolioResponse> => {
    return api.get('/portfolio/items');
  },
  
  getItemById: async (id: string) => {
    return api.get(`/portfolio/items/${id}`);
  },
};

