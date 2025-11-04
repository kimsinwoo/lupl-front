import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';
import { orderService } from '../services/order.service';
import { reviewService } from '../services/review.service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { ProductCard } from './ProductCard';
import { User, Package, Heart, Settings, Star } from 'lucide-react';
import { toast } from 'sonner';

interface MyPageProps {
  onNavigate: (page: string, productId?: string) => void;
}

/** ===== 타입 정의 ===== */
interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}
interface OrderAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
interface Order {
  id: string;
  orderNumber?: string;
  userId?: string;
  date: string | number | Date;
  total: number;
  status: OrderStatus;
  paymentStatus?: string;
  paymentMethod?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
}

export const MyPage = ({ onNavigate }: MyPageProps) => {
  const { user, favorites, updateProfile, logout } = useUser();
  const { products } = useAdmin();
  const { t } = useLanguage();

  // 번역 폴백: 키 그대로 나오면 대체 문구 사용
  const tf = (key: string, fallback: string) => {
    const v = String(t(key) ?? '');
    return v && v !== key ? v : fallback;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  
  // 리뷰 작성 관련 상태
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ productId: string; productName: string; orderId: string } | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [userReviews, setUserReviews] = useState<Map<string, boolean>>(new Map()); // productId -> hasReview

  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    street: user?.address?.street ?? '',
    city: user?.address?.city ?? '',
    state: user?.address?.state ?? '',
    zipCode: user?.address?.zipCode ?? '',
    country: user?.address?.country ?? '',
  });

  useEffect(() => {
    if (user) {
      void loadOrders();
      void loadFavorites();
      void loadUserReviews();
    } else {
      setFavoriteProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  const loadUserReviews = async () => {
    try {
      // 주문에 포함된 제품들의 리뷰 작성 여부 확인
      const reviewsMap = new Map<string, boolean>();
      for (const order of userOrders) {
        if (order.status === 'delivered') {
          for (const item of order.items) {
            try {
              const response = await reviewService.getProductReviews(item.productId);
              const reviews = Array.isArray(response?.data) ? response.data : (response?.data?.data || []);
              const hasUserReview = reviews.some((review: any) => 
                review.userId === user?.id && review.orderId === order.id
              );
              reviewsMap.set(`${item.productId}-${order.id}`, hasUserReview);
            } catch (error) {
              console.error('Failed to check reviews for product:', item.productId, error);
            }
          }
        }
      }
      setUserReviews(reviewsMap);
    } catch (error) {
      console.error('Failed to load user reviews:', error);
    }
  };
  
  useEffect(() => {
    if (userOrders.length > 0 && user) {
      void loadUserReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOrders, user]);

  const loadFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const { favoriteService } = await import('../services/favorite.service');
      const response = await favoriteService.getFavorites();
      
      console.log('📦 Favorites API Response:', response);
      console.log('📦 Response type:', typeof response);
      console.log('📦 Response.data:', response.data);
      console.log('📦 Is array?', Array.isArray(response.data));
      
      // Extract products from favorites
      const favoriteProductsData: any[] = [];
      
      // Handle different response structures
      let favoritesArray: any[] = [];
      
      if (Array.isArray(response)) {
        // Response is directly an array
        favoritesArray = response;
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          // Response is { data: [...favorites] }
          favoritesArray = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Response is { data: { data: [...favorites] } }
          favoritesArray = response.data.data;
        }
      }
      
      console.log('📦 Favorites array:', favoritesArray);
      console.log('📦 Favorites count:', favoritesArray.length);
      
      favoritesArray.forEach((fav: any, index: number) => {
        console.log(`📦 Favorite ${index}:`, fav);
        
        if (fav.product) {
          // Parse images
          let imageUrl = '';
          try {
            if (Array.isArray(fav.product.images)) {
              imageUrl = fav.product.images[0] || '';
            } else if (typeof fav.product.images === 'string') {
              const parsed = JSON.parse(fav.product.images);
              imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
            }
          } catch (e) {
            console.warn('Failed to parse product images:', e);
          }

          favoriteProductsData.push({
            id: fav.product.id,
            name: fav.product.name,
            price: fav.product.price,
            image: imageUrl || 'https://via.placeholder.com/400',
          });
          console.log(`✅ Added product to favorites:`, fav.product.name);
        } else {
          console.warn(`⚠️ Favorite ${index} has no product:`, fav);
        }
      });
      
      setFavoriteProducts(favoriteProductsData);
      console.log('✅ Favorites loaded:', favoriteProductsData.length, 'products');
    } catch (error) {
      console.error('❌ Failed to load favorites:', error);
      console.error('❌ Error details:', (error as any)?.response?.data || (error as any)?.message);
      toast.error(tf('mypage.loadFavoritesError', 'Failed to load favorites'));
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await orderService.getMyOrders();
      console.log('📦 Orders API Response:', response);
      
      // Axios 응답 구조 처리
      let responseData: any = response;
      if ((response as any).data) {
        responseData = (response as any).data;
      }
      
      console.log('📦 Response Data:', responseData);
      
      // 백엔드 응답 형식: { success: true, data: orders[] }
      let ordersArray: any[] = [];
      
      if (responseData?.success && responseData?.data) {
        // data가 배열인 경우
        if (Array.isArray(responseData.data)) {
          ordersArray = responseData.data;
        } 
        // data가 객체이고 orders 속성이 있는 경우
        else if (responseData.data.orders && Array.isArray(responseData.data.orders)) {
          ordersArray = responseData.data.orders;
        }
      } 
      // 직접 배열인 경우
      else if (Array.isArray(responseData)) {
        ordersArray = responseData;
      }
      
      console.log('📦 Parsed Orders Array:', ordersArray);
      console.log('📦 Orders Count:', ordersArray.length);

      const orders: Order[] = ordersArray.map((order: any): Order => {
        const items: OrderItem[] = (order.items ?? []).map((item: any): OrderItem => {
          // 이미지 파싱
          let productImages: string[] = [];
          if (item.product?.images) {
            if (Array.isArray(item.product.images)) {
              productImages = item.product.images;
            } else if (typeof item.product.images === 'string') {
              try {
                const parsed = JSON.parse(item.product.images);
                productImages = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                productImages = [item.product.images];
              }
            }
          }
          
          return {
            productId: String(item.productId || item.product?.id || ''),
            productName: item.product?.name || item.productName || 'Unknown Product',
            productImage: productImages[0] || item.productImage || '',
            quantity: Number(item.quantity ?? 0),
            size: item.variant?.size || item.size || '',
            color: item.variant?.color || item.color || '',
            price: Number(item.price ?? item.product?.price ?? 0),
          };
        });
        
        return {
          id: String(order.id),
          orderNumber: order.orderNumber || order.order_number || `ORDER-${order.id}`,
          userId: order.userId || order.user_id || '',
          date: order.createdAt || order.created_at || order.date || new Date().toISOString(),
          total: Number(order.total ?? 0),
          status: (order.status || 'pending') as OrderStatus,
          paymentStatus: order.paymentStatus || order.payment_status || 'pending',
          paymentMethod: order.paymentMethod || order.payment_method || '',
          items: items,
          shippingAddress: {
            street: order.shippingAddress1 || order.shipping_address1 || order.shippingAddress?.street || '',
            city: order.shippingCity || order.shipping_city || order.shippingAddress?.city || '',
            state: order.shippingState || order.shipping_state || order.shippingAddress?.state || '',
            zipCode: order.shippingZip || order.shipping_zip || order.shippingAddress?.zipCode || '',
            country: order.shippingCountry || order.shipping_country || order.shippingAddress?.country || 'Korea',
          },
        };
      });

      console.log('📦 Final Orders:', orders);
      setUserOrders(orders);
    } catch (error: any) {
      console.error('❌ Failed to load orders:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      toast.error(tf('mypage.loadOrdersError', '주문 목록을 불러올 수 없습니다'));
    } finally {
      setIsLoadingOrders(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24 flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-wide mb-6">
            {tf('mypage.loginRequired', 'PLEASE LOGIN')}
          </h2>
          <Button
            onClick={() => onNavigate('login')}
            className="tracking-wide px-6 py-2 text-base bg-[#5842FF] text-white hover:bg-[#5842FF]/80"
          >
            {tf('mypage.goToLogin', 'GO TO LOGIN')}
          </Button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });
      setIsEditing(false);
      toast.success(tf('mypage.profileUpdated', 'Profile updated successfully'));
    } catch {
      toast.error('프로필 업데이트에 실패했습니다');
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('home');
    toast.success(tf('mypage.loggedOut', 'Logged out successfully'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/15 text-yellow-300 ring-1 ring-inset ring-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-500/30';
      case 'shipped':
        return 'bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-500/30';
      case 'delivered':
        return 'bg-green-500/15 text-green-300 ring-1 ring-inset ring-green-500/30';
      case 'cancelled':
        return 'bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-500/30';
      default:
        return 'bg-white/10 text-white/70 ring-1 ring-inset ring-white/20';
    }
  };
  
  const handleOpenReviewDialog = (productId: string, productName: string, orderId: string) => {
    setSelectedProductForReview({ productId, productName, orderId });
    setReviewRating(5);
    setReviewComment('');
    setIsReviewDialogOpen(true);
  };
  
  const handleSubmitReview = async () => {
    if (!selectedProductForReview) return;
    
    if (!reviewComment.trim()) {
      toast.error('리뷰 내용을 입력해주세요');
      return;
    }
    
    try {
      await reviewService.createReview({
        productId: selectedProductForReview.productId,
        orderId: selectedProductForReview.orderId,
        rating: reviewRating,
        comment: reviewComment,
      });
      
      toast.success('리뷰가 작성되었습니다');
      setIsReviewDialogOpen(false);
      setSelectedProductForReview(null);
      setReviewRating(5);
      setReviewComment('');
      await loadUserReviews();
    } catch (error: any) {
      console.error('Failed to create review:', error);
      toast.error(error.response?.data?.message || '리뷰 작성에 실패했습니다');
    }
  };
  
  const hasReviewed = (productId: string, orderId: string) => {
    return userReviews.get(`${productId}-${orderId}`) || false;
  };


  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-32 pb-16 sm:pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-wide mb-2 text-white">
            {tf('mypage.title', 'MY PAGE')}
          </h1>
          <p className="text-base md:text-lg tracking-wide text-white/70">
            {tf('mypage.welcome', 'Welcome back')},{' '}
            <span className="font-medium text-white">{user.name}</span>
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="flex justify-center w-full gap-2 md:gap-4 rounded-lg shadow-sm max-w-xl mx-auto mb-6">
            <TabsTrigger
              value="profile"
              className="tracking-wide gap-2 py-2 px-4 text-sm md:text-base rounded-md transition text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <User className="w-4 h-4" />
              {tf('mypage.profile', 'PROFILE')}
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="tracking-wide gap-2 py-2 px-4 text-sm md:text-base rounded-md transition text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4" />
              {tf('mypage.orders', 'ORDERS')}
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="tracking-wide gap-2 py-2 px-4 text-sm md:text-base rounded-md transition text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Heart className="w-4 h-4" />
              {tf('mypage.favorites', 'FAVORITES')}
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-8">
            <div className="max-w-2xl mx-auto bg-white/5 text-white rounded-2xl p-6 sm:p-10 shadow-lg border border-white/10 ring-1 ring-white/5">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold tracking-wide mb-3 md:mb-0 text-white">
                  {tf('mypage.profileInfo', 'PROFILE INFORMATION')}
                </h2>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="tracking-wide gap-2 border-white/20 text-white/70 hover:bg-white/10"
                    style={{ color: 'black' }}
                  >
                    <Settings className="w-4 h-4" style={{ color: 'black' }} />
                    {tf('mypage.edit', 'EDIT')}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="tracking-wide bg-[#5842FF] text-white hover:bg-[#5842FF]/80"
                    >
                      {tf('mypage.save', 'SAVE')}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name,
                          phone: user.phone,
                          street: user.address?.street ?? '',
                          city: user.address?.city ?? '',
                          state: user.address?.state ?? '',
                          zipCode: user.address?.zipCode ?? '',
                          country: user.address?.country ?? '',
                        });
                      }}
                      variant="outline"
                      className="tracking-wide border-white/20 text-white/70 hover:bg-white/10"
                      style={{ color: 'black' }}
                    >
                      {tf('mypage.cancel', 'CANCEL')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm tracking-wide text-white">
                      {tf('mypage.name', 'NAME')}
                    </Label>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#5842FF]/50"
                        autoComplete="name"
                      />
                    ) : (
                      <p className="py-2 text-white">{user.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm tracking-wide text-white">
                      {tf('mypage.email', 'EMAIL')}
                    </Label>
                    <p className="py-2 text-white/70">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm tracking-wide text-white">
                    {tf('mypage.phone', 'PHONE')}
                  </Label>
                  {isEditing ? (
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="bg-neutral-900 border-neutral-700 text-white placeholder-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-300"
                      autoComplete="tel"
                    />
                  ) : (
                    <p className="py-2 text-white">{user.phone ?? '-'}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-medium tracking-wide mb-3 text-white">
                    {tf('mypage.address', 'ADDRESS')}
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm tracking-wide text-white">
                        {tf('mypage.street', 'STREET')}
                      </Label>
                      {isEditing ? (
                        <Input
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#5842FF]/50"
                          autoComplete="street-address"
                        />
                      ) : (
                        <p className="py-2 text-white">{user.address?.street ?? '-'}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm tracking-wide text-white">
                          {tf('mypage.city', 'CITY')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#5842FF]/50"
                            autoComplete="address-level2"
                          />
                        ) : (
                          <p className="py-2 text-white">{user.address?.city ?? '-'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm tracking-wide text-white">
                          {tf('mypage.state', 'STATE')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#5842FF]/50"
                            autoComplete="address-level1"
                          />
                        ) : (
                          <p className="py-2 text-white">{user.address?.state ?? '-'}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm tracking-wide text-white">
                          {tf('mypage.zipCode', 'ZIP CODE')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#5842FF]/50"
                            autoComplete="postal-code"
                          />
                        ) : (
                          <p className="py-2 text-white">{user.address?.zipCode ?? '-'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm tracking-wide text-white">
                          {tf('mypage.country', 'COUNTRY')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-[#5842FF]/50"
                            autoComplete="country-name"
                          />
                        ) : (
                          <p className="py-2 text-white">{user.address?.country ?? '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full tracking-wide py-3 font-semibold border-white/20 text-white hover:bg-white/10"
                    style={{ color: 'black' }}
                  >
                    {tf('mypage.logout', 'LOGOUT')}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-center mb-8 text-white">
              {tf('mypage.orderHistory', 'ORDER HISTORY')}
            </h2>

            {isLoadingOrders ? (
              <div className="flex justify-center py-12">
                <span className="text-white/70 text-sm">Loading...</span>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto mb-3 text-white/30" />
                <p className="text-white/70 tracking-wide">
                  {tf('mypage.noOrders', 'No orders yet')}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white/5 text-white rounded-xl p-6 shadow-lg border border-white/10 ring-1 ring-white/5"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <p className="font-medium tracking-wide mb-1 text-white">
                          {tf('mypage.orderNumber', 'ORDER')} #{order.id}
                        </p>
                        <p className="text-xs text-white/70">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} rounded px-3 py-1 text-xs font-semibold`}>
                        {String(order.status).toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-3 border-t border-white/10 pt-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 mb-3 pb-3 border-b border-white/10 last:border-b-0"
                        >
                          {/* 이미지 */}
                          <div className="flex-shrink-0 flex items-center justify-center overflow-hidden rounded-lg bg-white/5" style={{ width: '100px', height: '100px' }}>
                            <img
                              src={item.productImage ? item.productImage : '/placeholder.svg'}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* 이름 및 옵션 */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="text-white text-base font-semibold leading-tight break-words">
                              {item.productName}
                            </h3>
                            <p className="text-white/70 mt-1 text-xs">
                              {item.size} <span className="mx-1">/</span> {item.color}
                            </p>
                            <span className="text-white/60 text-xs mt-1">
                              {tf('mypage.quantity', 'Qty')}: {item.quantity}
                            </span>
                            {/* 리뷰 작성 버튼 - DELIVERED 상태일 때만 표시 */}
                            {order.status === 'delivered' && (
                              <div className="mt-2">
                                {hasReviewed(item.productId, order.id) ? (
                                  <Badge className="bg-green-500/20 text-green-300 text-xs">
                                    리뷰 작성 완료
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 bg-[#5842FF] border-[#5842FF] text-white hover:bg-[#5842FF]/80"
                                    onClick={() => handleOpenReviewDialog(item.productId, item.productName, order.id)}
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    리뷰 작성
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                           {/* 세부 가격 */}
                           <span className="text-white text-sm sm:text-base font-semibold tabular-nums" style={{ whiteSpace: 'nowrap' }}>
                             ${Number(item.price ?? 0).toFixed(2)}
                           </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                      <p className="tracking-wide font-medium text-white/70">
                        {tf('mypage.total', 'TOTAL')}
                      </p>
                      <p className="text-lg tracking-wide font-bold text-white">
                        ${((Number(order.total ?? 0)) / 1300).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-center mb-8 text-white">
              {tf('mypage.wishlist', 'MY WISHLIST')}
            </h2>

            {isLoadingFavorites ? (
              <div className="text-center py-16">
                <p className="text-white/70 tracking-wide">
                  {tf('mypage.loading', 'Loading...')}
                </p>
              </div>
            ) : favoriteProducts.length === 0 ? (
              <div className="text-center py-16 max-w-xl mx-auto">
                <Heart className="w-12 h-12 mx-auto mb-2 text-white/30" />
                <p className="text-white/70 tracking-wide mb-8">
                  {tf('mypage.noFavorites', 'No favorites yet')}
                </p>
                <Button
                  onClick={() => onNavigate('shop')}
                  className="tracking-wide px-7 py-2 bg-[#5842FF] text-white hover:bg-[#5842FF]/80"
                >
                  {tf('mypage.shopNow', 'SHOP NOW')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favoriteProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 리뷰 작성 다이얼로그 */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="bg-black border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">리뷰 작성</DialogTitle>
            <DialogDescription className="text-white/70">
              {selectedProductForReview?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* 별점 선택 */}
            <div>
              <Label className="text-white mb-2 block">별점</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewRating(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        rating <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-white/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* 리뷰 내용 */}
            <div>
              <Label htmlFor="review-comment" className="text-white mb-2 block">
                리뷰 내용
              </Label>
              <Textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="리뷰를 작성해주세요"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/30 min-h-[120px]"
              />
            </div>
            
            {/* 버튼 */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmitReview}
                className="flex-1 bg-[#5842FF] hover:bg-[#5842FF]/80 text-white"
              >
                작성 완료
              </Button>
              <Button
                onClick={() => setIsReviewDialogOpen(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
