import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { franchiseAPI } from '../lib/api';

const Offices = () => {
  const { t } = useTranslation();
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFranchises();
  }, []);

  const loadFranchises = async () => {
    try {
      const response = await franchiseAPI.getAll();
      setFranchises(response.data || []);
    } catch (error) {
      console.error('Failed to load franchises:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('offices.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('offices.title')}</h1>
          <p className="text-gray-600">{t('offices.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {franchises.map((franchise) => (
            <Link
              key={franchise.id}
              to={`/offices/${franchise.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
            >
              <h3 className="font-bold text-xl mb-3 text-gray-800">
                {franchise.office_name}
              </h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p><strong>{t('offices.city')}:</strong> {franchise.city}, {franchise.district}</p>
                <p><strong>{t('offices.address')}:</strong> {franchise.address}</p>
                <p><strong>{t('offices.phone')}:</strong> {franchise.phone}</p>
                <p><strong>{t('offices.email')}:</strong> {franchise.email}</p>
                <p><strong>{t('offices.manager')}:</strong> {franchise.manager_name}</p>
              </div>
              <div className="mt-4 text-red-600 font-semibold">
                {t('offices.viewDetails')} →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Offices;
