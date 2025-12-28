import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

const AppRoutes = () => {
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
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
