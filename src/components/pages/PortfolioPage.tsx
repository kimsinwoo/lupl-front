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

  // 미디어 아트 비디오 데이터
  const mediaArtVideos = [
    {
      url: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/1efd6893-9e6e-442e-8405-c94174349c80/LUPL_1_세로.mp4?table=block&id=2c4a6583-95de-801b-a841-fc8903182a10&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=kWlQmdocH22yJoS8wL3X-Y92Jye2BgqZS3rJrKlGmA8&downloadName=LUPL_1_세로.mp4',
      title: '대구예아람학교 미디어아트'
    },
    {
      url: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/3718cb7e-cb97-41e8-a891-1d21b99bf239/LUPL_2_세로.mp4?table=block&id=2c4a6583-95de-80cf-ac8e-f3099dca4491&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=ta8K0Bt1wKM0AxpZ6UkAJdWiEisSMlxDDNhf-JPpDqk&downloadName=LUPL_2_세로.mp4',
      title: '대구광명학교 미디어아트'
    },
    {
      url: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/d8a88964-aabb-46b3-ab64-b801d864fd2c/성보_미디어.mp4?table=block&id=2c4a6583-95de-80ae-8295-fd68673e703b&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=D30BqL4XzBxh2NbYPV1Eal9dRGbp4RBGcHXvTB-ArrE&downloadName=성보+미디어.mp4',
      title: '대구성보학교 미디어아트'
    }
  ];

  // 아트 콘테스트 Instagram 링크 데이터
  const contestPosts = [
    'https://www.instagram.com/p/CzI9V2xPqPf/?img_index=1',
    'https://www.instagram.com/p/DBax1SPvPEb/',
    'https://www.instagram.com/p/DPvd8GnErW6/'
  ];

  // 점자 메뉴 데이터
  const brailleItems = [
    {
      type: 'image' as const,
      image: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/beca1bf8-bec6-4d2f-ad61-2ed09b9c8926/image.png?table=block&id=2c4a6583-95de-808f-814e-d9db6e6a770c&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=qgEGrFlICYtUNQC1Xaj1NTvH8RuIWC-skL7CiRb3rwE&downloadName=image.png',
      title: '봉평메일국시'
    },
    {
      type: 'image' as const,
      image: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/b8221cec-58a5-425e-8950-32d0b5947a5b/image.png?table=block&id=2c4a6583-95de-8085-be03-fea3bd8370d4&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=99BtxXIIDr5kgqjG3HJZhMBzbvJYZeb6mbPtVRRylcs&downloadName=image.png',
      title: '헤이차일드'
    },
    {
      type: 'image' as const,
      image: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/5a251dc4-2da8-4f3c-8130-1cd2c601fc3f/image.png?table=block&id=2c4a6583-95de-8021-9b14-c8a6344c9a41&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=GVml7LvLxUBOM3nANvTcxDRFn3G0qyN4AXz7P5nOwTw&downloadName=image.png',
      title: '동아식당'
    },
    {
      type: 'image' as const,
      image: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/6486c966-0885-4432-a118-ef43ad50bee8/image.png?table=block&id=2c4a6583-95de-806d-95f3-ee1d83f383ce&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=JDdzgHy9e3c9ISU7RJUTg1YhKj7whUwpR9Y9Peg8nHk&downloadName=image.png',
      title: '피키차일드다이닝'
    },
    {
      type: 'image' as const,
      image: 'https://file.notion.so/f/f/0293b3b4-0688-440a-bb5a-3948efeda036/87758d42-8b3d-4148-b649-2670c7eed15f/image.png?table=block&id=2c4a6583-95de-80ef-9533-cae7c9f0f25f&spaceId=0293b3b4-0688-440a-bb5a-3948efeda036&expirationTimestamp=1765368000000&signature=nBXs8ADfmE68gQ8kody0WTdazCYgVJj5FTjB9bY4IU0&downloadName=image.png',
      title: '스너그로스터리'
    },
    {
      type: 'link' as const,
      url: 'https://cautious-jaw-0ea.notion.site/60d6e244e45a4aeabb7ea7b62ab4fed9',
      title: '오가닉모가'
    }
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
        ) : activeCategory === 'all' ? (
          // ALL 카테고리: 모든 카테고리별로 분리해서 표시
          <div className="space-y-16 sm:space-y-20">
            {/* 미디어 아트 섹션 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('portfolio.media-art')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {mediaArtVideos.map((video, index) => (
                  <motion.div
                    key={video.url}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                  >
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <p className="text-white text-sm font-medium">{video.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 전시 섹션 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('portfolio.exhibition')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center">
                            <p className="text-white/60">No thumbnail</p>
                          </div>
                        )}
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
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                          <p className="text-white text-sm font-medium">전시 영상 {index + 1}</p>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* 인클루시브 패션 섹션 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('portfolio.fashion')}</h2>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center max-w-4xl mx-auto">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  onClick={() => window.open('https://lupl.kr/shop', '_blank')}
                  className="group relative w-full sm:w-[320px] h-[240px] rounded-lg overflow-hidden bg-gradient-to-br from-[#5842FF] to-[#7B68EE] border-2 border-[#5842FF] hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-[#5842FF]/50 cursor-pointer"
                >
                  <div className="w-full h-full bg-black/20 group-hover:bg-black/10 transition-all duration-300 flex flex-col items-center justify-center p-6 sm:p-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-white/30 transition-all duration-300">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">LUPL 자사몰</h3>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  onClick={() => window.open('https://www.musinsa.com/brand/lupl?gf=A', '_blank')}
                  className="group relative w-full sm:w-[320px] h-[240px] rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border-2 border-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-white/20 cursor-pointer"
                >
                  <div className="w-full h-full bg-black/20 group-hover:bg-black/10 transition-all duration-300 flex flex-col items-center justify-center p-6 sm:p-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-white/20 transition-all duration-300">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">무신사</h3>
                  </div>
                </motion.button>
              </div>
            </motion.section>

            {/* 아트 콘테스트 섹션 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('portfolio.contest')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                          <p className="text-white text-sm font-medium">아트 콘테스트 {index + 1}</p>
                        </div>
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
              </div>
            </motion.section>

            {/* 점자 섹션 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('portfolio.braille')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {brailleItems.map((item, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {item.type === 'image' ? (
                      <div className="group block relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white text-sm sm:text-base font-medium">{item.title}</h3>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => window.open(item.url, '_blank')}
                        className="group block relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-[#5842FF]/20 to-[#7B68EE]/20 flex flex-col items-center justify-center p-6">
                          <div className="w-16 h-16 bg-[#5842FF] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#7B68EE] transition-colors">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                          <h3 className="text-white text-sm sm:text-base font-medium text-center">{item.title}</h3>
                        </div>
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 기타 포트폴리오 아이템 섹션 (카테고리가 없는 것들) */}
            {portfolioItems.filter(item => !item.categorySlug || !['media-art', 'exhibition', 'fashion', 'contest', 'braille'].includes(item.categorySlug)).length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-white text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">기타</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {portfolioItems.filter(item => !item.categorySlug || !['media-art', 'exhibition', 'fashion', 'contest', 'braille'].includes(item.categorySlug)).map((item, index) => (
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
                </div>
              </motion.section>
            )}
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
        ) : activeCategory === 'media-art' ? (
          // 미디어 아트 카테고리: 비디오 재생 박스 표시
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {mediaArtVideos.map((video, index) => (
              <motion.div
                key={video.url}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
              >
                <video
                  src={video.url}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
                {/* 비디오 정보 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <p className="text-white text-sm font-medium">{video.title}</p>
                </div>
              </motion.div>
            ))}
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
        ) : activeCategory === 'fashion' ? (
          // 인클루시브 패션 카테고리: 쇼핑몰 이동 버튼 표시
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center max-w-4xl mx-auto py-8"
          >
            {/* 자사몰 버튼 */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => window.open('https://lupl.kr/shop', '_blank')}
              className="group relative w-full sm:w-[320px] h-[240px] rounded-lg overflow-hidden bg-gradient-to-br from-[#5842FF] to-[#7B68EE] border-2 border-[#5842FF] hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-[#5842FF]/50 cursor-pointer"
            >
              <div className="w-full h-full bg-black/20 group-hover:bg-black/10 transition-all duration-300 flex flex-col items-center justify-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-white/30 transition-all duration-300">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">LUPL 자사몰</h3>
                <p className="text-white/80 text-sm sm:text-base text-center">lupl.kr/shop</p>
              </div>
            </motion.button>

            {/* 무신사 버튼 */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => window.open('https://www.musinsa.com/brand/lupl?gf=A', '_blank')}
              className="group relative w-full sm:w-[320px] h-[240px] rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border-2 border-white/20 hover:border-white/50 transition-all duration-300 shadow-lg hover:shadow-white/20 cursor-pointer"
            >
              <div className="w-full h-full bg-black/20 group-hover:bg-black/10 transition-all duration-300 flex flex-col items-center justify-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-white/20 transition-all duration-300">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">무신사</h3>
                <p className="text-white/80 text-sm sm:text-base text-center">musinsa.com/brand/lupl</p>
              </div>
            </motion.button>
          </motion.div>
        ) : activeCategory === 'braille' ? (
          // 점자 카테고리: 점자 메뉴 아이템 표시
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {brailleItems.map((item, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {item.type === 'image' ? (
                  <div className="group block relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white text-sm sm:text-base font-medium">{item.title}</h3>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => window.open(item.url, '_blank')}
                    className="group block relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-[#5842FF]/20 to-[#7B68EE]/20 flex flex-col items-center justify-center p-6">
                      <div className="w-16 h-16 bg-[#5842FF] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#7B68EE] transition-colors">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <h3 className="text-white text-sm sm:text-base font-medium text-center">{item.title}</h3>
                    </div>
                  </button>
                )}
              </motion.div>
            ))}
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