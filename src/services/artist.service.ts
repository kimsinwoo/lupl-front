import api from '../utils/api';

export interface Artist {
  id: string;
  name: string;
  nameEn?: string;
  bio?: string;
  bioEn?: string;
  profileImage?: string;
  portfolio?: string[];
  exhibitions?: string[];
  products?: any[];
}

export interface ArtistsResponse {
  success: boolean;
  data: Artist[];
}

export interface ArtistResponse {
  success: boolean;
  data: Artist;
}

export const artistService = {
  getAll: async (): Promise<ArtistsResponse> => {
    return api.get('/artists');
  },
  
  getById: async (id: string): Promise<ArtistResponse> => {
    return api.get(`/artists/${id}`);
  },
};

