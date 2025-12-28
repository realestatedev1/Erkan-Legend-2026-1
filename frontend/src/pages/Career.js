import React, { useState } from 'react';
import { careerAPI } from '../lib/api';

const Career = () => {
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
      setError('Başvuru gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const positions = [
    'Gayrimenkul Danışmanı',
    'Satış Uzmanı',
    'Pazarlama Uzmanı',
    'Müşteri Ilişkileri Uzmanı',
    'Ofis Yöneticisi',
    'Diğer'
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Kariyer Fırsatları</h1>
            <p className="text-gray-600">Legend Cities ekibine katılın ve kariyer hedeflerinize ulaşın</p>
          </div>

          {/* Why Join Us */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Neden Legend Cities?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Kariyer Gelişimi', desc: 'Sürekli eğitim ve gelişim fırsatları' },
                { title: 'Rekabetçi Maaş', desc: 'Sektör standartlarının üzerinde ücretlendirme' },
                { title: 'Esnek Çalışma', desc: 'Modern ve esnek çalışma ortamı' },
                { title: 'Takım Ruhu', desc: 'Güçlü ekip kültürü ve iş birliği' },
              ].map((item, index) => (
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Açık Pozisyonlar</h2>
            <div className="space-y-4">
              {positions.slice(0, -1).map((position, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-bold text-lg text-gray-800">{position}</h3>
                  <p className="text-sm text-gray-600">Tam zamanlı • İstanbul</p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Başvuru Formu</h2>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                Başvurunuz başarıyla alındı. Sizi değerlendirmeye alacağız.
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
                  <label className="block text-gray-700 font-semibold mb-2">Başvurduğunuz Pozisyon *</label>
                  <select
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  >
                    <option value="">Seçiniz</option>
                    {positions.map((pos, idx) => (
                      <option key={idx} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Deneyim</label>
                  <input
                    type="text"
                    placeholder="Örn: 3 yıl gayrimenkul sektörü"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Eğitim Durumu</label>
                  <input
                    type="text"
                    placeholder="Örn: Üniversite - İşletme"
                    className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Ek Bilgiler</label>
                <textarea
                  className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows="5"
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  placeholder="Kendinizi tanıtın ve neden bu pozisyon için uygun olduğunuzu belirtin..."
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

export default Career;
