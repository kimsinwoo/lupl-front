import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { paymentService } from '../services/payment.service';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

export const CheckoutSuccessPage = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // 이미 처리된 경우 무시
    if (hasProcessed.current) {
      console.log('⚠️ Payment already processed, skipping');
      return;
    }

    const handlePaymentSuccess = async () => {
      try {
        // 처리 시작 표시
        hasProcessed.current = true;

        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        console.log('📦 Payment success params:', { paymentKey, orderId, amount });

        if (!paymentKey || !orderId || !amount) {
          console.error('❌ Missing payment parameters');
          throw new Error(t('checkout.paymentFailed'));
        }

        // orderId에 LUPL- 접두어 추가 (토스페이먼츠에 보낸 형식과 일치)
        const tossOrderId = `LUPL-${orderId}`;
        
        console.log('💰 Confirming payment with:', { paymentKey, tossOrderId, amount });

        // 결제 승인 - orderId는 접두어 없이 실제 주문 ID를 전달
        await paymentService.confirmPayment({
          paymentKey,
          orderId: orderId, // 실제 주문 ID (접두어 없음)
          tossOrderId: tossOrderId, // 토스페이먼츠에 보낸 형식
          amount: parseInt(amount, 10)
        });

        console.log('✅ Payment confirmed');

        // 장바구니 비우기
        await clearCart();

        toast.success(t('checkout.paymentSuccess'));
      } catch (error: any) {
        console.error('❌ Failed to confirm payment:', error);
        // 에러 발생 시 처리 플래그 리셋하지 않음 (재시도 방지)
        toast.error(error.response?.data?.message || t('checkout.paymentFailed'));
      }
    };

    handlePaymentSuccess();
  }, []); // 의존성 배열 비움 - 한 번만 실행

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 sm:space-y-8">
          <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
          <h1 className="text-white text-3xl sm:text-4xl tracking-[0.15em]">{t('checkout.paymentComplete')}</h1>
          <p className="text-white/70 text-lg">
            {t('checkout.orderCompleted')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/mypage')}
              className="px-8 py-5 bg-[#5842FF] text-white hover:bg-[#5842FF]/80 tracking-[0.15em]"
            >
              {t('checkout.viewOrders')}
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="px-8 py-5 border-white/20 text-white hover:bg-white/10 tracking-[0.15em]"
            >
              {t('checkout.continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

