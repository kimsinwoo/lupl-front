import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from '../services/product.service';
import { toast } from 'sonner';

interface HomePageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

const HomePageContent: React.FC<HomePageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    loadFeaturedProducts();
  }, []);
  
  const loadFeaturedProducts = async () => {
    try {
      console.log('🔍 Loading featured products from API...');
      const response = await productService.getFeatured();
      console.log('📦 API Response:', response);
      
      // 실제 응답 구조 처리 (타입 무시)
      const responseAny: any = response;
      
      // Axios 전체 response 객체인 경우
      let actualData: any = responseAny;
      if (responseAny?.data && (responseAny?.status || responseAny?.headers)) {
        actualData = responseAny.data;
      }
      if (actualData?.data?.data) {
        actualData = actualData.data;
      }
      
      // Featured products는 배열을 직접 반환하거나, data 안에 있을 수 있음
      const productsArray = Array.isArray(actualData?.data) 
        ? actualData.data 
        : (Array.isArray(actualData) ? actualData : (actualData?.data?.products || []));
      
      console.log('📦 Actual data:', actualData);
      console.log('📦 Products array:', productsArray);
      console.log('📦 Products count:', productsArray.length);
      
      // products 배열이 있으면 표시
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        console.log(`✅ Loaded ${productsArray.length} featured products`);
        setProducts(productsArray);
      } else {
        console.warn('⚠️ Invalid API response format:', response);
        console.warn('⚠️ Products array:', productsArray);
        // API 실패 시 전체 상품에서 추천 상품 가져오기
        await loadAllProducts();
      }
    } catch (error: any) {
      console.error('❌ Failed to load featured products:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`상품을 불러올 수 없습니다: ${error.message || 'API 연결 실패'}`);
      // API 실패 시 전체 상품에서 추천 상품 가져오기
      await loadAllProducts();
    }
  };

  const loadAllProducts = async () => {
    try {
      console.log('🔄 Trying to load all products as fallback...');
      const response = await productService.getAll({ 
        page: 1, 
        limit: 20,
        featured: true,
        status: 'active'
      });
      
      // 실제 응답 구조 처리 (타입 무시)
      const responseAny: any = response;
      
      let actualData: any = responseAny;
      if (responseAny?.data && (responseAny?.status || responseAny?.headers)) {
        actualData = responseAny.data;
      }
      if (actualData?.data?.data) {
        actualData = actualData.data;
      }
      
      const productsArray = actualData?.data?.products || actualData?.products || [];
      
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        console.log(`✅ Loaded ${productsArray.length} products as fallback`);
        setProducts(productsArray);
      }
    } catch (error: any) {
      console.error('❌ Fallback also failed:', error);
      toast.error('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
    }
  };

  const heroImages = [
    'https://images.unsplash.com/photo-1629922949137-e236a5ab497d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZmFzaGlvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTU0OTQ3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1611702817465-8dedb5de2103?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZGl0b3JpYWwlMjBmYXNoaW9uJTIwYmxhY2t8ZW58MXx8fHwxNzYxNjMyNDgwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1715541448446-3369e1cc0ee9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjBzdHVkaW98ZW58MXx8fHwxNzYxNTUwMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1645997098653-ed4519760b10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb25vY2hyb21lJTIwZmFzaGlvbiUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc2MTYzMjQ4MXww&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  const featuredProducts = products.slice(0, 6);
  
  // Transform API product to local format
  const transformedProducts = featuredProducts.map(p => {
    // images 처리
    let imageUrl = '';
    try {
      if (Array.isArray(p.images)) {
        imageUrl = p.images[0] || '';
      } else if (typeof p.images === 'string') {
        const parsed = JSON.parse(p.images);
        imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
      }
    } catch (e) {
      console.warn('Failed to parse images for product:', p.id, e);
    }

    // variants에서 중복 제거하여 size와 color 추출
    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    
    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach((v: any) => {
        if (v.size) sizesSet.add(v.size);
        if (v.color) colorsSet.add(v.color);
      });
    }
    
    const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : ['S', 'M', 'L'];
    const colors = colorsSet.size > 0 ? Array.from(colorsSet) : ['Black'];

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      image: imageUrl || 'https://via.placeholder.com/400',
      category: p.category?.slug || 'accessories',
      gender: p.gender || 'unisex',
      sizes,
      colors,
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <ImageWithFallback
              src={heroImages[currentSlide]}
              alt={`Hero ${currentSlide + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-80 transition-opacity"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-80 transition-opacity"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-6 sm:w-8' : 'bg-white/50 w-2'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-[0.15em] sm:tracking-[0.2em] text-center mb-8 sm:mb-10 lg:mb-12 max-w-5xl">
            {t('home.slogan')}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('shop');
                } else {
                  navigate('/shop');
                }
              }}
              className="px-8 sm:px-10 lg:px-12 py-5 sm:py-6 bg-white text-black hover:bg-white/90 tracking-[0.15em] text-sm sm:text-base"
            >
              {t('home.shopNow')}
            </Button>
            <Button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('lookbook');
                } else {
                  navigate('/lookbook');
                }
              }}
              className="px-8 sm:px-10 lg:px-12 py-5 sm:py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-black tracking-[0.15em] text-sm sm:text-base"
            >
              {t('home.viewLookbook')}
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          <p className="text-base sm:text-lg lg:text-xl leading-relaxed">{t('home.philosophy')}</p>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
        <h2 className="text-center tracking-[0.2em] mb-12 sm:mb-14 lg:mb-16">{t('home.featured')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
          {transformedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => {
                if (onNavigate) {
                  onNavigate('product', product.id);
                } else {
                  navigate(`/product/${product.id}`);
                }
              }}
            />
          ))}
        </div>
        <div className="flex justify-center mt-12 sm:mt-14 lg:mt-16">
          <Button
            onClick={() => {
              if (onNavigate) {
                onNavigate('shop');
              } else {
                navigate('/shop');
              }
            }}
            className="px-8 sm:px-10 lg:px-12 py-5 sm:py-6 bg-black text-white hover:bg-black/90 tracking-[0.15em] text-sm sm:text-base"
          >
            {t('nav.shop')}
          </Button>
        </div>
      </section>
    </div>
  );
};

// Wrapper for backward compatibility
export const HomePage: React.FC = () => <HomePageContent />;