import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { ArrowLeft, Lock } from 'lucide-react';

const translations: any = {
  ko: {
    title: '비밀번호 변경',
    emailPlaceholder: '이메일을 입력하세요',
    codePlaceholder: '인증 코드를 입력하세요',
    passwordPlaceholder: '새 비밀번호를 입력하세요',
    confirmPasswordPlaceholder: '비밀번호를 다시 입력하세요',
    sendCode: '인증 코드 발송',
    verify: '인증하기',
    reset: '비밀번호 변경',
    resend: '재발송',
    backToLogin: '로그인으로 돌아가기',
    seconds: '초',
    codeSent: '인증 코드가 발송되었습니다',
    passwordReset: '비밀번호가 변경되었습니다',
    passwordMismatch: '비밀번호가 일치하지 않습니다',
    passwordMinLength: '비밀번호는 최소 6자 이상이어야 합니다',
  },
  en: {
    title: 'Reset Password',
    emailPlaceholder: 'Enter your email',
    codePlaceholder: 'Enter verification code',
    passwordPlaceholder: 'Enter new password',
    confirmPasswordPlaceholder: 'Confirm password',
    sendCode: 'Send Verification Code',
    verify: 'Verify',
    reset: 'Reset Password',
    resend: 'Resend',
    backToLogin: 'Back to Login',
    seconds: 'seconds',
    codeSent: 'Verification code sent',
    passwordReset: 'Password reset successfully',
    passwordMismatch: 'Passwords do not match',
    passwordMinLength: 'Password must be at least 6 characters',
  },
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!email) {
      toast.error(language === 'ko' ? '이메일을 입력해주세요' : 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendResetPasswordVerification(email);
      toast.success(t.codeSent);
      setStep('verify');
      setCountdown(180);
      
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
      // Code verification is done in resetPasswordWithVerification
      setStep('reset');
      toast.success(language === 'ko' ? '인증이 완료되었습니다' : 'Verification successful');
    } catch (error: any) {
      toast.error(error?.message || (language === 'ko' ? '인증 실패' : 'Verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error(language === 'ko' ? '비밀번호를 입력해주세요' : 'Please enter password');
      return;
    }

    if (password.length < 6) {
      toast.error(t.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPasswordWithVerification(email, code, password);
      toast.success(t.passwordReset);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || (language === 'ko' ? '비밀번호 변경 실패' : 'Failed to reset password'));
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

          {step === 'reset' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  {language === 'ko' ? '새 비밀번호' : 'New Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  {language === 'ko' ? '비밀번호 확인' : 'Confirm Password'}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white"
              >
                {isLoading ? (language === 'ko' ? '변경 중...' : 'Resetting...') : t.reset}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

