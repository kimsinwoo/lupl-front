import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt?: string;
}

export interface UserOrder {
  id: string;
  userId: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  favorites: string[];
  userOrders: UserOrder[];
  login: (email: string, password: string) => boolean;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => boolean;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  addUserOrder: (order: UserOrder) => void;
  updateUserFromStorage: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);

  // Load favorites from API when user logs in
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const { favoriteService } = await import('../services/favorite.service');
          const response = await favoriteService.getFavorites();
          
          // Extract product IDs from favorites
          // 백엔드는 { success: true, data: favorites } 형태로 응답
          // api.get()은 이미 response.data를 반환하므로 response는 { success: true, data: favorites }
          const favoriteIds: string[] = [];
          
          let favoritesArray: any[] = [];
          if (response.success && response.data && Array.isArray(response.data)) {
            favoritesArray = response.data;
          } else if (Array.isArray(response)) {
            favoritesArray = response;
          } else if (Array.isArray(response.data)) {
            favoritesArray = response.data;
          }
          
          favoritesArray.forEach((fav: any) => {
            if (fav.productId) {
              favoriteIds.push(fav.productId);
            }
          });
          
          setFavorites(favoriteIds);
          console.log('✅ Favorites loaded:', favoriteIds);
        } catch (error) {
          console.error('❌ Failed to load favorites:', error);
        }
      } else {
        setFavorites([]);
      }
    };

    loadFavorites();
  }, [user]);

  // Initialize from localStorage
  useEffect(() => {
    const loadUserFromStorage = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('✅ User loaded from localStorage:', userData.email);
        } catch (error) {
          console.error('Failed to parse user from localStorage', error);
          localStorage.removeItem('user');
        }
      }
    };
    
    loadUserFromStorage();
    
    // localStorage 변경 감지 (다른 탭에서 로그인/로그아웃 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue);
            setUser(userData);
          } catch (error) {
            console.error('Failed to parse user from storage event', error);
          }
        } else {
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 같은 탭에서의 localStorage 변경 감지를 위한 커스텀 이벤트
    const handleCustomStorageChange = () => {
      console.log('🔄 userUpdated event received, reloading user from storage...');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('✅ User updated in context:', userData.email);
        } catch (error) {
          console.error('Failed to parse user from localStorage', error);
        }
      } else {
        setUser(null);
        console.log('⚠️ User removed from storage');
      }
    };
    
    window.addEventListener('userUpdated', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleCustomStorageChange);
    };
  }, []);

  const login = (email: string, password: string): boolean => {
    // This function is kept for backward compatibility
    // Actual login should be done through authService.login()
    // This will be called from LoginPage after API authentication succeeds
    return false;
  };

  const signup = (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }): boolean => {
    // This function is kept for backward compatibility
    // Actual signup should be done through authService.register()
    // This will be called from SignUpPage after API registration succeeds
    return false;
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (세션 삭제)
      const { authService } = await import('../services/auth.service');
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    setUser(null);
    setFavorites([]);
    setUserOrders([]);
    localStorage.removeItem('user');
    console.log('✅ User logged out');
  };
  
  // localStorage에서 사용자 정보를 직접 업데이트하는 함수 추가
  const updateUserFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        return true;
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        return false;
      }
    }
    return false;
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) {
      console.error('❌ Cannot update profile: user is null');
      throw new Error('User is not logged in');
    }

    try {
      console.log('📝 Updating profile with data:', userData);
      const { userService } = await import('../services/user.service');
      const response = await userService.updateProfile(userData as any);
      
      console.log('📝 Profile update response:', response);
      
      // 응답 구조 처리
      let userDataResponse = response;
      
      // api.put는 response.data를 반환하므로, 이미 파싱된 상태
      // 구조 1: { success: true, data: { ...user }, message: '...' }
      if (response && response.success && response.data) {
        userDataResponse = response;
      }
      // 구조 2: { data: { success: true, data: { ...user } } } - 중첩된 경우
      else if ((response as any).data?.data) {
        userDataResponse = (response as any).data;
      }
      // 구조 3: data 자체가 user 객체인 경우
      else if (response && (response as any).id) {
        userDataResponse = {
          success: true,
          data: response,
          message: 'Profile updated successfully'
        };
      }
      
      console.log('📝 Processed userDataResponse:', userDataResponse);
      
      if (userDataResponse && userDataResponse.success && userDataResponse.data) {
        const updatedUser = userDataResponse.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('✅ Profile updated successfully:', updatedUser);
      } else {
        console.error('❌ Invalid response structure:', userDataResponse);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      // Show login prompt
      const { toast } = await import('sonner');
      toast.error('Please login to add favorites');
      return;
    }

    try {
      const { favoriteService } = await import('../services/favorite.service');
      const response = await favoriteService.toggleFavorite(productId);
      
      if (response.success) {
        // Update local state
        if (response.isFavorite) {
          setFavorites([...favorites, productId]);
        } else {
          setFavorites(favorites.filter((id) => id !== productId));
        }

        const { toast } = await import('sonner');
        toast.success(response.message || (response.isFavorite ? 'Added to favorites' : 'Removed from favorites'));
      }
    } catch (error: any) {
      console.error('❌ Failed to toggle favorite:', error);
      const { toast } = await import('sonner');
      toast.error(error.response?.data?.message || 'Failed to update favorite');
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const addUserOrder = (order: UserOrder) => {
    if (!user) return;

    const newOrders = [order, ...userOrders];
    setUserOrders(newOrders);
    // Order creation should be done through API (orderService)
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        favorites,
        userOrders,
        login,
        signup,
        logout,
        updateProfile,
        toggleFavorite,
        isFavorite,
        addUserOrder,
        updateUserFromStorage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
