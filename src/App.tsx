import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { AppRouter } from './AppRouter';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  return (
    <LanguageProvider>
      <UserProvider>
        <CartProvider>
          <AdminProvider>
            <>
              <AppRouter />
              <Toaster />
            </>
          </AdminProvider>
        </CartProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default function App() {
  return <AppContent />;
}
