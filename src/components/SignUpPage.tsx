import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authService } from '../services/auth.service';

// Custom event to trigger UserContext update
const triggerUserUpdate = () => {
  window.dispatchEvent(new CustomEvent('userUpdated'));
};

interface SignUpPageProps {
  onNavigate: (page: string) => void;
}

export const SignUpPage = ({ onNavigate }: SignUpPageProps) => {
  const { signup } = useUser();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(language === 'ko' ? '비밀번호가 일치하지 않습니다' : 'Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error(language === 'ko' ? '비밀번호는 최소 6자 이상이어야 합니다' : 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    // Context 방식 먼저
    const contextSuccess = signup({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (contextSuccess) {
      toast.success(language === 'ko' ? '회원가입이 완료되었습니다' : 'Account created successfully');
      onNavigate('home');
      setIsLoading(false);
      return;
    }

    // API 방식 시도
    try {
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      });

      if (result.success && result.data?.user) {
        const userData = result.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        triggerUserUpdate();

        setTimeout(() => {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            // 확인 로그
            // console.log('✅ User confirmed saved:', JSON.parse(savedUser).email);
          }
        }, 50);
        
        toast.success(language === 'ko' ? '회원가입이 완료되었습니다' : 'Account created successfully');

        setTimeout(() => {
          onNavigate('home');
        }, 300);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      // Get error message - could be from Error object or axios response
      let errorMessage = error.message;
      
      // If error has response data, try to extract message from there
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || error.message;
      }
      
      // Default messages if no specific message found
      if (!errorMessage || errorMessage === 'Request failed with status code 409') {
        errorMessage = language === 'ko' ? '이미 존재하는 이메일입니다' : 'Email already exists';
      } else if (!errorMessage || errorMessage === 'Request failed with status code 400') {
        errorMessage = language === 'ko' ? '입력 정보가 올바르지 않습니다' : 'Invalid registration data';
      }
      
      toast.error(errorMessage);
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
            {(language === 'ko' ? '회원가입' : 'Sign Up')}
          </motion.p>
        </motion.div>
      
        {/* Sign Up Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8"
          style={{ maxWidth: '512px', margin: '0 auto' }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="name" className="block text-white text-sm sm:text-base">
                {(language === 'ko' ? '이름' : 'Name')}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? '이름을 입력하세요' : 'Enter your name'}
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="block text-white text-sm sm:text-base">
                {(language === 'ko' ? '이메일' : 'Email')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder="your@email.com"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="space-y-2"
            >
              <Label htmlFor="phone" className="block text-white text-sm sm:text-base">
                {(language === 'ko' ? '전화번호' : 'Phone')}
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? '전화번호를 입력하세요' : '+1 (555) 000-0000'}
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="block text-white text-sm sm:text-base">
                {(language === 'ko' ? '비밀번호' : 'Password')}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? '••••••••' : '••••••••'}
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="space-y-2"
            >
              <Label htmlFor="confirmPassword" className="block text-white text-sm sm:text-base">
                {(language === 'ko' ? '비밀번호 확인' : 'Confirm Password')}
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-[#5842FF]"
                placeholder={language === 'ko' ? '••••••••' : '••••••••'}
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5842FF] hover:bg-[#5842FF]/80 text-white py-6 text-base disabled:opacity-50 transition-all duration-300"
              >
                {isLoading
                  ? (language === 'ko' ? '회원가입 중...' : 'Signing up...')
                  : ((language === 'ko' ? '회원가입' : 'Sign Up'))
                }
              </Button>
            </motion.div>
          </form>
        </motion.div>
        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-white/70">
            {(language === 'ko' ? '이미 계정이 있으신가요?' : "Already have an account?")}{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#5842FF] hover:text-[#5842FF]/80 underline hover:no-underline transition-colors duration-300"
            >
              {(language === 'ko' ? '로그인' : 'Login')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
