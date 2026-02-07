import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConsultantAuth, consultantPortalAPI } from '../../context/ConsultantAuthContext';
import { locationAPI } from '../../lib/api';
import { ArrowLeft, Save, Upload, X, MapPin, Home, Building, Plus } from 'lucide-react';

const ConsultantPropertyForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { consultant, loading: authLoading } = useConsultantAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [savedPropertyId, setSavedPropertyId] = useState(null);
  
  // Location states
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
    title: '',
    description: '',
    property_type: 'sale',
    category: 'residential',
    sub_category: '',
    price: '',
    currency: 'TRY',
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    area_gross: '',
    area_net: '',
    rooms: '',
    bathrooms: '',
    floor: '',
    total_floors: '',
    age: '',
    building_type: '',
    heating: '',
    furnished: '',
    usage_status: '',
    parking: '',
    facade: '',
    dues: '',
    credit_eligible: false,
    exchange: false,
    balcony: false,
    elevator: false,
    in_complex: false,
    smart_home: false,
    security: false,
    pool: false,
    gym: false,
    garden: false,
    terrace: false,
    featured: false,
    images: [],
    latitude: null,
    longitude: null
  };

  const [formData, setFormData] = useState(initialFormData);

  // Auth check
  useEffect(() => {
    if (!authLoading && !consultant) {
      navigate('/consultant/login');
    }
  }, [consultant, authLoading, navigate]);

  // Load property if editing
  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  // Load districts when city changes
  useEffect(() => {
    if (formData.city) {
      loadDistricts(formData.city);
    } else {
      setDistricts([]);
      setNeighborhoods([]);
    }
  }, [formData.city]);

  // Load neighborhoods when district changes
  useEffect(() => {
    if (formData.city && formData.district) {
      loadNeighborhoods(formData.city, formData.district);
    } else {
      setNeighborhoods([]);
    }
  }, [formData.district]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const response = await consultantPortalAPI.getProperties(0, 100);
      const property = response.data.properties?.find(p => p.id === propertyId);
      if (property) {
        setFormData({
          ...initialFormData,
          ...property,
          price: property.price || '',
          area_gross: property.area_gross || '',
          area_net: property.area_net || '',
          dues: property.dues || '',
        });
        setSavedPropertyId(propertyId);
      } else {
        alert('İlan bulunamadı');
        navigate('/consultant/dashboard');
      }
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Clean data
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
      let response;
      if (propertyId || savedPropertyId) {
        response = await consultantPortalAPI.updateProperty(propertyId || savedPropertyId, cleanedData);
        alert('İlan başarıyla güncellendi!');
      } else {
        response = await consultantPortalAPI.createProperty(cleanedData);
        const newId = response.data.property?.id;
        if (newId) {
          setSavedPropertyId(newId);
          alert('İlan başarıyla oluşturuldu! Şimdi resim ekleyebilirsiniz.');
          setActiveTab('images');
        }
      }
    } catch (error) {
      console.error('Failed to save property:', error);
      alert('Kaydetme başarısız: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const targetId = propertyId || savedPropertyId;
    if (!targetId) {
      alert('Lütfen önce ilanı kaydedin, sonra resim ekleyin.');
      return;
    }

    setUploadingImages(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await consultantPortalAPI.uploadPropertyImage(targetId, file);
      }
      
      alert(`${files.length} resim başarıyla yüklendi!`);
      
      // Reload property to get updated images
      const response = await consultantPortalAPI.getProperties(0, 100);
      const property = response.data.properties?.find(p => p.id === targetId);
      if (property) {
        setFormData(prev => ({ ...prev, images: property.images || [] }));
      }
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Resim yükleme başarısız: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploadingImages(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: 'Temel Bilgiler', icon: Home },
    { id: 'details', label: 'Detaylar', icon: Building },
    { id: 'features', label: 'Özellikler', icon: Plus },
    { id: 'images', label: 'Resimler', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/consultant/dashboard" className="text-gray-600 hover:text-red-600">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold text-gray-800">
                {propertyId ? 'İlan Düzenle' : 'Yeni İlan Ekle'}
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {consultant?.name} - {consultant?.franchise_name}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Temel Bilgiler</h2>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İlan Başlığı *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Örn: Etiler'de Deniz Manzaralı 3+1 Daire"
                />
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İlan Tipi *</label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="sale">Satılık</option>
                    <option value="rent">Kiralık</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="residential">Konut</option>
                    <option value="commercial">Ticari</option>
                    <option value="land">Arsa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alt Kategori</label>
                  <select
                    value={formData.sub_category}
                    onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    {formData.category === 'residential' && (
                      <>
                        <option value="apartment">Daire</option>
                        <option value="villa">Villa</option>
                        <option value="residence">Residence</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="detached">Müstakil Ev</option>
                      </>
                    )}
                    {formData.category === 'commercial' && (
                      <>
                        <option value="office">Ofis</option>
                        <option value="shop">Dükkan</option>
                        <option value="warehouse">Depo</option>
                        <option value="factory">Fabrika</option>
                      </>
                    )}
                    {formData.category === 'land' && (
                      <>
                        <option value="plot">İmarlı Arsa</option>
                        <option value="field">Tarla</option>
                        <option value="garden">Bahçe</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="TRY">TL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="border-t pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Konum Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                    <select
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value, district: '', neighborhood: '' })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Şehir Seçin</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">İlçe *</label>
                    <select
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value, neighborhood: '' })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                      disabled={!formData.city}
                    >
                      <option value="">İlçe Seçin</option>
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mahalle</label>
                    <select
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                      disabled={!formData.district}
                    >
                      <option value="">Mahalle Seçin</option>
                      {neighborhoods.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="Cadde, sokak, bina no..."
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="İlan hakkında detaylı açıklama..."
                />
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Detay Bilgileri</h2>
              
              {/* Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brüt m²</label>
                  <input
                    type="number"
                    value={formData.area_gross}
                    onChange={(e) => setFormData({ ...formData, area_gross: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Net m²</label>
                  <input
                    type="number"
                    value={formData.area_net}
                    onChange={(e) => setFormData({ ...formData, area_net: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Oda Sayısı</label>
                  <select
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="1+0">Stüdyo (1+0)</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="3+2">3+2</option>
                    <option value="4+1">4+1</option>
                    <option value="4+2">4+2</option>
                    <option value="5+1">5+1</option>
                    <option value="5+2">5+2</option>
                    <option value="6+">6 ve üzeri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banyo Sayısı</label>
                  <select
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>

              {/* Floor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulunduğu Kat</label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="basement">Bodrum</option>
                    <option value="ground">Zemin/Giriş</option>
                    <option value="mezzanine">Asma Kat</option>
                    {[...Array(30)].map((_, i) => (
                      <option key={i+1} value={String(i+1)}>{i+1}. Kat</option>
                    ))}
                    <option value="penthouse">Çatı Katı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bina Kat Sayısı</label>
                  <input
                    type="number"
                    value={formData.total_floors}
                    onChange={(e) => setFormData({ ...formData, total_floors: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              {/* Building Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bina Yaşı</label>
                  <select
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="0">Sıfır Bina</option>
                    <option value="1">1-5 Yaş</option>
                    <option value="6">6-10 Yaş</option>
                    <option value="11">11-15 Yaş</option>
                    <option value="16">16-20 Yaş</option>
                    <option value="21">21+ Yaş</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Isıtma</label>
                  <select
                    value={formData.heating}
                    onChange={(e) => setFormData({ ...formData, heating: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="central">Merkezi</option>
                    <option value="individual">Bireysel</option>
                    <option value="floor">Yerden Isıtma</option>
                    <option value="air_conditioning">Klima</option>
                    <option value="stove">Soba</option>
                    <option value="none">Yok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eşya Durumu</label>
                  <select
                    value={formData.furnished}
                    onChange={(e) => setFormData({ ...formData, furnished: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="furnished">Eşyalı</option>
                    <option value="semi_furnished">Yarı Eşyalı</option>
                    <option value="unfurnished">Eşyasız</option>
                  </select>
                </div>
              </div>

              {/* Financial */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aidat (TL/Ay)</label>
                  <input
                    type="number"
                    value={formData.dues}
                    onChange={(e) => setFormData({ ...formData, dues: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.credit_eligible}
                      onChange={(e) => setFormData({ ...formData, credit_eligible: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded"
                    />
                    <span className="text-sm">Krediye Uygun</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.exchange}
                      onChange={(e) => setFormData({ ...formData, exchange: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded"
                    />
                    <span className="text-sm">Takasa Açık</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-6">Özellikler</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'balcony', label: 'Balkon' },
                  { key: 'elevator', label: 'Asansör' },
                  { key: 'in_complex', label: 'Site İçinde' },
                  { key: 'smart_home', label: 'Akıllı Ev' },
                  { key: 'security', label: 'Güvenlik' },
                  { key: 'pool', label: 'Havuz' },
                  { key: 'gym', label: 'Spor Salonu' },
                  { key: 'garden', label: 'Bahçe' },
                  { key: 'terrace', label: 'Teras' },
                ].map(feature => (
                  <label key={feature.key} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData[feature.key]}
                      onChange={(e) => setFormData({ ...formData, [feature.key]: e.target.checked })}
                      className="w-5 h-5 text-red-600 rounded"
                    />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-6">Resimler</h2>
              
              {!propertyId && !savedPropertyId ? (
                <div className="text-center py-8 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 font-medium mb-2">
                    Resim yüklemek için önce ilanı kaydedin
                  </p>
                  <p className="text-sm text-yellow-600">
                    "Temel Bilgiler" sekmesini doldurup kaydedin, sonra resim ekleyebilirsiniz.
                  </p>
                </div>
              ) : (
                <>
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {uploadingImages ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-2"></div>
                          <span className="text-gray-500">Yükleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <span className="text-red-600 font-medium">Resim yüklemek için tıklayın</span>
                          <p className="text-sm text-gray-500 mt-1">veya sürükleyip bırakın (PNG, JPG)</p>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Current Images */}
                  {formData.images && formData.images.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Mevcut Resimler ({formData.images.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((img, index) => {
                          const imgUrl = img.startsWith('http') ? img : `${process.env.REACT_APP_BACKEND_URL}${img}`;
                          return (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                              <img src={imgUrl} alt={`Resim ${index + 1}`} className="w-full h-full object-cover" />
                              {index === 0 && (
                                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                  Ana Resim
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex gap-4">
            <Link
              to="/consultant/dashboard"
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-center font-medium hover:bg-gray-50 transition"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {propertyId ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultantPropertyForm;
