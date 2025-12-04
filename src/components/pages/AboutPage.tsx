import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { partners } from '../../data/mockData';
import { useLanguage } from '../../contexts/LanguageContext';

export function AboutPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission and Vision */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24 sm:mb-32"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-[#5842FF] mb-8">{t('about.mission')}</h2>
            <p className="text-white/70 max-w-3xl mx-auto mb-8 px-4">
              {t('about.mission.text')}
            </p>
            <p className="text-white/70 max-w-3xl mx-auto px-4">
              {t('about.mission.text2')}
            </p>
          </motion.div>
        </motion.section>

        {/* Who We Are */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 sm:mb-32"
        >
          <h2 className="text-white mb-12 text-center">{t('about.who.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 hover:border-[#5842FF] transition-colors duration-300">
              <h3 className="text-white mb-4">{t('about.content.title')}</h3>
              <p className="text-white/70 mb-6">
                {t('about.content.desc')}
              </p>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>• {t('about.content.list1')}</li>
                <li>• {t('about.content.list2')}</li>
                <li>• {t('about.content.list3')}</li>
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 hover:border-[#5842FF] transition-colors duration-300">
              <h3 className="text-white mb-4">{t('about.agency.title')}</h3>
              <p className="text-white/70 mb-6">
                {t('about.agency.desc')}
              </p>
              <ul className="space-y-2 text-white/60 text-sm mb-6">
                <li>• {t('about.agency.list1')}</li>
                <li>• {t('about.agency.list2')}</li>
                <li>• {t('about.agency.list3')}</li>
              </ul>
              <Link 
                to="/artist" 
                className="inline-block text-[#5842FF] hover:text-[#5842FF]/80 transition-colors"
              >
                {t('about.meet.artists')}
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Partners */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-white mb-12 text-center">{t('about.partners')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center hover:border-[#5842FF] transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{partner.logo}</div>
                <p className="text-white/60 text-xs sm:text-sm text-center">{partner.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}