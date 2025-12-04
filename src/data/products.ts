// Product type definition for compatibility
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  slug?: string;
  status?: string;
  featured?: boolean;
  gender?: string;
  image?: string; // For ProductCard compatibility
  images?: string[]; // For ProductDetailPage compatibility
  category?: string | {
    id: string;
    name: string;
    slug: string;
  };
  variants?: {
    id: string;
    size: string;
    color: string;
    stock: number;
    sku: string;
  }[];
  sizes?: string[];
  colors?: string[];
  averageRating?: number;
}

