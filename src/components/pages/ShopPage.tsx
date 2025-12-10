import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';
import { productService } from '../../services/product.service';
import { toast } from 'sonner';

type Category = 'all' | 'art' | 'fashion' | 'goods';

interface Product {
  id: string;
  name: string;
  title?: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  artist?: string;
  artistId?: string;
}

export function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll({
        page: 1,
        limit: 100,
        status: 'active'
      });
      
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
        const transformedProducts = productsArray.map((p: any) => {
          let imageUrl = '';
          try {
            if (Array.isArray(p.images)) {
              imageUrl = p.images[0] || '';
            } else if (typeof p.images === 'string') {
              const parsed = JSON.parse(p.images);
              imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
            }
          } catch (e) {
            console.warn('Failed to parse images:', e);
          }

          return {
            id: p.id,
            name: p.name,
            title: p.name,
            price: p.price,
            image: imageUrl || '',
            category: p.category?.slug || 'goods',
            artist: p.artist?.name || '',
            artistId: p.artistId,
          };
        });
        
        setProducts(transformedProducts);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error(t('shop.loadError') || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: t('shop.all') },
    { id: 'art', label: t('shop.art') },
    { id: 'fashion', label: t('shop.fashion') },
    { id: 'goods', label: t('shop.goods') }
  ] as const;

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 sm:mb-12 text-center"
        >
          <h1 className="text-white mb-4">{t('shop.title')}</h1>
          <p className="text-white/60 px-4">{t('shop.description')}</p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 sm:px-6 py-2 rounded-full border transition-all duration-300 text-sm sm:text-base ${
                activeCategory === category.id
                  ? 'bg-[#5842FF] border-[#5842FF] text-white'
                  : 'bg-transparent border-white/20 text-white/70 hover:border-[#5842FF] hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-24">
            <p className="text-white/60">{t('common.loading') || 'Loading...'}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/60">{t('shop.noProducts') || 'No products found'}</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link
                to={`/shop/${product.id}`}
                className="group block bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#5842FF] transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden relative max-h-64 sm:max-h-80">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {hoveredProduct === product.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-[#5842FF]/10"
                    />
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  {product.artist && (
                    <p className="text-white/60 text-xs sm:text-sm mb-1">{product.artist}</p>
                  )}
                  <h3 className="text-white mb-2 text-sm sm:text-base">{product.title || product.name}</h3>
                  <p className="text-[#5842FF]">₩{Number(product.price).toLocaleString('ko-KR')}</p>
                </div>
              </Link>
            </motion.div>
          ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}