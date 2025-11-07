import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export const CartPage = ({ onNavigate }: CartPageProps) => {
  const { t } = useLanguage();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const tf = (key: string, fallback: string) => {
    const v = t(key);
    return v !== key && v.trim().length > 0 ? v : fallback;
  };

  const shippingCost = cartTotal > 0 ? 15000 : 0; // ₩15,000 배송비
  const total = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-white mb-8 text-4xl sm:text-5xl">
              {tf('cart.title', 'Cart')}
            </h1>
            <p className="text-white/70 mb-8 text-lg">
              {tf('cart.empty', 'Your cart is empty.')}
            </p>
            <Button
              onClick={() => onNavigate('shop')}
              className="bg-[#5842FF] hover:bg-[#5842FF]/80 text-white px-8 py-6"
            >
              {tf('cart.continueShopping', 'Continue Shopping')}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white mb-6 sm:mb-8 text-2xl sm:text-3xl"
        >
          {tf('cart.title', 'Cart')}
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-6">
          {/* items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02]">
              {cart.map((item, i) => {
                const lineTotal = item.price * item.quantity;
                return (
                  <motion.div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="px-4 sm:px-4 py-4 border-b last:border-b-0 border-white/10"
                  >
                    {/* flex 전체 라인을 커스텀하게 구성 */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        width: '100%',
                      }}
                    >
                      {/* 이미지 */}
                      <div style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div className="overflow-hidden rounded-lg bg-white/5" style={{ width: '100px', height: '100px' }}>
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      {/* 이름 및 옵션 */}
                      <div
                        style={{
                          flexGrow: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <h3 className="text-white text-sm sm:text-base font-semibold leading-tight break-words">
                          {item.name}
                        </h3>
                        <p className="text-white/70 mt-1 text-xs">
                          {item.selectedSize} <span className="mx-1">/</span> {item.selectedColor}
                        </p>
                      </div>
                      {/* 수량, 가격, 삭제 */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          minWidth: 0,
                        }}
                      >
                        <div className="inline-flex items-center gap-2">
                          <button
                            aria-label={tf('cart.decrease', 'Decrease quantity')}
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="w-7 h-7 sm:w-8 sm:h-8 grid place-items-center rounded-sm border border-white/30 text-white text-xs sm:text-sm
                                      hover:border-white/60 disabled:opacity-40 disabled:hover:border-white/30 transition-colors"
                          >
                            –
                          </button>
                          <span className="text-white text-xs sm:text-sm tabular-nums min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            aria-label={tf('cart.increase', 'Increase quantity')}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 grid place-items-center rounded-sm border border-white/30 text-white text-xs sm:text-sm
                                      hover:border-white/60 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-white text-sm sm:text-base font-semibold tabular-nums" style={{ whiteSpace: 'nowrap' }}>
                          ₩{lineTotal.toLocaleString('ko-KR')}
                        </span>
                        <button
                          aria-label={tf('cart.remove', 'Remove from cart')}
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/60 hover:text-red-400 transition-colors ml-2"
                          title={tf('cart.remove', 'Remove from cart')}
                          style={{ marginLeft: 0, marginRight: 0 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-5 lg:sticky lg:top-32 backdrop-blur"
            >
              <h2 className="text-white text-sm sm:text-base mb-3 sm:mb-4 tracking-[0.06em]">
                {tf('checkout.orderSummary', 'Order Summary')}
              </h2>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-white/70">{tf('cart.subtotal', 'Subtotal')}</span>
                  <span className="text-white tabular-nums">₩{cartTotal.toLocaleString('ko-KR')}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-white/70">{tf('cart.shipping', 'Shipping')}</span>
                  <span className="text-white tabular-nums">₩{shippingCost.toLocaleString('ko-KR')}</span>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-white/10 flex justify-between">
                  <span className="text-white text-sm sm:text-base">{tf('cart.total', 'Total')}</span>
                  <span className="text-white text-base sm:text-lg tabular-nums">₩{total.toLocaleString('ko-KR')}</span>
                </div>
              </div>

              <Button
                onClick={() => onNavigate('checkout')}
                className="w-full py-3 sm:py-4 bg-[#5842FF] hover:bg-[#5842FF]/80 text-white text-xs sm:text-sm"
              >
                {tf('cart.checkout', 'Checkout')}
              </Button>

              <Button
                onClick={() => onNavigate('shop')}
                variant="outline"
                className="w-full py-3 sm:py-4 border-white/20 hover:border-[#5842FF] text-[#5842FF] hover:text-[#5842FF] text-xs sm:text-sm"
              >
                {tf('cart.continueShopping', 'Continue Shopping')}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
