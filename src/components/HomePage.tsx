import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { productService } from '../services/product.service';
import { toast } from 'sonner';

// 비디오 파일 경로 (public 폴더 또는 assets 폴더에서 접근)
const LUPLVideo = '/assets/LUPL.mp4';

interface HomePageProps {
  onNavigate?: (page: string, productId?: string) => void;
}

const HomePageContent: React.FC<HomePageProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  
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


  return (
    <div className="min-h-screen">
      {/* Hero Video */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">

          <div className="absolute inset-0 bg-black/20" />
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