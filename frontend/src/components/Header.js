import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Mobil menüde link tıklandığında menüyü kapat
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition">{t('nav.home')}</Link>
            <Link to="/properties" className="text-gray-700 hover:text-red-600 transition">{t('nav.properties')}</Link>
            <Link to="/offices" className="text-gray-700 hover:text-red-600 transition">{t('nav.offices')}</Link>
            <Link to="/services" className="text-gray-700 hover:text-red-600 transition">{t('nav.services')}</Link>
            <Link to="/about" className="text-gray-700 hover:text-red-600 transition">{t('nav.about')}</Link>
            <Link to="/franchise" className="text-gray-700 hover:text-red-600 transition">{t('nav.franchise')}</Link>
            <Link to="/career" className="text-gray-700 hover:text-red-600 transition">{t('nav.career')}</Link>
            <Link to="/contact" className="text-gray-700 hover:text-red-600 transition">{t('nav.contact')}</Link>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {user ? (
              <>
                <Link 
                  to="/admin" 
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  {t('nav.adminPanel')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button
              className="text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <Link to="/" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.home')}</Link>
            <Link to="/properties" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.properties')}</Link>
            <Link to="/offices" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.offices')}</Link>
            <Link to="/services" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.services')}</Link>
            <Link to="/about" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.about')}</Link>
            <Link to="/franchise" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.franchise')}</Link>
            <Link to="/career" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.career')}</Link>
            <Link to="/contact" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.contact')}</Link>
            {user ? (
              <>
                <Link to="/admin" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.adminPanel')}</Link>
                <button onClick={handleLogout} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.logout')}</button>
              </>
            ) : (
              <Link to="/login" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">{t('nav.login')}</Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
