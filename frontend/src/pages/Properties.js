import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyAPI, locationAPI } from '../lib/api';

const Properties = () => {
  const { t } = useTranslation();
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
  }, [searchParams]);

  useEffect(() => {
    if (filters.city) {
      loadDistricts(filters.city);
    } else {
      setDistricts([]);
      setNeighborhoods([]);
      setFilters(prev => ({ ...prev, district: '', neighborhood: '' }));
    }
  }, [filters.city]);

  useEffect(() => {
    if (filters.city && filters.district) {
      loadNeighborhoods(filters.city, filters.district);
    } else {
      setNeighborhoods([]);
      setFilters(prev => ({ ...prev, neighborhood: '' }));
    }
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

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== null && v !== undefined).length;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">{t('properties.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">{t('properties.filter')}</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {activeFilterCount} {t('properties.active')}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.propertyType')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600 focus:border-red-600"
                    value={filters.property_type}
                    onChange={(e) => handleFilterChange('property_type', e.target.value)}
                  >
                    <option value="">{t('properties.all')}</option>
                    <option value="sale">{t('properties.sale')}</option>
                    <option value="rent">{t('properties.rent')}</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.category')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">{t('properties.all')}</option>
                    <option value="residential">{t('properties.residential')}</option>
                    <option value="commercial">{t('properties.commercial')}</option>
                    <option value="land">{t('properties.land')}</option>
                    <option value="tourism">{t('properties.tourism')}</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.city')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  >
                    <option value="">{t('properties.selectCity')}</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.district')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.district}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    disabled={!filters.city || loadingLocations}
                  >
                    <option value="">{loadingLocations ? t('properties.loading') : t('properties.selectDistrict')}</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {!filters.city && (
                    <p className="text-xs text-gray-500 mt-1">{t('properties.selectFirst')}</p>
                  )}
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.neighborhood')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.neighborhood}
                    onChange={(e) => handleFilterChange('neighborhood', e.target.value)}
                    disabled={!filters.district || loadingLocations}
                  >
                    <option value="">{loadingLocations ? t('properties.loading') : t('properties.selectNeighborhood')}</option>
                    {neighborhoods.map(neighborhood => (
                      <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                    ))}
                  </select>
                  {!filters.district && (
                    <p className="text-xs text-gray-500 mt-1">{t('properties.selectDistrictFirst')}</p>
                  )}
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.rooms')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                    value={filters.rooms}
                    onChange={(e) => handleFilterChange('rooms', e.target.value)}
                  >
                    <option value="">{t('properties.all')}</option>
                    <option value="1+0">{t('properties.studio')} (1+0)</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+1">5+1</option>
                    <option value="5+2">5+2</option>
                    <option value="6+">6 {t('properties.andAbove')}</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.priceRange')} (₺)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder={t('properties.min')}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder={t('properties.max')}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    />
                  </div>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                >
                  <span className="font-medium text-gray-700">
                    {showAdvancedFilters ? '▼' : '▶'} {t('properties.advancedFilters')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {showAdvancedFilters ? t('properties.hide') : t('properties.show')}
                  </span>
                </button>

                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 animate-fadeIn">
                    {/* Area */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('properties.area')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="number" placeholder={t('properties.min')} className="w-full px-3 py-2 border rounded" value={filters.min_area} onChange={(e) => handleFilterChange('min_area', e.target.value)} />
                        <input type="number" placeholder={t('properties.max')} className="w-full px-3 py-2 border rounded" value={filters.max_area} onChange={(e) => handleFilterChange('max_area', e.target.value)} />
                      </div>
                    </div>

                    {/* Heating */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('properties.heating')}</label>
                      <select className="w-full px-3 py-2 border rounded" value={filters.heating} onChange={(e) => handleFilterChange('heating', e.target.value)}>
                        <option value="">{t('properties.all')}</option>
                        <option value="dogalgaz">{t('properties.naturalGas')}</option>
                        <option value="merkezi">{t('properties.central')}</option>
                        <option value="kombi">{t('properties.combi')}</option>
                        <option value="klima">{t('properties.airCon')}</option>
                        <option value="yok">{t('properties.none')}</option>
                      </select>
                    </div>

                    {/* Furnished */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('properties.furnished')}</label>
                      <select className="w-full px-3 py-2 border rounded" value={filters.furnished} onChange={(e) => handleFilterChange('furnished', e.target.value)}>
                        <option value="">{t('properties.all')}</option>
                        <option value="evet">{t('properties.furnishedYes')}</option>
                        <option value="hayir">{t('properties.furnishedNo')}</option>
                        <option value="kismen">{t('properties.furnishedPartial')}</option>
                      </select>
                    </div>

                    {/* Parking */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">{t('properties.parking')}</label>
                      <select className="w-full px-3 py-2 border rounded" value={filters.parking} onChange={(e) => handleFilterChange('parking', e.target.value)}>
                        <option value="">{t('properties.all')}</option>
                        <option value="kapali">{t('properties.closedParking')}</option>
                        <option value="acik">{t('properties.openParking')}</option>
                        <option value="yok">{t('properties.none')}</option>
                      </select>
                    </div>

                    {/* Features Checkboxes */}
                    <div>
                      <label className="block text-sm font-semibold mb-3">{t('properties.features')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.credit_eligible === 'true'} onChange={(e) => handleFilterChange('credit_eligible', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.creditEligible')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.exchange === 'true'} onChange={(e) => handleFilterChange('exchange', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.exchange')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.in_complex === 'true'} onChange={(e) => handleFilterChange('in_complex', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.inComplex')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.elevator === 'true'} onChange={(e) => handleFilterChange('elevator', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.elevator')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.balcony === 'true'} onChange={(e) => handleFilterChange('balcony', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.balcony')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.security === 'true'} onChange={(e) => handleFilterChange('security', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.security')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.pool === 'true'} onChange={(e) => handleFilterChange('pool', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.pool')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.gym === 'true'} onChange={(e) => handleFilterChange('gym', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.gym')}</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 text-red-600 rounded" checked={filters.garden === 'true'} onChange={(e) => handleFilterChange('garden', e.target.checked ? 'true' : '')} />
                          <span className="text-sm">{t('properties.garden')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="space-y-2 pt-4">
                  <button onClick={applyFilters} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition font-semibold">
                    🔍 {t('properties.applyFilters')} ({activeFilterCount} {t('properties.selected')})
                  </button>
                  <button onClick={clearFilters} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                    {t('properties.clearAll')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-800">{total}</span> {t('properties.resultsFound')}
              </p>
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600">
                <option>{t('properties.sortNewest')}</option>
                <option>{t('properties.sortPriceLow')}</option>
                <option>{t('properties.sortPriceHigh')}</option>
                <option>{t('properties.sortArea')}</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('properties.noResults')}</h3>
                <p className="text-gray-500 mb-4">{t('properties.noResultsDesc')}</p>
                <button onClick={clearFilters} className="text-red-600 hover:underline">{t('properties.clearFilters')}</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    to={`/properties/${property.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${property.property_type === 'sale' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                          {property.property_type === 'sale' ? t('properties.sale') : t('properties.rent')}
                        </span>
                        {property.featured && (
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded">{t('properties.featured')}</span>
                        )}
                      </div>
                      {property.credit_eligible && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded">{t('properties.creditEligible')}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">{property.title}</h3>
                      <p className="text-gray-500 text-sm mb-3">📍 {property.district}, {property.city}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        {property.rooms && <span>🛏 {property.rooms}</span>}
                        {(property.area_gross || property.area_net || property.area_sqm) && (
                          <span>📐 {property.area_gross || property.area_net || property.area_sqm} m²</span>
                        )}
                        {property.age !== undefined && property.age !== null && (
                          <span>🏗 {property.age === 0 ? t('properties.new') : `${property.age} ${t('properties.years')}`}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-red-600">{formatPrice(property.price)} ₺</span>
                        {property.in_complex && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t('properties.inComplex')}</span>
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
