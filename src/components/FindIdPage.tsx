import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { Mail, ArrowLeft } from 'lucide-react';

const translations: any = {
  ko: {
    title: '아이디 찾기',
    emailPlaceholder: '이메일을 입력하세요',
    codePlaceholder: '인증 코드를 입력하세요',
    sendCode: '인증 코드 발송',
    verify: '인증하기',
    resend: '재발송',
    foundId: '찾으신 아이디',
    backToLogin: '로그인으로 돌아가기',
    seconds: '초',
    codeSent: '인증 코드가 발송되었습니다',
    codeVerified: '인증이 완료되었습니다',
    idFound: '아이디를 찾았습니다',
  },
  en: {
    title: 'Find ID',
    emailPlaceholder: 'Enter your email',
    codePlaceholder: 'Enter verification code',
    sendCode: 'Send Verification Code',
    verify: 'Verify',
    resend: 'Resend',
    foundId: 'Your ID',
    backToLogin: 'Back to Login',
    seconds: 'seconds',
    codeSent: 'Verification code sent',
    codeVerified: 'Verification successful',
    idFound: 'ID found successfully',
  },
};

export const FindIdPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'result'>('email');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!email) {
      toast.error(language === 'ko' ? '이메일을 입력해주세요' : 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendFindIdVerification(email);
      toast.success(t.codeSent);
      setStep('verify');
      setCountdown(180); // 3 minutes
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || (language === 'ko' ? '인증 코드 발송 실패' : 'Failed to send verification code'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code) {
      toast.error(language === 'ko' ? '인증 코드를 입력해주세요' : 'Please enter verification code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.findUserId(email, code);
      setUserId(result.data.email);
      setStep('result');
      toast.success(t.idFound);
    } catch (error: any) {
      toast.error(error?.message || (language === 'ko' ? '인증 실패' : 'Verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24 flex items-center justify-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/login')}
              className="text-white hover:text-white/70"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white tracking-[0.15em]">{t.title}</h1>
          </div>

          {step === 'email' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  {language === 'ko' ? '이메일' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <Button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white"
              >
                {isLoading ? (language === 'ko' ? '발송 중...' : 'Sending...') : t.sendCode}
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-white">
                  {language === 'ko' ? '인증 코드' : 'Verification Code'}
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t.codePlaceholder}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                {countdown > 0 && (
                  <p className="text-sm text-white/70 text-center">
                    {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')} {t.seconds}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setStep('email');
                    setCode('');
                  }}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  {language === 'ko' ? '이메일 변경' : 'Change Email'}
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isLoading || code.length !== 6}
                  className="flex-1 bg-[#5842FF] hover:bg-[#5842FF]/80 text-white"
                >
                  {isLoading ? (language === 'ko' ? '인증 중...' : 'Verifying...') : t.verify}
                </Button>
              </div>

              {countdown === 0 && (
                <Button
                  onClick={handleSendCode}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  {t.resend}
                </Button>
              )}
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-6 text-center">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <Mail className="w-12 h-12 text-[#5842FF] mx-auto mb-4" />
                <p className="text-white/70 mb-2">{t.foundId}</p>
                <p className="text-2xl font-bold text-white">{userId}</p>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white"
              >
                {t.backToLogin}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

