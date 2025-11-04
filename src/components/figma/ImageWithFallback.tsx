import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  // Properly destructure with default values
  const {
    src = '',
    alt = '',
    style,
    className = '',
    width,
    height,
    aspectRatio,
    loading = 'lazy',
    ...rest
  } = props as ImageWithFallbackProps & {
    src?: string;
    alt?: string;
    style?: React.CSSProperties;
    className?: string;
    loading?: 'lazy' | 'eager';
  }

  // If className contains w-full or h-full, don't constrain with maxWidth
  const shouldFillContainer = className.includes('w-full') && className.includes('h-full');
  const hasExplicitSizing = style && (style.width || style.height || style.minWidth || style.minHeight);
  
  // Calculate aspect ratio from width/height or use provided aspectRatio
  const imageStyle: React.CSSProperties = {
    ...style,
    // Only apply maxWidth if image shouldn't fill container and no explicit sizing
    ...(!shouldFillContainer && !hasExplicitSizing && { maxWidth: '100%' }),
    // Only apply height: auto if height isn't explicitly set via className or style
    ...(!className.includes('h-full') && !height && !style?.height && !hasExplicitSizing && { height: 'auto' }),
    ...(width && !style?.width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && !style?.height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...(aspectRatio && { aspectRatio }),
  }

  // Prepare img props for HTML attributes
  const baseImgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    ...rest,
    loading: loading as 'lazy' | 'eager' | undefined,
    decoding: 'async',
  }

  // Add numeric width/height as HTML attributes for layout stability
  if (width && typeof width === 'number') {
    baseImgProps.width = width
  }
  if (height && typeof height === 'number') {
    baseImgProps.height = height
  }

  return didError ? (
    <div
      className={`inline-block bg-white/5 text-center align-middle flex items-center justify-center ${className}`}
      style={imageStyle}
    >
      <div className="flex items-center justify-center w-full h-full p-4">
        <img 
          src={ERROR_IMG_SRC} 
          alt="Error loading image" 
          className="opacity-30" 
          {...baseImgProps} 
          data-original-url={src}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
        />
      </div>
    </div>
  ) : (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} ${!className.includes('object-') ? 'object-cover' : ''}`} 
      style={imageStyle}
      {...baseImgProps}
      onError={handleError}
    />
  )
}
