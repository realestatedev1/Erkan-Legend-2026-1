import React, { useState, useEffect } from 'react';
import { propertyAPI, locationAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const PropertyManagement = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, details, features, images
  const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'inactive', 'all'
  
  // Lokasyon state'leri
  const [cities] = useState([
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın',
    'Ağrı', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
    'Bursa', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
    'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Iğdır', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars',
    'Kastamonu', 'Kayseri', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Kırklareli', 'Kırıkkale', 'Kırşehir', 'Malatya',
    'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
    'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak',
    'Van', 'Yalova', 'Yozgat', 'Zonguldak', 'Çanakkale', 'Çankırı', 'Çorum', 'İstanbul', 'İzmir', 'Şanlıurfa', 'Şırnak'
  ]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);

  const initialFormData = {
    // Temel Bilgiler
    title: '',
    description: '',
    property_type: 'sale',
    category: 'residential',
    sub_category: '',
    price: '',
    currency: 'TRY',
    
    // Konum
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    
    // Alan Bilgileri
    area_gross: '',
    area_net: '',
    rooms: '',
    bathrooms: '',
    
    // Kat Bilgileri
    floor: '',
    total_floors: '',
    
    // Bina Bilgileri
    age: '',
    building_type: '',
    
    // Isınma ve Özellikler
    heating: '',
    furnished: '',
    usage_status: '',
    parking: '',
    facade: '',
    
    // Finansal
    dues: '',
    credit_eligible: false,
    exchange: false,
    
    // Özellikler (Boolean)
    balcony: false,
    elevator: false,
    in_complex: false,
    smart_home: false,
    security: false,
    pool: false,
    gym: false,
    garden: false,
    terrace: false,
    
    // Diğer
    featured: false,
    images: [],
    features: []
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadProperties();
  }, []);

  // Şehir değiştiğinde ilçeleri yükle
  useEffect(() => {
    if (formData.city) {
      loadDistricts(formData.city);
    } else {
      setDistricts([]);
      setNeighborhoods([]);
    }
  }, [formData.city]);

  // İlçe değiştiğinde mahalleleri yükle
  useEffect(() => {
    if (formData.city && formData.district) {
      loadNeighborhoods(formData.city, formData.district);
    } else {
      setNeighborhoods([]);
    }
  }, [formData.district]);

  const loadDistricts = async (city) => {
    try {
      const response = await locationAPI.getDistricts(city);
      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error('Failed to load districts:', error);
      setDistricts([]);
    }
  };

  const loadNeighborhoods = async (city, district) => {
    try {
      const response = await locationAPI.getNeighborhoods(city, district);
      setNeighborhoods(response.data.neighborhoods || []);
    } catch (error) {
      console.error('Failed to load neighborhoods:', error);
      setNeighborhoods([]);
    }
  };

  const loadProperties = async () => {
    try {
      const params = user?.role === 'franchise_admin' ? { franchise_id: user.franchise_id } : {};
      const response = await propertyAPI.getAll({ ...params, limit: 100 });
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Boş stringleri null'a çevir
    const cleanedData = {};
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value === '' || value === null || value === undefined) {
        cleanedData[key] = null;
      } else if (key === 'price' || key === 'area_gross' || key === 'area_net' || key === 'dues') {
        cleanedData[key] = parseFloat(value) || null;
      } else if (key === 'age' || key === 'total_floors' || key === 'bathrooms') {
        cleanedData[key] = parseInt(value) || null;
      } else {
        cleanedData[key] = value;
      }
    });

    try {
      if (editingProperty) {
        await propertyAPI.update(editingProperty.id, cleanedData);
      } else {
        await propertyAPI.create(cleanedData);
      }
      
      setShowForm(false);
      setEditingProperty(null);
      setFormData(initialFormData);
      setActiveTab('basic');
      loadProperties();
      
      alert('İlan başarıyla kaydedildi!');
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('Kaydetme başarısız: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleImageUpload = async (e, propertyId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await propertyAPI.uploadImage(propertyId, file);
      }
      
      alert(`${files.length} resim başarıyla yüklendi!`);
      loadProperties();
      
      if (editingProperty && editingProperty.id === propertyId) {
        const response = await propertyAPI.getById(propertyId);
        setFormData({ ...formData, images: response.data.images || [] });
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Resim yükleme başarısız: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('İlanı silmek istediğinize emin misiniz?')) return;
    try {
      await propertyAPI.delete(id);
      loadProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Silme başarısız');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      ...initialFormData,
      ...property,
      price: property.price || '',
      area_gross: property.area_gross || '',
      area_net: property.area_net || '',
      dues: property.dues || '',
      age: property.age || '',
      total_floors: property.total_floors || '',
      bathrooms: property.bathrooms || '',
    });
    setShowForm(true);
    setActiveTab('basic');
  };

  const handleRemoveImage = async (imageUrl) => {
    if (!editingProperty) return;
    
    const updatedImages = formData.images.filter(img => img !== imageUrl);
    
    try {
      await propertyAPI.update(editingProperty.id, { images: updatedImages });
      setFormData({ ...formData, images: updatedImages });
      alert('Resim kaldırıldı!');
      loadProperties();
    } catch (error) {
      console.error('Failed to remove image:', error);
      alert('Resim kaldırma başarısız');
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('İlanı pasife almak istediğinize emin misiniz? İlan arşive taşınacak.')) return;
    try {
      await propertyAPI.deactivate(id);
      loadProperties();
      alert('İlan pasife alındı (arşivlendi)');
    } catch (error) {
      console.error('Failed to deactivate property:', error);
      alert('Pasife alma başarısız: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('İlanı tekrar yayınlamak istediğinize emin misiniz?')) return;
    try {
      await propertyAPI.activate(id);
      loadProperties();
      alert('İlan tekrar yayınlandı');
    } catch (error) {
      console.error('Failed to activate property:', error);
      alert('Yayınlama başarısız: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Filtrelenmiş ilanlar
  const filteredProperties = properties.filter(property => {
    if (statusFilter === 'active') return property.active !== false;
    if (statusFilter === 'inactive') return property.active === false;
    return true; // 'all'
  });

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleCheckboxChange = (key) => {
    setFormData({ ...formData, [key]: !formData[key] });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">İlan Yönetimi</h1>
            {/* Status Filter Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✓ Aktif İlanlar ({properties.filter(p => p.active !== false).length})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'inactive'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⏸ Arşiv ({properties.filter(p => p.active === false).length})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📋 Tümü ({properties.length})
              </button>
            </div>
          </div>
          <button 
            onClick={() => { 
              setShowForm(true); 
              setEditingProperty(null); 
              setFormData(initialFormData);
              setActiveTab('basic');
            }} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            data-testid="add-property-button"
          >
            <span className="text-xl">+</span> Yeni İlan Ekle
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingProperty ? 'İlan Düzenle' : 'Yeni İlan'}</h2>
              <button 
                onClick={() => { setShowForm(false); setEditingProperty(null); }} 
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b mb-6">
              {[
                { id: 'basic', label: '📋 Temel Bilgiler' },
                { id: 'details', label: '🏠 Detaylar' },
                { id: 'features', label: '✨ Özellikler' },
                { id: 'images', label: '📷 Görseller', disabled: !editingProperty }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`px-6 py-3 font-medium transition ${
                    activeTab === tab.id 
                      ? 'border-b-2 border-red-600 text-red-600' 
                      : tab.disabled 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* TAB 1: TEMEL BİLGİLER */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Başlık */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">İlan Başlığı *</label>
                      <input 
                        type="text" 
                        placeholder="Örn: Kadıköy'de Deniz Manzaralı 3+1 Daire" 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600" 
                        value={formData.title} 
                        onChange={(e) => handleChange('title', e.target.value)} 
                        required 
                      />
                    </div>

                    {/* İlan Tipi & Kategori */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">İlan Tipi *</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.property_type} 
                        onChange={(e) => handleChange('property_type', e.target.value)}
                      >
                        <option value="sale">Satılık</option>
                        <option value="rent">Kiralık</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Kategori *</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.category} 
                        onChange={(e) => handleChange('category', e.target.value)}
                      >
                        <option value="residential">Konut</option>
                        <option value="commercial">Ticari</option>
                        <option value="land">Arsa</option>
                        <option value="tourism">Turizm</option>
                      </select>
                    </div>

                    {/* Alt Kategori */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Alt Kategori</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.sub_category} 
                        onChange={(e) => handleChange('sub_category', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        {formData.category === 'residential' && (
                          <>
                            <option value="apartment">Daire</option>
                            <option value="residence">Rezidans</option>
                            <option value="villa">Villa</option>
                            <option value="detached">Müstakil Ev</option>
                            <option value="farm">Çiftlik Evi</option>
                            <option value="mansion">Köşk / Konak</option>
                            <option value="summer">Yazlık</option>
                            <option value="prefabricated">Prefabrik</option>
                          </>
                        )}
                        {formData.category === 'commercial' && (
                          <>
                            <option value="office">Ofis</option>
                            <option value="shop">Dükkan / Mağaza</option>
                            <option value="plaza">Plaza</option>
                            <option value="warehouse">Depo</option>
                            <option value="factory">Fabrika</option>
                            <option value="workshop">Atölye</option>
                          </>
                        )}
                        {formData.category === 'land' && (
                          <>
                            <option value="residential_land">İmarlı</option>
                            <option value="agricultural">Tarla</option>
                            <option value="vineyard">Bağ / Bahçe</option>
                            <option value="commercial_land">Ticari İmarlı</option>
                          </>
                        )}
                        {formData.category === 'tourism' && (
                          <>
                            <option value="hotel">Otel</option>
                            <option value="boutique">Butik Otel</option>
                            <option value="apart">Apart</option>
                            <option value="pension">Pansiyon</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Fiyat */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Fiyat *</label>
                      <div className="flex">
                        <input 
                          type="number" 
                          placeholder="Fiyat" 
                          className="flex-1 px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-red-600" 
                          value={formData.price} 
                          onChange={(e) => handleChange('price', e.target.value)} 
                          required 
                        />
                        <select 
                          className="px-4 py-3 border-t border-b border-r rounded-r-lg bg-gray-50"
                          value={formData.currency}
                          onChange={(e) => handleChange('currency', e.target.value)}
                        >
                          <option value="TRY">₺ TRY</option>
                          <option value="USD">$ USD</option>
                          <option value="EUR">€ EUR</option>
                          <option value="GBP">£ GBP</option>
                        </select>
                      </div>
                    </div>

                    {/* Konum: Şehir */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Şehir *</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.city} 
                        onChange={(e) => handleChange('city', e.target.value)} 
                        required
                      >
                        <option value="">Şehir Seçin</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Konum: İlçe */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">İlçe *</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.district} 
                        onChange={(e) => handleChange('district', e.target.value)} 
                        required
                        disabled={!formData.city}
                      >
                        <option value="">{formData.city ? 'İlçe Seçin' : 'Önce şehir seçin'}</option>
                        {districts.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>

                    {/* Konum: Mahalle */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Mahalle</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.neighborhood} 
                        onChange={(e) => handleChange('neighborhood', e.target.value)}
                        disabled={!formData.district}
                      >
                        <option value="">{formData.district ? 'Mahalle Seçin' : 'Önce ilçe seçin'}</option>
                        {neighborhoods.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Adres */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Açık Adres *</label>
                      <input 
                        type="text" 
                        placeholder="Cadde, Sokak, Bina No vb." 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.address} 
                        onChange={(e) => handleChange('address', e.target.value)} 
                        required 
                      />
                    </div>

                    {/* Açıklama */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">İlan Açıklaması *</label>
                      <textarea 
                        placeholder="İlan hakkında detaylı bilgi yazın..." 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        rows="5" 
                        value={formData.description} 
                        onChange={(e) => handleChange('description', e.target.value)} 
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                      Devam → Detaylar
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: DETAYLAR */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Alan Bilgileri */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Brüt m²</label>
                      <input 
                        type="number" 
                        placeholder="Brüt alan" 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.area_gross} 
                        onChange={(e) => handleChange('area_gross', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Net m²</label>
                      <input 
                        type="number" 
                        placeholder="Net alan" 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.area_net} 
                        onChange={(e) => handleChange('area_net', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Oda Sayısı</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.rooms} 
                        onChange={(e) => handleChange('rooms', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="1+0">Stüdyo (1+0)</option>
                        <option value="1+1">1+1</option>
                        <option value="2+1">2+1</option>
                        <option value="2+2">2+2</option>
                        <option value="3+1">3+1</option>
                        <option value="3+2">3+2</option>
                        <option value="4+1">4+1</option>
                        <option value="4+2">4+2</option>
                        <option value="5+1">5+1</option>
                        <option value="5+2">5+2</option>
                        <option value="6+1">6+1</option>
                        <option value="6+2">6+2</option>
                        <option value="7+">7 ve üzeri</option>
                      </select>
                    </div>

                    {/* Banyo & Yaş */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Banyo Sayısı</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.bathrooms} 
                        onChange={(e) => handleChange('bathrooms', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bina Yaşı</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.age} 
                        onChange={(e) => handleChange('age', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="0">Sıfır Bina</option>
                        <option value="1">1 yıllık</option>
                        <option value="2">2 yıllık</option>
                        <option value="3">3 yıllık</option>
                        <option value="4">4 yıllık</option>
                        <option value="5">5-10 yıl arası</option>
                        <option value="10">10-15 yıl arası</option>
                        <option value="15">15-20 yıl arası</option>
                        <option value="20">20-25 yıl arası</option>
                        <option value="25">25-30 yıl arası</option>
                        <option value="30">30+ yıl</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bina Tipi</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.building_type} 
                        onChange={(e) => handleChange('building_type', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="apartment">Apartman Dairesi</option>
                        <option value="residence">Rezidans</option>
                        <option value="villa">Villa</option>
                        <option value="detached">Müstakil</option>
                        <option value="twin">İkiz</option>
                        <option value="triplex">Tripleks</option>
                        <option value="dublex">Dubleks</option>
                      </select>
                    </div>

                    {/* Kat Bilgileri */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bulunduğu Kat</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.floor} 
                        onChange={(e) => handleChange('floor', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="bodrum">Bodrum Kat</option>
                        <option value="zemin">Zemin Kat</option>
                        <option value="bahce">Bahçe Katı</option>
                        <option value="giris">Giriş Kat / Yüksek Giriş</option>
                        <option value="1">1. Kat</option>
                        <option value="2">2. Kat</option>
                        <option value="3">3. Kat</option>
                        <option value="4">4. Kat</option>
                        <option value="5">5. Kat</option>
                        <option value="6">6. Kat</option>
                        <option value="7">7. Kat</option>
                        <option value="8">8. Kat</option>
                        <option value="9">9. Kat</option>
                        <option value="10">10. Kat</option>
                        <option value="11-15">11-15. Kat</option>
                        <option value="16-20">16-20. Kat</option>
                        <option value="21-25">21-25. Kat</option>
                        <option value="26-30">26-30. Kat</option>
                        <option value="31+">31+ Kat</option>
                        <option value="cati">Çatı Katı</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bina Kat Sayısı</label>
                      <input 
                        type="number" 
                        placeholder="Toplam kat" 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.total_floors} 
                        onChange={(e) => handleChange('total_floors', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Cephe</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.facade} 
                        onChange={(e) => handleChange('facade', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="kuzey">Kuzey</option>
                        <option value="guney">Güney</option>
                        <option value="dogu">Doğu</option>
                        <option value="bati">Batı</option>
                        <option value="kuzey-dogu">Kuzey-Doğu</option>
                        <option value="kuzey-bati">Kuzey-Batı</option>
                        <option value="guney-dogu">Güney-Doğu</option>
                        <option value="guney-bati">Güney-Batı</option>
                      </select>
                    </div>

                    {/* Isınma & Eşya */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Isınma Tipi</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.heating} 
                        onChange={(e) => handleChange('heating', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="dogalgaz">Doğalgaz (Bireysel)</option>
                        <option value="merkezi">Merkezi Sistem</option>
                        <option value="merkezi_pay">Merkezi (Pay Ölçer)</option>
                        <option value="kombi">Kombi (Doğalgaz)</option>
                        <option value="yerden">Yerden Isıtma</option>
                        <option value="klima">Klima</option>
                        <option value="soba">Soba</option>
                        <option value="fuel_oil">Fuel-Oil</option>
                        <option value="yok">Yok</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Eşya Durumu</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.furnished} 
                        onChange={(e) => handleChange('furnished', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="evet">Eşyalı</option>
                        <option value="hayir">Boş</option>
                        <option value="kismen">Kısmen Eşyalı</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Kullanım Durumu</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.usage_status} 
                        onChange={(e) => handleChange('usage_status', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="bos">Boş</option>
                        <option value="kiracili">Kiracılı</option>
                        <option value="mulk_sahibi">Mülk Sahibi Oturuyor</option>
                      </select>
                    </div>

                    {/* Otopark & Aidat */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Otopark</label>
                      <select 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.parking} 
                        onChange={(e) => handleChange('parking', e.target.value)}
                      >
                        <option value="">Seçiniz</option>
                        <option value="kapali">Kapalı Otopark</option>
                        <option value="acik">Açık Otopark</option>
                        <option value="yol">Yol Üstü Park</option>
                        <option value="yok">Yok</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Aidat (Aylık)</label>
                      <input 
                        type="number" 
                        placeholder="Aylık aidat tutarı" 
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-600" 
                        value={formData.dues} 
                        onChange={(e) => handleChange('dues', e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab('basic')}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      ← Geri
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('features')}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                      Devam → Özellikler
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ÖZELLİKLER */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  {/* Finansal Özellikler */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-gray-700">💰 Finansal Bilgiler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.credit_eligible}
                          onChange={() => handleCheckboxChange('credit_eligible')}
                        />
                        <span>Krediye Uygun</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.exchange}
                          onChange={() => handleCheckboxChange('exchange')}
                        />
                        <span>Takas</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.featured}
                          onChange={() => handleCheckboxChange('featured')}
                        />
                        <span>⭐ Vitrin İlanı</span>
                      </label>
                    </div>
                  </div>

                  {/* Bina Özellikleri */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-gray-700">🏢 Bina Özellikleri</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.in_complex}
                          onChange={() => handleCheckboxChange('in_complex')}
                        />
                        <span>Site İçinde</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.elevator}
                          onChange={() => handleCheckboxChange('elevator')}
                        />
                        <span>Asansör</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.security}
                          onChange={() => handleCheckboxChange('security')}
                        />
                        <span>Güvenlik</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.smart_home}
                          onChange={() => handleCheckboxChange('smart_home')}
                        />
                        <span>Akıllı Ev</span>
                      </label>
                    </div>
                  </div>

                  {/* İç Özellikler */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-gray-700">🏠 İç Özellikler</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.balcony}
                          onChange={() => handleCheckboxChange('balcony')}
                        />
                        <span>Balkon</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.terrace}
                          onChange={() => handleCheckboxChange('terrace')}
                        />
                        <span>Teras</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.garden}
                          onChange={() => handleCheckboxChange('garden')}
                        />
                        <span>Bahçe</span>
                      </label>
                    </div>
                  </div>

                  {/* Sosyal Özellikler */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 text-gray-700">🏊 Sosyal Alanlar</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.pool}
                          onChange={() => handleCheckboxChange('pool')}
                        />
                        <span>Havuz</span>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-600"
                          checked={formData.gym}
                          onChange={() => handleCheckboxChange('gym')}
                        />
                        <span>Spor Salonu</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setActiveTab('details')}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      ← Geri
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-semibold"
                      data-testid="save-property-button"
                    >
                      ✓ {editingProperty ? 'Güncelle' : 'İlanı Kaydet'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: GÖRSELLER */}
              {activeTab === 'images' && editingProperty && (
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">📷 İlan Görselleri</h3>
                    
                    {/* Mevcut Resimler */}
                    {formData.images && formData.images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={`${process.env.REACT_APP_BACKEND_URL}${img}`}
                              alt={`Görsel ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img)}
                              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                            >
                              ✕
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                Kapak
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Henüz görsel eklenmemiş
                      </div>
                    )}

                    {/* Yeni Resim Yükle */}
                    <div className="border-t pt-4">
                      <label className="block mb-2 text-sm font-semibold">Yeni Görsel Ekle:</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageUpload(e, editingProperty.id)}
                        disabled={uploadingImages}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />
                      {uploadingImages && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          Resimler yükleniyor...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab('features')}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      ← Geri
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingProperty(null); }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      ✓ Tamamlandı
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* İlan Listesi */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {properties.length === 0 ? (
            <div className="p-8 text-center text-gray-600">Henüz ilan yok</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Resim</th>
                  <th className="text-left p-4">Başlık</th>
                  <th className="text-left p-4">Konum</th>
                  <th className="text-left p-4">Fiyat</th>
                  <th className="text-left p-4">Özellikler</th>
                  <th className="text-left p-4">Durum</th>
                  <th className="text-left p-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={`${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          Resim Yok
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{property.title}</div>
                      <div className="text-sm text-gray-500">{property.rooms} • {property.area_gross || property.area_net || property.area_sqm} m²</div>
                    </td>
                    <td className="p-4 text-sm">{property.district}, {property.city}</td>
                    <td className="p-4 font-semibold text-red-600">{property.price?.toLocaleString('tr-TR')} {property.currency || 'TRY'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {property.credit_eligible && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Kredi</span>}
                        {property.in_complex && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Site</span>}
                        {property.elevator && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Asansör</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${property.active ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                        {property.active ? 'Aktif' : 'Pasif'}
                      </span>
                      {property.featured && (
                        <span className="ml-1 px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700">
                          Vitrin
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleEdit(property)} 
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(property.id)} 
                        className="text-red-600 hover:text-red-800"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyManagement;
