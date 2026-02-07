import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConsultantAuth, consultantPortalAPI } from '../context/ConsultantAuthContext';
import { 
  Home, Plus, Edit2, Trash2, Eye, Image, LogOut, User, 
  Building, Phone, Mail, MapPin, Settings, BarChart3
} from 'lucide-react';

const ConsultantDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { consultant, logout, loading } = useConsultantAuth();
  
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, views: 0 });

  useEffect(() => {
    if (!loading && !consultant) {
      navigate('/consultant/login');
    }
  }, [consultant, loading, navigate]);

  useEffect(() => {
    if (consultant) {
      loadProperties();
    }
  }, [consultant]);

  const loadProperties = async () => {
    try {
      const response = await consultantPortalAPI.getProperties(0, 100);
      const props = response.data.properties || [];
      setProperties(props);
      
      // Calculate stats
      const activeCount = props.filter(p => p.active).length;
      const totalViews = props.reduce((sum, p) => sum + (p.views || 0), 0);
      setStats({
        total: props.length,
        active: activeCount,
        views: totalViews
      });
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await consultantPortalAPI.deleteProperty(propertyId);
      loadProperties();
    } catch (error) {
      alert('Silme işlemi başarısız oldu');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/consultant/login');
  };

  if (loading || !consultant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-red-600 font-bold text-xl">Legend Cities</Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 font-medium">Danışman Portalı</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {consultant.photo_url ? (
                  <img src={consultant.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{consultant.name}</p>
                  <p className="text-xs text-gray-500">{consultant.franchise_name}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden md:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome & Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Hoş Geldiniz, {consultant.name}!
          </h1>
          <p className="text-gray-600">{consultant.title} - {consultant.franchise_name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam İlan</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Aktif İlan</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Görüntülenme</p>
                <p className="text-3xl font-bold text-purple-600">{stats.views}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            to="/consultant/properties/new"
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Yeni İlan Ekle
          </Link>
          <Link
            to="/consultant/profile"
            className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium border"
          >
            <Settings className="w-5 h-5" />
            Profil Ayarları
          </Link>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">İlanlarım</h2>
            <span className="text-sm text-gray-500">{properties.length} ilan</span>
          </div>

          {propertiesLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">Henüz ilan eklemediniz</p>
              <p className="text-sm text-gray-500 mb-6">İlk ilanınızı ekleyerek başlayın</p>
              <Link
                to="/consultant/properties/new"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                <Plus className="w-5 h-5" />
                İlan Ekle
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {properties.map((property) => {
                const imageUrl = property.images?.[0] 
                  ? (property.images[0].startsWith('http') ? property.images[0] : `${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`)
                  : null;
                
                return (
                  <div key={property.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-gray-800 truncate">{property.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {property.city}, {property.district}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              {property.price?.toLocaleString('tr-TR')} {property.currency || 'TL'}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${property.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {property.active ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-gray-500">
                            {property.property_type === 'sale' ? 'Satılık' : 'Kiralık'}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{property.views || 0} görüntülenme</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(property.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          to={`/properties/${property.id}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Görüntüle"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/consultant/properties/${property.id}/edit`}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition"
                          title="Düzenle"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="font-bold text-gray-800 mb-4">İletişim Bilgileriniz</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{consultant.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{consultant.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <span>{consultant.franchise_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
