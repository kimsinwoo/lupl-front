import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { initKakao, kakaoLogin } from '../utils/kakaoAuth';
import { initGoogle, googleLogin } from '../utils/googleAuth';
import { naverLogin } from '../utils/naverAuth';
import { authService } from '../services/auth.service';

// 같은 탭에서 UserContext 업데이트 트리거
const triggerUserUpdate = (): void => {
  window.dispatchEvent(new CustomEvent('userUpdated'));
};

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

/** ----- 타입/가드 ----- */
type UserData = {
  id?: string | number;
  email?: string;
  name?: string;
  [k: string]: unknown;
};

type ApiResponse = {
  success: boolean;
  data?: unknown;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const extractUserData = (result: unknown): UserData | null => {
  if (!isRecord(result)) return null;
  const success = typeof result.success === 'boolean' ? result.success : false;
  if (!success) return null;

  const data = (result as ApiResponse).data;
  if (isRecord(data)) {
    if ('user' in data && isRecord((data as Record<string, unknown>).user)) {
      return data.user as UserData;
    }
    return data as UserData;
  }
  return null;
};

/** ----- 브랜드 스위치 (검수용) ----- */
type BrandStyle = 'strict' | 'darkHarmony';
const BRAND_STYLE: BrandStyle = 'darkHarmony'; // 검수 제출 시 'strict'로 변경

/** ----- 아이콘 SVG (색/비율 임의 변경 금지) ----- */
const GoogleG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const KakaoSymbol: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M12 3c-5.52 0-10 3.39-10 7.56 0 2.69 1.8 5.07 4.5 6.49L5.5 22l4.5-2.5c.5.05 1 .08 1.5.08 5.52 0 10-3.39 10-7.56S17.52 3 12 3z"/>
  </svg>
);

const NaverN: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
  </svg>
);

