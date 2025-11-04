import api from '../utils/api';

export interface Review {
  id: string;
  userId: string;
  productId: string;
  orderId?: string | null;
  rating: number;       // 1~5
  comment: string;
  userName?: string;
  createdAt: string;    // ISO
  updatedAt: string;    // ISO
}

export interface CreateReviewData {
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
}

/** 백엔드 실제 응답: { success: true, data: Review[] } */
type ReviewsEnvelope = {
  success: boolean;
  data: Review[];
};

/** create/update 응답: { success: true, data: Review } */
type ReviewEnvelope = {
  success: boolean;
  data: Review;
};

export const reviewService = {
  /** 제품별 리뷰 조회 — 항상 Review[]만 반환하도록 단일화 */
  async getProductReviews(productId: string): Promise<Review[]> {
    const res = await api.get<ReviewsEnvelope | Review[]>('/reviews', {
      params: { productId },
    });

    const payload = res.data as ReviewsEnvelope | Review[];
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    // userName 보정 (user.name이 있을 수 있음)
    return list.map((r) => ({
      ...r,
      userName: r.userName ?? (typeof (r as unknown as { user?: { name?: string } }).user?.name === 'string'
        ? (r as unknown as { user?: { name?: string } }).user!.name
        : undefined),
    }));
  },

  async createReview(data: CreateReviewData): Promise<Review> {
    const res = await api.post<ReviewEnvelope>('/reviews', data);
    return res.data.data;
  },

  async updateReview(id: string, data: Partial<CreateReviewData>): Promise<Review> {
    const res = await api.put<ReviewEnvelope>(`/reviews/${id}`, data);
    return res.data.data;
  },

  async deleteReview(id: string): Promise<boolean> {
    const res = await api.delete<{ success: boolean }>(`/reviews/${id}`);
    return Boolean(res.data?.success);
  },
};
