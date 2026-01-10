import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CompareProvider } from './context/CompareContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

// Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Offices from './pages/Offices';
import OfficeDetail from './pages/OfficeDetail';
import Services from './pages/Services';
import About from './pages/About';
import Franchise from './pages/Franchise';
import Career from './pages/Career';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Favorites from './pages/Favorites';
import Compare from './pages/Compare';
import CustomerLogin from './pages/CustomerLogin';
import AuthCallback from './pages/AuthCallback';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import PropertyManagement from './pages/admin/PropertyManagement';
import FranchiseManagement from './pages/admin/FranchiseManagement';
import Messages from './pages/admin/Messages';
import Applications from './pages/admin/Applications';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Check for OAuth callback - must be done synchronously before rendering routes
const AppRouter = () => {
  const location = useLocation();
  
  // Check URL fragment for session_id (OAuth callback)
  // This must be done BEFORE rendering routes to prevent race conditions
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/offices" element={<Offices />} />
          <Route path="/offices/:id" element={<OfficeDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/career" element={<Career />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/giris" element={<CustomerLogin />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/properties" element={<ProtectedRoute><PropertyManagement /></ProtectedRoute>} />
          <Route path="/admin/franchises" element={<ProtectedRoute><FranchiseManagement /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <FavoritesProvider>
          <CompareProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </CompareProvider>
        </FavoritesProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

export default App;
