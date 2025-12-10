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
    // 클라이언트 ID 검증
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID가 환경 변수에 설정되지 않았습니다.'));
      return;
    }

    // 이미 로드되어 있으면 초기화만 수행
    if (window.google && window.google.accounts && window.google.accounts.id) {
      console.log('✅ Google SDK already loaded');
      resolve(true);
      return;
    }

    // 이미 스크립트가 로드 중인지 확인
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      // 스크립트가 이미 있으면 로드될 때까지 대기
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.accounts && window.google.accounts.id) {
          clearInterval(checkInterval);
          console.log('✅ Google SDK loaded after waiting');
          resolve(true);
        } else if (attempts >= 50) {
          // 최대 5초 대기
          clearInterval(checkInterval);
          reject(new Error('Google Sign-In SDK 로드 시간 초과'));
        }
      }, 100);
      return;
    }

    // Google Sign-In 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // 스크립트 로드 후 SDK가 준비될 때까지 대기
      let attempts = 0;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google && window.google.accounts && window.google.accounts.id) {
          clearInterval(checkInterval);
          console.log('✅ Google SDK loaded successfully');
          resolve(true);
        } else if (attempts >= 50) {
          // 최대 5초 대기
          clearInterval(checkInterval);
          reject(new Error('Google Sign-In SDK 초기화 실패'));
        }
      }, 100);
    };

    script.onerror = () => {
      reject(new Error('Google Sign-In SDK 스크립트 로드 실패. 네트워크 연결을 확인해주세요.'));
    };

    document.head.appendChild(script);
  });
};

