import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { franchiseAPI, propertyAPI, consultantAPI } from '../lib/api';
import { Phone, Mail, MapPin, User, Briefcase, MessageCircle } from 'lucide-react';

const OfficeDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [franchise, setFranchise] = useState(null);
  const [properties, setProperties] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [franchiseRes, propertiesRes, consultantsRes] = await Promise.all([
        franchiseAPI.getById(id),
        propertyAPI.getAll({ franchise_id: id, limit: 12 }),
        consultantAPI.getByFranchise(id)
      ]);
      setFranchise(franchiseRes.data);
      setProperties(propertiesRes.data.properties || []);
      setConsultants(consultantsRes.data.consultants || []);
    } catch (error) {
      console.error('Failed to load data:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!franchise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('officeDetail.notFound', 'Ofis bulunamadı')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Office Info Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{franchise.office_name}</h1>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{franchise.address}, {franchise.district}, {franchise.city}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <a href={`tel:${franchise.phone}`} className="hover:text-red-600">{franchise.phone}</a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <a href={`mailto:${franchise.email}`} className="hover:text-red-600">{franchise.email}</a>
                </p>
                <p className="flex items-center gap-2">
                  <User className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span><strong>{t('officeDetail.manager', 'Yönetici')}:</strong> {franchise.manager_name}</span>
                </p>
              </div>
            </div>
            <div className="text-center bg-red-50 rounded-lg p-6">
              <p className="text-4xl font-bold text-red-600">{franchise.property_count || properties.length}</p>
              <p className="text-gray-600">{t('officeDetail.activeListings', 'Aktif İlan')}</p>
              <p className="text-2xl font-bold text-gray-700 mt-2">{consultants.length}</p>
              <p className="text-gray-600">{t('officeDetail.consultants', 'Danışman')}</p>
            </div>
          </div>
        </div>

        {/* Consultants Section */}
        {consultants.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-red-600" />
              {t('officeDetail.ourConsultants', 'Danışmanlarımız')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {consultants.map((consultant) => {
                const photoUrl = consultant.photo_url 
                  ? (consultant.photo_url.startsWith('http') ? consultant.photo_url : `${process.env.REACT_APP_BACKEND_URL}${consultant.photo_url}`)
                  : null;
                
                return (
                  <div key={consultant.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                    {/* Photo */}
                    <div className="h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                      {photoUrl ? (
                        <img 
                          src={photoUrl} 
                          alt={consultant.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                          <User className="w-12 h-12 text-red-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800">{consultant.name}</h3>
                      <p className="text-sm text-red-600 mb-2">{consultant.title}</p>
                      
                      {consultant.experience_years && (
                        <p className="text-xs text-gray-500 mb-2">
                          {consultant.experience_years} {t('officeDetail.yearsExperience', 'yıl deneyim')}
                        </p>
                      )}
                      
                      {consultant.specialization && consultant.specialization.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {consultant.specialization.slice(0, 3).map((spec, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Contact Buttons */}
                      <div className="flex gap-2 mt-3">
                        <a
                          href={`tel:${consultant.phone}`}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          {t('officeDetail.call', 'Ara')}
                        </a>
                        <button
                          onClick={() => handleWhatsApp(consultant.phone, consultant.name)}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition text-sm"
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
          </div>
        )}

        {/* Properties Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('officeDetail.officeProperties', 'Ofis İlanları')}</h2>
        {properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-xl text-gray-600">{t('officeDetail.noProperties', 'Henüz ilan bulunmuyor')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {properties.map((property) => {
              const imageUrl = property.images?.[0] 
                ? (property.images[0].startsWith('http') ? property.images[0] : `${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`)
                : null;
              return (
                <Link key={property.id} to={`/properties/${property.id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  <div className="h-48 bg-gray-300">
                    {imageUrl ? (
                      <img src={imageUrl} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">{t('officeDetail.noPhoto', 'Fotoğraf yok')}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{property.city}, {property.district}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-red-600">{property.price.toLocaleString('tr-TR')} {property.currency}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{property.property_type === 'sale' ? t('properties.sale', 'Satılık') : t('properties.rent', 'Kiralık')}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeDetail;
