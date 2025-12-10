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

  // YouTube URL에서 Video ID 추출
  const getYouTubeVideoId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // YouTube 썸네일 URL 생성
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '';
  };

  // 전시 YouTube 링크 데이터
  const exhibitionVideos = [
    'https://youtu.be/WvDlSV4YGOI?si=QZmwtBUSPVQKhiS9',
    'https://youtu.be/W2GPKnQox2o?si=aE5tneRt-X7OdU7r',
    'https://youtu.be/M3Cc4PKRTgM?si=f-_7YGDKF4M1yjDc'
  ];

  // 아트 콘테스트 Instagram 링크 데이터
  const contestPosts = [
    'https://www.instagram.com/p/CzI9V2xPqPf/?img_index=1',
    'https://www.instagram.com/p/DBax1SPvPEb/',
    'https://www.instagram.com/p/DPvd8GnErW6/'
  ];

  // Instagram 포스트 ID 추출
  const getInstagramPostId = (url: string): string | null => {
    const match = url.match(/instagram\.com\/p\/([^/?]+)/);
    return match ? match[1] : null;
  };

  // Instagram 썸네일 URL 생성 (oEmbed API 사용)
  const getInstagramThumbnail = (url: string): string => {
    const postId = getInstagramPostId(url);
    if (postId) {
      // Instagram oEmbed API를 통해 썸네일 가져오기
      return `https://www.instagram.com/p/${postId}/media/?size=l`;
    }
    return '';
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
        ) : activeCategory === 'exhibition' ? (
          // 전시 카테고리: YouTube 비디오 박스 표시
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {exhibitionVideos.map((videoUrl, index) => {
              const thumbnail = getYouTubeThumbnail(videoUrl);
              const videoId = getYouTubeVideoId(videoUrl);
              
              return (
                <motion.div
                  key={videoUrl}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <button
                    onClick={() => window.open(videoUrl, '_blank')}
                    className="group block relative aspect-video w-full rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={`Exhibition Video ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // 썸네일 로드 실패 시 기본 이미지
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center">
                        <p className="text-white/60">No thumbnail</p>
                      </div>
                    )}
                    {/* YouTube 재생 아이콘 오버레이 */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-[#5842FF] rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-8 h-8 text-white ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* 비디오 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <p className="text-white text-sm font-medium">전시 영상 {index + 1}</p>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : activeCategory === 'contest' ? (
          // 아트 콘테스트 카테고리: Instagram 포스트 박스 표시
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {contestPosts.map((postUrl, index) => {
              const thumbnail = getInstagramThumbnail(postUrl);
              const postId = getInstagramPostId(postUrl);
              
              return (
                <motion.div
                  key={postUrl}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <button
                    onClick={() => window.open(postUrl, '_blank')}
                    className="group block relative aspect-square w-full rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={`Contest Post ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // 썸네일 로드 실패 시 기본 이미지
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('.instagram-fallback');
                            if (fallback) {
                              (fallback as HTMLElement).style.display = 'flex';
                            }
                          }
                        }}
                      />
                    ) : null}
                    {/* Instagram 아이콘 오버레이 */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity shadow-lg">
                        <svg
                          className="w-7 h-7 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                    </div>
                    {/* 포스트 정보 */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <p className="text-white text-sm font-medium">아트 콘테스트 {index + 1}</p>
                    </div>
                    {/* 썸네일 로드 실패 시 폴백 */}
                    <div className="instagram-fallback absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-500/20 flex items-center justify-center" style={{ display: thumbnail ? 'none' : 'flex' }}>
                      <div className="text-center">
                        <svg
                          className="w-16 h-16 text-white/60 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <p className="text-white/60 text-sm">Instagram</p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
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