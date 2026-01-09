import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { careerAPI } from '../lib/api';

const Career = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    education: '',
    cover_letter: '',
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
      await careerAPI.apply(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', position: '', experience: '', education: '', cover_letter: '' });
    } catch (err) {
      setError(t('career.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const positions = [
    t('career.position1'),
    t('career.position2'),
    t('career.position3'),
    t('career.position4'),
    t('career.position5'),
    t('career.position6')
  ];

  const benefits = [
    { title: t('career.benefit1Title'), desc: t('career.benefit1Desc') },
    { title: t('career.benefit2Title'), desc: t('career.benefit2Desc') },
    { title: t('career.benefit3Title'), desc: t('career.benefit3Desc') },
    { title: t('career.benefit4Title'), desc: t('career.benefit4Desc') },
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('career.title')}</h1>
            <p className="text-gray-600">{t('career.subtitle')}</p>
          </div>

          {/* Why Join Us */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('career.whyUs')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-red-600 text-2xl mr-3">✓</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('career.openPositions')}</h2>
            <div className="space-y-4">
              {positions.slice(0, -1).map((position, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-bold text-lg text-gray-800">{position}</h3>
                  <p className="text-sm text-gray-600">{t('career.fullTime')} • İstanbul</p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('career.formTitle')}</h2>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {t('career.successMessage')}
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
                  <label className="block text-gray-700 font-semibold mb-2">{t('career.fullName')} *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('career.email')} *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('career.phone')} *</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('career.position')} *</label>
                  <select
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  >
                    <option value="">{t('career.select')}</option>
                    {positions.map((pos, idx) => (
                      <option key={idx} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('career.experience')}</label>
                  <input
                    type="text"
                    placeholder={t('career.experiencePlaceholder')}
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t('career.education')}</label>
                  <input
                    type="text"
                    placeholder={t('career.educationPlaceholder')}
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">{t('career.additionalInfo')}</label>
                <textarea
                  className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows="5"
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  placeholder={t('career.additionalInfoPlaceholder')}
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-4 rounded hover:bg-red-700 transition font-semibold text-lg disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? t('career.sending') : t('career.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
