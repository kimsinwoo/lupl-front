import React from 'react';
import { Product } from '../data/products';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onNavigate?: (page: string, productId?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onNavigate }) => {
  const { isFavorite, toggleFavorite } = useUser();
  const isFav = isFavorite(product.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick
    await toggleFavorite(product.id);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else if (onNavigate) {
      onNavigate('product', product.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer space-y-4 transition-all hover:scale-105 relative"
    >
      <div className="aspect-[3/4] overflow-hidden bg-white/5 rounded-lg relative">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all z-10"
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>
      </div>
      <div className="space-y-2">
        <div className="text-base font-medium text-white group-hover:text-[#5842FF] transition-colors">
          {product.name}
        </div>
        <div className="text-lg font-bold text-[#5842FF]">${product.price}</div>
      </div>
    </div>
  );
};
