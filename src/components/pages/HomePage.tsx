import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../data/translations';

export function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];

  const quickLinks = language === 'ko' 
    ? [
        { title: '미디어 아트', path: '/portfolio?category=media-art' },
        { title: '전시', path: '/portfolio?category=exhibition' },
        { title: '인클루시브 패션', path: '/portfolio?category=fashion' },
        { title: '아트 콘테스트', path: '/portfolio?category=contest' }
      ]
    : [
        { title: 'Media Art', path: '/portfolio?category=media-art' },
        { title: 'Exhibition', path: '/portfolio?category=exhibition' },
        { title: 'Inclusive Fashion', path: '/portfolio?category=fashion' },
        { title: 'Art Contest', path: '/portfolio?category=contest' }
      ];

  return (
    <div className="min-h-screen bg-black w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden w-full" style={{ maxWidth: '100vw' }}>
        {/* Video Background Placeholder */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black z-10" />
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1681235014294-588fea095706?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMHBhaW50aW5nfGVufDF8fHx8MTc2MTc4MzQ5NHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Artwork collage"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
            loading="eager"
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-20 text-center px-4 sm:px-6"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-white mb-4"
          >
            {language === 'ko' ? '모두를 위한 포용적 예술' : 'Inclusive Art for Everyone'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-white/70 max-w-2xl mx-auto px-4"
          >
            {t['home.description']}
          </motion.p>
        </motion.div>
      </section>

      {/* Quick Links */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={link.path}
                  className="group block relative h-48 sm:h-64 rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-[#5842FF] transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <span className="text-white group-hover:text-[#5842FF] transition-colors duration-300">
                      {link.title}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#5842FF] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}