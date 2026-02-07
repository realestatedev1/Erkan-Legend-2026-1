import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyAPI, franchiseAPI, locationAPI, consultantAPI } from '../lib/api';
import { Phone, MessageCircle, User, Briefcase } from 'lucide-react';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [stats, setStats] = useState({ properties: 150, clients: 5000, experience: 63 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams, setSearchParams] = useState({
    property_type: 'sale',
    category: '',
    city: '',
    district: '',
    neighborhood: '',
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Dinamik lokasyon listeleri - 81 il ile başla
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

  const heroSlides = [
    { image: '/hero-slider/slide1.jpg', title: 'Modern Lüks Yaşam' },
    { image: '/hero-slider/slide2.jpg', title: 'Prestijli Binalar' },
    { image: '/hero-slider/slide3.jpg', title: 'Hayalinizdeki Ev' },
    { image: '/hero-slider/slide4.jpg', title: 'Mutlu Aileler' },
    { image: '/hero-slider/slide5.jpg', title: 'Konforlu İç Mekanlar' },
    { image: '/hero-slider/slide6.jpg', title: 'Şehir Manzaralı' },
    { image: '/hero-slider/slide7.jpg', title: 'Güvenilir Hizmet' },
  ];

  useEffect(() => {
    loadFeaturedProperties();
    loadConsultants();
    
    // Auto-slide every 5 seconds
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(slideInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Şehir değiştiğinde ilçeleri API'den yükle
  useEffect(() => {
    if (searchParams.city) {
      loadDistricts(searchParams.city);
    } else {
      setDistricts([]);
      setNeighborhoods([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.city]);

  // İlçe değiştiğinde mahalleleri API'den yükle
  useEffect(() => {
    if (searchParams.city && searchParams.district) {
      loadNeighborhoods(searchParams.city, searchParams.district);
    } else {
      setNeighborhoods([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.district]);

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

  const loadFeaturedProperties = async () => {
    try {
      const response = await propertyAPI.getAll({ featured_only: true, limit: 6 });
      setFeaturedProperties(response.data.properties || []);
    } catch (error) {
      console.error('Failed to load featured properties:', error);
    }
  };

  const loadConsultants = async () => {
    try {
      const response = await consultantAPI.getAll(null, true);
      // Shuffle and get up to 6 consultants for display
      const shuffled = (response.data || []).sort(() => 0.5 - Math.random());
      setConsultants(shuffled.slice(0, 6));
    } catch (error) {
      console.error('Failed to load consultants:', error);
    }
  };

  const handleWhatsApp = (phone, name) => {
    const message = t('home.consultants.whatsappMessage', { name, defaultValue: `Merhaba ${name}, Legend Cities web sitesinden ulaşıyorum.` });
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.property_type) params.append('property_type', searchParams.property_type);
    if (searchParams.category) params.append('category', searchParams.category);
    if (searchParams.city) params.append('city', searchParams.city);
    if (searchParams.district) params.append('district', searchParams.district);
    if (searchParams.neighborhood) params.append('neighborhood', searchParams.neighborhood);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Slider */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Slides */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Content Over Slider */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              {/* Logo */}
              <div className="mb-6 animate-scaleIn">
                <img 
                  src="/logo.jpg" 
                  alt="Legend Cities" 
                  className="h-32 w-auto"
                  data-testid="hero-logo"
                />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fadeInUp text-white drop-shadow-2xl" data-testid="hero-title">
                {t('home.heroTitle')}
              </h1>
              
              <p className="text-2xl md:text-3xl mb-2 text-white font-light italic animate-fadeInUp animation-delay-200 drop-shadow-lg" data-testid="hero-subtitle">
                {t('home.heroSubtitle')}
              </p>
              
              <p className="text-lg md:text-xl mb-8 text-gray-200 animate-fadeInUp animation-delay-400 drop-shadow-md">
                {t('home.heroDesc')}
              </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-2xl p-6 animate-fadeInUp animation-delay-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <select
                  className="px-4 py-3 border rounded text-gray-700"
                  value={searchParams.property_type}
                  onChange={(e) => setSearchParams({ ...searchParams, property_type: e.target.value })}
                  data-testid="search-property-type"
                >
                  <option value="sale">{t('home.search.sale')}</option>
                  <option value="rent">{t('home.search.rent')}</option>
                </select>

                <select
                  className="px-4 py-3 border rounded text-gray-700"
                  value={searchParams.category}
                  onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
                  data-testid="search-category"
                >
                  <option value="">{t('home.search.allCategories')}</option>
                  <option value="residential">{t('home.search.residential')}</option>
                  <option value="commercial">{t('home.search.commercial')}</option>
                  <option value="land">{t('home.search.land')}</option>
                  <option value="tourism">{t('home.search.tourism')}</option>
                </select>

                <select
                  className="px-4 py-3 border rounded text-gray-700"
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value, district: '', neighborhood: '' })}
                  data-testid="search-city"
                >
                  <option value="">{t('home.search.selectCity')}</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  className="px-4 py-3 border rounded text-gray-700"
                  value={searchParams.district}
                  onChange={(e) => setSearchParams({ ...searchParams, district: e.target.value, neighborhood: '' })}
                  disabled={!searchParams.city}
                  data-testid="search-district"
                >
                  <option value="">{t('home.search.district')}</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition font-semibold"
                  data-testid="search-button"
                >
                  {t('home.search.searchBtn')}
                </button>
              </div>
            </form>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-white w-8' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-testid="stat-properties">
              <div className="text-5xl font-bold text-red-600 mb-2">{stats.properties}+</div>
              <div className="text-gray-600 text-lg">{t('home.stats.activeListings')}</div>
            </div>
            <div data-testid="stat-clients">
              <div className="text-5xl font-bold text-red-600 mb-2">{stats.clients}+</div>
              <div className="text-gray-600 text-lg">{t('home.stats.happyClients')}</div>
            </div>
            <div data-testid="stat-experience">
              <div className="text-5xl font-bold text-red-600 mb-2">{stats.experience}</div>
              <div className="text-gray-600 text-lg">{t('home.stats.yearsExperience')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('home.featuredProperties.title')}</h2>
            <p className="text-gray-600">{t('home.featuredProperties.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProperties.map((property) => {
              // Check if image URL is absolute or relative
              const imageUrl = property.images && property.images.length > 0
                ? (property.images[0].startsWith('http') 
                    ? property.images[0] 
                    : `${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`)
                : null;
              
              return (
              <Link
                key={property.id}
                to={`/properties/${property.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover-lift"
                data-testid={`property-card-${property.id}`}
              >
                <div className="h-48 bg-gray-300">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {t('home.featuredProperties.noPhoto')}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{property.title}</h3>
                  <p className="text-gray-600 mb-2">{property.city}, {property.district}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-red-600">
                      {property.price.toLocaleString('tr-TR')} {property.currency}
                    </span>
                    <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                      {property.property_type === 'sale' ? t('home.search.sale') : t('home.search.rent')}
                    </span>
                  </div>
                </div>
              </Link>
            );})}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700 transition font-semibold"
              data-testid="view-all-properties"
            >
              {t('home.featuredProperties.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('home.services.title')}</h2>
            <p className="text-gray-600">{t('home.services.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t('home.services.residential'), desc: t('home.services.residentialDesc') },
              { title: t('home.services.commercial'), desc: t('home.services.commercialDesc') },
              { title: t('home.services.land'), desc: t('home.services.landDesc') },
              { title: t('home.services.consulting'), desc: t('home.services.consultingDesc') },
              { title: t('home.services.management'), desc: t('home.services.managementDesc') },
              { title: t('home.services.valuation'), desc: t('home.services.valuationDesc') },
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded hover:bg-red-700 transition font-semibold"
            >
              {t('home.services.moreInfo')}
            </Link>
          </div>
        </div>
      </section>

      {/* Franchise CTA */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-red-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{t('home.franchise.title')}</h2>
          <p className="text-xl mb-8">{t('home.franchise.subtitle')}</p>
          <Link
            to="/franchise"
            className="inline-block bg-white text-red-600 px-8 py-3 rounded hover:bg-gray-100 transition font-semibold"
            data-testid="franchise-cta"
          >
            {t('home.franchise.apply')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
// Force bundle refresh - Mon Dec 29 09:27:07 UTC 2025
