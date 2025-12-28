import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propertyAPI, contactAPI } from '../lib/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formSuccess, setFormSuccess] = useState(false);

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
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">İlan bulunamadı</div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['/placeholder.jpg'];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <Link to="/" className="hover:text-red-600">Ana Sayfa</Link>
          {' > '}
          <Link to="/properties" className="hover:text-red-600">İlanlar</Link>
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
                    src={`${process.env.REACT_APP_BACKEND_URL}${images[currentImage]}`}
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
                      src={`${process.env.REACT_APP_BACKEND_URL}${img}`}
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
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{property.title}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span>📍 {property.city}, {property.district}</span>
                {property.neighborhood && <span>• {property.neighborhood}</span>}
              </div>
              <div className="text-4xl font-bold text-red-600 mb-6">
                {property.price.toLocaleString('tr-TR')} {property.currency}
                <span className="text-lg font-normal text-gray-600 ml-2">
                  ({property.property_type === 'sale' ? 'Satılık' : 'Kiralık'})
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.rooms && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">{property.rooms}</div>
                    <div className="text-sm text-gray-600">Oda Sayısı</div>
                  </div>
                )}
                {property.area_sqm && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">{property.area_sqm}m²</div>
                    <div className="text-sm text-gray-600">Alan</div>
                  </div>
                )}
                {property.floor && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">{property.floor}</div>
                    <div className="text-sm text-gray-600">Kat</div>
                  </div>
                )}
                {property.age !== null && (
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="font-bold text-gray-800">{property.age}</div>
                    <div className="text-sm text-gray-600">Bina Yaşı</div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-xl mb-3">İlan Açıklaması</h3>
                <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
              </div>

              {property.features && property.features.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-bold text-xl mb-3">Özellikler</h3>
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Franchise Info */}
            {property.franchise_info && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
                <h3 className="font-bold text-xl mb-4">Ofis Bilgileri</h3>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-800">
                    {property.franchise_info.office_name}
                  </p>
                  <p className="text-gray-600">
                    <strong>Telefon:</strong><br />
                    {property.franchise_info.phone}
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong><br />
                    {property.franchise_info.email}
                  </p>
                  <button
                    onClick={() => setShowContactForm(!showContactForm)}
                    className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 transition font-semibold"
                  >
                    İletişime Geç
                  </button>
                </div>

                {showContactForm && (
                  <div className="mt-6 pt-6 border-t">
                    {formSuccess ? (
                      <div className="bg-green-100 text-green-700 p-3 rounded">
                        Mesajınız gönderildi!
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Adınız"
                          className="w-full px-3 py-2 border rounded"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          className="w-full px-3 py-2 border rounded"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Telefon"
                          className="w-full px-3 py-2 border rounded"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                        <textarea
                          placeholder="Mesajınız"
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
                          Gönder
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
