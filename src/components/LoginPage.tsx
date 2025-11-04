import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // 수정: motion/react => framer-motion
import { useUser } from '../context/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { initKakao, kakaoLogin } from '../utils/kakaoAuth';
import { authService } from '../services/auth.service';

// Custom event to trigger UserContext update
const triggerUserUpdate = () => {
  // 같은 탭에서 localStorage 변경을 감지하기 위한 커스텀 이벤트
  window.dispatchEvent(new CustomEvent('userUpdated'));
};

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage = ({ onNavigate }: LoginPageProps) => {
  const { login } = useUser();
  const { language } = useLanguage();
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(true); // 카카오 버튼 노출 제어

  useEffect(() => {
    // Kakao SDK 초기화 오류에 대비해 try-catch
    async function init() {
      try {
        await initKakao();
        setKakaoReady(true);
      } catch (err) {
        setKakaoReady(false);
        // 콘솔만 남김 (버튼 숨기기)
        console.error('Kakao SDK Init Error (Kakao button will be hidden):', err);
      }
    }
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => { // 수정: SyntheticEvent => FormEvent
    e.preventDefault();
    setIsLoading(true);

    try {
      // Context 함수와 API 서비스 둘 다 시도
      const contextSuccess = login(email, password);
      if (contextSuccess) {
        toast.success(language === 'ko' ? '로그인 성공' : 'Login successful');
        onNavigate('home');
        setIsLoading(false);
        return;
      }

      // API 호출 (세션 쿠키가 자동으로 설정됨)
      const result = await authService.login({ email, password });
      console.log('📦 Login API Response from authService:', result);
      
      // authService에서 이미 처리했지만, 한번 더 확인
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('✅ User already saved in authService:', userData);
        
        // UserContext 업데이트 트리거
        triggerUserUpdate();
        
        setTimeout(() => {
          const confirmed = localStorage.getItem('user');
          if (confirmed) {
            const parsed = JSON.parse(confirmed);
            console.log('✅ User confirmed saved:', parsed.email);
            console.log('✅ Current UserContext should be updated');
          }
        }, 100);
        
        toast.success(language === 'ko' ? '로그인 성공' : 'Login successful');
        
        // 로그인 성공 후 무조건 홈으로 이동
        setTimeout(() => {
          onNavigate('home');
        }, 300);
      } else {
        // authService에서 저장되지 않은 경우 직접 처리
        console.warn('⚠️ User not saved in authService, trying to extract from result');
        
        let userData: any = null;
        if (result.success) {
          // result 타입 안전성 고려
          if ('data' in result && result.data && typeof result.data === 'object') {
            if ('user' in result.data) {
              userData = result.data.user;
            } else if ('id' in result.data) {
              userData = result.data;
            }
          }
        }
        
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ User saved manually:', userData);
          triggerUserUpdate();
          toast.success(language === 'ko' ? '로그인 성공' : 'Login successful');
          setTimeout(() => {
            onNavigate('home');
          }, 300);
        } else {
          console.error('❌ User data not found in response:', result);
          toast.error(language === 'ko' ? '로그인 응답 형식 오류' : 'Login response format error');
        }
      }
    } catch (error: any) {
      toast.error(error?.message || (language === 'ko' ? '이메일 또는 비밀번호가 잘못되었습니다' : 'Invalid email or password'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      await initKakao();
      const accessToken = await kakaoLogin();
      
      const result = await authService.kakaoLogin(accessToken as string);
      
      console.log('📦 Kakao Login API Response:', result);
      
      // 응답 구조 확인 및 사용자 정보 추출
      let userData: any = null;
      
      if (result.success) {
        if ('data' in result && result.data && typeof result.data === 'object') {
          if ('user' in result.data) {
            userData = result.data.user;
          } else {
            userData = result.data;
          }
        }
      }
      
      console.log('👤 Extracted user data (Kakao):', userData);
      
      if (userData) {
        // localStorage에 user 정보 저장
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ User saved to localStorage (Kakao):', userData);
        
        // UserContext 업데이트 트리거
        triggerUserUpdate();
        
        setTimeout(() => {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            console.log('✅ User confirmed saved (Kakao):', parsed.email);
          }
        }, 100);
        
        toast.success(language === 'ko' ? '카카오 로그인 성공' : 'Kakao login successful');
        
        // 로그인 성공 후 무조건 홈으로 이동
        setTimeout(() => {
          onNavigate('home');
        }, 300);
      } else {
        console.error('❌ User data not found in Kakao response:', result);
        toast.error(language === 'ko' ? '카카오 로그인 응답 형식 오류' : 'Kakao login response format error');
      }
    } catch (error: any) {
      toast.error(error?.message || (language === 'ko' ? '카카오 로그인 실패' : 'Kakao login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full" style={{ maxWidth: '512px' }}>
        {/* Header Section with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white mb-4 text-4xl sm:text-5xl tracking-wider"
          >
            Lupl
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/70 text-sm sm:text-base tracking-wider"
          >
            {language === 'ko' ? '로그인' : 'Login'}
          </motion.p>
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md mx-auto bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-2"
            >
              <Label 
                htmlFor="email" 
                className="block text-white/70 text-sm sm:text-base"
              >
                {language === 'ko' ? '이메일' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? 'your@email.com' : 'your@email.com'}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-2"
            >
              <Label 
                htmlFor="password" 
                className="block text-white/70 text-sm sm:text-base"
              >
                {language === 'ko' ? '비밀번호' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? '••••••••' : '••••••••'}
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white py-6 text-base disabled:opacity-50 transition-all duration-300"
              >
                {isLoading 
                  ? (language === 'ko' ? '로그인 중...' : 'Logging in...') 
                  : (language === 'ko' ? '로그인' : 'Login')
                }
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/50">
                {language === 'ko' ? '또는' : 'or'}
              </span>
            </div>
          </div>

          {/* Kakao Login Button */}
          <div className="flex w-full items-center justify-center mt-4 border border-white/10 pt-4 rounded-md p-2 cursor-pointer">
            {kakaoReady && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full flex items-center justify-center"
              >
                <Button
                  type="button"
                  onClick={handleKakaoLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#FFEB3B] text-black font-semibold py-4 sm:py-5 text-base rounded-md transition-all duration-200 border-none shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#FEE500]/50"
                  style={{
                    maxWidth: 360,
                    margin: '0 auto',
                  }}
                >
                  <span className="flex-1 text-center text-white ">
                    {language === 'ko' ? '카카오로 로그인' : 'Login with Kakao'}
                  </span>
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Sign Up and Find ID/Reset Password Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 space-y-3 text-center"
        >
          <p className="text-sm text-white/70">
            {language === 'ko' ? '계정이 없으신가요?' : "Don't have an account?"}{' '}
            <button
              onClick={() => onNavigate('signup')}
              className="text-[#5842FF] hover:text-[#5842FF]/80 underline hover:no-underline transition-colors duration-300"
            >
              {language === 'ko' ? '회원가입' : 'Sign up'}
            </button>
          </p>
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/reset-password'}
              className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
            >
              {language === 'ko' ? '비밀번호 변경' : 'Reset Password'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
