import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.jpg" 
              alt="Legend Cities" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition">Ana Sayfa</Link>
            <Link to="/properties" className="text-gray-700 hover:text-red-600 transition">İlanlar</Link>
            <Link to="/offices" className="text-gray-700 hover:text-red-600 transition">Ofislerimiz</Link>
            <Link to="/services" className="text-gray-700 hover:text-red-600 transition">Hizmetler</Link>
            <Link to="/about" className="text-gray-700 hover:text-red-600 transition">Hakkımızda</Link>
            <Link to="/franchise" className="text-gray-700 hover:text-red-600 transition">Franchise</Link>
            <Link to="/career" className="text-gray-700 hover:text-red-600 transition">Kariyer</Link>
            <Link to="/contact" className="text-gray-700 hover:text-red-600 transition">İletişim</Link>
            
            {user ? (
              <>
                <Link 
                  to="/admin" 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Admin Panel
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition"
                >
                  Çıkış
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Giriş
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <Link to="/" className="block py-2 text-gray-700 hover:text-red-600">Ana Sayfa</Link>
            <Link to="/properties" className="block py-2 text-gray-700 hover:text-red-600">İlanlar</Link>
            <Link to="/offices" className="block py-2 text-gray-700 hover:text-red-600">Ofislerimiz</Link>
            <Link to="/services" className="block py-2 text-gray-700 hover:text-red-600">Hizmetler</Link>
            <Link to="/about" className="block py-2 text-gray-700 hover:text-red-600">Hakkımızda</Link>
            <Link to="/franchise" className="block py-2 text-gray-700 hover:text-red-600">Franchise</Link>
            <Link to="/career" className="block py-2 text-gray-700 hover:text-red-600">Kariyer</Link>
            <Link to="/contact" className="block py-2 text-gray-700 hover:text-red-600">İletişim</Link>
            {user && (
              <>
                <Link to="/admin" className="block py-2 text-gray-700 hover:text-red-600">Admin Panel</Link>
                <button onClick={handleLogout} className="block py-2 text-gray-700 hover:text-red-600">Çıkış</button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