/** ----- 공용 소셜 아이콘 버튼 (크게/다크 친화) ----- */
const SocialIconButton: React.FC<{
  brand: 'google' | 'kakao' | 'naver';
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}> = ({ brand, onClick, disabled, label, children }) => {
  const base =
    'relative inline-flex items-center justify-center ' +
    'h-14 w-14 md:h-16 md:w-16 rounded-full p-0 ' + // 56~64px
    'transition-all duration-200 disabled:opacity-50 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-black ' +
    // 미세 보더/글로시 + 그림자
    'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.35)] ' +
    'active:scale-[0.98]';

  const neutral = 'bg-[#0E0E0F] hover:bg-[#171718] border border-[#242527] text-white';

  const cls =
    brand === 'google'
      ? (BRAND_STYLE === 'strict'
          ? 'bg-[#131314] hover:bg-[#1C1D1E] border border-[#8E918F]'
          : neutral)
      : brand === 'kakao'
      ? (BRAND_STYLE === 'strict'
          ? 'bg-[#FEE500] hover:brightness-95 text-black'
          : neutral)
      : // naver
        (BRAND_STYLE === 'strict'
          ? 'bg-[#03C75A] hover:brightness-95 text-white'
          : neutral);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`${base} ${cls}`}
    >
      {children}
    </button>
  );
};

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useUser();
  const { language } = useLanguage();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [kakaoReady, setKakaoReady] = useState<boolean>(true);
  const [googleReady, setGoogleReady] = useState<boolean>(true);

  useEffect(() => {
    async function initKakaoSDK(): Promise<void> {
      try {
        await initKakao();
        setKakaoReady(true);
      } catch (err) {
        setKakaoReady(false);
        // eslint-disable-next-line no-console
        console.error('Kakao SDK Init Error:', err);
      }
    }

    async function initGoogleSDK(): Promise<void> {
      try {
        await initGoogle();
        setGoogleReady(true);
        console.log('✅ Google SDK initialized successfully');
      } catch (err: any) {
        setGoogleReady(false);
        console.error('❌ Google SDK Init Error:', err);
        
        // 환경 변수 오류인 경우 명확한 메시지 표시
        if (err?.message?.includes('VITE_GOOGLE_CLIENT_ID')) {
          console.error('⚠️ VITE_GOOGLE_CLIENT_ID 환경 변수가 설정되지 않았습니다.');
        }
      }
    }

    // OAuth 콜백 처리
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const error_description = urlParams.get('error_description');
    
    // URL 경로로 카카오/네이버 구분
    const currentPath = window.location.pathname;
    const isKakaoCallback = currentPath.includes('/oauth/kakao/callback');
    const isNaverCallback = currentPath.includes('/oauth/naver/callback');

    if (error) {
      toast.error(
        language === 'ko'
          ? `소셜 로그인 실패: ${error_description ?? error}`
          : `Social login failed: ${error_description ?? error}`
      );
      window.history.replaceState({}, '', '/login');
    } else if (code && state) {
      // URL 경로 우선, 없으면 state로 구분
      const kakaoState = sessionStorage.getItem('kakao_state');
      const isKakao = isKakaoCallback || (isNaverCallback === false && state === kakaoState);

      (async () => {
        try {
          setIsLoading(true);
          // authorization 요청 시 사용한 redirectUri를 sessionStorage에서 가져오기
          // 카카오는 저장된 값 사용, 네이버는 현재 URL 사용
          const redirectUri = isKakao 
            ? sessionStorage.getItem('kakao_redirect_uri') || `${window.location.origin}${currentPath}`
            : `${window.location.origin}${currentPath}`;
          
          console.log('📋 Using redirectUri:', { isKakao, redirectUri, currentPath });
          
          const result = isKakao
            ? await authService.kakaoLogin(code, state, redirectUri)
            : await authService.naverLogin(code, state, redirectUri);

          const userData = extractUserData(result);
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            triggerUserUpdate();
            toast.success(
              language === 'ko'
                ? `${isKakao ? '카카오' : '네이버'} 로그인 성공`
                : `${isKakao ? 'Kakao' : 'Naver'} login successful`
            );
            setTimeout(() => onNavigate('home'), 300);
          } else {
            toast.error(
              language === 'ko'
                ? `${isKakao ? '카카오' : '네이버'} 로그인 응답 형식 오류`
                : `${isKakao ? 'Kakao' : 'Naver'} login response format error`
            );
          }
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : language === 'ko'
              ? `${isKakao ? '카카오' : '네이버'} 로그인 실패`
              : `${isKakao ? 'Kakao' : 'Naver'} login failed`;
          toast.error(msg);
        } finally {
          setIsLoading(false);
          // callback 경로를 /login으로 변경
          if (isKakaoCallback || isNaverCallback) {
            window.history.replaceState({}, '', '/login');
          }
        }
      })();
    } else {
      void initKakaoSDK();
      void initGoogleSDK();
    }
  }, [language, onNavigate]);

  /** ----- 이메일/비밀번호 로그인 ----- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const contextSuccess = login(email, password);
      if (contextSuccess) {
        toast.success(language === 'ko' ? '로그인 성공' : 'Login successful');
        onNavigate('home');
        setIsLoading(false);
        return;
      }

      const result = await authService.login({ email, password });

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        triggerUserUpdate();
        toast.success(language === 'ko' ? '로그인 성공' : 'Login successful');
        setTimeout(() => onNavigate('home'), 300);
        return;
      }

      const userData = extractUserData(result);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        triggerUserUpdate();
        toast.success(language === 'ko' ? '로그인 성공' : 'Login successful');
        setTimeout(() => onNavigate('home'), 300);
      } else {
        toast.error(language === 'ko' ? '로그인 응답 형식 오류' : 'Login response format error');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : language === 'ko'
          ? '이메일 또는 비밀번호가 잘못되었습니다'
          : 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /** ----- 소셜 핸들러 ----- */
  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await initGoogle();
      const idToken = await googleLogin();
      if (!idToken) throw new Error('Failed to get ID token from Google');

      const result = await authService.googleLogin(idToken);
      const userData = extractUserData(result);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        triggerUserUpdate();
        toast.success(language === 'ko' ? '구글 로그인 성공' : 'Google login successful');
        setTimeout(() => onNavigate('home'), 300);
      } else {
        toast.error(language === 'ko' ? '구글 로그인 응답 형식 오류' : 'Google login response format error');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : language === 'ko' ? '구글 로그인 실패' : 'Google login failed';
      if (msg.includes('origin is not allowed') || msg.toLowerCase().includes('cors')) {
        toast.error(
          language === 'ko'
            ? '구글 로그인 설정 오류: Google Cloud Console에서 현재 도메인을 승인해주세요.'
            : 'Google login setup error: Please authorize this domain in Google Cloud Console.'
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = (): void => naverLogin();
  const handleKakaoLogin = (): void => kakaoLogin();

  /** ----- UI ----- */
  return (
    <div className="min-h-screen bg-black pt-24 pb-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full" style={{ maxWidth: '512px' }}>
        {/* Header */}
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

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8"
        >
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="block text-white/70 text-sm sm:text-base">
                {language === 'ko' ? '이메일' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder="your@email.com"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="block text-white/70 text-sm sm:text-base">
                {language === 'ko' ? '비밀번호' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder="••••••••"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white py-6 text-base disabled:opacity-50 transition-all duration-300"
              >
                {isLoading ? (language === 'ko' ? '로그인 중...' : 'Logging in...') : (language === 'ko' ? '로그인' : 'Login')}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/50">{language === 'ko' ? '또는' : 'or'}</span>
            </div>
          </div>

          {/* Social: 아이콘형(크게) */}
          <div className="flex items-center justify-center gap-5 md:gap-6 mt-4">
            {googleReady && (
              <SocialIconButton
                brand="google"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                label={language === 'ko' ? 'Google로 로그인' : 'Login with Google'}
              >
                <GoogleG className="h-7 w-7 md:h-8 md:w-8" />
              </SocialIconButton>
            )}

            {kakaoReady && (
              <SocialIconButton
                brand="kakao"
                onClick={handleKakaoLogin}
                disabled={isLoading}
                label={language === 'ko' ? 'Kakao로 로그인' : 'Login with Kakao'}
              >
                <KakaoSymbol
                  className={
                    BRAND_STYLE === 'darkHarmony'
                      ? 'h-7 w-7 md:h-8 md:w-8 text-white'
                      : 'h-7 w-7 md:h-8 md:w-8 text-black'
                  }
                />
              </SocialIconButton>
            )}

            <SocialIconButton
              brand="naver"
              onClick={naverLogin}
              disabled={isLoading}
              label={language === 'ko' ? 'NAVER로 로그인' : 'Login with NAVER'}
            >
              <NaverN className="h-7 w-7 md:h-8 md:w-8" />
            </SocialIconButton>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.9 }} className="mt-8 space-y-3 text-center">
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
              onClick={() => (window.location.href = '/reset-password')}
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
