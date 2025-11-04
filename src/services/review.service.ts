import api from '../utils/api';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  // 제품별 리뷰 조회
  getProductReviews: async (productId: string): Promise<{ success: boolean; data: Review[] }> => {
    return api.get('/reviews', { params: { productId } });
  },

  // 리뷰 생성
  createReview: async (data: CreateReviewData): Promise<{ success: boolean; data: Review }> => {
    return api.post('/reviews', data);
  },

  // 리뷰 업데이트
  updateReview: async (id: string, data: Partial<CreateReviewData>): Promise<{ success: boolean; data: Review }> => {
    return api.put(`/reviews/${id}`, data);
  },

  // 리뷰 삭제
  deleteReview: async (id: string): Promise<{ success: boolean }> => {
    return api.delete(`/reviews/${id}`);
  },
};
