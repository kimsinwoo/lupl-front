import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { PortfolioPage } from './components/pages/PortfolioPage';
import { PortfolioDetail } from './components/pages/PortfolioDetail';
import { ArtistPage } from './components/pages/ArtistPage';
import { ArtistDetail } from './components/pages/ArtistDetail';
import { ShopPage } from './components/pages/ShopPage';
import { ProductDetail } from './components/pages/ProductDetail';
import { ContactPage } from './components/pages/ContactPage';
import { ProductListingPage } from './components/ProductListingPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { CheckoutSuccessPage } from './components/CheckoutSuccessPage';
import { CheckoutFailPage } from './components/CheckoutFailPage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { MyPage } from './components/MyPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { useUser } from './context/UserContext';

// 보호된 라우트 (로그인 필요)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const storedUser = localStorage.getItem('user');
  
  if (!user && !storedUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin 보호된 라우트
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const storedUser = localStorage.getItem('user');
  
  let isAdmin = user?.role === 'admin';
  
  if (!isAdmin && storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      isAdmin = userData?.role === 'admin';
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
    }
  }
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

// 레이아웃 컴포넌트
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

// Wrapper components for React Router integration
const ProductListingPageWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string, productId?: string) => {
    if (page === 'product' && productId) {
      navigate(`/product/${productId}`);
    } else {
      navigate(`/${page}`);
    }
  };
  return <ProductListingPage onNavigate={handleNavigate} />;
};

const ProductDetailPageWrapper = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };
  return <ProductDetailPage productId={productId || ''} onNavigate={handleNavigate} />;
};

const CartPageWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };
  return <CartPage onNavigate={handleNavigate} />;
};

const CheckoutPageWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };
  return <CheckoutPage onNavigate={handleNavigate} />;
};

const MyPageWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string, productId?: string) => {
    if (page === 'product' && productId) {
      navigate(`/product/${productId}`);
    } else {
      navigate(`/${page}`);
    }
  };
  return <MyPage onNavigate={handleNavigate} />;
};

const LoginPageWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };
  return <LoginPage onNavigate={handleNavigate} />;
};

const SignUpPageWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };
  return <SignUpPage onNavigate={handleNavigate} />;
};

const AdminLoginWrapper = () => {
  const navigate = useNavigate();
  const handleLoginSuccess = () => {
    navigate('/admin');
  };
  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
};

const AdminDashboardWrapper = () => {
  const navigate = useNavigate();
  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };
  return <AdminDashboard onNavigate={handleNavigate} />;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Lupl Original Routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/preview_page.html" element={<Layout><HomePage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
        <Route path="/portfolio/:id" element={<Layout><PortfolioDetail /></Layout>} />
        <Route path="/artist" element={<Layout><ArtistPage /></Layout>} />
        <Route path="/artist/:id" element={<Layout><ArtistDetail /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        
        {/* Legacy Shop Routes (still using old pages) */}
        <Route path="/shop" element={<Layout><ShopPage /></Layout>} />
        <Route path="/shop/:id" element={<Layout><ProductDetail /></Layout>} />
        
        {/* New E-commerce Routes */}
        <Route path="/products" element={<Layout><ProductListingPageWrapper /></Layout>} />
        <Route path="/product/:productId" element={<Layout><ProductDetailPageWrapper /></Layout>} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/signup" element={<SignUpPageWrapper />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected Routes */}
        <Route path="/cart" element={<ProtectedRoute><Layout><CartPageWrapper /></Layout></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Layout><CheckoutPageWrapper /></Layout></ProtectedRoute>} />
        <Route path="/checkout/success" element={<ProtectedRoute><Layout><CheckoutSuccessPage /></Layout></ProtectedRoute>} />
        <Route path="/checkout/fail" element={<ProtectedRoute><Layout><CheckoutFailPage /></Layout></ProtectedRoute>} />
        <Route path="/mypage" element={<ProtectedRoute><Layout><MyPageWrapper /></Layout></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginWrapper />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminDashboardWrapper /></AdminProtectedRoute>} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

