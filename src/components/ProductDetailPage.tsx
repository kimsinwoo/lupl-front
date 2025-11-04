import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { productService } from '../services/product.service';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ShoppingBag, Minus, Plus } from 'lucide-react';

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
  
  useEffect(() => {
    loadProduct();
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
              <p className="text-2xl lg:text-3xl text-[#5842FF] font-semibold">
                ${product.price}
              </p>
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
    </motion.div>
  );
};
