import { Link } from 'react-router-dom';
import { Instagram, Youtube, Mail, Linkedin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

export function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 text-white/80 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white">{t['footer.company']}</h3>
            <p className="text-sm text-white/60">
              {t['footer.tagline']}
            </p>
            {/* Social Links */}
            <div className="flex gap-4 pt-2">
              <a 
                href="https://www.instagram.com/lupl_official/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#5842FF] transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@LUPL%EB%9F%AC%ED%94%8C" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#5842FF] transition-colors duration-300"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="mailto:cs@lupl.kr"
                className="text-white/60 hover:text-[#5842FF] transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              
            </div>
          </div>

          {/* About Links */}
          <div className="space-y-4">
            <h4 className="text-sm tracking-wider text-white/90">{t['footer.about']}</h4>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/about" 
                className="text-sm text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.about.company']}
              </Link>
              <Link 
                to="/artist" 
                className="text-sm text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.about.artists']}
              </Link>
              <Link 
                to="/about" 
                className="text-sm text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.about.partners']}
              </Link>
            </nav>
          </div>

          {/* Services Links */}
          <div className="space-y-4">
            <h4 className="text-sm tracking-wider text-white/90">{t['footer.services']}</h4>
            <nav className="flex flex-col gap-2">
              <Link 
                to="/portfolio" 
                className="text-sm text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.services.portfolio']}
              </Link>
              <Link 
                to="/shop" 
                className="text-sm text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.services.shop']}
              </Link>
              <Link 
                to="/contact" 
                className="text-sm text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.services.contact']}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm tracking-wider text-white/90">{t['footer.contact']}</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <a 
                href="mailto:cs@lupl.kr"
                className="hover:text-[#5842FF] transition-colors duration-300"
              >
                cs@lupl.kr
              </a>
              <a 
                href="tel:+82 10-2593-0554"
                className="hover:text-[#5842FF] transition-colors duration-300"
              >
                +82 10-2593-0554
              </a>
              <p className="text-white/60">
                {t['footer.address']}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">
              {t['footer.copyright'].replace('2025', currentYear.toString())}
            </p>
            <div className="flex gap-6 text-sm">
              <button 
                className="text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.legal.terms']}
              </button>
              <button 
                className="text-white/60 hover:text-[#5842FF] transition-colors duration-300"
              >
                {t['footer.legal.privacy']}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
