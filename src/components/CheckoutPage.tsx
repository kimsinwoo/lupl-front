import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  
  // 직접 구매 상품 정보 (URL state에서 가져옴)
  const directPurchaseProduct = location.state?.product || null;
  const isDirectPurchase = !!directPurchaseProduct;
  
  // User의 이름을 firstName과 lastName으로 분리
  const userName = user?.name || '';
  const nameParts = userName.split(' ');
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Korea',
  });
  
  // User 정보가 로드되면 기본값 설정
  useEffect(() => {
    if (user && useSavedAddress) {
      const userAddress = user.address as any;
      if (userAddress) {
        setFormData({
          firstName: defaultFirstName,
          lastName: defaultLastName,
          email: user.email || '',
          phone: user.phone || '',
          address: userAddress.street || userAddress.address || '',
          city: userAddress.city || '',
          postalCode: userAddress.zipCode || userAddress.postalCode || '',
          country: userAddress.country || 'Korea',
        });
      } else {
        // 주소가 없으면 기본 정보만 설정
        setFormData(prev => ({
          ...prev,
          firstName: defaultFirstName,
          lastName: defaultLastName,
          email: user.email || '',
          phone: user.phone || '',
        }));
      }
    }
  }, [user, useSavedAddress]);
  
  // 새로운 주소로 보내기 선택 시 폼 초기화
  const handleAddressOptionChange = (useSaved: boolean) => {
    setUseSavedAddress(useSaved);
    if (!useSaved) {
      // 새로운 주소 입력 모드
      setFormData({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Korea',
      });
    } else {
      // 저장된 주소 사용 모드
      const userAddress = user?.address as any;
      if (userAddress) {
        setFormData({
          firstName: defaultFirstName,
          lastName: defaultLastName,
          email: user?.email || '',
          phone: user?.phone || '',
          address: userAddress.street || userAddress.address || '',
          city: userAddress.city || '',
          postalCode: userAddress.zipCode || userAddress.postalCode || '',
          country: userAddress.country || 'Korea',
        });
      }
    }
  };
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentWidgets, setPaymentWidgets] = useState(null);

  // 직접 구매인 경우 해당 상품만, 아니면 장바구니 전체
  const displayCart = isDirectPurchase 
    ? [{
        id: `direct-${directPurchaseProduct.id}`,
        productId: directPurchaseProduct.id,
        name: directPurchaseProduct.name || directPurchaseProduct.title,
        price: directPurchaseProduct.price,
        image: directPurchaseProduct.image || (Array.isArray(directPurchaseProduct.images) ? directPurchaseProduct.images[0] : ''),
        quantity: directPurchaseProduct.quantity || 1,
        selectedSize: directPurchaseProduct.size || '',
        selectedColor: directPurchaseProduct.color || '',
        variantId: directPurchaseProduct.variantId,
      }]
    : cart;
    
  const displayTotal = isDirectPurchase 
    ? (directPurchaseProduct.price * (directPurchaseProduct.quantity || 1))
    : cartTotal;
    
  const shippingCostDisplay = displayTotal > 0 ? 15 : 0; // $15 배송비
  const total = displayTotal + shippingCostDisplay;
  
  // totalAmount: 달러를 원화로 변환 (1 USD = 1300 KRW)
  const totalAmount = Math.floor((total * 1300));
  
  // 토스페이먼츠 스크립트 로드
  useEffect(() => {
    if (!window.TossPayments) {
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment-widget';
      script.async = true;
      script.onload = () => {
        console.log('✅ TossPayments script loaded');
      };
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  // Step 3으로 이동하면 결제 위젯 초기화
  useEffect(() => {
    const initPaymentWidget = async () => {
      if (step === 3 && paymentMethod === 'card') {
        // TossPayments 스크립트가 로드될 때까지 대기
        let retries = 0;
        const checkTossPayments = setInterval(async () => {
          if (window.TossPayments) {
            clearInterval(checkTossPayments);
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
          } else {
            retries++;
            if (retries > 50) { // 5초 후 타임아웃
              clearInterval(checkTossPayments);
              console.error('❌ TossPayments script failed to load');
            }
          }
        }, 100);
        
        return () => {
          clearInterval(checkTossPayments);
          if (paymentWidgets) {
            paymentWidgets.unmount?.('#payment-method');
            paymentWidgets.unmount?.('#agreement');
          }
        };
      }
    };
    
    initPaymentWidget();
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
        toast.error(t('checkout.allFieldsRequired'));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // 결제 방법 선택으로 진행
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    console.log('🛒 Current cart in CheckoutPage:', displayCart);
    console.log('🛒 Cart length:', displayCart.length);
    console.log('🛒 Cart total:', displayTotal);
    console.log('🛒 Is direct purchase:', isDirectPurchase);
    
    setIsPlacingOrder(true);
    try {
      // 주문에 포함할 items 준비
      const orderItems = displayCart.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity || 1,
      }));
      
      // 먼저 주문 생성
      const orderData = {
        shippingName: `${formData.firstName} ${formData.lastName}`,
        shippingPhone: formData.phone || '',
        shippingAddress1: formData.address,
        shippingAddress2: '',
        shippingCity: formData.city,
        shippingZip: formData.postalCode,
        shippingCountry: formData.country || 'Korea',
        paymentMethod: paymentMethod,
        notes: '',
        items: orderItems  // items 배열 추가
      };
      
      console.log('📦 Creating order with data:', orderData);
      
      const orderResponse = await orderService.createOrder(orderData);
      console.log('✅ Order created:', orderResponse);
      
      // orderId 추출
      let actualOrderId = '';
      if ((orderResponse as any).data?.data?.id) {
        actualOrderId = (orderResponse as any).data.data.id;
      } else if ((orderResponse as any).data?.id) {
        actualOrderId = (orderResponse as any).data.id;
      }
      
      if (!actualOrderId) {
        throw new Error(t('checkout.orderIdFailed'));
      }
      
      // 결제 방법에 따라 처리
      if (paymentMethod === 'card') {
        // Toss Payments v2 위젯으로 결제
        if (!paymentWidgets) {
          throw new Error(t('checkout.paymentWidgetNotReady'));
        }
        
        console.log('💳 Requesting payment with widgets...');
        const orderItemCount = displayCart.length;
        const orderName = isDirectPurchase 
          ? `${directPurchaseProduct.name || directPurchaseProduct.title}`
          : `Lupl 주문 (${orderItemCount}개 상품)`;
        
        console.log('💳 Payment params:', {
          orderId: `LUPL-${actualOrderId}`,
          orderName: orderName,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerMobilePhone: formData.phone,
        });
        
        // 결제창 열기
        await paymentWidgets.requestPayment({
          orderId: `LUPL-${actualOrderId}`,
          orderName: orderName,
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
        
        toast.success(t('checkout.orderSuccess'));
        
        // 직접 구매가 아닌 경우에만 장바구니 비우기
        if (!isDirectPurchase) {
          await clearCart();
        }
        
        // MyPage로 이동
        setTimeout(() => {
          onNavigate('mypage');
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ Failed to process order:', error);
      toast.error(error.message || t('checkout.orderFailed'));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isDirectPurchase && cart.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 sm:space-y-8">
            <p className="text-base sm:text-lg lg:text-xl text-white/60">{t('cart.empty')}</p>
            <Button
              onClick={() => onNavigate('shop')}
              className="px-8 sm:px-10 lg:px-12 py-5 sm:py-6 bg-[#5842FF] text-white hover:bg-[#5842FF]/80 tracking-[0.15em] text-sm sm:text-base"
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
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl tracking-[0.2em] mb-10 sm:mb-12">{t('checkout.title')}</h1>

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
                <h2 className="text-white text-xl sm:text-2xl tracking-[0.15em] mb-5 sm:mb-6">{t('checkout.shipping')}</h2>

                {/* 주소 선택 옵션 (로그인한 사용자만) */}
                {user && (
                  <div className="space-y-3 p-4 border border-white/10 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="useSavedAddress"
                        name="addressOption"
                        checked={useSavedAddress}
                        onChange={() => handleAddressOptionChange(true)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="useSavedAddress" className="text-white cursor-pointer">
                        {language === 'ko' ? '저장된 주소 사용' : 'Use Saved Address'}
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="useNewAddress"
                        name="addressOption"
                        checked={!useSavedAddress}
                        onChange={() => handleAddressOptionChange(false)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="useNewAddress" className="text-white cursor-pointer">
                        {language === 'ko' ? '새로운 주소로 보내기' : 'Send to New Address'}
                      </label>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm text-white">{t('checkout.firstName')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="border-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm text-white">{t('checkout.lastName')}</Label>
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
                  <Label htmlFor="email" className="text-sm text-white">{t('checkout.email')}</Label>
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
                  <Label htmlFor="phone" className="text-sm text-white">{t('checkout.phone')}</Label>
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
                  <Label htmlFor="address" className="text-sm text-white">{t('checkout.address')}</Label>
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
                    <Label htmlFor="city" className="text-sm text-white">{t('checkout.city')}</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="border-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm text-white">{t('checkout.postalCode')}</Label>
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
                  <Label htmlFor="country" className="text-sm text-white">{t('checkout.country')}</Label>
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
                  <div className="border border-white/20 rounded-lg p-4 cursor-pointer transition-all hover:border-[#5842FF] bg-white/5"
                    onClick={() => setPaymentMethod('card')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium tracking-wide">{t('checkout.card')}</div>
                        <div className="text-white/70 text-sm">{t('checkout.card.description')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-white/20 rounded-lg p-4 cursor-pointer transition-all hover:border-[#5842FF] bg-white/5"
                    onClick={() => setPaymentMethod('bank')}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium tracking-wide">{t('checkout.bank')}</div>
                        <div className="text-white/70 text-sm">{t('checkout.bank.description')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 py-5 sm:py-6 border-black/20 tracking-[0.15em] text-sm sm:text-base text-black"
                  >
                    {t('checkout.back')}
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
                <h2 className="text-white text-xl sm:text-2xl tracking-[0.15em] mb-5 sm:mb-6">{t('checkout.review')}</h2>

                <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 border border-white/10">
                  <h3 className="text-white text-sm tracking-[0.15em]">{t('checkout.shippingAddress')}</h3>
                  <div className="text-white/70 text-sm">
                    <p>{formData.firstName} {formData.lastName}</p>
                    <p>{formData.address}</p>
                    <p>{formData.city}, {formData.postalCode}</p>
                    <p>{formData.country}</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 border border-white/10">
                  <h3 className="text-white text-sm tracking-[0.15em]">{t('checkout.orderItems')}</h3>
                  {displayCart.map((item, i) => {
                    const lineTotal = item.price * item.quantity;
                    return (
                      <div
                        key={`${item.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`}
                        className="flex items-center gap-4 mb-3 pb-3 border-b border-white/10 last:border-b-0"
                      >
                        {/* 이미지 */}
                        <div className="flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-white/5" style={{ width: '120px', height: '120px' }}>
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* 이름 및 옵션 */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-white text-base font-semibold leading-tight break-words">
                            {item.name}
                          </h3>
                          <p className="text-white/70 mt-1 text-xs">
                            {item.selectedSize} <span className="mx-1">/</span> {item.selectedColor}
                          </p>
                          <span className="text-white/60 text-xs mt-1">
                            {t('checkout.quantity')}: {item.quantity}
                          </span>
                        </div>
                        {/* 세부 가격 */}
                        <span className="text-white text-sm sm:text-base font-semibold tabular-nums" style={{ whiteSpace: 'nowrap' }}>
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {paymentMethod === 'card' ? (
                  <>
                    {/* 토스페이먼츠 위젯 */}
                    <div className="mb-6">
                      <div id="payment-method" className="bg-white rounded-lg p-4"></div>
                    </div>
                    <div className="mb-6">
                      <div id="agreement"></div>
                    </div>
                    
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || !paymentWidgets}
                      className="w-full py-5 sm:py-6 bg-[#5842FF] text-white hover:bg-[#5842FF]/80 tracking-[0.15em] text-sm sm:text-base disabled:opacity-50"
                    >
                      {isPlacingOrder ? t('checkout.processing') : t('checkout.pay')}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4 p-5 sm:p-6 border border-white/10">
                      <h3 className="text-white text-sm tracking-[0.15em]">{t('checkout.paymentMethod')}</h3>
                      <div className="text-white/70 text-sm">
                        {t('checkout.bank')}
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full py-5 sm:py-6 bg-[#5842FF] text-white hover:bg-[#5842FF]/80 tracking-[0.15em] text-sm sm:text-base"
                    >
                      {isPlacingOrder ? t('checkout.processing') : t('checkout.placeOrder')}
                    </Button>
                  </>
                )}
                
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="w-full py-5 sm:py-6 border-white/20 text-white hover:bg-white/10 tracking-[0.15em] text-sm sm:text-base"
                >
                  {t('checkout.back')}
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-white/10 bg-white/5 p-6 sm:p-8 space-y-5 sm:space-y-6 lg:sticky lg:top-32">
              <h2 className="text-white text-base sm:text-lg tracking-[0.15em] mb-4 sm:mb-6">{t('checkout.orderSummary')}</h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-white/70">{t('cart.subtotal')}</span>
                  <span className="text-white">${displayTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-white/70">{t('cart.shipping')}</span>
                  <span className="text-white">${shippingCostDisplay.toFixed(2)}</span>
                </div>
                <div className="pt-3 sm:pt-4 border-t border-white/10 flex justify-between">
                  <span className="text-sm sm:text-base tracking-[0.15em] text-white">{t('cart.total')}</span>
                  <span className="text-lg sm:text-xl text-white">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
