import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, propertyAPI } from '../../lib/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, propertiesRes] = await Promise.all([
        adminAPI.getStats(),
        propertyAPI.getAll({ limit: 5 })
      ]);
      setStats(statsRes.data);
      setRecentProperties(propertiesRes.data.properties || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Yükleniyor...</div></div>;
  }

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Hoşgeldiniz, {user?.name}</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link to="/admin/properties" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2 text-gray-800">İlan Yönetimi</h3>
            <p className="text-sm text-gray-600">İlanları yönet</p>
          </Link>

          {isSuperAdmin && (
            <Link to="/admin/franchises" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Franchise Yönetimi</h3>
              <p className="text-sm text-gray-600">Ofisleri yönet</p>
            </Link>
          )}

          <Link to="/admin/messages" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="font-bold text-lg mb-2 text-gray-800">Mesajlar</h3>
            <p className="text-sm text-gray-600">Müşteri mesajları</p>
          </Link>

          {isSuperAdmin && (
            <Link to="/admin/applications" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2 text-gray-800">Başvurular</h3>
              <p className="text-sm text-gray-600">Kariyer & Franchise</p>
            </Link>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.total_properties || 0}</div>
              <div className="text-gray-600">Toplam İlan</div>
            </div>

            {isSuperAdmin && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-3xl font-bold text-red-600 mb-2">{stats.total_franchises || 0}</div>
                <div className="text-gray-600">Toplam Ofis</div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.unread_messages || 0}</div>
              <div className="text-gray-600">Okunmamış Mesaj</div>
            </div>

            {isSuperAdmin && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.career_applications || 0}</div>
                  <div className="text-gray-600">Kariyer Başvurusu</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.franchise_applications || 0}</div>
                  <div className="text-gray-600">Franchise Başvurusu</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Son İlanlar</h2>
          {recentProperties.length === 0 ? (
            <p className="text-gray-600">Henüz ilan yok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3">Başlık</th>
                    <th className="text-left p-3">Konum</th>
                    <th className="text-left p-3">Fiyat</th>
                    <th className="text-left p-3">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProperties.map((property) => (
                    <tr key={property.id} className="border-b">
                      <td className="p-3">{property.title}</td>
                      <td className="p-3">{property.city}, {property.district}</td>
                      <td className="p-3">{property.price.toLocaleString('tr-TR')} {property.currency}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          property.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {property.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
