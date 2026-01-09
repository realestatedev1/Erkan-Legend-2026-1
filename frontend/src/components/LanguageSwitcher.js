import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 hover:border-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
      title={currentLang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      <span className={`fi fi-${currentLang === 'tr' ? 'tr' : 'gb'} rounded-sm`}></span>
      <span className="text-gray-700">{currentLang === 'tr' ? 'TR' : 'EN'}</span>
      <svg 
        className="w-4 h-4 text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    </button>
  );
};

export default LanguageSwitcher;
