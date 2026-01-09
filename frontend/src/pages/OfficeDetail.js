import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { franchiseAPI, propertyAPI } from '../lib/api';

const OfficeDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [franchise, setFranchise] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [franchiseRes, propertiesRes] = await Promise.all([
        franchiseAPI.getById(id),
        propertyAPI.getAll({ franchise_id: id, limit: 12 })
      ]);
      setFranchise(franchiseRes.data);
      setProperties(propertiesRes.data.properties || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">{t('officeDetail.loading')}</div></div>;
  }

  if (!franchise) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">{t('officeDetail.notFound')}</div></div>;
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">{franchise.office_name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3">{t('officeDetail.officeInfo')}</h3>
              <div className="space-y-2 text-gray-700">
                <p><strong>{t('officeDetail.address')}:</strong> {franchise.address}, {franchise.district}, {franchise.city}</p>
                <p><strong>{t('officeDetail.phone')}:</strong> {franchise.phone}</p>
                <p><strong>{t('officeDetail.email')}:</strong> {franchise.email}</p>
                <p><strong>{t('officeDetail.manager')}:</strong> {franchise.manager_name}</p>
              </div>
            </div>
            {franchise.property_count !== undefined && (
              <div>
                <h3 className="font-bold text-lg mb-3">{t('officeDetail.stats')}</h3>
                <p className="text-3xl font-bold text-red-600">{franchise.property_count}</p>
                <p className="text-gray-600">{t('officeDetail.activeListings')}</p>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('officeDetail.officeProperties')}</h2>
        {properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-xl text-gray-600">{t('officeDetail.noProperties')}</p>
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
                    <div className="w-full h-full flex items-center justify-center text-gray-500">{t('officeDetail.noPhoto')}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{property.city}, {property.district}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-red-600">{property.price.toLocaleString('tr-TR')} {property.currency}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{property.property_type === 'sale' ? t('properties.sale') : t('properties.rent')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeDetail;
