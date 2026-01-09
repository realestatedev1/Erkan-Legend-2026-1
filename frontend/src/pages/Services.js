import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: t('services.residential'),
      description: t('services.residentialDesc'),
      features: [
        t('services.residentialFeature1'),
        t('services.residentialFeature2'),
        t('services.residentialFeature3'),
        t('services.residentialFeature4')
      ]
    },
    {
      title: t('services.commercial'),
      description: t('services.commercialDesc'),
      features: [
        t('services.commercialFeature1'),
        t('services.commercialFeature2'),
        t('services.commercialFeature3'),
        t('services.commercialFeature4')
      ]
    },
    {
      title: t('services.land'),
      description: t('services.landDesc'),
      features: [
        t('services.landFeature1'),
        t('services.landFeature2'),
        t('services.landFeature3'),
        t('services.landFeature4')
      ]
    },
    {
      title: t('services.consulting'),
      description: t('services.consultingDesc'),
      features: [
        t('services.consultingFeature1'),
        t('services.consultingFeature2'),
        t('services.consultingFeature3'),
        t('services.consultingFeature4')
      ]
    },
    {
      title: t('services.management'),
      description: t('services.managementDesc'),
      features: [
        t('services.managementFeature1'),
        t('services.managementFeature2'),
        t('services.managementFeature3'),
        t('services.managementFeature4')
      ]
    },
    {
      title: t('services.valuation'),
      description: t('services.valuationDesc'),
      features: [
        t('services.valuationFeature1'),
        t('services.valuationFeature2'),
        t('services.valuationFeature3'),
        t('services.valuationFeature4')
      ]
    },
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('services.title')}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{t('services.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <span className="text-red-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-red-600 to-gray-900 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('services.moreInfoTitle')}</h2>
          <p className="mb-8 text-lg">{t('services.moreInfoDesc')}</p>
          <Link to="/contact" className="inline-block bg-white text-red-600 px-8 py-3 rounded hover:bg-gray-100 transition font-semibold">
            {t('services.contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Services;
