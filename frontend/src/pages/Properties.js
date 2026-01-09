import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyAPI, locationAPI } from '../lib/api';
import { MultiPropertyMap } from '../components/PropertyMap';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import PriceRangeSlider from '../components/PriceRangeSlider';

const Properties = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toggleCompare, isInCompare, canAddMore } = useCompare();
  
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

  // Handle property click from map
  const handleMapPropertyClick = (property) => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <div className="min-h-screen py-4 md:py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header with title and mobile filter button */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">{t('properties.title')}</h1>
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('properties.filter')}
            {activeFilterCount > 0 && (
              <span className="bg-white text-red-600 text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowMobileFilters(false)}
            />
            
            {/* Filter Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <h3 className="font-bold text-xl">{t('properties.filter')}</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Mobile Filter Content - Same as desktop */}
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.propertyType')}</label>
                  <select
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-red-600"
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
                    <option value="">{t('properties.selectDistrict')}</option>
                    {districts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
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
                    <option value="5+">5+</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold mb-2">{t('properties.priceRange')} (₺)</label>
                  <PriceRangeSlider
                    min={0}
                    max={50000000}
                    minValue={filters.min_price ? parseInt(filters.min_price) : 0}
                    maxValue={filters.max_price ? parseInt(filters.max_price) : 50000000}
                    onChange={({ min, max }) => {
                      handleFilterChange('min_price', min > 0 ? min.toString() : '');
                      handleFilterChange('max_price', max < 50000000 ? max.toString() : '');
                    }}
                  />
                </div>
              </div>

              {/* Mobile Filter Actions */}
              <div className="sticky bottom-0 bg-white border-t p-4 space-y-2">
                <button 
                  onClick={() => { applyFilters(); setShowMobileFilters(false); }} 
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold"
                >
                  🔍 {t('properties.applyFilters')} ({activeFilterCount})
                </button>
                <button 
                  onClick={() => { clearFilters(); setShowMobileFilters(false); }} 
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg"
                >
                  {t('properties.clearAll')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
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
                  <PriceRangeSlider
                    min={0}
                    max={50000000}
                    minValue={filters.min_price ? parseInt(filters.min_price) : 0}
                    maxValue={filters.max_price ? parseInt(filters.max_price) : 50000000}
                    onChange={({ min, max }) => {
                      handleFilterChange('min_price', min > 0 ? min.toString() : '');
                      handleFilterChange('max_price', max < 50000000 ? max.toString() : '');
                    }}
                  />
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
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      viewMode === 'grid' 
                        ? 'bg-white text-red-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {t('properties.gridView', 'Liste')}
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      viewMode === 'map' 
                        ? 'bg-white text-red-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    {t('properties.mapView', 'Harita')}
                  </button>
                </div>
                <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-600">
                  <option>{t('properties.sortNewest')}</option>
                  <option>{t('properties.sortPriceLow')}</option>
                  <option>{t('properties.sortPriceHigh')}</option>
                  <option>{t('properties.sortArea')}</option>
                </select>
              </div>
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
            ) : viewMode === 'map' ? (
              /* Map View */
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <MultiPropertyMap 
                  properties={properties} 
                  height="600px"
                  onPropertyClick={handleMapPropertyClick}
                />
                <div className="p-4 border-t bg-gray-50">
                  <p className="text-sm text-gray-600">
                    📍 {properties.filter(p => p.latitude && p.longitude).length} / {properties.length} {t('properties.propertiesOnMap', 'ilan haritada gösterildi')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative">
                      <Link to={`/properties/${property.id}`}>
                        <img
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${property.property_type === 'sale' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                          {property.property_type === 'sale' ? t('properties.sale') : t('properties.rent')}
                        </span>
                        {property.featured && (
                          <span className="px-2 py-1 text-xs font-semibold bg-yellow-500 text-white rounded">{t('properties.featured')}</span>
                        )}
                      </div>
                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {property.credit_eligible && (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-600 text-white rounded">{t('properties.creditEligible')}</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(property);
                          }}
                          className={`p-1.5 rounded-full shadow-md transition ${
                            isFavorite(property.id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white text-gray-600 hover:bg-red-50'
                          }`}
                          title={isFavorite(property.id) ? t('favorites.remove', 'Favorilerden Çıkar') : t('favorites.add', 'Favorilere Ekle')}
                        >
                          <svg className="w-4 h-4" fill={isFavorite(property.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const result = toggleCompare(property);
                            if (!result.success) {
                              alert(result.message);
                            }
                          }}
                          disabled={!isInCompare(property.id) && !canAddMore}
                          className={`p-1.5 rounded-full shadow-md transition ${
                            isInCompare(property.id) 
                              ? 'bg-blue-500 text-white' 
                              : canAddMore
                                ? 'bg-white text-gray-600 hover:bg-blue-50'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title={isInCompare(property.id) ? t('compare.remove', 'Karşılaştırmadan Çıkar') : t('compare.add', 'Karşılaştır')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <Link to={`/properties/${property.id}`} className="block p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1 hover:text-red-600">{property.title}</h3>
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
                    </Link>
                    {/* WhatsApp Share Button */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          const text = `🏠 ${property.title}\n📍 ${property.district}, ${property.city}\n💰 ${formatPrice(property.price)} ${property.currency || 'TRY'}\n\n🔗 ${window.location.origin}/properties/${property.id}`;
                          const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {t('properties.shareWhatsApp', 'WhatsApp ile Paylaş')}
                      </button>
                    </div>
                  </div>
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
