import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, propertyAPI } from '../../lib/api';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';

const COLORS = ['#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED'];

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const isSuperAdmin = user?.role === 'super_admin';

  // Prepare chart data
  const propertyTypeData = stats?.property_type_distribution ? [
    { name: 'Satılık', value: stats.property_type_distribution.sale },
    { name: 'Kiralık', value: stats.property_type_distribution.rent }
  ] : [];

  const categoryData = stats?.category_distribution ? [
    { name: 'Konut', value: stats.category_distribution.residential },
    { name: 'Ticari', value: stats.category_distribution.commercial },
    { name: 'Arsa', value: stats.category_distribution.land }
  ] : [];

  const cityData = stats?.city_distribution || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard</h1>
          <p className="text-gray-600">Hoşgeldiniz, {user?.name}</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link to="/admin/properties" className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-red-600">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <h3 className="font-bold text-gray-800">İlan Yönetimi</h3>
                <p className="text-xs text-gray-500">İlanları yönet</p>
              </div>
            </div>
          </Link>

          {isSuperAdmin && (
            <Link to="/admin/franchises" className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <h3 className="font-bold text-gray-800">Franchise Yönetimi</h3>
                  <p className="text-xs text-gray-500">Ofisleri yönet</p>
                </div>
              </div>
            </Link>
          )}

          <Link to="/admin/messages" className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-green-600">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✉️</span>
              <div>
                <h3 className="font-bold text-gray-800">Mesajlar</h3>
                <p className="text-xs text-gray-500">Müşteri mesajları</p>
              </div>
            </div>
          </Link>

          {isSuperAdmin && (
            <Link to="/admin/applications" className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-purple-600">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="font-bold text-gray-800">Başvurular</h3>
                  <p className="text-xs text-gray-500">Kariyer & Franchise</p>
                </div>
              </div>
            </Link>
          )}

          <Link to="/admin/consultants" className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-yellow-500">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="font-bold text-gray-800">Danışmanlar</h3>
                <p className="text-xs text-gray-500">Danışman yönetimi</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-5 rounded-lg shadow-md">
              <div className="text-3xl font-bold mb-1">{stats.total_properties || 0}</div>
              <div className="text-red-100 text-sm">Toplam İlan</div>
            </div>

            {isSuperAdmin && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-lg shadow-md">
                <div className="text-3xl font-bold mb-1">{stats.total_franchises || 0}</div>
                <div className="text-blue-100 text-sm">Toplam Ofis</div>
              </div>
            )}

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-lg shadow-md">
              <div className="text-3xl font-bold mb-1">{stats.total_views || 0}</div>
              <div className="text-green-100 text-sm">Toplam Görüntülenme</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-5 rounded-lg shadow-md">
              <div className="text-3xl font-bold mb-1">{stats.unread_messages || 0}</div>
              <div className="text-yellow-100 text-sm">Okunmamış Mesaj</div>
            </div>

            {isSuperAdmin && (
              <>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-lg shadow-md">
                  <div className="text-3xl font-bold mb-1">{stats.career_applications || 0}</div>
                  <div className="text-purple-100 text-sm">Kariyer Başvurusu</div>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-5 rounded-lg shadow-md">
                  <div className="text-3xl font-bold mb-1">{stats.franchise_applications || 0}</div>
                  <div className="text-pink-100 text-sm">Franchise Başvurusu</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Charts Section */}
        {isSuperAdmin && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Property Type Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 İlan Tipi Dağılımı</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🏷️ Kategori Dağılımı</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* City Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🌍 Şehir Dağılımı</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="city" type="category" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#DC2626" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Viewed Properties */}
        {isSuperAdmin && stats?.top_viewed_properties && stats.top_viewed_properties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">👁️ En Çok Görüntülenen İlanlar</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Sıra</th>
                    <th className="text-left p-3 font-semibold">Başlık</th>
                    <th className="text-left p-3 font-semibold">Konum</th>
                    <th className="text-right p-3 font-semibold">Görüntülenme</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_viewed_properties.map((property, index) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link to={`/properties/${property.id}`} className="text-red-600 hover:underline font-medium">
                          {property.title}
                        </Link>
                      </td>
                      <td className="p-3 text-gray-600">{property.city}, {property.district}</td>
                      <td className="p-3 text-right">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          👁️ {property.view_count || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">🕐 Son İlanlar</h2>
            <Link to="/admin/properties" className="text-red-600 hover:underline text-sm">
              Tümünü Gör →
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <p className="text-gray-600">Henüz ilan yok</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-semibold">Başlık</th>
                    <th className="text-left p-3 font-semibold">Konum</th>
                    <th className="text-left p-3 font-semibold">Fiyat</th>
                    <th className="text-center p-3 font-semibold">Görüntülenme</th>
                    <th className="text-left p-3 font-semibold">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProperties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Link to={`/properties/${property.id}`} className="hover:text-red-600">
                          {property.title}
                        </Link>
                      </td>
                      <td className="p-3 text-gray-600">{property.city}, {property.district}</td>
                      <td className="p-3 font-semibold">{property.price?.toLocaleString('tr-TR')} {property.currency}</td>
                      <td className="p-3 text-center">
                        <span className="text-gray-600">👁️ {property.view_count || 0}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          property.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {property.active !== false ? 'Aktif' : 'Pasif'}
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
