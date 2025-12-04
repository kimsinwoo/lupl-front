export interface PortfolioItem {
  id: string;
  title: string;
  category: 'media-art' | 'exhibition' | 'fashion' | 'contest' | 'braille';
  image: string;
  video?: string;
  description: string;
  year: string;
}

export interface Artist {
  id: string;
  name: string;
  nameKo: string;
  image: string;
  bio: string;
  bioKo: string;
  exhibitions: string[];
  category: string;
}

export interface Product {
  id: string;
  name: string;
  nameKo: string;
  category: 'acc' | 'top' | 'bottom';
  price: number;
  images: string[];
  artistId: string;
  description: string;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Digital Dreams Exhibition',
    category: 'media-art',
    image: 'https://images.unsplash.com/photo-1681235014294-588fea095706?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFydCUyMHBhaW50aW5nfGVufDF8fHx8MTc2MTc4MzQ5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'An immersive media art installation exploring the intersection of disability and digital creativity.',
    year: '2024'
  },
  {
    id: '2',
    title: 'Inclusive Spaces',
    category: 'exhibition',
    image: 'https://images.unsplash.com/photo-1761403692053-4d9a9c0284dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBleGhpYml0aW9uJTIwaW5zdGFsbGF0aW9ufGVufDF8fHx8MTc2MTgwNjgwNnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A gallery exhibition showcasing works from disabled artists across various mediums.',
    year: '2024'
  },
  {
    id: '3',
    title: 'Fashion Forward Collection',
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1571867424485-369464ed33cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZGVzaWduJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYxODA2ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Inclusive fashion designs that celebrate diversity and accessibility.',
    year: '2023'
  },
  {
    id: '4',
    title: 'Accessible Art Contest 2024',
    category: 'contest',
    image: 'https://images.unsplash.com/photo-1565799515768-2dcfd834625c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBnYWxsZXJ5JTIwc3BhY2V8ZW58MXx8fHwxNzYxNzQ5MzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Annual art contest celebrating emerging disabled artists.',
    year: '2024'
  },
  {
    id: '5',
    title: 'Tactile Menu Design',
    category: 'braille',
    image: 'https://images.unsplash.com/photo-1519217651866-847339e674d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NjE3MDQzMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Innovative braille menu designs for restaurants and cafes.',
    year: '2024'
  },
  {
    id: '6',
    title: 'Sound and Vision',
    category: 'media-art',
    image: 'https://images.unsplash.com/photo-1625263013526-a10b79ce9cdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBzdHVkaW98ZW58MXx8fHwxNzYxNzQyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'A multisensory media art experience combining audio and visual elements.',
    year: '2023'
  }
];

export const artists: Artist[] = [
  {
    id: '1',
    name: 'Kim Minho',
    nameKo: '김민호',
    image: 'https://images.unsplash.com/photo-1614204424926-196a80bf0be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE3NTI1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Visual artist specializing in abstract painting and digital media. Exploring themes of perception and accessibility.',
    bioKo: '추상화와 디지털 미디어를 전문으로 하는 시각 예술가. 인식과 접근성의 주제를 탐구합니다.',
    exhibitions: ['Seoul Art Fair 2024', 'Inclusive Dreams Exhibition 2023', 'Digital Horizons 2022'],
    category: 'Visual Arts'
  },
  {
    id: '2',
    name: 'Lee Soyeon',
    nameKo: '이소연',
    image: 'https://images.unsplash.com/photo-1614204424926-196a80bf0be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE3NTI1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Fashion designer creating inclusive clothing that combines style with accessibility.',
    bioKo: '스타일과 접근성을 결합한 포용적 의류를 만드는 패션 디자이너.',
    exhibitions: ['Seoul Fashion Week 2024', 'Inclusive Fashion Show 2023'],
    category: 'Fashion Design'
  },
  {
    id: '3',
    name: 'Park Jihoon',
    nameKo: '박지훈',
    image: 'https://images.unsplash.com/photo-1614204424926-196a80bf0be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE3NTI1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Sculptor and installation artist working with tactile materials and interactive experiences.',
    bioKo: '촉각적 재료와 인터랙티브 경험을 다루는 조각가이자 설치 예술가.',
    exhibitions: ['Touch and Feel Exhibition 2024', 'Material Worlds 2023', 'Sensory Art Biennale 2022'],
    category: 'Sculpture'
  },
  {
    id: '4',
    name: 'Choi Yuna',
    nameKo: '최유나',
    image: 'https://images.unsplash.com/photo-1614204424926-196a80bf0be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE3NTI1OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    bio: 'Digital artist creating accessible media art and interactive installations.',
    bioKo: '접근 가능한 미디어 아트와 인터랙티브 설치 작품을 만드는 디지털 아티스트.',
    exhibitions: ['Digital Dreams 2024', 'Interactive Arts Festival 2023'],
    category: 'Digital Media'
  }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Minimal Ring',
    nameKo: '미니멀 링',
    category: 'acc',
    price: 45000,
    images: [
      'https://images.unsplash.com/photo-1655255114527-d0a834d9a774?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwamV3ZWxyeXxlbnwxfHx8fDE3NjE3NDg4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1655255114527-d0a834d9a774?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwamV3ZWxyeXxlbnwxfHx8fDE3NjE3NDg4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    artistId: '1',
    description: 'Handcrafted minimalist ring designed by Kim Minho. Sterling silver with a brushed finish.'
  },
  {
    id: '2',
    name: 'Oversized Art Tee',
    nameKo: '오버사이즈 아트 티',
    category: 'top',
    price: 68000,
    images: [
      'https://images.unsplash.com/photo-1571867424485-369464ed33cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZGVzaWduJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYxODA2ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1571867424485-369464ed33cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZGVzaWduJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYxODA2ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    artistId: '2',
    description: 'Comfortable oversized t-shirt featuring original artwork. 100% organic cotton.'
  },
  {
    id: '3',
    name: 'Wide Leg Pants',
    nameKo: '와이드 레그 팬츠',
    category: 'bottom',
    price: 89000,
    images: [
      'https://images.unsplash.com/photo-1571867424485-369464ed33cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZGVzaWduJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYxODA2ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1571867424485-369464ed33cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwZGVzaWduJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYxODA2ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    artistId: '2',
    description: 'Inclusive design wide leg pants with adaptive features. Made from sustainable materials.'
  },
  {
    id: '4',
    name: 'Statement Necklace',
    nameKo: '스테이트먼트 목걸이',
    category: 'acc',
    price: 72000,
    images: [
      'https://images.unsplash.com/photo-1655255114527-d0a834d9a774?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwamV3ZWxyeXxlbnwxfHx8fDE3NjE3NDg4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1655255114527-d0a834d9a774?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwamV3ZWxyeXxlbnwxfHx8fDE3NjE3NDg4MTN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    artistId: '3',
    description: 'Bold statement necklace designed by Park Jihoon. Mixed media construction.'
  }
];

export const partners = [
  { name: 'Seoul Art Center', logo: '🎨' },
  { name: 'National Museum', logo: '🏛️' },
  { name: 'Design Foundation', logo: '✨' },
  { name: 'Fashion Week Seoul', logo: '👗' },
  { name: 'Accessibility Korea', logo: '♿' },
  { name: 'Creative Industries', logo: '💡' }
];
