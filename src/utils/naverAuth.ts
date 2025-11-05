// 네이버 로그인 유틸리티

// 환경 변수에서 가져오기
const NAVER_CLIENT_ID = (import.meta as any).env?.VITE_NAVER_CLIENT_ID;
if (!NAVER_CLIENT_ID) {
  throw new Error('VITE_NAVER_CLIENT_ID is not set in environment variables');
}

const NAVER_CALLBACK_URL = typeof window !== 'undefined' 
  ? `${window.location.origin}/oauth/naver/callback` 
  : 'http://localhost:3000/oauth/naver/callback';

// 네이버 로그인 URL 생성 (OAuth 코드 방식)
export const naverLoginUrl = (): string => {
  const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('naver_state', state);
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: NAVER_CLIENT_ID,
    redirect_uri: NAVER_CALLBACK_URL,
    state: state
    // 네이버는 개발자 콘솔에서 설정한 동의 항목(회원이름, 이메일, 휴대전화번호)이 자동으로 적용됨
    // 필요시 scope 파라미터 추가 가능 (예: scope=name,email,mobile)
  });

  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
};

// 네이버 로그인 (URL로 리다이렉트)
export const naverLogin = () => {
  window.location.href = naverLoginUrl();
};

// OAuth callback에서 code로 access token 받기 (백엔드에서 처리)
export const getNaverAccessToken = async (code: string, state: string): Promise<string> => {
  // state 검증
  const savedState = sessionStorage.getItem('naver_state');
  if (state !== savedState) {
    throw new Error('Invalid state');
  }
  sessionStorage.removeItem('naver_state');

  try {
    // 백엔드 API를 통해 code와 state 전달 (백엔드에서 access token으로 변환)
    const api = (await import('../utils/api')).default;
    const response = await api.post('/auth/naver', { code, state });
    
    // 백엔드에서 이미 처리되었으므로, 여기서는 code와 state만 전달
    // 백엔드에서 access token을 받아 사용자 정보를 가져오고 JWT를 반환
    // 따라서 여기서는 실제 access token을 반환할 필요가 없음
    // 대신 백엔드 응답에서 사용자 정보를 사용
    
    // 하지만 함수 시그니처가 access token을 반환하도록 되어 있으므로,
    // 임시로 빈 문자열을 반환하고 실제 처리는 authService.naverLogin에서 함
    return code; // code를 반환 (실제로는 사용되지 않음)
  } catch (error: any) {
    throw error;
  }
};
