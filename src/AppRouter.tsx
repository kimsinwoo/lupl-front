import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useUser } from './context/UserContext';

// Lazy load components for code splitting
const HomePage = lazy(() => import('./components/pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./components/pages/AboutPage').then(m => ({ default: m.AboutPage })));
const PortfolioPage = lazy(() => import('./components/pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const PortfolioDetail = lazy(() => import('./components/pages/PortfolioDetail').then(m => ({ default: m.PortfolioDetail })));
const ArtistPage = lazy(() => import('./components/pages/ArtistPage').then(m => ({ default: m.ArtistPage })));
const ArtistDetail = lazy(() => import('./components/pages/ArtistDetail').then(m => ({ default: m.ArtistDetail })));
const ShopPage = lazy(() => import('./components/pages/ShopPage').then(m => ({ default: m.ShopPage })));
const ProductDetail = lazy(() => import('./components/pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const ContactPage = lazy(() => import('./components/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const ProductListingPage = lazy(() => import('./components/ProductListingPage').then(m => ({ default: m.ProductListingPage })));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./components/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const CheckoutSuccessPage = lazy(() => import('./components/CheckoutSuccessPage').then(m => ({ default: m.CheckoutSuccessPage })));
const CheckoutFailPage = lazy(() => import('./components/CheckoutFailPage').then(m => ({ default: m.CheckoutFailPage })));
const LoginPage = lazy(() => import('./components/LoginPage').then(m => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import('./components/SignUpPage').then(m => ({ default: m.SignUpPage })));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const MyPage = lazy(() => import('./components/MyPage').then(m => ({ default: m.MyPage })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

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
    <div className="min-h-screen bg-black flex flex-col overflow-x-hidden w-full">
      <Header />
      <main className="w-full">{children}</main>
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

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white">Loading...</div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </BrowserRouter>
  );
};

