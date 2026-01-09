import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { franchiseApplicationAPI } from '../lib/api';

const Franchise = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    experience: '',
    investment_amount: '',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await franchiseApplicationAPI.apply(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', city: '', experience: '', investment_amount: '', message: '' });
    } catch (err) {
      setError(t('franchise.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { title: t('franchise.benefit1Title'), desc: t('franchise.benefit1Desc') },
    { title: t('franchise.benefit2Title'), desc: t('franchise.benefit2Desc') },
    { title: t('franchise.benefit3Title'), desc: t('franchise.benefit3Desc') },
    { title: t('franchise.benefit4Title'), desc: t('franchise.benefit4Desc') },
    { title: t('franchise.benefit5Title'), desc: t('franchise.benefit5Desc') },
    { title: t('franchise.benefit6Title'), desc: t('franchise.benefit6Desc') },
  ];

  const requirements = [
    t('franchise.requirement1'),
    t('franchise.requirement2'),
    t('franchise.requirement3'),
    t('franchise.requirement4'),
    t('franchise.requirement5'),
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-gray-900 text-white rounded-lg p-12 mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">{t('franchise.title')}</h1>
          <p className="text-xl">{t('franchise.subtitle')}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t('franchise.benefits')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-red-600 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('franchise.requirements')}</h2>
            <ul className="space-y-3 text-gray-700">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-2">✓</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">{t('franchise.formTitle')}</h2>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {t('franchise.successMessage')}
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('franchise.fullName')} *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('franchise.email')} *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('franchise.phone')} *</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('franchise.city')} *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('franchise.experience')}</label>
                  <select
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  >
                    <option value="">{t('franchise.select')}</option>
                    <option value="0-2">0-2 {t('properties.years')}</option>
                    <option value="3-5">3-5 {t('properties.years')}</option>
                    <option value="5+">5+ {t('properties.years')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('franchise.investmentBudget')}</label>
                  <select
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.investment_amount}
                    onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                  >
                    <option value="">{t('franchise.select')}</option>
                    <option value="100-500k">100-500k TL</option>
                    <option value="500k-1m">500k - 1M TL</option>
                    <option value="1m+">1M+ TL</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">{t('franchise.message')}</label>
                <textarea
                  className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('franchise.messagePlaceholder')}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-4 rounded hover:bg-red-700 transition font-semibold text-lg disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? t('franchise.sending') : t('franchise.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Franchise;
