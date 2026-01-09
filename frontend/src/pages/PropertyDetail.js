import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyAPI, contactAPI } from '../lib/api';
import { SinglePropertyMap } from '../components/PropertyMap';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import MortgageCalculator from '../components/MortgageCalculator';
import PropertyQRCode from '../components/PropertyQRCode';
import PropertyPDF from '../components/PropertyPDF';

const PropertyDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formSuccess, setFormSuccess] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isInCompare, canAddMore } = useCompare();

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      setProperty(response.data);
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await contactAPI.send({
        ...formData,
        property_id: id,
        franchise_id: property.franchise_id,
      });
      setFormSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('propertyDetail.loading')}</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('propertyDetail.notFound')}</div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['/placeholder.jpg'];

  // Helper function to get image URL
  const getImageUrl = (img) => {
    if (!img) return '/placeholder.jpg';
    return img.startsWith('http') ? img : `${process.env.REACT_APP_BACKEND_URL}${img}`;
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:text-red-600">{t('propertyDetail.home')}</Link>
          {' > '}
          <Link to="/properties" className="hover:text-red-600">{t('propertyDetail.properties')}</Link>
          {' > '}
          <span>{property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="h-96 bg-gray-300">
                {images[currentImage] && (
                  <img
                    src={getImageUrl(images[currentImage])}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={getImageUrl(img)}
                      alt={`${property.title} ${index + 1}`}
                      className={`w-20 h-20 object-cover cursor-pointer rounded ${
                        currentImage === index ? 'ring-2 ring-red-600' : ''
                      }`}
                      onClick={() => setCurrentImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{property.title}</h1>
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(property)}
                    className={`p-2 rounded-full transition ${
                      isFavorite(property.id) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                    }`}
                    title={isFavorite(property.id) ? t('favorites.remove', 'Favorilerden Çıkar') : t('favorites.add', 'Favorilere Ekle')}
                  >
                    <svg className="w-6 h-6" fill={isFavorite(property.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const result = toggleCompare(property);
                      if (!result.success) {
                        alert(result.message);
                      }
                    }}
                    disabled={!isInCompare(property.id) && !canAddMore}
                    className={`p-2 rounded-full transition ${
                      isInCompare(property.id) 
                        ? 'bg-blue-500 text-white' 
                        : canAddMore
                          ? 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={isInCompare(property.id) ? t('compare.remove', 'Karşılaştırmadan Çıkar') : t('compare.add', 'Karşılaştır')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const text = `🏠 ${property.title}\n📍 ${property.district}, ${property.city}\n💰 ${property.price.toLocaleString('tr-TR')} ${property.currency}\n\n🔗 ${window.location.href}`;
                      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                      window.open(url, '_blank');
                    }}
                    className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                    title={t('properties.shareWhatsApp', 'WhatsApp ile Paylaş')}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-600 mb-2">
                <span>📍 {property.city}, {property.district}</span>
                {property.neighborhood && <span>• {property.neighborhood}</span>}
              </div>
              
              {/* View Count */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  👁️ {property.view_count || 0} {t('propertyDetail.views', 'görüntülenme')}
                </span>
              </div>

              <div className="text-4xl font-bold text-red-600 mb-4">
                {property.price.toLocaleString('tr-TR')} {property.currency}
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({property.property_type === 'sale' ? t('propertyDetail.forSale') : t('propertyDetail.forRent')})
                </span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-2 mb-6">
                <PropertyPDF property={property} />
                <PropertyQRCode propertyId={property.id} propertyTitle={property.title} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.rooms && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">{property.rooms}</div>
                    <div className="text-sm text-gray-600">{t('propertyDetail.rooms')}</div>
                  </div>
                )}
                {(property.area_gross || property.area_net || property.area_sqm) && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">
                      {property.area_gross || property.area_net || property.area_sqm}m²
                    </div>
                    <div className="text-sm text-gray-600">{t('propertyDetail.area')}</div>
                  </div>
                )}
                {property.floor && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">{property.floor}</div>
                    <div className="text-sm text-gray-600">{t('propertyDetail.floor')}</div>
                  </div>
                )}
                {property.age !== null && property.age !== undefined && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">{property.age}</div>
                    <div className="text-sm text-gray-600">{t('propertyDetail.buildingAge')}</div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-xl mb-3">{t('propertyDetail.description')}</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>

              {property.features && property.features.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-bold text-xl mb-3">{t('propertyDetail.features')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-600">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Location Map */}
              <div className="border-t pt-6 mt-6">
                <h3 className="font-bold text-xl mb-3">{t('propertyDetail.location', 'Konum')}</h3>
                <SinglePropertyMap property={property} height="350px" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Franchise Info */}
            {property.franchise_info && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
                <h3 className="font-bold text-xl mb-4">{t('propertyDetail.officeInfo')}</h3>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-800">
                    {property.franchise_info.office_name}
                  </p>
                  <p className="text-gray-600">
                    <strong>{t('propertyDetail.phone')}:</strong><br />
                    {property.franchise_info.phone}
                  </p>
                  <p className="text-gray-600">
                    <strong>{t('propertyDetail.email')}:</strong><br />
                    {property.franchise_info.email}
                  </p>
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition font-semibold"
                  >
                    {t('propertyDetail.contact')}
                  </button>
                </div>

                {showContactForm && (
                  <div className="mt-6 pt-6 border-t">
                    {formSuccess ? (
                      <div className="bg-green-100 text-green-700 p-3 rounded">
                        {t('propertyDetail.messageSent')}
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder={t('propertyDetail.yourName')}
                          className="w-full px-3 py-2 border rounded"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                        <input
                          type="email"
                          placeholder={t('propertyDetail.email')}
                          className="w-full px-3 py-2 border rounded"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                        <input
                          type="tel"
                          placeholder={t('propertyDetail.phone')}
                          className="w-full px-3 py-2 border rounded"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                        <textarea
                          placeholder={t('propertyDetail.yourMessage')}
                          className="w-full px-3 py-2 border rounded"
                          rows="3"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                        ></textarea>
                        <button
                          type="submit"
                          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
                        >
                          {t('propertyDetail.send')}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
