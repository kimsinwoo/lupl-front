import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';
import { artistService } from '../../services/artist.service';
import { toast } from 'sonner';

interface Artist {
  id: string;
  name: string;
  nameEn?: string;
  bio?: string;
  bioEn?: string;
  profileImage?: string;
  image?: string;
  specialty?: string;
}

export function ArtistPage() {
  const { language, t } = useLanguage();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      setLoading(true);
      const response: any = await artistService.getAll();
      
      let artistsData: any[] = [];
      if (response?.data?.data) {
        artistsData = response.data.data;
      } else if (Array.isArray(response?.data)) {
        artistsData = response.data;
      } else if (Array.isArray(response)) {
        artistsData = response;
      }
      
      setArtists(artistsData);
    } catch (error: any) {
      console.error('Failed to load artists:', error);
      toast.error(t('artist.loadError') || 'Failed to load artists');
    } finally {
      setLoading(false);
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
          className="mb-12 sm:mb-16 text-center"
        >
          <h1 className="text-white mb-4">{t('artist.title')}</h1>
          <p className="text-white/60 px-4">{t('artist.description')}</p>
        </motion.div>

        {/* Artists Grid */}
        {loading ? (
          <div className="text-center py-24">
            <p className="text-white/60">{t('common.loading') || 'Loading...'}</p>
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white/60">{t('artist.noArtists') || 'No artists found'}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/artist/${artist.id}`}
                  className="group block bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#5842FF] transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden max-h-64 sm:max-h-80">
                    <ImageWithFallback
                      src={artist.profileImage || artist.image}
                      alt={language === 'ko' ? artist.name : (artist.nameEn || artist.name)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-white mb-2">{language === 'ko' ? artist.name : (artist.nameEn || artist.name)}</h3>
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {language === 'ko' ? (artist.bio || '') : (artist.bioEn || artist.bio || '')}
                    </p>
                    {artist.specialty && (
                      <p className="text-[#5842FF] text-xs sm:text-sm">
                        {artist.specialty}
                      </p>
                    )}
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