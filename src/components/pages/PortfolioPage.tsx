import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';
import { portfolioService } from '../../services/portfolio.service';
import { toast } from 'sonner';

type Category = 'all' | 'media-art' | 'exhibition' | 'fashion' | 'contest' | 'braille';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  year?: number;
  images?: string[];
  image?: string;
  category?: {
    id: string;
    slug: string;
    name?: string;
  };
  categoryId?: string;
}

export function PortfolioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    const category = searchParams.get('category') as Category;
    if (category) {
      setActiveCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    loadPortfolioItems();
  }, [activeCategory]);

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      let response: any;
      
      if (activeCategory === 'all') {
        response = await portfolioService.getAllItems();
      } else {
        // Category별 조회는 나중에 구현 가능
        response = await portfolioService.getAllItems();
      }
      
      let items: any[] = [];
      if (response?.data?.data) {
        items = response.data.data;
      } else if (Array.isArray(response?.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      // 이미지 처리
      const processedItems = items.map((item: any) => {
        let imageUrl = '';
        try {
          if (Array.isArray(item.images)) {
            imageUrl = item.images[0] || '';
          } else if (typeof item.images === 'string') {
            const parsed = JSON.parse(item.images);
            imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
          }
        } catch (e) {
          console.warn('Failed to parse images:', e);
        }
        
        return {
          ...item,
          image: imageUrl || item.image || '',
          categorySlug: item.category?.slug || item.categoryId || '',
        };
      });
      
      setPortfolioItems(processedItems);
    } catch (error: any) {
      console.error('Failed to load portfolio items:', error);
      toast.error(t('portfolio.loadError') || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: t('portfolio.all') },
    { id: 'media-art', label: t('portfolio.media-art') },
    { id: 'exhibition', label: t('portfolio.exhibition') },
    { id: 'fashion', label: t('portfolio.fashion') },
    { id: 'contest', label: t('portfolio.contest') },
    { id: 'braille', label: t('portfolio.braille') }
  ] as const;

  const filteredItems = activeCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.categorySlug === activeCategory);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 sm:mb-12 text-center sm:text-left"
        >
          <h1 className="text-white mb-4">{t('portfolio.title')}</h1>
          <p className="text-white/60">{t('portfolio.description')}</p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
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
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-24">
            <p className="text-white/60">{t('common.loading') || 'Loading...'}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/60">{t('portfolio.noItems') || 'No portfolio items found'}</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/portfolio/${item.id}`}
                className="group block relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300 max-h-80 sm:max-h-96"
              >
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-[#5842FF] text-xs sm:text-sm mb-2">{item.year}</p>
                  <h3 className="text-white text-sm sm:text-base">{item.title}</h3>
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