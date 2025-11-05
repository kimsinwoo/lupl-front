// 구글 로그인 유틸리티

declare global {
  interface Window {
    google: any;
  }
}

// 환경 변수에서 가져오기
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  throw new Error('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
}

export const initGoogle = () => {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 초기화만 수행
    if (window.google && window.google.accounts) {
      resolve(true);
      return;
    }

    // Google Sign-In 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.accounts) {
        resolve(true);
      } else {
        reject(new Error('Google Sign-In SDK failed to load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Sign-In SDK'));
    };
  });
};

// 구글 로그인 - ID Token 받기 (버튼 렌더링 방식)
export const googleLogin = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts) {
      reject(new Error('Google Sign-In SDK not initialized'));
      return;
    }

    // 이미 진행 중인 로그인이 있으면 취소
    const existingContainer = document.getElementById('google-login-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 임시 컨테이너 생성 (화면 밖에 위치)
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'google-login-container';
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.top = '-9999px';
    buttonContainer.style.left = '-9999px';
    buttonContainer.style.opacity = '0';
    buttonContainer.style.pointerEvents = 'auto'; // 클릭 가능하게 설정
    document.body.appendChild(buttonContainer);

    let resolved = false;

    // Google Identity Services 초기화
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (credentialResponse: any) => {
        // 정리
        if (buttonContainer.parentNode) {
          buttonContainer.parentNode.removeChild(buttonContainer);
        }

        if (resolved) return;
        resolved = true;

        if (credentialResponse.credential) {
          resolve(credentialResponse.credential);
        } else {
          const error = credentialResponse.error || 'Failed to get ID token';
          console.error('Google login error:', error);
          reject(new Error(error));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true
    });

    // 버튼 렌더링
    try {
      window.google.accounts.id.renderButton(buttonContainer, {
        theme: 'filled_black',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });

      // 버튼이 렌더링될 때까지 대기 후 자동 클릭
      setTimeout(() => {
        if (resolved) return;

        const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement;
        if (button) {
          // 버튼을 화면 중앙에 표시하여 사용자가 클릭할 수 있도록 함
          buttonContainer.style.position = 'fixed';
          buttonContainer.style.top = '50%';
          buttonContainer.style.left = '50%';
          buttonContainer.style.transform = 'translate(-50%, -50%)';
          buttonContainer.style.opacity = '1';
          buttonContainer.style.zIndex = '9999';
          buttonContainer.style.background = 'white';
          buttonContainer.style.padding = '20px';
          buttonContainer.style.borderRadius = '8px';
          buttonContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

          // 자동 클릭
          button.click();
        } else {
          // 버튼이 렌더링되지 않으면 타임아웃
          setTimeout(() => {
            if (!resolved) {
              if (buttonContainer.parentNode) {
                buttonContainer.parentNode.removeChild(buttonContainer);
              }
              reject(new Error('Failed to render Google login button. Please check your Google Cloud Console settings.'));
            }
          }, 3000);
        }
      }, 500);
    } catch (error: any) {
      if (buttonContainer.parentNode) {
        buttonContainer.parentNode.removeChild(buttonContainer);
      }
      console.error('Google login initialization error:', error);
      reject(error);
    }
  });
};

// 더 간단한 방법: One Tap을 사용하여 직접 ID Token 받기
export const googleLoginOneTap = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.accounts) {
      reject(new Error('Google Sign-In SDK not initialized'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (credentialResponse: any) => {
        if (credentialResponse.credential) {
          resolve(credentialResponse.credential);
        } else {
          reject(new Error('Failed to get ID token'));
        }
      }
    });

    // One Tap 표시
    window.google.accounts.id.prompt();
  });
};
