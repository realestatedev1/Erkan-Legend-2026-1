import React, { useState } from 'react';
import { franchiseApplicationAPI } from '../lib/api';

const Franchise = () => {
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
      setError('Başvuru gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-gray-900 text-white rounded-lg p-12 mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Franchise Olun</h1>
          <p className="text-xl">Legend Cities ailesine katılın ve başarı hikayenizi yazın</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Franchise Avantajları</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Güçlü Marka', desc: '63 yıllık deneyim ve güvenilir marka' },
                { title: 'Eğitim Desteği', desc: 'Kapsamlı eğitim ve mentorluk programları' },
                { title: 'Pazarlama Desteği', desc: 'Ulusal ve yerel pazarlama kampanyaları' },
                { title: 'Teknoloji', desc: 'Gelişmiş yazılım ve sistem altyapısı' },
                { title: 'Danışmanlık', desc: 'Sürekli operasyonel destek ve danışmanlık' },
                { title: 'Portföy Paylaşımı', desc: 'Geniş ılan portföyüne erişim' },
              ].map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-red-600 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-12 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Franchise Koşulları</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✓</span>
                <span>Gayrimenkul sektöründe deneyim veya ilgi</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✓</span>
                <span>Yeterli yatırım sermayesi</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✓</span>
                <span>Uygun ofis lokasyonu</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✓</span>
                <span>Girişimci ruh ve başarı isteği</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 mr-2">✓</span>
                <span>Marka değerlerine bağlılık</span>
              </li>
            </ul>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Franchise Başvuru Formu</h2>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                Başvurunuz başarıyla alındı. En kısa sürede size dönüş yapacağız.
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
                  <label className="block text-gray-700 font-semibold mb-2">Ad Soyad *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Telefon *</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Şehir *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Deneyim</label>
                  <select
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  >
                    <option value="">Seçiniz</option>
                    <option value="0-2">0-2 yıl</option>
                    <option value="3-5">3-5 yıl</option>
                    <option value="5+">5+ yıl</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Yatırım Bütçesi</label>
                  <select
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.investment_amount}
                    onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                  >
                    <option value="">Seçiniz</option>
                    <option value="100-500k">100-500 bin TL</option>
                    <option value="500k-1m">500 bin - 1 milyon TL</option>
                    <option value="1m+">1 milyon TL+</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Mesajınız</label>
                <textarea
                  className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Franchise hakkında sormak istediğiniz sorular..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-4 rounded hover:bg-red-700 transition font-semibold text-lg disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Gönderiliyor...' : 'Başvuru Gönder'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Franchise;
