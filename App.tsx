import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Layout from './components/Layout';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import ProfileDashboard from './components/ProfileDashboard';
import AdminPanel from './components/AdminPanel';
import Auth from './components/Auth';
import GoogleOAuthCallback from './components/GoogleOAuthCallback';
import ToyGeni from './components/ToyGeni';
import FAQs from './components/FAQs';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement; role?: UserRole }> = ({ children, role }) => {
  const { user } = useStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
      <Route path="/faq" element={<FAQs />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role={UserRole.ADMIN}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const AppContent: React.FC = () => {
  return (
    <Layout>
      <AppRoutes />
      <ToyGeni />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </HashRouter>
  );
};

export default App;
