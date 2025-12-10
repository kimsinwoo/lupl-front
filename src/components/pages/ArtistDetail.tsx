import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { artistService } from '../../services/artist.service';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';

interface Artist {
  id: string;
  name: string;
  nameEn?: string;
  bio?: string;
  bioEn?: string;
  profileImage?: string;
  image?: string;
  specialty?: string;
  exhibitions?: Array<{
    year?: string;
    title?: string;
    location?: string;
  }>;
  works?: Array<{
    id: string;
    title?: string;
    year?: string;
    image?: string;
  }>;
  products?: any[];
}

export function ArtistDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadArtist();
    }
  }, [id]);

  const loadArtist = async () => {
    try {
      setLoading(true);
      const response: any = await artistService.getById(id!);
      
      let artistData: any = response;
      if (response?.data?.data) {
        artistData = response.data.data;
      } else if (response?.data) {
        artistData = response.data;
      }
      
      setArtist(artistData);
    } catch (error: any) {
      console.error('Failed to load artist:', error);
      toast.error(language === 'ko' ? '아티스트를 불러올 수 없습니다' : 'Failed to load artist');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 flex items-center justify-center">
        <p className="text-white">{language === 'ko' ? '로딩 중...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-black pt-24 px-4 sm:px-6 flex items-center justify-center">
        <p className="text-white">{language === 'ko' ? '아티스트를 찾을 수 없습니다' : 'Artist not found'}</p>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    // Mock PDF download functionality
    alert('PDF download would start here. This is a demo function.');
  };

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
            to="/artist"
            className="inline-flex items-center gap-2 text-white/70 hover:text-[#5842FF] transition-colors duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Artists
          </Link>
        </motion.div>

        {/* Artist Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden bg-white/5 border border-white/10">
              <ImageWithFallback
                src={artist.profileImage || artist.image}
                alt={language === 'ko' ? artist.name : (artist.nameEn || artist.name)}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-white mb-4">{language === 'ko' ? artist.name : (artist.nameEn || artist.name)}</h1>
            {artist.specialty && (
              <p className="text-[#5842FF] mb-6 sm:mb-8">{artist.specialty}</p>
            )}
            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-white mb-4">{language === 'ko' ? '소개' : 'About'}</h2>
              <p className="text-white/70">
                {language === 'ko' ? (artist.bio || '') : (artist.bioEn || artist.bio || '')}
              </p>
            </div>

            {artist.products && artist.products.length > 0 && (
              <Button
                onClick={handleDownloadPDF}
                className="bg-[#5842FF] hover:bg-[#5842FF]/80 text-white w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                {language === 'ko' ? '포트폴리오 다운로드' : 'Download Portfolio'}
              </Button>
            )}
          </motion.div>
        </div>

        {/* Exhibitions & Awards */}
        {artist.exhibitions && artist.exhibitions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 sm:mb-16"
          >
            <h2 className="text-white mb-6 sm:mb-8">{language === 'ko' ? '전시 및 수상' : 'Exhibitions & Awards'}</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8">
              <div className="space-y-4 sm:space-y-6">
                {artist.exhibitions.map((exhibition, index) => (
                  <div key={index} className="border-b border-white/10 last:border-0 pb-4 sm:pb-6 last:pb-0">
                    <p className="text-[#5842FF] text-sm mb-2">{exhibition.year}</p>
                    <h3 className="text-white mb-2">{exhibition.title}</h3>
                    <p className="text-white/60 text-sm">{exhibition.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Selected Works */}
        {artist.works && artist.works.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-white mb-6 sm:mb-8">{language === 'ko' ? '주요 작품' : 'Selected Works'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {artist.works.map((work) => (
                <div
                  key={work.id}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                >
                  <ImageWithFallback
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-sm sm:text-base mb-1">{work.title}</h3>
                    <p className="text-white/60 text-xs sm:text-sm">{work.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}