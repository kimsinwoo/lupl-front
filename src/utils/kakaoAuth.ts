// 카카오 로그인 유틸리티 (OAuth 2.0 Authorization Code Flow)

// 환경 변수에서 가져오기
const KAKAO_REST_API_KEY = (import.meta as any).env?.VITE_KAKAO_APP_KEY;
if (!KAKAO_REST_API_KEY) {
  throw new Error('VITE_KAKAO_APP_KEY is not set in environment variables');
}

const KAKAO_CALLBACK_URL = typeof window !== 'undefined' 
  ? `${window.location.origin}/oauth/kakao/callback` 
  : 'http://localhost:3000/oauth/kakao/callback';

// 카카오 로그인 URL 생성 (OAuth 코드 방식)
export const kakaoLoginUrl = (): string => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('kakao_state', state);
  // authorization 요청 시 사용한 redirect_uri를 저장 (토큰 교환 시 동일한 값 사용)
  sessionStorage.setItem('kakao_redirect_uri', KAKAO_CALLBACK_URL);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_CALLBACK_URL,
    state: state,
    scope: 'profile_nickname' // 닉네임만 동의 (카카오 개발자 콘솔에서 동의 항목 설정 확인 필요)
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
};

// 카카오 로그인 (URL로 리다이렉트)
export const kakaoLogin = () => {
  window.location.href = kakaoLoginUrl();
};

// OAuth callback에서 code로 access token 받기 (백엔드에서 처리)
export const getKakaoAccessToken = async (code: string, state: string): Promise<string> => {
  // state 검증
  const savedState = sessionStorage.getItem('kakao_state');
  if (state !== savedState) {
    throw new Error('Invalid state');
  }
  sessionStorage.removeItem('kakao_state');

  try {
    // 백엔드 API를 통해 code와 state 전달 (백엔드에서 access token으로 변환)
    const api = (await import('../utils/api')).default;
    const response = await api.post('/auth/kakao', { code, state });
    
    // 백엔드에서 이미 처리되었으므로, 여기서는 code만 반환 (실제로는 사용되지 않음)
    return code;
  } catch (error: any) {
    throw error;
  }
};

// 더 이상 사용하지 않음 (하위 호환성을 위해 유지)
export const initKakao = () => {
  return Promise.resolve(true);
};

export const kakaoLogout = () => {
  // OAuth code flow에서는 로그아웃이 별도로 필요 없음
  // 세션 정리
  sessionStorage.removeItem('kakao_state');
  sessionStorage.removeItem('kakao_redirect_uri');
};

