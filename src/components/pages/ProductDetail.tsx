import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { productService } from '../../services/product.service';
import { artistService } from '../../services/artist.service';
import { reviewService, Review } from '../../services/review.service';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';

interface ProductVariant {
  id: string;
  size: string;
  color?: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  title?: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  details?: {
    material?: string;
    size?: string;
  };
  artistId?: string;
  relatedProducts?: string[];
  variants?: ProductVariant[];
}

interface ProductLike {
  id: string;
  name: string;
  image?: string;
  images?: string[] | string;
  artistId?: string;
  variants?: ProductVariant[];
  description?: string;
  details?: { material?: string; size?: string };
  price: number;
}

interface Artist {
  id: string;
  name: string;
  nameEn?: string;
  profileImage?: string;
  image?: string;
}

/** 0~5 사이 소수점을 예쁘게 채우는 별점 */
function StarRating({
  rating,
  size = 20,
  emptyClass = 'text-white/30',
  fillClass = 'text-yellow-400',
}: {
  rating: number;               // 0~5 (소수점 포함)
  size?: number;                // px
  emptyClass?: string;
  fillClass?: string;
}) {
  const safe = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0));
  const percent = `${(safe / 5) * 100}%`;

  return (
    <div className="relative inline-block" style={{ width: size * 5, height: size }}>
      {/* 빈 별 5개 */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={emptyClass} style={{ width: size, height: size }} />
        ))}
      </div>
      {/* 채운 별 5개 (가로 클립) */}
      <div
        className="absolute top-0 left-0 overflow-hidden"
        style={{ width: percent, height: size }}
        aria-hidden
      >
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`fill-current ${fillClass}`}
              style={{ width: size, height: size }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const { user, isFavorite, toggleFavorite } = useUser();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; size: string; color?: string } | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number.isFinite(r.rating) ? r.rating : 0), 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  useEffect(() => {
    if (!id) return;
    void loadProduct(id);
    void loadReviews(id);
  }, [id]);

  function isProductLike(v: unknown): v is ProductLike {
    return typeof v === 'object' && v !== null && 'id' in v && 'name' in v && 'price' in v;
  }

  async function loadProduct(productId: string) {
    try {
      setLoading(true);

      // 다양한 래핑을 고려하여 안전하게 풀기
      const raw = await productService.getById(productId) as unknown;
      let p: ProductLike | null = null;

      if (isProductLike(raw)) {
        p = raw;
      } else if (typeof raw === 'object' && raw !== null && 'data' in raw) {
        const d1 = (raw as { data?: unknown }).data;
        if (isProductLike(d1)) p = d1;
        else if (typeof d1 === 'object' && d1 !== null && 'data' in d1) {
          const d2 = (d1 as { data?: unknown }).data;
          if (isProductLike(d2)) p = d2;
        }
      }

      if (!p) throw new Error('Invalid product payload');

      // images 파싱 (string | string[])
      let images: string[] = [];
      if (Array.isArray(p.images)) {
        images = p.images.filter((s): s is string => typeof s === 'string' && s.length > 0);
      } else if (typeof p.images === 'string') {
        try {
          const parsed = JSON.parse(p.images) as unknown;
          if (Array.isArray(parsed)) {
            images = (parsed as unknown[]).filter((s): s is string => typeof s === 'string' && s.length > 0);
          } else if (typeof parsed === 'string' && parsed.length > 0) {
            images = [parsed];
          }
        } catch {
          // JSON 파싱 실패시 무시
        }
      }

      const processed: Product = {
        ...p,
        title: p.name,
        images: images.length > 0 ? images : p.image ? [p.image] : undefined,
        image: images[0] ?? p.image,
      };

      setProduct(processed);

      // 기본 variant
      if (processed.variants && processed.variants.length > 0) {
        const v0 = processed.variants[0];
        setSelectedVariant({
          id: v0.id,
          size: v0.size,
          color: v0.color,
        });
      }

      // 아티스트
      if (p.artistId) {
        try {
          const ar = await artistService.getById(p.artistId) as unknown;
          let a: Artist | null = null;

          const isArtist = (x: unknown): x is Artist =>
            typeof x === 'object' && x !== null && 'id' in x && 'name' in x;

          if (isArtist(ar)) a = ar;
          else if (typeof ar === 'object' && ar !== null && 'data' in ar) {
            const d1 = (ar as { data?: unknown }).data;
            if (isArtist(d1)) a = d1;
            else if (typeof d1 === 'object' && d1 !== null && 'data' in d1) {
              const d2 = (d1 as { data?: unknown }).data;
              if (isArtist(d2)) a = d2;
            }
          }

          if (a) setArtist(a);
        } catch {
          // 아티스트 실패는 치명적 아님
        }
      }
    } catch {
      toast.error(language === 'ko' ? '상품을 불러올 수 없습니다' : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews(productId: string) {
    try {
      setIsLoadingReviews(true);
      const list = await reviewService.getProductReviews(productId);
      setReviews(list);
    } catch {
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }

  async function handleAddToCart() {
    if (!user) {
      toast.error(t('cart.loginRequired') ?? '로그인을 해주세요');
      navigate('/login');
      return;
    }
    if (!product || !selectedVariant) {
      toast.error(t('product.select.options.required'));
      return;
    }
    try {
      await addToCart(product, selectedVariant.size, selectedVariant.color, selectedVariant.id);
      toast.success(t('product.added.to.cart'));
    } catch (e) {
      toast.error(t('product.add.cart.failed'));
    }
  }

  function handleBuyNow() {
    if (!user) {
      toast.error(t('cart.loginRequired') ?? '로그인을 해주세요');
      navigate('/login');
      return;
    }
    if (!product || !selectedVariant) {
      toast.error(t('product.select.options.required'));
      return;
    }
    navigate('/checkout', {
      state: {
        directPurchase: true,
        product: {
          ...product,
          variantId: selectedVariant.id,
          size: selectedVariant.size,
          color: selectedVariant.color,
          quantity: 1,
        },
      },
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 flex items-center justify-center">
        <p className="text-white">{language === 'ko' ? '로딩 중...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 flex items-center justify-center">
        <p className="text-white">{language === 'ko' ? '상품을 찾을 수 없습니다' : 'Product not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-white/70 hover:text-[#5842FF] transition-colors duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </motion.div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Left: Artist Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-6 h-fit order-2 lg:order-1"
          >
            {artist && (
              <>
                <div className="aspect-square max-w-48 mx-auto rounded-lg overflow-hidden mb-4">
                  <ImageWithFallback
                    src={artist.profileImage ?? artist.image}
                    alt={language === 'ko' ? artist.name : artist.nameEn ?? artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white mb-2">{language === 'ko' ? '아티스트' : 'Artist'}</h3>
                <p className="text-white/70 mb-4">
                  {language === 'ko' ? artist.name : artist.nameEn ?? artist.name}
                </p>
                <Link
                  to={`/artist/${artist.id}`}
                  className="text-[#5842FF] hover:text-[#5842FF]/80 transition-colors text-sm"
                >
                  {language === 'ko' ? '아티스트 프로필 보기 →' : 'View Artist Profile →'}
                </Link>
              </>
            )}
          </motion.div>

          {/* Center: Product Images */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="max-w-md mx-auto aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 mb-4">
              <ImageWithFallback
                src={product.images?.[selectedImage] ?? product.image}
                alt={product.title ?? product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden bg-white/5 border transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-[#5842FF]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`${product.title ?? product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-3"
          >
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-white flex-1">{product.title ?? product.name}</h1>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`p-2 rounded-full transition-all ml-4 ${
                  isFavorite(product.id) ? 'bg-red-100/10 hover:bg-red-100/20' : 'bg-white/5 hover:bg-white/10'
                }`}
                aria-label={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-6 h-6 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>

            <p className="text-[#5842FF] mb-4 text-xl sm:text-2xl">
              {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : product.price}
            </p>

            {/* 리뷰 요약/열기 */}
            <button
              onClick={() => setIsReviewsDialogOpen(true)}
              className="flex items-center justify-between gap-4 w-full sm:w-auto border border-white/20 bg-white/5 px-4 py-3 rounded-lg mb-6 hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <StarRating rating={averageRating} size={20} />
                <span className="text-white/80 text-sm">
                  {reviews.length > 0
                    ? `(${averageRating.toFixed(1)}) · ${reviews.length}${
                        language === 'ko' ? '개 리뷰' : ' reviews'
                      }`
                    : language === 'ko'
                    ? '아직 리뷰가 없습니다'
                    : 'No reviews yet'}
                </span>
              </div>
            </button>

            {product.description && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-white mb-4">{language === 'ko' ? '상품 설명' : 'Description'}</h2>
                <p className="text-white/70">{product.description}</p>
              </div>
            )}

            {product.details && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-white mb-4">{language === 'ko' ? '상품 상세' : 'Product Details'}</h2>
                <div className="space-y-3">
                  {product.details.material && (
                    <div className="flex justify-between">
                      <span className="text-white/50">{language === 'ko' ? '소재' : 'Material'}</span>
                      <span className="text-white">{product.details.material}</span>
                    </div>
                  )}
                  {product.details.size && (
                    <div className="flex justify-between">
                      <span className="text-white/50">{t('product.select.size')}</span>
                      <span className="text-white">{product.details.size}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/50">{t('product.shipping')}</span>
                    <span className="text-white">{t('product.shipping')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Variant 선택 */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-white mb-4">{t('product.select.options')}</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/70 text-sm mb-2">{t('product.select.size')}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() =>
                            setSelectedVariant({
                              id: variant.id,
                              size: variant.size,
                              color: variant.color,
                            })
                          }
                          className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'bg-[#5842FF] border-[#5842FF] text-white'
                              : 'bg-transparent border-white/20 text-white/70 hover:border-[#5842FF]'
                          }`}
                        >
                          {variant.size} {variant.color ? `- ${variant.color}` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="w-full bg-transparent border border-white/20 text-white hover:border-[#5842FF] hover:text-[#5842FF] disabled:opacity-50"
              >
                {t('product.add.cart')}
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!selectedVariant}
                className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white disabled:opacity-50"
              >
                {t('product.buy.now')}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 리뷰 목록 다이얼로그 */}
      <Dialog open={isReviewsDialogOpen} onOpenChange={setIsReviewsDialogOpen}>
        <DialogContent className="bg-black border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {language === 'ko' ? `리뷰 (${reviews.length}개)` : `Reviews (${reviews.length})`}
            </DialogTitle>
          </DialogHeader>

          {/* 상단 요약 */}
          <div className="flex items-center gap-3 mt-2 mb-4">
            <StarRating rating={averageRating} size={22} />
            <span className="text-white/80 text-sm">
              {reviews.length > 0
                ? `(${averageRating.toFixed(1)}) · ${reviews.length}${language === 'ko' ? '개' : ''}`
                : language === 'ko'
                ? '아직 리뷰가 없습니다'
                : 'No reviews yet'}
            </span>
          </div>

          <div className="space-y-4">
            {isLoadingReviews ? (
              <div className="text-center py-8 text-white/70">
                {language === 'ko' ? '리뷰를 불러오는 중...' : 'Loading reviews...'}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-white/70">
                {language === 'ko' ? '아직 작성된 리뷰가 없습니다.' : 'No reviews yet.'}
              </div>
            ) : (
              reviews.map((review) => {
                const star = Math.max(0, Math.min(5, Number(review.rating)));
                return (
                  <div key={review.id} className="border-b border-white/10 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <StarRating rating={star} size={16} />
                        <span className="text-white/70 text-sm">
                          {review.userName ?? (language === 'ko' ? '익명' : 'Anonymous')}
                        </span>
                      </div>
                      <span className="text-white/50 text-xs">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-white/90 text-sm leading-relaxed mt-2">{review.comment}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
