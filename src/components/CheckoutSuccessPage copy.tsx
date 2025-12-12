import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
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
          throw new Error('결제 정보가 올바르지 않습니다');
        }

        // orderId에 KITAE- 접두어 추가 (토스페이먼츠에 보낸 형식과 일치)
        const tossOrderId = `KITAE-${orderId}`;
        
        console.log('💰 Confirming payment with:', { paymentKey, tossOrderId, amount });

        // 결제 승인
        await paymentService.confirmPayment({
          paymentKey,
          orderId: tossOrderId, // 토스페이먼츠에 보낸 형식 사용
          amount: parseInt(amount, 10)
        });

        console.log('✅ Payment confirmed');

        // 장바구니 비우기
        await clearCart();

        toast.success('결제가 성공적으로 완료되었습니다!');
      } catch (error: any) {
        console.error('❌ Failed to confirm payment:', error);
        // 에러 발생 시 처리 플래그 리셋하지 않음 (재시도 방지)
        toast.error('결제 승인에 실패했습니다');
      }
    };

    handlePaymentSuccess();
  }, []); // 의존성 배열 비움 - 한 번만 실행

  return (
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 sm:space-y-8">
          <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
          <h1 className="text-3xl sm:text-4xl tracking-[0.15em]">결제 완료</h1>
          <p className="text-lg text-muted-foreground">
            주문이 성공적으로 완료되었습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/mypage')}
              className="px-8 py-5 bg-black text-white hover:bg-black/90 tracking-[0.15em]"
            >
              주문 내역 확인
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="px-8 py-5 border-black tracking-[0.15em]"
            >
              쇼핑 계속하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

