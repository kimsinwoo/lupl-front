import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminService } from '../services/admin.service';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingZip?: string;
  shippingCountry?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
  }[];
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: any;
  category: string;
  gender?: string;
  sizes?: string[];
  colors?: string[];
  description?: string;
  careInfo?: string;
  composition?: string;
  status?: string;
  featured?: boolean;
  createdAt?: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  loadProducts: () => Promise<void>;
  loadOrders: () => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentStatus?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          setIsAuthenticated(true);
          loadProducts();
          loadOrders();
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (password: string): Promise<boolean> => {
    // Admin login is handled through the auth system
    // This is just for backward compatibility
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
          setIsAuthenticated(true);
          await loadProducts();
          await loadOrders();
          return true;
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setProducts([]);
    setOrders([]);
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getAllProducts();
      console.log('📦 Loaded products:', response);
      
      let productsData = response;
      if ((response as any).data) {
        productsData = (response as any).data;
      }
      
      const productsArray = Array.isArray(productsData) ? productsData : (productsData as any).products || [];
      
      // Transform to match Product interface
      const transformedProducts: Product[] = productsArray.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: Array.isArray(p.images) ? p.images[0] : (typeof p.images === 'string' ? (JSON.parse(p.images)?.[0] || '') : ''),
        images: p.images,
        category: p.category?.slug || p.category || 'accessories',
        gender: p.gender || 'unisex',
        description: p.description || '',
        careInfo: p.careInfo || '',
        composition: p.composition || '',
        status: p.status || 'active',
        featured: p.featured || false,
        createdAt: p.createdAt,
      }));
      
      setProducts(transformedProducts);
    } catch (error: any) {
      console.error('❌ Failed to load products:', error);
      toast.error('상품 목록을 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getAllOrders();
      console.log('📦 Loaded orders:', response);
      
      let ordersData = response;
      if ((response as any).data) {
        ordersData = (response as any).data;
      }
      
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      
      // Transform to match Order interface
      const transformedOrders: Order[] = ordersArray.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber || o.id,
        date: o.createdAt || new Date().toISOString(),
        customerName: o.user?.name || o.shippingName || 'Unknown',
        email: o.user?.email || 'unknown@example.com',
        total: o.total || 0,
        status: o.status || 'pending',
        paymentStatus: o.paymentStatus || 'pending',
        // 배송지 정보 포함
        shippingName: o.shippingName || o.user?.name || 'Unknown',
        shippingPhone: o.shippingPhone || o.user?.phone || '',
        shippingAddress1: o.shippingAddress1 || '',
        shippingAddress2: o.shippingAddress2 || '',
        shippingCity: o.shippingCity || '',
        shippingZip: o.shippingZip || '',
        shippingCountry: o.shippingCountry || 'South Korea',
        items: o.items?.map((item: any) => ({
          productId: item.productId,
          productName: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          size: item.variant?.size || '',
          color: item.variant?.color || '',
          price: item.price || 0,
        })) || [],
        createdAt: o.createdAt,
      }));
      
      setOrders(transformedOrders);
    } catch (error: any) {
      console.error('❌ Failed to load orders:', error);
      toast.error('주문 목록을 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (product: any) => {
    try {
      setIsLoading(true);
      const response = await adminService.createProduct(product);
      toast.success('상품이 추가되었습니다');
      await loadProducts();
    } catch (error: any) {
      console.error('❌ Failed to add product:', error);
      toast.error('상품 추가에 실패했습니다');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      setIsLoading(true);
      await adminService.updateProduct(id, updatedProduct);
      toast.success('상품이 수정되었습니다');
      await loadProducts();
    } catch (error: any) {
      console.error('❌ Failed to update product:', error);
      toast.error('상품 수정에 실패했습니다');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setIsLoading(true);
      await adminService.deleteProduct(id);
      toast.success('상품이 삭제되었습니다');
      await loadProducts();
    } catch (error: any) {
      console.error('❌ Failed to delete product:', error);
      toast.error('상품 삭제에 실패했습니다');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: string) => {
    try {
      setIsLoading(true);
      await adminService.updateOrderStatus(orderId, status, paymentStatus);
      toast.success('주문 상태가 업데이트되었습니다');
      await loadOrders();
    } catch (error: any) {
      console.error('❌ Failed to update order status:', error);
      toast.error('주문 상태 업데이트에 실패했습니다');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadProducts(), loadOrders()]);
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        products,
        orders,
        isLoading,
        loadProducts,
        loadOrders,
        addProduct,
        updateProduct,
        deleteProduct,
        updateOrderStatus,
        refreshData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
