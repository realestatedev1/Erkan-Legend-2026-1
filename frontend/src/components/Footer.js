import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <img 
              src="/logo.jpg" 
              alt="Legend Cities" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm">
              {t('footer.slogan')}
            </p>
            <p className="text-gray-400 text-sm mt-4">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><Link to="/properties" className="text-gray-400 hover:text-red-600 transition">{t('nav.properties')}</Link></li>
              <li><Link to="/offices" className="text-gray-400 hover:text-red-600 transition">{t('nav.offices')}</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-red-600 transition">{t('nav.services')}</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-red-600 transition">{t('nav.about')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">{t('footer.residential')}</li>
              <li className="text-gray-400 text-sm">{t('footer.commercial')}</li>
              <li className="text-gray-400 text-sm">{t('footer.land')}</li>
              <li className="text-gray-400 text-sm">{t('footer.consulting')}</li>
              <li className="text-gray-400 text-sm">{t('footer.management')}</li>
              <li className="text-gray-400 text-sm">{t('footer.valuation')}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Nisbetiye Mahallesi</li>
              <li>Nisbetiye Caddesi No:28/16</li>
              <li>34340 Etiler, Beşiktaş</li>
              <li>İstanbul - Türkiye</li>
              <li className="mt-4">Tel: +90 212 324 0 444</li>
              <li>Tel: +90 532 212 51 47</li>
              <li>Email: info@legendcities.com.tr</li>
              <li className="mt-4">
                <a href="https://www.instagram.com/legendcities" target="_blank" rel="noopener noreferrer" className="hover:text-legend-red transition">
                  📷 @legendcities
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Legend Cities. {t('footer.allRights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
