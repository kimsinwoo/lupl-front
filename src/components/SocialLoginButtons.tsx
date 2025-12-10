// src/components/SocialLoginButtons.tsx
import React, { useState, ReactNode, CSSProperties } from "react";

// Base props for all buttons
type ButtonBaseProps = {
  size?: 40 | 44 | 48;            // 터치 접근성 최소 44 권장
  disabled?: boolean;
  loading?: boolean;
  href?: string;                  // a 태그 링크 리다이렉트 방식
  onClick?: () => void;           // 클릭 핸들러 방식
  ariaLabel: string;              // 예) "Google로 로그인"
  className?: string;
};

// Kakao button props
type KakaoProps = ButtonBaseProps & {
  iconOnly?: boolean;             // Kakao: true면 아이콘-only (검수 리스크 주의)
};

// ─────────────────────────────────────────────────────────────────────────────
// 공식 아이콘/버튼 아트웍은 반드시 각사 배포 자산을 사용하세요.
// /src/assets 경로에 아래 파일명을 두고 import 경로만 맞추면 됩니다.
// Google: google_icon_circle_24.svg  (공식 'G' 컬러 아이콘)
// Naver : naver_icon_24.svg          (공식 아이콘형 'N' 자산 - green/white)
// Kakao : kakao_symbol_black.svg     (심볼), kakao_wordmark_ko.svg (선택)
// ─────────────────────────────────────────────────────────────────────────────

// 만약 svg import 에러가 나면 아래 임시 대체 import 구문 사용 
// (타입스크립트에서 svg를 import할 수 있도록 tsconfig와 d.ts에 설정 필요)
import GoogleIcon from "../assets/google_icon_circle_24.svg?url";
import NaverIcon from "../assets/naver_icon_24.svg?url";
import KakaoSymbol from "../assets/kakao_symbol_black.svg?url";

const px = (n: number) => `${n}px`;

const baseBtnStyle = (
  size: number,
  radius: number,
  bg: string,
  border?: string
): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: px(size),
  height: px(size),
  borderRadius: px(radius),
  background: bg,
  border: border ? `1px solid ${border}` : "none",
  cursor: "pointer",
  userSelect: "none",
  outline: "none",
  textDecoration: "none",
  transition: "transform .04s ease, opacity .15s ease, box-shadow .15s ease",
  boxShadow: "none",
});

const focusRingStyle: CSSProperties = {
  boxShadow: "0 0 0 3px rgba(255,255,255,.35)",
};

const disabledStyle: CSSProperties = {
  opacity: 0.55,
  cursor: "not-allowed",
};

const iconStyle = (iconSize: number): CSSProperties => ({
  width: px(iconSize),
  height: px(iconSize),
  display: "block",
});

const Label = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "-0.2px",
    }}
  >
    {children}
  </span>
);

// 유틸: 링크 또는 버튼으로 렌더
function AsLinkOrButton(props: {
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  style: CSSProperties;
  className?: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  const { href, disabled, onClick, style, className, ariaLabel, children } = props;
  const [focused, setFocused] = useState(false);

  const mergedStyle: CSSProperties = {
    ...style,
    ...(focused ? focusRingStyle : {}),
    ...(disabled ? disabledStyle : {}),
  };

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        aria-label={ariaLabel}
        style={mergedStyle}
        className={className}
        tabIndex={disabled ? -1 : 0}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === " " || e.key === "Enter") {
            (e.currentTarget as HTMLAnchorElement).click();
          }
        }}
        aria-disabled={disabled}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      style={mergedStyle}
      className={className}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

// Google: 아이콘형(공식 컬러 G). 다크 배경에서 많이 쓰는 원형 48px 권장.
export function GoogleIconButton({
  size = 48,
  disabled,
  loading,
  href,
  onClick,
  className,
  ariaLabel,
}: ButtonBaseProps) {
  const diameter = size;
  // 다크 UI에서 사용 빈도 높은 중립 컨테이너
  const style = baseBtnStyle(diameter, diameter / 2, "#131314", "#8E918F");

  const iconSize = Math.round(size * 0.5); // 24px@48 기준
  return (
    <AsLinkOrButton
      href={href}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      className={className}
      ariaLabel={ariaLabel}
    >
      <img src={GoogleIcon} alt="" aria-hidden="true" style={iconStyle(iconSize)} />
    </AsLinkOrButton>
  );
}

// NAVER: 아이콘형. 브랜드 그린 배경 #03C75A + 화이트 N (공식 자산 사용)
export function NaverIconButton({
  size = 48,
  disabled,
  loading,
  href,
  onClick,
  className,
  ariaLabel,
}: ButtonBaseProps) {
  const diameter = size;
  const style = baseBtnStyle(diameter, diameter / 2, "#03C75A");

  const iconSize = Math.round(size * 0.5);
  return (
    <AsLinkOrButton
      href={href}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      className={className}
      ariaLabel={ariaLabel}
    >
      <img src={NaverIcon} alt="" aria-hidden="true" style={iconStyle(iconSize)} />
    </AsLinkOrButton>
  );
}

// Kakao: 공식 권장은 라벨 노출 버튼. 기본: 라벨형, 필요 시 iconOnly=true 제공.
export function KakaoLoginButton({
  size = 48,
  disabled,
  loading,
  href,
  onClick,
  className,
  ariaLabel,
  iconOnly = false,
}: KakaoProps) {
  const height = size;
  const horizontalPadding = Math.round(size * 0.5); // 라벨형 좌우 패딩
  const radius = 12;

  const style: CSSProperties = iconOnly
    ? baseBtnStyle(height, height / 2, "#FEE500")
    : {
        ...baseBtnStyle(height, radius, "#FEE500"),
        padding: `0 ${px(horizontalPadding)}`,
        width: "auto",
      };

  const iconSize = Math.round(size * 0.5);

  return (
    <AsLinkOrButton
      href={href}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      className={className}
      ariaLabel={ariaLabel}
    >
      <img src={KakaoSymbol} alt="" aria-hidden="true" style={{ ...iconStyle(iconSize), marginRight: iconOnly ? 0 : 8 }} />
      {!iconOnly && <Label>카카오로 로그인</Label>}
    </AsLinkOrButton>
  );
}

// 한 번에 쓰고 싶다면 아래 래퍼를 사용하세요.
export function SocialLoginRow({
  googleHref,
  naverHref,
  kakaoHref,
  size = 48,
  gap = 12,
}: {
  googleHref?: string;
  naverHref?: string;
  kakaoHref?: string;
  size?: 40 | 44 | 48;
  gap?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: px(gap),
        alignItems: "center",
      }}
    >
      <GoogleIconButton size={size} href={googleHref} ariaLabel="Google로 로그인" />
      <NaverIconButton size={size} href={naverHref} ariaLabel="NAVER로 로그인" />
      <KakaoLoginButton size={size} href={kakaoHref} ariaLabel="카카오로 로그인" />
    </div>
  );
}
