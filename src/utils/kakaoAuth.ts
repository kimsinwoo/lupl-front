// 카카오 로그인 유틸리티

declare global {
  interface Window {
    Kakao: any;
  }
}

export const initKakao = () => {
  // 카카오 SDK 로드
  if (!window.Kakao) {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY || 'your-kakao-app-key');
        }
        resolve(true);
      };
    });
  }
  return Promise.resolve(true);
};

export const kakaoLogin = () => {
  return new Promise((resolve, reject) => {
    window.Kakao.Auth.login({
      success: (authObj: any) => {
        resolve(authObj.access_token);
      },
      fail: (error: any) => {
        reject(error);
      },
      scope: 'profile_nickname,account_email'
    });
  });
};

export const kakaoLogout = () => {
  if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
    window.Kakao.Auth.logout();
  }
};

