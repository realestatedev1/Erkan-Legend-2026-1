import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationCenter from './NotificationCenter';
import { User, LogOut, Settings, Heart, ChevronDown } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { customer, logout: customerLogout } = useCustomerAuth();
  const { favoritesCount } = useFavorites();
  const { compareCount } = useCompare();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleCustomerLogout = async () => {
    await customerLogout();
    setCustomerMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

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
            
            {/* Favorites Icon */}
            <Link to="/favorites" className="relative text-gray-700 hover:text-red-600 transition" title={t('nav.favorites', 'Favoriler')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Compare Icon */}
            <Link to="/compare" className="relative text-gray-700 hover:text-red-600 transition" title={t('nav.compare', 'Karşılaştır')}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>
            
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Customer Notification Center */}
            {customer && <NotificationCenter />}
            
            {/* Customer Auth Section */}
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setCustomerMenuOpen(!customerMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                >
                  {customer.profile_image ? (
                    <img 
                      src={customer.profile_image} 
                      alt={customer.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                  <span className="hidden lg:inline text-sm font-medium max-w-[100px] truncate">
                    {customer.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {customerMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                      <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                    </div>
                    <Link
                      to="/favorites"
                      onClick={() => setCustomerMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="w-4 h-4" />
                      Favorilerim
                    </Link>
                    <button
                      onClick={handleCustomerLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/giris" 
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline text-sm">{t('nav.customerLogin', 'Üye Girişi')}</span>
              </Link>
            )}
            
            {/* Admin Section */}
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
            {/* Mobile Notifications */}
            {customer && <NotificationCenter />}
            {/* Mobile Favorites */}
            <Link to="/favorites" className="relative text-gray-700" onClick={closeMobileMenu}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>
            {/* Mobile Compare */}
            <Link to="/compare" className="relative text-gray-700" onClick={closeMobileMenu}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>
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
            
            <div className="border-t border-gray-200 mt-2 pt-2">
              {customer ? (
                <>
                  <div className="py-2 flex items-center gap-2">
                    {customer.profile_image ? (
                      <img src={customer.profile_image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                    <span className="text-sm font-medium">{customer.name}</span>
                  </div>
                  <button onClick={handleCustomerLogout} className="block py-2 text-red-600">Çıkış Yap</button>
                </>
              ) : (
                <Link to="/giris" onClick={closeMobileMenu} className="block py-2 text-gray-700 hover:text-red-600">Üye Girişi</Link>
              )}
            </div>
            
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
