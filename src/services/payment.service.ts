import api from '../utils/api';

export interface ConfirmPaymentRequest {
  paymentKey: string;
  orderId: string;
  tossOrderId?: string;
  amount: number;
}

export interface CancelPaymentRequest {
  paymentKey: string;
  cancelReason: string;
}

export interface PaymentResponse {
  success: boolean;
  data: any;
  message: string;
}

export const paymentService = {
  confirmPayment: async (data: ConfirmPaymentRequest): Promise<PaymentResponse> => {
    return api.post('/payments/confirm', data);
  },

  cancelPayment: async (data: CancelPaymentRequest): Promise<PaymentResponse> => {
    return api.post('/payments/cancel', data);
  },
};

