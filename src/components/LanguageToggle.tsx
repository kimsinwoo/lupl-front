import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="relative w-14 h-7 rounded-full bg-white/10 border border-white/20 hover:border-[#5842FF] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5842FF]/50"
      aria-label="Toggle language"
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-[#5842FF] flex items-center justify-center"
        animate={{
          x: language === 'ko' ? 0 : 28,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        <span className="text-white text-[10px]">
          {language === 'ko' ? 'KO' : 'EN'}
        </span>
      </motion.div>
      <div className="flex items-center justify-between px-2 h-full text-[10px] text-white/50 pointer-events-none">
        <span className={language === 'ko' ? 'opacity-0' : 'opacity-100'}>KO</span>
        <span className={language === 'en' ? 'opacity-0' : 'opacity-100'}>EN</span>
      </div>
    </button>
  );
};
