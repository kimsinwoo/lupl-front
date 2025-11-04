import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { productService } from '../services/product.service';
import { reviewService, Review } from '../services/review.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ShoppingBag, Minus, Plus, Star } from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { user } = useUser();
  const [product, setProduct] = useState<any>(null);
  const [productVariants, setProductVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  useEffect(() => {
    if (!productId) return;
    loadProduct();
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);
  
  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getById(productId);
      
      const responseAny: any = response;
      let actualData: any = responseAny;
      if (responseAny?.data && (responseAny?.status || responseAny?.headers)) {
        actualData = responseAny.data;
      }
      if (actualData?.data?.data) {
        actualData = actualData.data;
      }
      
      const productData = actualData?.data || actualData;
      
      if (productData) {
        let images: string[] = [];
        try {
          if (Array.isArray(productData.images)) {
            images = productData.images;
          } else if (typeof productData.images === 'string') {
            const parsed = JSON.parse(productData.images);
            images = Array.isArray(parsed) ? parsed : [parsed];
          }
        } catch (e) {
          console.warn('Failed to parse images:', e);
        }

        if (productData.variants && Array.isArray(productData.variants)) {
          setProductVariants(productData.variants);
        }
        
        const sizesSet = new Set<string>();
        const colorsSet = new Set<string>();
        
        if (productData.variants && Array.isArray(productData.variants)) {
          productData.variants.forEach((v: any) => {
            if (v.size) sizesSet.add(v.size);
            if (v.color) colorsSet.add(v.color);
          });
        }
        
        const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : ['S', 'M', 'L'];
        const colors = colorsSet.size > 0 ? Array.from(colorsSet) : ['Black'];

        setProduct({
          ...productData,
          images: images,
          image: images[0] || '',
          category: productData.category?.slug || 'accessories',
          gender: productData.gender || 'unisex',
          sizes,
          colors,
          description: productData.description || '',
          composition: productData.composition || '',
          careInfo: productData.careInfo || '',
        });
      }
    } catch (error: any) {
      console.error('Failed to load product:', error);
      toast.error(`상품을 불러올 수 없습니다: ${error.message || 'API 연결 실패'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const loadReviews = async () => {
    if (!productId) return;
    
    try {
      setIsLoadingReviews(true);
      const response = await reviewService.getProductReviews(productId);
      
      // API 응답 구조 확인 및 파싱
      let reviewsData: Review[] = [];
      
      if (Array.isArray(response)) {
        reviewsData = response;
      } else if (response && typeof response === 'object') {
        // { success: true, data: Review[] } 형식
        if (Array.isArray(response.data)) {
          reviewsData = response.data;
        } 
        // { data: { data: Review[] } } 형식
        else if (response.data && Array.isArray(response.data.data)) {
          reviewsData = response.data.data;
        }
      }
      
      setReviews(reviewsData || []);
      
      // 평균 별점 계산
      if (reviewsData && reviewsData.length > 0) {
        const sum = reviewsData.reduce((acc: number, review: Review) => acc + (review.rating || 0), 0);
        const avg = sum / reviewsData.length;
        setAverageRating(Number(avg.toFixed(1)));
      } else {
        setAverageRating(0);
      }
    } catch (error: any) {
      console.error('Failed to load reviews:', error);
      setReviews([]);
      setAverageRating(0);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error(t('cart.loginRequired') || '로그인을 해주세요');
      onNavigate('login');
      return;
    }
    
    if (!selectedSize || !selectedColor) {
      toast.error('사이즈와 색상을 선택해주세요');
      return;
    }
    
    try {
      let variantId: string | null = null;
      
      const existingVariant = productVariants.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      );
      
      if (existingVariant) {
        variantId = existingVariant.id;
      } else {
        try {
          const variantResponse = await productService.getVariantBySizeAndColor(
            productId,
            selectedSize,
            selectedColor
          );
          
          let variantData = variantResponse;
          if ((variantResponse as any).data?.data) {
            variantData = (variantResponse as any).data;
          } else if ((variantResponse as any).data) {
            variantData = (variantResponse as any).data;
          }
          
          if (variantData?.id || (variantData as any).data?.id) {
            variantId = variantData?.id || (variantData as any).data?.id;
          }
        } catch (variantError: any) {
          toast.error(`사이즈(${selectedSize})와 색상(${selectedColor}) 조합을 찾을 수 없습니다`);
          return;
        }
      }
      
      if (!variantId) {
        toast.error('상품 옵션을 찾을 수 없습니다');
        return;
      }
      
      await addToCart(product, selectedSize, selectedColor, variantId);
      setTimeout(() => {
        onNavigate('cart');
      }, 500);
    } catch (error: any) {
      toast.error(error.message || '장바구니 추가 실패');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error(t('cart.loginRequired') || '로그인을 해주세요');
      onNavigate('login');
      return;
    }
    
    if (!selectedSize || !selectedColor) {
      toast.error('사이즈와 색상을 선택해주세요');
      return;
    }
    
    try {
      let variantId: string | null = null;
      
      const existingVariant = productVariants.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      );
      
      if (existingVariant) {
        variantId = existingVariant.id;
      } else {
        try {
          const variantResponse = await productService.getVariantBySizeAndColor(
            productId,
            selectedSize,
            selectedColor
          );
          
          let variantData = variantResponse;
          if ((variantResponse as any).data?.data) {
            variantData = (variantResponse as any).data;
          } else if ((variantResponse as any).data) {
            variantData = (variantResponse as any).data;
          }
          
          if (variantData?.id || (variantData as any).data?.id) {
            variantId = variantData?.id || (variantData as any).data?.id;
          }
        } catch (variantError: any) {
          toast.error(`사이즈(${selectedSize})와 색상(${selectedColor}) 조합을 찾을 수 없습니다`);
          return;
        }
      }
      
      if (!variantId) {
        toast.error('상품 옵션을 찾을 수 없습니다');
        return;
      }
      
      await addToCart(product, selectedSize, selectedColor, variantId);
      setTimeout(() => {
        onNavigate('checkout');
      }, 500);
    } catch (error: any) {
      toast.error(error.message || '상품 추가 실패');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">상품을 찾을 수 없습니다</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden bg-white/5 rounded-lg">
              <ImageWithFallback
                src={product.images?.[currentImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square overflow-hidden bg-white/5 rounded-lg border-2 transition-all ${
                      currentImageIndex === idx 
                        ? 'border-[#5842FF]' 
                        : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {product.name}
              </h1>
              <p className="text-2xl lg:text-3xl text-[#5842FF] font-semibold mb-3">
                ${product.price}
              </p>
              
              {/* 리뷰 섹션 - 항상 표시 */}
              <div className="mb-4">
                <button
                  onClick={() => setIsReviewsDialogOpen(true)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer bg-white/5 px-3 py-2 rounded"
                >
                  {isLoadingReviews ? (
                    <span className="text-white/50 text-sm">리뷰를 불러오는 중...</span>
                  ) : reviews.length > 0 && averageRating > 0 ? (
                    <>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`w-5 h-5 ${
                              rating <= Math.round(averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-white/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white/70 text-sm">
                        ({averageRating.toFixed(1)}) {reviews.length}개 리뷰
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className="w-5 h-5 text-white/30"
                          />
                        ))}
                      </div>
                      <span className="text-white/50 text-sm">
                        아직 리뷰가 없습니다
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">
                Size
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border-2 transition-all ${
                      selectedSize === size
                        ? 'bg-[#5842FF] text-white border-[#5842FF]'
                        : 'bg-transparent text-white border-white/20 hover:border-white/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">
                Color
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 border-2 transition-all ${
                      selectedColor === color
                        ? 'bg-[#5842FF] text-white border-[#5842FF]'
                        : 'bg-transparent text-white border-white/20 hover:border-white/40'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl text-white w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-[#5842FF] hover:bg-[#5842FF]/80 text-white py-6 text-lg uppercase tracking-wider"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-1 bg-white text-black hover:bg-white/90 py-6 text-lg uppercase tracking-wider"
              >
                Buy Now
              </Button>
            </div>

            {/* Product Details */}
            {product.description && (
              <div className="pt-8 border-t border-white/10">
                <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">
                  Description
                </h3>
                <p className="text-white/80 leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.composition && (
              <div>
                <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">
                  Composition
                </h3>
                <p className="text-white/80">{product.composition}</p>
              </div>
            )}

            {product.careInfo && (
              <div>
                <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">
                  Care Instructions
                </h3>
                <p className="text-white/80">{product.careInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 리뷰 목록 다이얼로그 */}
      <Dialog open={isReviewsDialogOpen} onOpenChange={setIsReviewsDialogOpen}>
        <DialogContent className="bg-black border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">리뷰 ({reviews.length}개)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {isLoadingReviews ? (
              <div className="text-center py-8 text-white/70">리뷰를 불러오는 중...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-white/70">아직 작성된 리뷰가 없습니다.</div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-white/10 pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`w-4 h-4 ${
                              rating <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-white/30'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white/70 text-sm">
                        {review.userName || '익명'}
                      </span>
                    </div>
                    <span className="text-white/50 text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
