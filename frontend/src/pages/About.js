import React from 'react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  const principles = [
    t('about.principle1'),
    t('about.principle2'),
    t('about.principle3'),
    t('about.principle4'),
    t('about.principle5'),
    t('about.principle6'),
    t('about.principle7'),
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('about.title')}</h1>
            <p className="text-xl text-gray-600">{t('about.subtitle')}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('about.history')}</h2>
            <p className="text-gray-700 mb-4">{t('about.historyText1')}</p>
            <p className="text-gray-700">{t('about.historyText2')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('about.mission')}</h2>
              <p className="text-gray-700">{t('about.missionText')}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('about.vision')}</h2>
              <p className="text-gray-700">{t('about.visionText')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('about.principles')}</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {principles.map((principle, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="text-red-600 mr-2 text-xl">✓</span>
                  {principle}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-gray-900 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('about.whyUs')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <div className="text-4xl font-bold mb-2">63</div>
                <div>{t('about.yearsExperience')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5000+</div>
                <div>{t('about.happyClients')}</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">150+</div>
                <div>{t('about.activeListings')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
