import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { productService } from '../../services/product.service';
import { artistService } from '../../services/artist.service';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { Heart } from 'lucide-react';

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
  variants?: Array<{
    id: string;
    size: string;
    color?: string;
    stock: number;
  }>;
}

interface Artist {
  id: string;
  name: string;
  nameEn?: string;
  profileImage?: string;
  image?: string;
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

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response: any = await productService.getById(id!);
      
      let productData: any = response;
      if (response?.data?.data) {
        productData = response.data.data;
      } else if (response?.data) {
        productData = response.data;
      }
      
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

      const processedProduct = {
        ...productData,
        title: productData.name,
        images: images.length > 0 ? images : [productData.image || ''],
        image: images[0] || productData.image || '',
      };
      
      setProduct(processedProduct);
      
      // 첫 번째 variant를 기본값으로 설정
      if (processedProduct.variants && processedProduct.variants.length > 0) {
        const firstVariant = processedProduct.variants[0];
        setSelectedVariant({
          id: firstVariant.id,
          size: firstVariant.size,
          color: firstVariant.color || 'Black',
        });
      } else {
        // Variant가 없으면 기본 variant 생성 (백엔드에서 처리하거나 임시로 사용)
        console.warn('⚠️ No variants found for product, need to create default variant');
      }
      
      // 아티스트 정보 로드
      if (productData.artistId) {
        try {
          const artistResponse: any = await artistService.getById(productData.artistId);
          let artistData: any = artistResponse;
          if (artistResponse?.data?.data) {
            artistData = artistResponse.data.data;
          } else if (artistResponse?.data) {
            artistData = artistResponse.data;
          }
          setArtist(artistData);
        } catch (error) {
          console.error('Failed to load artist:', error);
        }
      }
    } catch (error: any) {
      console.error('Failed to load product:', error);
      toast.error(language === 'ko' ? '상품을 불러올 수 없습니다' : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error(t('cart.loginRequired') || '로그인을 해주세요');
      navigate('/login');
      return;
    }
    
    if (!product) return;
    
    if (!selectedVariant) {
      toast.error(t('product.select.options.required'));
      return;
    }
    
    try {
      await addToCart(product, selectedVariant.size, selectedVariant.color || 'Black', selectedVariant.id);
      toast.success(t('product.added.to.cart'));
    } catch (error: any) {
      console.error('❌ Add to cart error:', error);
      toast.error(error?.message || t('product.add.cart.failed'));
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error(t('cart.loginRequired') || '로그인을 해주세요');
      navigate('/login');
      return;
    }
    
    if (!product || !selectedVariant) {
      toast.error(t('product.select.options.required'));
      return;
    }
    
    // 체크아웃 페이지로 이동하면서 상품 정보 전달
    navigate('/checkout', {
      state: {
        directPurchase: true,
        product: {
          ...product,
          variantId: selectedVariant.id,
          size: selectedVariant.size,
          color: selectedVariant.color || 'Black',
          quantity: 1,
        }
      }
    });
  };

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
                    src={artist.profileImage || artist.image}
                    alt={language === 'ko' ? artist.name : (artist.nameEn || artist.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white mb-2">{language === 'ko' ? '아티스트' : 'Artist'}</h3>
                <p className="text-white/70 mb-4">{language === 'ko' ? artist.name : (artist.nameEn || artist.name)}</p>
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
                src={product.images?.[selectedImage] || product.image}
                alt={product.title}
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
                      alt={`${product.title} ${index + 1}`}
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
              <h1 className="text-white flex-1">{product.title || product.name}</h1>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`p-2 rounded-full transition-all ml-4
                  ${isFavorite(product.id) ? 'bg-red-100/10 hover:bg-red-100/20' : 'bg-white/5 hover:bg-white/10'}
                `}
                aria-label={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  className={`w-6 h-6 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                />
              </button>
            </div>
            <p className="text-[#5842FF] mb-6 sm:mb-8 text-xl sm:text-2xl">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</p>

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

            {/* Variant 선택 (variants가 있는 경우) */}
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
                          onClick={() => setSelectedVariant({
                            id: variant.id,
                            size: variant.size,
                            color: variant.color || 'Black',
                          })}
                          className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                            selectedVariant?.id === variant.id
                              ? 'bg-[#5842FF] border-[#5842FF] text-white'
                              : 'bg-transparent border-white/20 text-white/70 hover:border-[#5842FF]'
                          }`}
                        >
                          {variant.size} {variant.color && `- ${variant.color}`}
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

        {/* Related Products - 나중에 API로 연결 가능 */}
      </div>
    </div>
  );
}