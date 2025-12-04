import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from './ProductCard';
import { Checkbox } from './ui/checkbox';
import { productService } from '../services/product.service';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Filter } from 'lucide-react';

interface ProductListingPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  
  useEffect(() => {
    loadProducts();
  }, [selectedCategories, selectedGenders]);
  
  const loadProducts = async () => {
    try {
      const category = selectedCategories.length > 0 ? selectedCategories[0] : undefined;
      const gender = selectedGenders.length > 0 ? selectedGenders[0] : undefined;
      
      const response = await productService.getAll({
        page: 1,
        limit: 100,
        category,
        gender,
        status: 'active'
      });
      
      const responseAny: any = response;
      let actualData: any = responseAny;
      if (responseAny?.data && (responseAny?.status || responseAny?.headers)) {
        actualData = responseAny.data;
      }
      if (actualData?.data?.data) {
        actualData = actualData.data;
      }
      
      const productsArray = actualData?.data?.products || actualData?.products || [];
      
      if (Array.isArray(productsArray) && productsArray.length > 0) {
        const transformedProducts = productsArray.map((p: any) => {
          let imageUrl = '';
          try {
            if (Array.isArray(p.images)) {
              imageUrl = p.images[0] || '';
            } else if (typeof p.images === 'string') {
              const parsed = JSON.parse(p.images);
              imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
            }
          } catch (e) {
            console.warn('Failed to parse images for product:', p.id, e);
          }

          const sizesSet = new Set<string>();
          const colorsSet = new Set<string>();
          
          if (p.variants && Array.isArray(p.variants)) {
            p.variants.forEach((v: any) => {
              if (v.size) sizesSet.add(v.size);
              if (v.color) colorsSet.add(v.color);
            });
          }
          
          const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : ['S', 'M', 'L'];
          const colors = colorsSet.size > 0 ? Array.from(colorsSet) : ['Black'];

          return {
            id: p.id,
            name: p.name,
            price: p.price,
            image: imageUrl || '',
            category: p.category?.slug || 'accessories',
            gender: p.gender || 'unisex',
            sizes,
            colors,
          };
        });
        
        setProducts(transformedProducts);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      toast.error(`상품을 불러올 수 없습니다: ${error.message || 'API 연결 실패'}`);
    }
  };

  const categories = ['tops', 'bottoms', 'outerwear', 'accessories'];
  const genders = ['women', 'men', 'unisex'];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  const filteredProducts = products;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Shop</h1>
          <p className="text-white/60">{filteredProducts.length} products available</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64">
            <div className="lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </h2>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="lg:hidden text-white/60 hover:text-white"
                >
                  {isFilterOpen ? 'Hide' : 'Show'}
                </button>
              </div>
              
              {(isFilterOpen || window.innerWidth >= 1024) && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">Category</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center gap-3">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label
                            htmlFor={category}
                            className="cursor-pointer capitalize text-white hover:text-[#5842FF] transition-colors"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">Gender</h3>
                    <div className="space-y-3">
                      {genders.map((gender) => (
                        <div key={gender} className="flex items-center gap-3">
                          <Checkbox
                            id={gender}
                            checked={selectedGenders.includes(gender)}
                            onCheckedChange={() => toggleGender(gender)}
                          />
                          <label
                            htmlFor={gender}
                            className="cursor-pointer capitalize text-white hover:text-[#5842FF] transition-colors"
                          >
                            {gender}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(selectedCategories.length > 0 || selectedGenders.length > 0) && (
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setSelectedGenders([]);
                      }}
                      className="text-sm text-[#5842FF] hover:text-[#5842FF]/80 underline transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-white/60 text-lg">
                  {selectedCategories.length > 0 || selectedGenders.length > 0 
                    ? 'No products found matching your filters' 
                    : 'No products available'}
                </p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard
                      product={product}
                      onClick={() => onNavigate('product', product.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
