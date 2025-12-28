import React, { useState } from 'react';
import { contactAPI } from '../lib/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      await contactAPI.send(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">İletişim</h1>
            <p className="text-gray-600">Bize ulaşın, size yardımcı olalım</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-4 text-gray-800">Merkez Ofis</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>Adres:</strong><br />Nisbetiye Mahallesi Nisbetiye Caddesi No:28/16<br />34340 Etiler, Beşiktaş<br />İstanbul - Türkiye</p>
                <p><strong>Telefon:</strong> +90 212 324 0 444</p>
                <p><strong>Email:</strong> info@legendcities.com.tr</p>
                <p><strong>Web:</strong> www.legendcities.com.tr</p>
                <p>
                  <strong>Instagram:</strong>{' '}
                  <a href="https://www.instagram.com/legendcities" target="_blank" rel="noopener noreferrer" className="text-legend-red hover:underline">
                    @legendcities
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl mb-4 text-gray-800">Çalışma Saatleri</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Pazartesi - Cuma:</strong> 09:00 - 18:00</p>
                <p><strong>Cumartesi:</strong> 10:00 - 16:00</p>
                <p><strong>Pazar:</strong> Kapalı</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="font-bold text-2xl mb-6 text-gray-800">Bize Mesaj Gönderin</h3>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Mesajınız başarıyla gönderildi. En kısa sürede dönüş yapacağız.
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="contact-name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="contact-email"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Telefon</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  data-testid="contact-phone"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Mesajınız</label>
                <textarea
                  className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows="6"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  data-testid="contact-message"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
                disabled={loading}
                data-testid="contact-submit"
              >
                {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
