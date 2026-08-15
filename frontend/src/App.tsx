import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import NeedsPage from './pages/NeedsPage';
import NeedDetailPage from './pages/NeedDetailPage';
import OffersPage from './pages/OffersPage';
import ReportNeedPage from './pages/ReportNeedPage';
import OfferHelpPage from './pages/OfferHelpPage';
import DashboardPage from './pages/DashboardPage';
import CollectionCentersPage from './pages/CollectionCentersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';

// Agregar estas importaciones en App.tsx
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import FAQPage from './pages/FAQPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Agregar estas rutas en el Router
<Routes>
<Route path="/about" element={<AboutPage />} />
<Route path="/contact" element={<ContactPage />} />
<Route path="/privacy" element={<PrivacyPage />} />
<Route path="/terms" element={<TermsPage />} />
<Route path="/faq" element={<FAQPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
</Routes>

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mapa" element={<MapPage />} />
              <Route path="/necesidades" element={<NeedsPage />} />
              <Route path="/necesidades/:id" element={<NeedDetailPage />} />
              <Route path="/ayudas" element={<OffersPage />} />
              <Route path="/reportar-necesidad" element={
                <ProtectedRoute>
                  <ReportNeedPage />
                </ProtectedRoute>
              } />
              <Route path="/ofrecer-ayuda" element={
                <ProtectedRoute>
                  <OfferHelpPage />
                </ProtectedRoute>
              } />
              <Route path="/puntos-entrega" element={<CollectionCentersPage />} />
              <Route path="/estadisticas" element={
                <ProtectedRoute requiredRoles={['admin', 'organization']}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;