import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { propertyAPI, locationAPI } from '../lib/api';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    property_type: searchParams.get('property_type') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    district: searchParams.get('district') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    rooms: searchParams.get('rooms') || '',
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
      
      // Eğer seçili ilçe yeni şehirde yoksa temizle
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
      
      // Eğer seçili mahalle yeni ilçede yoksa temizle
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
      if (filters[key]) params[key] = filters[key];
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      property_type: '',
      category: '',
      city: '',
      district: '',
      min_price: '',
      max_price: '',
      rooms: '',
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Tüm İlanlar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h3 className="font-bold text-xl mb-4">Filtrele</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">İlan Tipi</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={filters.property_type}
                    onChange={(e) => handleFilterChange('property_type', e.target.value)}
                  >
                    <option value="">Tümü</option>
                    <option value="sale">Satılık</option>
                    <option value="rent">Kiralık</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Kategori</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">Tümü</option>
                    <option value="residential">Konut</option>
                    <option value="commercial">Ticari</option>
                    <option value="land">Arsa</option>
                    <option value="tourism">Turizm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Şehir</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  >
                    <option value="">Şehir Seçin</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">İlçe</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    disabled={!filters.city}
                  >
                    <option value="">İlçe Seçin</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {!filters.city && (
                    <p className="text-xs text-gray-500 mt-1">Önce şehir seçin</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Mahalle</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.neighborhood}
                    onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                    disabled={!filters.district}
                  >
                    <option value="">Mahalle Seçin</option>
                    {neighborhoods.map(neighborhood => (
                      <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                    ))}
                  </select>
                  {!filters.district && (
                    <p className="text-xs text-gray-500 mt-1">Önce ilçe seçin</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Oda Sayısı</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={filters.rooms}
                    onChange={(e) => handleFilterChange('rooms', e.target.value)}
                  >
                    <option value="">Tümü</option>
                    <option value="1+0">1+0</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+1">5+1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Fiyat Aralığı</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border rounded"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border rounded"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={applyFilters}
                  className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                >
                  Filtrele
                </button>

                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition"
                >
                  Temizle
                </button>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-gray-600">
              <span className="font-semibold">{total}</span> ilan bulundu
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl">Yükleniyor...</div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-xl text-gray-600">İlan bulunamadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="h-48 bg-gray-300">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          Fotoğraf Yok
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {property.city}, {property.district}
                      </p>
                      {property.rooms && (
                        <p className="text-sm text-gray-600 mb-2">{property.rooms} • {property.area_sqm}m²</p>
                      )}
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xl font-bold text-red-600">
                          {property.price.toLocaleString('tr-TR')} {property.currency}
                        </span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {property.property_type === 'sale' ? 'Satılık' : 'Kiralık'}
                        </span>
                      </div>
                      {property.franchise_info && (
                        <p className="text-xs text-gray-500 mt-2">
                          {property.franchise_info.office_name}
                        </p>
                      )}
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
