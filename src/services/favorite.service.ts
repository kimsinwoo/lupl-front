import api from '../utils/api';

export interface FavoriteResponse {
  success: boolean;
  data: {
    favorites: Array<{
      id: string;
      productId: string;
      product?: {
        id: string;
        name: string;
        price: number;
        images: any;
      };
    }>;
  };
}

export const favoriteService = {
  getFavorites: async (): Promise<FavoriteResponse> => {
    return api.get('/favorites');
  },

  addFavorite: async (productId: string): Promise<{ success: boolean; message: string }> => {
    return api.post('/favorites/add', { productId });
  },

  removeFavorite: async (productId: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/favorites/remove/${productId}`);
  },

  toggleFavorite: async (productId: string): Promise<{ success: boolean; message: string; isFavorite: boolean }> => {
    const response = await api.post('/favorites/toggle', { productId });
    return response.data;
  },
};

