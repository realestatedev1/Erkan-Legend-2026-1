import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { consultantAPI, franchiseAPI } from '../../lib/api';
import { Plus, Edit2, Trash2, Phone, Mail, User, X, Upload, Search } from 'lucide-react';

const ConsultantManagement = () => {
  const { t } = useTranslation();
  const [consultants, setConsultants] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState(null);
  const [filterFranchise, setFilterFranchise] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    franchise_id: '',
    name: '',
    title: 'Gayrimenkul Danışmanı',
    phone: '',
    email: '',
    username: '',
    password: '',
    bio: '',
    experience_years: '',
    specialization: [],
    languages: []
  });

  const specializationOptions = [
    'Konut', 'Ticari', 'Arsa', 'Tarla', 'Villa', 'Residence', 'Ofis', 'Dükkan'
  ];

  const languageOptions = [
    'Türkçe', 'İngilizce', 'Almanca', 'Rusça', 'Arapça', 'Fransızca'
  ];

  useEffect(() => {
    loadData();
  }, [filterFranchise]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [consultantsRes, franchisesRes] = await Promise.all([
        consultantAPI.getAll(filterFranchise || null, false),
        franchiseAPI.getAll(false)
      ]);
      setConsultants(consultantsRes.data);
      setFranchises(franchisesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null
      };

      if (editingConsultant) {
        await consultantAPI.update(editingConsultant.id, data);
      } else {
        await consultantAPI.create(data);
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save consultant:', error);
      alert(error.response?.data?.detail || 'Bir hata oluştu');
    }
  };

  const handleEdit = (consultant) => {
    setEditingConsultant(consultant);
    setFormData({
      franchise_id: consultant.franchise_id,
      name: consultant.name,
      title: consultant.title || 'Gayrimenkul Danışmanı',
      phone: consultant.phone,
      email: consultant.email,
      bio: consultant.bio || '',
      experience_years: consultant.experience_years || '',
      specialization: consultant.specialization || [],
      languages: consultant.languages || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu danışmanı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await consultantAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete consultant:', error);
      alert('Silme işlemi başarısız oldu');
    }
  };

  const handlePhotoUpload = async (consultantId, file) => {
    try {
      await consultantAPI.uploadPhoto(consultantId, file);
      loadData();
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Fotoğraf yükleme başarısız oldu');
    }
  };

  const resetForm = () => {
    setEditingConsultant(null);
    setFormData({
      franchise_id: '',
      name: '',
      title: 'Gayrimenkul Danışmanı',
      phone: '',
      email: '',
      bio: '',
      experience_years: '',
      specialization: [],
      languages: []
    });
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const filteredConsultants = consultants.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && consultants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Danışman Yönetimi</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <Plus className="w-5 h-5" />
            Yeni Danışman
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="İsim veya e-posta ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={filterFranchise}
                onChange={(e) => setFilterFranchise(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tüm Ofisler</option>
                {franchises.map(f => (
                  <option key={f.id} value={f.id}>{f.office_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Consultants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredConsultants.map((consultant) => {
            const photoUrl = consultant.photo_url 
              ? (consultant.photo_url.startsWith('http') ? consultant.photo_url : `${process.env.REACT_APP_BACKEND_URL}${consultant.photo_url}`)
              : null;
            
            return (
              <div key={consultant.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Photo Section */}
                <div className="relative h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt={consultant.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-red-400" />
                    </div>
                  )}
                  
                  {/* Photo Upload Button */}
                  <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-gray-100">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handlePhotoUpload(consultant.id, e.target.files[0]);
                        }
                      }}
                    />
                  </label>

                  {/* Status Badge */}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                    consultant.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {consultant.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {/* Info Section */}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{consultant.name}</h3>
                  <p className="text-sm text-red-600 mb-2">{consultant.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{consultant.franchise_name}</p>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {consultant.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {consultant.email}
                    </p>
                  </div>

                  {consultant.experience_years && (
                    <p className="text-xs text-gray-500 mb-2">
                      {consultant.experience_years} yıl deneyim
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                      onClick={() => handleEdit(consultant)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 px-3 rounded hover:bg-blue-100 transition text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(consultant.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 py-2 px-3 rounded hover:bg-red-100 transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredConsultants.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Danışman bulunamadı</p>
            <p className="text-gray-500">Yeni danışman eklemek için yukarıdaki butonu kullanın.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
                <h2 className="text-xl font-bold">
                  {editingConsultant ? 'Danışman Düzenle' : 'Yeni Danışman Ekle'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Franchise Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ofis *</label>
                  <select
                    value={formData.franchise_id}
                    onChange={(e) => setFormData({ ...formData, franchise_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Ofis Seçin</option>
                    {franchises.filter(f => f.active).map(f => (
                      <option key={f.id} value={f.id}>{f.office_name} - {f.city}</option>
                    ))}
                  </select>
                </div>

                {/* Name & Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Örn: Ahmet Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ünvan</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Gayrimenkul Danışmanı"
                    />
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim (Yıl)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Örn: 5"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hakkında</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Kısa biyografi..."
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanları</label>
                  <div className="flex flex-wrap gap-2">
                    {specializationOptions.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleArrayItem('specialization', spec)}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          formData.specialization.includes(spec)
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diller</label>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleArrayItem('languages', lang)}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          formData.languages.includes(lang)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    {editingConsultant ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantManagement;
