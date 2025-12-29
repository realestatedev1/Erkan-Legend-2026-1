import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { propertyAPI, locationAPI } from '../lib/api';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    property_type: searchParams.get('property_type') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    district: searchParams.get('district') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    rooms: searchParams.get('rooms') || '',
    // Yeni filtreler
    min_area: searchParams.get('min_area') || '',
    max_area: searchParams.get('max_area') || '',
    min_age: searchParams.get('min_age') || '',
    max_age: searchParams.get('max_age') || '',
    floor: searchParams.get('floor') || '',
    total_floors_min: searchParams.get('total_floors_min') || '',
    total_floors_max: searchParams.get('total_floors_max') || '',
    heating: searchParams.get('heating') || '',
    furnished: searchParams.get('furnished') || '',
    parking: searchParams.get('parking') || '',
    usage_status: searchParams.get('usage_status') || '',
    facade: searchParams.get('facade') || '',
    // Boolean filtreler
    balcony: searchParams.get('balcony') || '',
    elevator: searchParams.get('elevator') || '',
    in_complex: searchParams.get('in_complex') || '',
    credit_eligible: searchParams.get('credit_eligible') || '',
    exchange: searchParams.get('exchange') || '',
    security: searchParams.get('security') || '',
    pool: searchParams.get('pool') || '',
    gym: searchParams.get('gym') || '',
    garden: searchParams.get('garden') || '',
  });

  // Dinamik listeler - 81 il ile başla
  const [cities, setCities] = useState([
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
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Şehir değiştiğinde ilçeleri API'den yükle
  useEffect(() => {
    if (filters.city) {
      loadDistricts(filters.city);
    } else {
      setDistricts([]);
      setNeighborhoods([]);
      setFilters(prev => ({ ...prev, district: '', neighborhood: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city]);

  // İlçe değiştiğinde mahalleleri API'den yükle
  useEffect(() => {
    if (filters.city && filters.district) {
      loadNeighborhoods(filters.city, filters.district);
    } else {
      setNeighborhoods([]);
      setFilters(prev => ({ ...prev, neighborhood: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.district]);

  const loadDistricts = async (city) => {
    setLoadingLocations(true);
    try {
      const response = await locationAPI.getDistricts(city);
      const districtList = response.data.districts || [];
      setDistricts(districtList);
      
      if (filters.district && !districtList.includes(filters.district)) {
        setFilters(prev => ({ ...prev, district: '', neighborhood: '' }));
        setNeighborhoods([]);
      }
    } catch (error) {
      console.error('Failed to load districts:', error);
      setDistricts([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadNeighborhoods = async (city, district) => {
    setLoadingLocations(true);
    try {
      const response = await locationAPI.getNeighborhoods(city, district);
      const neighborhoodList = response.data.neighborhoods || [];
      setNeighborhoods(neighborhoodList);
      
      if (filters.neighborhood && !neighborhoodList.includes(filters.neighborhood)) {
        setFilters(prev => ({ ...prev, neighborhood: '' }));
      }
    } catch (error) {
      console.error('Failed to load neighborhoods:', error);
      setNeighborhoods([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams);
      const response = await propertyAPI.getAll(params);
      setProperties(response.data.properties || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        params[key] = filters[key];
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    Object.keys(filters).forEach(key => {
      emptyFilters[key] = '';
    });
    setFilters(emptyFilters);
    setSearchParams({});
    setDistricts([]);
    setNeighborhoods([]);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price);
  };

  // Aktif filtre sayısını hesapla
  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Tüm İlanlar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Filtrele</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {activeFilterCount} aktif
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* İlan Tipi */}
                <div>
                  <label className="block text-sm font-semibold mb-2">İlan Tipi</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    value={filters.property_type}
                    onChange={(e) => handleFilterChange('property_type', e.target.value)}
                    data-testid="filter-property-type"
                  >
                    <option value="">Tümü</option>
                    <option value="sale">Satılık</option>
                    <option value="rent">Kiralık</option>
                  </select>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Kategori</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    data-testid="filter-category"
                  >
                    <option value="">Tümü</option>
                    <option value="residential">Konut</option>
                    <option value="commercial">Ticari</option>
                    <option value="land">Arsa</option>
                    <option value="tourism">Turizm</option>
                  </select>
                </div>

                {/* Şehir */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Şehir</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    data-testid="filter-city"
                  >
                    <option value="">Şehir Seçin</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* İlçe */}
                <div>
                  <label className="block text-sm font-semibold mb-2">İlçe</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    disabled={!filters.city || loadingLocations}
                    data-testid="filter-district"
                  >
                    <option value="">{loadingLocations ? 'Yükleniyor...' : 'İlçe Seçin'}</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {!filters.city && (
                    <p className="text-xs text-gray-500 mt-1">Önce şehir seçin</p>
                  )}
                </div>

                {/* Mahalle */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Mahalle</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.neighborhood}
                    onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                    disabled={!filters.district || loadingLocations}
                    data-testid="filter-neighborhood"
                  >
                    <option value="">{loadingLocations ? 'Yükleniyor...' : 'Mahalle Seçin'}</option>
                    {neighborhoods.map(neighborhood => (
                      <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                    ))}
                  </select>
                  {!filters.district && (
                    <p className="text-xs text-gray-500 mt-1">Önce ilçe seçin</p>
                  )}
                </div>

                {/* Oda Sayısı */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Oda Sayısı</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.rooms}
                    onChange={(e) => handleFilterChange('rooms', e.target.value)}
                    data-testid="filter-rooms"
                  >
                    <option value="">Tümü</option>
                    <option value="1+0">Stüdyo (1+0)</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+1">5+1</option>
                    <option value="5+2">5+2</option>
                    <option value="6+">6 ve üzeri</option>
                  </select>
                </div>

                {/* Fiyat Aralığı */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Fiyat Aralığı (₺)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      data-testid="filter-min-price"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      data-testid="filter-max-price"
                    />
                  </div>
                </div>

                {/* Detaylı Filtreler Butonu */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                  data-testid="toggle-advanced-filters"
                >
                  <span className="font-medium text-gray-700">
                    {showAdvancedFilters ? '▼' : '▶'} Detaylı Filtreler
                  </span>
                  <span className="text-xs text-gray-500">
                    {showAdvancedFilters ? 'Gizle' : 'Göster'}
                  </span>
                </button>

                {/* Detaylı Filtreler */}
                {showAdvancedFilters && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 animate-fadeIn">
                    
                    {/* Alan (m²) */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Alan (m²)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min m²"
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                          value={filters.min_area}
                          onChange={(e) => handleFilterChange('min_area', e.target.value)}
                          data-testid="filter-min-area"
                        />
                        <input
                          type="number"
                          placeholder="Max m²"
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                          value={filters.max_area}
                          onChange={(e) => handleFilterChange('max_area', e.target.value)}
                          data-testid="filter-max-area"
                        />
                      </div>
                    </div>

                    {/* Bina Yaşı */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bina Yaşı</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                          value={filters.min_age}
                          onChange={(e) => handleFilterChange('min_age', e.target.value)}
                          data-testid="filter-min-age"
                        >
                          <option value="">Min</option>
                          <option value="0">Sıfır</option>
                          <option value="1">1 yıl</option>
                          <option value="5">5 yıl</option>
                          <option value="10">10 yıl</option>
                          <option value="15">15 yıl</option>
                          <option value="20">20 yıl</option>
                        </select>
                        <select
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                          value={filters.max_age}
                          onChange={(e) => handleFilterChange('max_age', e.target.value)}
                          data-testid="filter-max-age"
                        >
                          <option value="">Max</option>
                          <option value="1">1 yıl</option>
                          <option value="5">5 yıl</option>
                          <option value="10">10 yıl</option>
                          <option value="15">15 yıl</option>
                          <option value="20">20 yıl</option>
                          <option value="30">30+ yıl</option>
                        </select>
                      </div>
                    </div>

                    {/* Bulunduğu Kat */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bulunduğu Kat</label>
                      <select
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                        value={filters.floor}
                        onChange={(e) => handleFilterChange('floor', e.target.value)}
                        data-testid="filter-floor"
                      >
                        <option value="">Tümü</option>
                        <option value="bodrum">Bodrum Kat</option>
                        <option value="zemin">Zemin Kat</option>
                        <option value="giris">Giriş Kat</option>
                        <option value="1">1. Kat</option>
                        <option value="2">2. Kat</option>
                        <option value="3">3. Kat</option>
                        <option value="4">4. Kat</option>
                        <option value="5">5. Kat</option>
                        <option value="6-10">6-10. Kat</option>
                        <option value="11-15">11-15. Kat</option>
                        <option value="16-20">16-20. Kat</option>
                        <option value="21+">21+ Kat</option>
                        <option value="cati">Çatı Katı</option>
                      </select>
                    </div>

                    {/* Toplam Kat Sayısı */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bina Kat Sayısı</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                          value={filters.total_floors_min}
                          onChange={(e) => handleFilterChange('total_floors_min', e.target.value)}
                        >
                          <option value="">Min</option>
                          <option value="1">1 kat</option>
                          <option value="3">3 kat</option>
                          <option value="5">5 kat</option>
                          <option value="10">10 kat</option>
                          <option value="15">15 kat</option>
                        </select>
                        <select
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                          value={filters.total_floors_max}
                          onChange={(e) => handleFilterChange('total_floors_max', e.target.value)}
                        >
                          <option value="">Max</option>
                          <option value="3">3 kat</option>
                          <option value="5">5 kat</option>
                          <option value="10">10 kat</option>
                          <option value="15">15 kat</option>
                          <option value="20">20 kat</option>
                          <option value="30">30+ kat</option>
                        </select>
                      </div>
                    </div>

                    {/* Isınma Tipi */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Isınma Tipi</label>
                      <select
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                        value={filters.heating}
                        onChange={(e) => handleFilterChange('heating', e.target.value)}
                        data-testid="filter-heating"
                      >
                        <option value="">Tümü</option>
                        <option value="dogalgaz">Doğalgaz (Bireysel)</option>
                        <option value="merkezi">Merkezi</option>
                        <option value="merkezi_pay">Merkezi (Pay Ölçer)</option>
                        <option value="kombi">Kombi</option>
                        <option value="yerden">Yerden Isıtma</option>
                        <option value="klima">Klima</option>
                        <option value="soba">Soba</option>
                        <option value="yok">Yok</option>
                      </select>
                    </div>

                    {/* Eşya Durumu */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Eşya Durumu</label>
                      <select
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                        value={filters.furnished}
                        onChange={(e) => handleFilterChange('furnished', e.target.value)}
                        data-testid="filter-furnished"
                      >
                        <option value="">Tümü</option>
                        <option value="evet">Eşyalı</option>
                        <option value="hayir">Boş</option>
                        <option value="kismen">Kısmen Eşyalı</option>
                      </select>
                    </div>

                    {/* Kullanım Durumu */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Kullanım Durumu</label>
                      <select
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                        value={filters.usage_status}
                        onChange={(e) => handleFilterChange('usage_status', e.target.value)}
                        data-testid="filter-usage-status"
                      >
                        <option value="">Tümü</option>
                        <option value="bos">Boş</option>
                        <option value="kiracili">Kiracılı</option>
                        <option value="mulk_sahibi">Mülk Sahibi Oturuyor</option>
                      </select>
                    </div>

                    {/* Otopark */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Otopark</label>
                      <select
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                        value={filters.parking}
                        onChange={(e) => handleFilterChange('parking', e.target.value)}
                        data-testid="filter-parking"
                      >
                        <option value="">Tümü</option>
                        <option value="kapali">Kapalı Otopark</option>
                        <option value="acik">Açık Otopark</option>
                        <option value="yok">Yok</option>
                      </select>
                    </div>

                    {/* Cephe */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Cephe</label>
                      <select
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                        value={filters.facade}
                        onChange={(e) => handleFilterChange('facade', e.target.value)}
                        data-testid="filter-facade"
                      >
                        <option value="">Tümü</option>
                        <option value="kuzey">Kuzey</option>
                        <option value="guney">Güney</option>
                        <option value="dogu">Doğu</option>
                        <option value="bati">Batı</option>
                        <option value="kuzey-guney">Kuzey-Güney</option>
                        <option value="dogu-bati">Doğu-Batı</option>
                      </select>
                    </div>

                    {/* Özellikler - Checkbox Grid */}
                    <div>
                      <label className="block text-sm font-semibold mb-3">Özellikler</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.credit_eligible === 'true'}
                            onChange={(e) => handleFilterChange('credit_eligible', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Krediye Uygun</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.exchange === 'true'}
                            onChange={(e) => handleFilterChange('exchange', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Takas</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.in_complex === 'true'}
                            onChange={(e) => handleFilterChange('in_complex', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Site İçinde</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.elevator === 'true'}
                            onChange={(e) => handleFilterChange('elevator', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Asansör</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.balcony === 'true'}
                            onChange={(e) => handleFilterChange('balcony', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Balkon</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.security === 'true'}
                            onChange={(e) => handleFilterChange('security', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Güvenlik</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.pool === 'true'}
                            onChange={(e) => handleFilterChange('pool', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Havuz</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.gym === 'true'}
                            onChange={(e) => handleFilterChange('gym', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Spor Salonu</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-600"
                            checked={filters.garden === 'true'}
                            onChange={(e) => handleFilterChange('garden', e.target.checked ? 'true' : '')}
                          />
                          <span className="text-sm">Bahçe</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Butonlar */}
                <div className="space-y-2 pt-4">
                  <button
                    onClick={applyFilters}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                    data-testid="apply-filters"
                  >
                    🔍 Filtrele ({activeFilterCount} seçili)
                  </button>

                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                    data-testid="clear-filters"
                  >
                    Tümünü Temizle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">{total}</span> ilan bulundu
              </p>
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600">
                <option>En Yeni</option>
                <option>Fiyat (Düşükten Yükseğe)</option>
                <option>Fiyat (Yüksekten Düşüğe)</option>
                <option>m² (Düşükten Yükseğe)</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">İlan Bulunamadı</h3>
                <p className="text-gray-500 mb-4">Arama kriterlerinize uygun ilan bulunamadı.</p>
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:underline"
                >
                  Filtreleri temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    data-testid={`property-card-${property.id}`}
                  >
                    <div className="relative">
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          property.property_type === 'sale' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {property.property_type === 'sale' ? 'Satılık' : 'Kiralık'}
                        </span>
                        {property.featured && (
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded">
                            Vitrin
                          </span>
                        )}
                      </div>
                      {property.credit_eligible && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded">
                            Krediye Uygun
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                        {property.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">
                        📍 {property.district}, {property.city}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        {property.rooms && <span>🛏 {property.rooms}</span>}
                        {(property.area_gross || property.area_net || property.area_sqm) && (
                          <span>📐 {property.area_gross || property.area_net || property.area_sqm} m²</span>
                        )}
                        {property.age !== undefined && property.age !== null && (
                          <span>🏗 {property.age === 0 ? 'Sıfır' : `${property.age} yıl`}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-red-600">
                          {formatPrice(property.price)} ₺
                        </span>
                        {property.in_complex && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Site İçi</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
