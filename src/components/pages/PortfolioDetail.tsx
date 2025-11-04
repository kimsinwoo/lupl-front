import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { portfolioService } from '../../services/portfolio.service';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  overview?: string;
  impact?: string;
  year?: number;
  images?: string[];
  image?: string;
  category?: {
    id: string;
    slug: string;
    name?: string;
  };
  client?: string;
  relatedProjects?: string[];
}

export function PortfolioDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedItems, setRelatedItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    if (id) {
      loadPortfolioItem();
    }
  }, [id]);

  const loadPortfolioItem = async () => {
    try {
      setLoading(true);
      const response: any = await portfolioService.getItemById(id!);
      
      let itemData: any = response;
      if (response?.data?.data) {
        itemData = response.data.data;
      } else if (response?.data) {
        itemData = response.data;
      }
      
      // 이미지 처리
      let images: string[] = [];
      try {
        if (Array.isArray(itemData.images)) {
          images = itemData.images;
        } else if (typeof itemData.images === 'string') {
          const parsed = JSON.parse(itemData.images);
          images = Array.isArray(parsed) ? parsed : [parsed];
        }
      } catch (e) {
        console.warn('Failed to parse images:', e);
      }
      
      const processedItem = {
        ...itemData,
        images: images.length > 0 ? images : [itemData.image || ''],
        image: images[0] || itemData.image || '',
      };
      
      setItem(processedItem);
      
      // 관련 프로젝트 로드 (같은 카테고리)
      if (itemData.categoryId || itemData.category?.id) {
        await loadRelatedItems(itemData.categoryId || itemData.category?.id, id!);
      }
    } catch (error: any) {
      console.error('Failed to load portfolio item:', error);
      toast.error(language === 'ko' ? '포트폴리오를 불러올 수 없습니다' : 'Failed to load portfolio item');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedItems = async (categoryId: string, excludeId: string) => {
    try {
      const response: any = await portfolioService.getCategoryItems(categoryId);
      let items: any[] = [];
      
      if (response?.data?.data) {
        items = response.data.data;
      } else if (Array.isArray(response?.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      // 현재 항목 제외
      const related = items.filter(i => i.id !== excludeId).slice(0, 3);
      setRelatedItems(related);
    } catch (error) {
      console.error('Failed to load related items:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 flex items-center justify-center">
        <p className="text-white">{language === 'ko' ? '로딩 중...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 flex items-center justify-center">
        <p className="text-white">{language === 'ko' ? '포트폴리오를 찾을 수 없습니다' : 'Portfolio item not found'}</p>
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
            to="/portfolio"
            className="inline-flex items-center gap-2 text-white/70 hover:text-[#5842FF] transition-colors duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
        </motion.div>

        {/* Video/Image Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 sm:mb-12"
        >
          <div className="relative aspect-video max-h-[500px] sm:max-h-[600px] rounded-lg overflow-hidden bg-white/5 border border-white/10">
            <ImageWithFallback
              src={item.images?.[0] || item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-white mb-4">{item.title}</h1>
              <p className="text-white/70 mb-8 sm:mb-12">{item.description}</p>

              {item.overview && (
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-white mb-4">Overview</h2>
                  <p className="text-white/70">{item.overview}</p>
                </div>
              )}

              {item.impact && (
                <div>
                  <h2 className="text-white mb-4">Impact</h2>
                  <p className="text-white/70">{item.impact}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 sticky top-24"
            >
              <h3 className="text-white mb-6">Project Details</h3>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-white/50 text-sm mb-1">Year</p>
                  <p className="text-white">{item.year}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">Category</p>
                  <p className="text-white capitalize">{item.category?.name || item.category?.slug || '-'}</p>
                </div>
                {item.client && (
                  <div>
                    <p className="text-white/50 text-sm mb-1">Client</p>
                    <p className="text-white">{item.client}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Projects */}
        {relatedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 sm:mt-24"
          >
            <h2 className="text-white mb-8 sm:mb-12">{language === 'ko' ? '관련 프로젝트' : 'Related Projects'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedItems.map((related) => {
                const relatedImage = Array.isArray(related.images) 
                  ? related.images[0] 
                  : (related.image || '');
                return (
                  <Link
                    key={related.id}
                    to={`/portfolio/${related.id}`}
                    className="group block relative aspect-[4/3] max-h-64 sm:max-h-80 rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                  >
                    <ImageWithFallback
                      src={relatedImage}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <p className="text-[#5842FF] text-xs sm:text-sm mb-2">{related.year}</p>
                      <h3 className="text-white text-sm sm:text-base">{related.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}