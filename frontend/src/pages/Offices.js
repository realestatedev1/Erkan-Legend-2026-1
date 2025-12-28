import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { franchiseAPI } from '../lib/api';

const Offices = () => {
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
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Ofislerimiz</h1>
          <p className="text-gray-600">Türkiye genelindeki Legend Cities ofislerimiz</p>
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
                <p><strong>Şehir:</strong> {franchise.city}, {franchise.district}</p>
                <p><strong>Adres:</strong> {franchise.address}</p>
                <p><strong>Telefon:</strong> {franchise.phone}</p>
                <p><strong>Email:</strong> {franchise.email}</p>
                <p><strong>Yetkili:</strong> {franchise.manager_name}</p>
              </div>
              <div className="mt-4 text-red-600 font-semibold">
                Detayları Gör →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Offices;