// 구글 로그인 - ID Token 받기 (버튼 렌더링 방식)
export const googleLogin = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // SDK 초기화 확인
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      reject(new Error('Google Sign-In SDK가 초기화되지 않았습니다. 페이지를 새로고침해주세요.'));
      return;
    }

    // 클라이언트 ID 검증
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID가 환경 변수에 설정되지 않았습니다.'));
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
    buttonContainer.style.width = '200px';
    buttonContainer.style.height = '50px';
    document.body.appendChild(buttonContainer);

    let resolved = false;
    let renderAttempts = 0;
    const maxRenderAttempts = 15; // HTTPS 환경에서 더 많은 시간 필요 (500ms * 15 = 7.5초)

    // Google Identity Services 초기화
    try {
      console.log('🔑 Initializing Google Identity Services with client ID:', GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
      
      // initialize는 동기적으로 실행되지만, 내부적으로 비동기 작업이 있을 수 있으므로 약간의 지연을 줌
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        // Google OAuth 스코프 설정: 이메일과 프로필 정보 요청
        // 짧은 형식 사용 (Google Identity Services 권장)
        scope: 'openid email profile',
        callback: (credentialResponse: any) => {
          // 정리
          if (buttonContainer.parentNode) {
            buttonContainer.parentNode.removeChild(buttonContainer);
          }

          if (resolved) return;
          resolved = true;

          if (credentialResponse.credential) {
            console.log('✅ Google ID token received');
            resolve(credentialResponse.credential);
          } else {
            const error = credentialResponse.error || 'Failed to get ID token';
            console.error('❌ Google login error:', error);
            
            // 에러 타입에 따른 메시지
            let errorMessage = 'Google 로그인 실패';
            if (error === 'popup_closed_by_user') {
              errorMessage = '로그인 창이 닫혔습니다.';
            } else if (error === 'popup_blocked') {
              errorMessage = '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.';
            } else if (error.includes('origin') || error.includes('domain')) {
              errorMessage = 'Google Cloud Console에서 현재 도메인을 승인된 JavaScript 출처에 추가해주세요.';
            }
            
            reject(new Error(errorMessage));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      console.log('✅ Google Identity Services initialized');
    } catch (initError: any) {
      if (buttonContainer.parentNode) {
        buttonContainer.parentNode.removeChild(buttonContainer);
      }
      console.error('❌ Google initialize error:', initError);
      reject(new Error('Google 로그인 초기화 실패: ' + (initError.message || '알 수 없는 오류')));
      return;
    }

    // 버튼 렌더링 함수 - initialize 후 약간의 지연을 두고 실행
    const tryRenderButton = () => {
      if (resolved) return;

      try {
        console.log('🎨 Attempting to render Google button...');
        console.log('📦 Container element:', buttonContainer);
        console.log('📦 Container parent:', buttonContainer.parentElement);
        console.log('📦 Google SDK ready:', !!window.google?.accounts?.id);
        
        // SDK가 완전히 준비되었는지 확인
        if (!window.google?.accounts?.id) {
          console.error('❌ Google SDK not ready');
          reject(new Error('Google SDK가 아직 준비되지 않았습니다.'));
          return;
        }
        
        // 컨테이너가 DOM에 있는지 확인
        if (!buttonContainer.parentElement) {
          console.warn('⚠️ Container not in DOM, appending...');
          document.body.appendChild(buttonContainer);
        }
        
        // 컨테이너 스타일을 더 명확하게 설정
        buttonContainer.style.display = 'block';
        buttonContainer.style.visibility = 'visible';
        buttonContainer.style.width = '200px';
        buttonContainer.style.height = '50px';
        buttonContainer.style.minWidth = '200px';
        buttonContainer.style.minHeight = '50px';

        // 버튼 렌더링 시도
        try {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'filled_black',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
          console.log('🔄 renderButton called successfully');
        } catch (renderError: any) {
          console.error('❌ renderButton error:', renderError);
          throw renderError;
        }

        console.log('🔄 renderButton called, checking for button element...');

        // 버튼이 렌더링될 때까지 대기
        const checkButton = () => {
          if (resolved) return;

          // 여러 선택자로 버튼 찾기 시도
          const button = buttonContainer.querySelector('div[role="button"]') as HTMLElement ||
                        buttonContainer.querySelector('iframe') as HTMLElement ||
                        buttonContainer.querySelector('div') as HTMLElement;
          
          // 컨테이너 내부에 뭔가 렌더링되었는지 확인
          const hasContent = buttonContainer.children.length > 0 || buttonContainer.innerHTML.trim().length > 0;
          
          console.log(`🔍 Check attempt ${renderAttempts + 1}/${maxRenderAttempts}:`, {
            hasButton: !!button,
            hasContent,
            childrenCount: buttonContainer.children.length,
            innerHTML: buttonContainer.innerHTML.substring(0, 100)
          });

          if (button || hasContent) {
            console.log('✅ Google button rendered successfully');
            
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

            // 버튼이 있으면 클릭, 없으면 사용자가 직접 클릭하도록 표시
            if (button && button.click) {
              setTimeout(() => {
                if (!resolved) {
                  console.log('🖱️ Auto-clicking Google button...');
                  button.click();
                }
              }, 200);
            } else {
              console.log('ℹ️ Button element found but not clickable, user can click manually');
            }
          } else {
            renderAttempts++;
            if (renderAttempts < maxRenderAttempts) {
              // 아직 시도 중
              setTimeout(checkButton, 500);
            } else {
              // 타임아웃 - 더 자세한 디버깅 정보 제공
              console.error('❌ Google button render timeout after', renderAttempts, 'attempts');
              console.error('📦 Container state:', {
                parent: buttonContainer.parentElement,
                children: buttonContainer.children.length,
                innerHTML: buttonContainer.innerHTML.substring(0, 200),
                style: buttonContainer.style.cssText,
                currentOrigin: window.location.origin,
                clientId: GOOGLE_CLIENT_ID?.substring(0, 20) + '...'
              });
              
              if (buttonContainer.parentNode) {
                buttonContainer.parentNode.removeChild(buttonContainer);
              }
              
              reject(new Error(
                'Google 로그인 버튼을 렌더링할 수 없습니다.\n\n' +
                '가능한 원인:\n' +
                '1. Google Cloud Console에서 클라이언트 ID가 올바른지 확인\n' +
                '2. 승인된 JavaScript 출처에 현재 도메인(' + window.location.origin + ')이 추가되었는지 확인\n' +
                '3. OAuth 동의 화면에서 스코프(openid, email, profile)가 승인되었는지 확인\n' +
                '4. 브라우저 콘솔에서 추가 에러 메시지 확인\n' +
                '5. 네트워크 탭에서 Google API 요청이 실패했는지 확인'
              ));
            }
          }
        };

        // 첫 번째 체크 시작 - initialize 후 충분한 시간을 두고 시작
        // HTTPS 환경에서는 도메인 검증 등으로 인해 더 많은 시간이 필요할 수 있음
        setTimeout(checkButton, 500);
      } catch (renderError: any) {
        if (buttonContainer.parentNode) {
          buttonContainer.parentNode.removeChild(buttonContainer);
        }
        console.error('❌ Google renderButton error:', renderError);
        console.error('❌ Error details:', {
          message: renderError.message,
          stack: renderError.stack,
          name: renderError.name
        });
        reject(new Error('Google 로그인 버튼 렌더링 실패: ' + (renderError.message || '알 수 없는 오류')));
      }
    };

    // initialize 후 약간의 지연을 두고 버튼 렌더링 시도
    // Google SDK가 내부적으로 초기화를 완료할 시간을 줌
    setTimeout(() => {
      tryRenderButton();
    }, 100);
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
      // Google OAuth 스코프 설정: 이메일과 프로필 정보 요청
      // 짧은 형식 사용 (Google Identity Services 권장)
      scope: 'openid email profile',
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
