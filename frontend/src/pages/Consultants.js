import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { consultantAPI } from '../lib/api';
import { Phone, MessageCircle, User, Briefcase, Search, MapPin } from 'lucide-react';

const Consultants = () => {
  const { t, i18n } = useTranslation();
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOffice, setFilterOffice] = useState('');
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    loadConsultants();
  }, []);

  const loadConsultants = async () => {
    try {
      const response = await consultantAPI.getAll(null, true);
      const data = response.data || [];
      setConsultants(data);
      
      // Extract unique offices
      const uniqueOffices = [...new Set(data.map(c => c.franchise_name).filter(Boolean))];
      setOffices(uniqueOffices);
    } catch (error) {
      console.error('Failed to load consultants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (phone, name) => {
    const message = i18n.language === 'tr' 
      ? `Merhaba ${name}, Legend Cities web sitesinden ulaşıyorum.`
      : `Hello ${name}, I'm contacting you from Legend Cities website.`;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredConsultants = consultants.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (c.specialization && c.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesOffice = !filterOffice || c.franchise_name === filterOffice;
    return matchesSearch && matchesOffice;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Briefcase className="w-10 h-10 text-red-600" />
            {t('consultantsPage.title', 'Uzman Danışmanlarımız')}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('consultantsPage.subtitle', 'Deneyimli ve profesyonel ekibimizle gayrimenkul yolculuğunuzda yanınızdayız.')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('consultantsPage.searchPlaceholder', 'Danışman ara (isim, uzmanlık)...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-64">
              <select
                value={filterOffice}
                onChange={(e) => setFilterOffice(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">{t('consultantsPage.allOffices', 'Tüm Ofisler')}</option>
                {offices.map(office => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          <span className="font-semibold text-red-600">{filteredConsultants.length}</span> {t('consultantsPage.consultantFound', 'danışman bulundu')}
        </div>

        {/* Consultants Grid */}
        {filteredConsultants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <User className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">{t('consultantsPage.noResults', 'Danışman bulunamadı')}</p>
            <p className="text-gray-500 mt-2">{t('consultantsPage.tryDifferent', 'Farklı arama kriterleri deneyin')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredConsultants.map((consultant) => {
              const photoUrl = consultant.photo_url 
                ? (consultant.photo_url.startsWith('http') ? consultant.photo_url : `${process.env.REACT_APP_BACKEND_URL}${consultant.photo_url}`)
                : null;
              
              return (
                <div 
                  key={consultant.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Photo */}
                  <div className="h-52 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center relative">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt={consultant.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-14 h-14 text-red-400" />
                      </div>
                    )}
                    {/* Experience Badge */}
                    {consultant.experience_years && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow">
                        {consultant.experience_years} {t('consultantsPage.years', 'yıl')}
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-800">{consultant.name}</h3>
                    <p className="text-red-600 font-medium mb-2">{consultant.title}</p>
                    
                    {/* Office */}
                    <Link 
                      to={`/offices/${consultant.franchise_id}`}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-3"
                    >
                      <MapPin className="w-4 h-4" />
                      {consultant.franchise_name || 'Legend Cities'}
                    </Link>
                    
                    {/* Bio */}
                    {consultant.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{consultant.bio}</p>
                    )}
                    
                    {/* Specialization Tags */}
                    {consultant.specialization && consultant.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {consultant.specialization.map((spec, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Languages */}
                    {consultant.languages && consultant.languages.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3">
                        🌐 {consultant.languages.join(', ')}
                      </p>
                    )}
                    
                    {/* Contact Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={`tel:${consultant.phone}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        <Phone className="w-4 h-4" />
                        {t('consultantsPage.call', 'Ara')}
                      </a>
                      <button
                        onClick={() => handleWhatsApp(consultant.phone, consultant.name)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            {t('consultantsPage.ctaTitle', 'Kariyer Fırsatı')}
          </h2>
          <p className="text-lg mb-6 opacity-90">
            {t('consultantsPage.ctaSubtitle', 'Siz de Legend Cities ailesine katılmak ister misiniz?')}
          </p>
          <Link
            to="/career"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            {t('consultantsPage.ctaButton', 'Kariyer Başvurusu Yap')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Consultants;
