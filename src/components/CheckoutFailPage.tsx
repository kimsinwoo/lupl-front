import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { XCircle } from 'lucide-react';

export const CheckoutFailPage = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 sm:space-y-8">
          <XCircle className="w-20 h-20 mx-auto text-red-600" />
          <h1 className="text-3xl sm:text-4xl tracking-[0.15em]">결제 실패</h1>
          <p className="text-lg text-muted-foreground">
            결제 처리 중 오류가 발생했습니다
          </p>
          {errorCode && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-800">
                오류 코드: {errorCode}
              </p>
              {errorMessage && (
                <p className="text-sm text-red-800 mt-2">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/cart')}
              className="px-8 py-5 bg-black text-white hover:bg-black/90 tracking-[0.15em]"
            >
              장바구니로 돌아가기
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="px-8 py-5 border-black tracking-[0.15em]"
            >
              홈으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

