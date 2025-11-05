import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Instagram, Youtube, Mail, User, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { LanguageToggle } from './LanguageToggle';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from './ui/sheet';

// 아이콘 컴포넌트 분리
const LoginIcon = () => (
  <span className="flex items-center">
    <User className="w-5 h-5" />
    <span className="sr-only">Login</span>
  </span>
);

const MyPageIcon = () => (
  <span className="flex items-center">
    <User className="w-5 h-5" />
    <span className="sr-only">My Page</span>
  </span>
);

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useUser();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleCartClick = () => {
    if (!user) {
      toast.error(t('cart.loginRequired') || '로그인을 해주세요');
      navigate('/login');
      setIsOpen(false);
      return;
    }
    navigate('/cart');
    setIsOpen(false);
  };

  // Calculate cart item count
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Check if user is admin (from context or localStorage)
  const isAdmin = user?.role === 'admin' || (() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser).role === 'admin' : false;
    } catch {
      return false;
    }
  })();

  const navItems = [
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.portfolio'), path: '/portfolio' },
    { label: t('nav.artist'), path: '/artist' },
    { label: t('nav.shop'), path: '/shop' },
    { label: t('nav.contact'), path: '/contact' }
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="group z-50">
          {/* 로고가 잘 보이도록 배경을 주고, 그림자 및 테두리 강조 */}
          <span className="relative flex items-center justify-center transition-colors duration-300 group-hover:text-[#5842FF]">
            {/* 반투명 어두운 원형 배경 + 하얀색 원형 border + 섀도우 */}
            <span
              className="
                absolute
                inset-0
                rounded-full
                border-2
                border-white
                pointer-events-none
                w-12 h-12
                mx-auto
                my-auto
                bg-black/80
                shadow-lg
              "

              aria-hidden="true"
            ></span>
            <img
              src="/lupl-logo.png"
              alt="Lupl Logo"
              className="w-10 h-10 relative z-10 drop-shadow-[0_1px_8px_rgba(0,0,0,0.32)]"
              style={{
                background: 'transparent',
                filter: 'drop-shadow(1px 1px 4px white)'
              }}
            />
          </span>
        </Link>
        
        {/* Navigation */}
        <div className="flex items-center gap-8">
          {/* Main nav (desktop only) */}
          <nav className="hidden lg:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm tracking-wider transition-colors duration-300 ${
                  location.pathname === item.path
                    ? 'text-[#5842FF]'
                    : 'text-white/80 hover:text-[#5842FF]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Admin Link (only for admin users, desktop only) */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden lg:block text-sm tracking-wider transition-colors duration-300 text-white/80 hover:text-[#5842FF]"
              aria-label="Admin"
            >
              ADMIN
            </Link>
          )}

          {/* MyPage/Login Icon - 항상 보이게 */}
          {!user ? (
            <Link
              to="/login"
              className="text-white/80 hover:text-[#5842FF] transition-colors duration-300 flex items-center justify-center px-2"
              aria-label="Login"
            >
              <LoginIcon />
            </Link>
          ) : (
            <Link
              to="/mypage"
              className="text-white/80 hover:text-[#5842FF] transition-colors duration-300 flex items-center justify-center px-2"
              aria-label="My Page"
            >
              <MyPageIcon />
            </Link>
          )}

          {/* Cart Icon - 항상 보이게 */}
          <button
            onClick={handleCartClick}
            className="text-white/80 hover:text-[#5842FF] transition-colors duration-300 relative flex items-center justify-center px-2"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-1 bg-[#5842FF] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* 언어 토글러 - 항상 보이게 */}
          <LanguageToggle />

          {/* Menu 버튼 (모바일만 표시) */}
          <div className="flex lg:hidden items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button 
                  className="text-white p-2 hover:text-[#5842FF] transition-colors"
                  aria-label="Toggle menu"
                >
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#5842FF] border-[#5842FF] w-[300px] sm:w-[400px]" aria-describedby={undefined}>
                <SheetTitle className="text-white text-xl text-center mt-4">Menu</SheetTitle>
                <nav className="flex flex-col gap-6 mt-12 items-center">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg tracking-wider transition-colors duration-300 ${
                        location.pathname === item.path
                          ? 'text-white'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Admin link in mobile menu */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="text-lg tracking-wider transition-colors duration-300 text-white/80 hover:text-white"
                    >
                      ADMIN
                    </Link>
                  )}
                </nav>
                
                {/* SNS Links */}
                <div className="flex justify-center gap-6 mt-12">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white transition-colors duration-300"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-6 h-6" />
                  </a>
                  <a 
                    href="mailto:info@lupl.kr"
                    className="text-white/80 hover:text-white transition-colors duration-300"
                    aria-label="Email"
                  >
                    <Mail className="w-6 h-6" />
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}