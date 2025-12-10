import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdmin();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.login({ email, password });
      if (result.success) {
        const userData = result.data?.user || (result as any).user;
        if (userData && userData.role === 'admin') {
          toast.success(language === 'ko' ? '관리자 로그인 성공' : 'Admin login successful');
          onLoginSuccess();
        } else {
          setError(language === 'ko' ? '관리자 권한이 없습니다' : 'Admin permission required');
          setPassword('');
        }
      } else {
        setError(language === 'ko' ? '잘못된 인증 정보입니다' : 'Invalid credentials');
        setPassword('');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || (language === 'ko' ? '로그인 실패' : 'Login failed'));
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
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
            {language === 'ko' ? '관리자 로그인' : 'Admin Portal'}
          </motion.p>
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8"
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
                className="block text-white text-sm sm:text-base"
              >
                {language === 'ko' ? '이메일' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? '관리자 이메일을 입력하세요' : 'Enter admin email'}
                autoFocus
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
                className="block text-white text-sm sm:text-base"
              >
                {language === 'ko' ? '비밀번호' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? '비밀번호를 입력하세요' : 'Enter admin password'}
                required
              />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg text-center"
        >
          <p className="text-xs text-white/50 mb-2">
            {language === 'ko' ? '데모 계정' : 'Demo Account'}
          </p>
          <p className="text-xs text-white/70">
            admin@lupl.kr / admin123456
          </p>
        </motion.div>
      </div>
    </div>
  );
};
