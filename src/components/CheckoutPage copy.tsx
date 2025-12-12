import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
}

// TossPayments 타입 선언
declare global {
  interface Window {
    TossPayments: any;
  }
}

export const CheckoutPage = ({ onNavigate }: CheckoutPageProps) => {
  const { t } = useLanguage();
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Korea',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentWidgets, setPaymentWidgets] = useState(null);

  const shippingCostDisplay = cartTotal > 0 ? 3000 : 0; // ₩3,000 배송비
  const total = cartTotal + shippingCostDisplay;
  
  // totalAmount: 원화 금액
  const totalAmount = Math.floor(total);
  
  // Step 3으로 이동하면 결제 위젯 초기화
  useEffect(() => {
    const initPaymentWidget = async () => {
      if (step === 3 && paymentMethod === 'card' && window.TossPayments) {
        try {
          const clientKey = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
          const customerKey = window.TossPayments.ANONYMOUS;
          const tossPayments = window.TossPayments(clientKey);
          const widgets = tossPayments.widgets({ customerKey });
          
          // 금액 설정
          await widgets.setAmount({
            currency: 'KRW',
            value: totalAmount,
          });
          
          // UI 렌더링
          await Promise.all([
            widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
            widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' })
          ]);
          
          setPaymentWidgets(widgets);
          console.log('✅ Payment widgets initialized');
        } catch (error) {
          console.error('❌ Failed to initialize payment widgets:', error);
        }
      }
    };
    
    initPaymentWidget();
    
    // Cleanup
    return () => {
      if (paymentWidgets) {
        paymentWidgets.unmount?.('#payment-method');
        paymentWidgets.unmount?.('#agreement');
      }
    };
  }, [step, paymentMethod, totalAmount]);

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = async () => {
    if (step === 1 && step < 3) {
      // Form validation
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
        toast.error('모든 필드를 입력해주세요');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // 결제 방법 선택으로 진행
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    console.log('🛒 Current cart in CheckoutPage:', cart);
    console.log('🛒 Cart length:', cart.length);
    console.log('🛒 Cart total:', cartTotal);
    
    // 장바구니가 비어있는지 확인
    if (!cart || cart.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return;
    }
    
    setIsPlacingOrder(true);
    try {
      // 먼저 주문 생성 (정상 코드와 동일하게 items 전송하지 않음)
      const orderData = {
        shippingName: `${formData.firstName} ${formData.lastName}`,
        shippingPhone: formData.phone || '',
        shippingAddress1: formData.address,
        shippingAddress2: '',
        shippingCity: formData.city,
        shippingZip: formData.postalCode,
        shippingCountry: formData.country || 'Korea',
        paymentMethod: paymentMethod,
        notes: ''
      };
      
      console.log('📦 Creating order with data:', orderData);
      
      // items는 optional이므로 전송하지 않음 (백엔드에서 DB Cart에서 가져옴)
      const rawOrderResponse = await orderService.createOrder(orderData as any);
      console.log('📦 Raw order response:', rawOrderResponse);
      
      // 응답 구조 처리
      let orderResponse: any = rawOrderResponse;
      if (rawOrderResponse && typeof rawOrderResponse === 'object' && 'status' in rawOrderResponse && 'data' in rawOrderResponse) {
        console.log('📦 Detected axios response object, extracting data...');
        orderResponse = (rawOrderResponse as any).data;
      }
      
      // orderId 추출
      let actualOrderId = '';
      if (orderResponse?.success && orderResponse.data) {
        // { success: true, data: { id: ... } } 형식
        actualOrderId = orderResponse.data.id || orderResponse.data.orderId || '';
      } else if (orderResponse?.data?.id) {
        actualOrderId = orderResponse.data.id;
      } else if (orderResponse?.id) {
        actualOrderId = orderResponse.id;
      } else if (orderResponse?.orderId) {
        actualOrderId = orderResponse.orderId;
      }
      
      console.log('📦 Extracted order ID:', actualOrderId);
      
      if (!actualOrderId) {
        console.error('❌ Order response structure:', orderResponse);
        throw new Error('주문 ID를 받지 못했습니다. 응답 구조를 확인하세요.');
      }
      
      // 결제 방법에 따라 처리
      if (paymentMethod === 'card') {
        // Toss Payments v2 위젯으로 결제
        if (!paymentWidgets) {
          throw new Error('결제 위젯이 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
        }
        
        console.log('💳 Requesting payment with widgets...');
        console.log('💳 Payment params:', {
          orderId: `KITAE-${actualOrderId}`,
          orderName: `KITAE 주문 (${cart.length}개 상품)`,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerMobilePhone: formData.phone,
        });
        
        // 결제창 열기
        await paymentWidgets.requestPayment({
          orderId: `KITAE-${actualOrderId}`,
          orderName: `KITAE 주문 (${cart.length}개 상품)`,
          successUrl: `${window.location.origin}/checkout/success?amount=${totalAmount}&orderId=${actualOrderId}`,
          failUrl: `${window.location.origin}/checkout/fail`,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerMobilePhone: formData.phone,
        });
        
        // 결제창이 열리면 아래 코드는 실행되지 않음 (successUrl로 리다이렉트)
      } else {
        // 계좌 이체인 경우 바로 성공 처리
        console.log('🏦 Bank transfer payment - skipping Toss Payments');
        
        toast.success('주문이 성공적으로 완료되었습니다! 계좌 정보는 이메일로 발송됩니다.');
        
        // 장바구니 비우기
        await clearCart();
        
        // MyPage로 이동
        setTimeout(() => {
          onNavigate('mypage');
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ Failed to process order:', error);
      toast.error(error.message || '주문 처리에 실패했습니다');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">{t('cart.empty')}</p>
            <Button
              onClick={() => onNavigate('shop')}
              className="px-8 sm:px-10 lg:px-12 py-5 sm:py-6 bg-black text-white hover:bg-black/90 tracking-[0.15em] text-sm sm:text-base"
            >
              {t('cart.continueShopping')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressValue = (step / 3) * 100;

  return (
    <div className="min-h-screen pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl tracking-[0.2em] mb-10 sm:mb-12">{t('checkout.title')}</h1>

        {/* Progress Bar */}
        <div className="mb-10 sm:mb-12">
          <div className="flex justify-between mb-3 sm:mb-4 gap-2">
            <span className={`text-xs sm:text-sm tracking-[0.15em] ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              1. {t('checkout.shipping')}
            </span>
            <span className={`text-xs sm:text-sm tracking-[0.15em] ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              2. {t('checkout.payment')}
            </span>
            <span className={`text-xs sm:text-sm tracking-[0.15em] ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
              3. {t('checkout.review')}
            </span>
          </div>
          <Progress value={progressValue} className="h-1" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-5 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl tracking-[0.15em] mb-5 sm:mb-6">{t('checkout.shipping')}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm">{t('checkout.firstName')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="border-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm">{t('checkout.lastName')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="border-black/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">{t('checkout.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="border-black/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">{t('checkout.phone')}</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="border-black/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm">{t('checkout.address')}</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="border-black/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm">{t('checkout.city')}</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="border-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm">{t('checkout.postalCode')}</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="border-black/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm">{t('checkout.country')}</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="border-black/20"
                  />
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full py-5 sm:py-6 bg-black text-white hover:bg-black/90 tracking-[0.15em] text-sm sm:text-base"
                >
                  {t('checkout.continue')}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl tracking-[0.15em] mb-5 sm:mb-6">{t('checkout.payment')}</h2>
                
                {/* 결제 수단 선택 */}
                <div className="space-y-4">
                  <div className="border border-black/20 rounded-lg p-4 cursor-pointer transition-all hover:border-black"
                    onClick={() => setPaymentMethod('card')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-black"
                      />
                      <div className="flex-1">
                        <div className="font-medium tracking-wide">신용/ debit 카드</div>
                        <div className="text-sm text-muted-foreground">토스페이먼츠로 안전하게 결제하세요</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-black/20 rounded-lg p-4 cursor-pointer transition-all hover:border-black"
                    onClick={() => setPaymentMethod('bank')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-black"
                      />
                      <div className="flex-1">
                        <div className="font-medium tracking-wide">계좌 이체</div>
                        <div className="text-sm text-muted-foreground">직접 계좌로 입금해주세요</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 py-5 sm:py-6 border-black/20 tracking-[0.15em] text-sm sm:text-base"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="flex-1 py-5 sm:py-6 bg-black text-white hover:bg-black/90 tracking-[0.15em] text-sm sm:text-base"
                  >
                    {t('checkout.continue')}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl tracking-[0.15em] mb-5 sm:mb-6">{t('checkout.review')}</h2>

                <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 border border-black/10">
                  <h3 className="text-sm tracking-[0.15em]">SHIPPING ADDRESS</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.postalCode}</p>
                    <p>{formData.country}</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 border border-black/10">
                  <h3 className="text-sm tracking-[0.15em]">ORDER ITEMS</h3>
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm text-muted-foreground">
                      <span>{item.name} ({item.selectedSize}/{item.selectedColor}) x{item.quantity}</span>
                      <span>₩{(item.price * item.quantity).toLocaleString('ko-KR')}</span>
                    </div>
                  ))}
                </div>

                {paymentMethod === 'card' ? (
                  <>
                    {/* 토스페이먼츠 위젯 */}
                    <div id="payment-method"></div>
                    <div id="agreement"></div>
                    
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full py-5 sm:py-6 bg-black text-white hover:bg-black/90 tracking-[0.15em] text-sm sm:text-base"
                    >
                      {isPlacingOrder ? '처리 중...' : '결제하기'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 border border-black/10">
                      <h3 className="text-sm tracking-[0.15em]">PAYMENT METHOD</h3>
                      <div className="text-sm text-muted-foreground">
                        계좌 이체
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full py-5 sm:py-6 bg-black text-white hover:bg-black/90 tracking-[0.15em] text-sm sm:text-base"
                    >
                      {isPlacingOrder ? '처리 중...' : t('checkout.placeOrder')}
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="w-full py-5 sm:py-6 border-black/20 tracking-[0.15em] text-sm sm:text-base"
                >
                  Back
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-black/10 p-6 sm:p-8 space-y-5 sm:space-y-6 lg:sticky lg:top-32">
              <h2 className="text-base sm:text-lg tracking-[0.15em] mb-4 sm:mb-6">ORDER SUMMARY</h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span>₩{cartTotal.toLocaleString('ko-KR')}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">{t('cart.shipping')}</span>
                  <span>₩{shippingCostDisplay.toLocaleString('ko-KR')}</span>
                </div>
                <div className="pt-3 sm:pt-4 border-t border-black/10 flex justify-between">
                  <span className="text-sm sm:text-base tracking-[0.15em]">{t('cart.total')}</span>
                  <span className="text-lg sm:text-xl">₩{total.toLocaleString('ko-KR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
