import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const { toggleCompare, isInCompare, canAddMore } = useCompare();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price);
  };

  const handleWhatsAppShare = (property) => {
    const text = `🏠 ${property.title}\n📍 ${property.district}, ${property.city}\n💰 ${formatPrice(property.price)} ${property.currency}\n\n🔗 ${window.location.origin}/properties/${property.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-8xl mb-6">❤️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {t('favorites.empty', 'Favorileriniz Boş')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('favorites.emptyDesc', 'Beğendiğiniz ilanları favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz.')}
          </p>
          <Link 
            to="/properties" 
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition inline-block"
          >
            {t('favorites.browseProperties', 'İlanları Keşfet')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              ❤️ {t('favorites.title', 'Favorilerim')}
            </h1>
            <p className="text-gray-600 mt-1">
              {favorites.length} {t('favorites.count', 'ilan favorilerinizde')}
            </p>
          </div>
          <button
            onClick={clearFavorites}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            {t('favorites.clearAll', 'Tümünü Temizle')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
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
                    {property.property_type === 'sale' ? t('properties.sale', 'Satılık') : t('properties.rent', 'Kiralık')}
                  </span>
                </div>
                {/* Remove from favorites button */}
                <button
                  onClick={() => removeFavorite(property.id)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition"
                  title={t('favorites.remove', 'Favorilerden Çıkar')}
                >
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <Link to={`/properties/${property.id}`}>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 hover:text-red-600 line-clamp-1">
                    {property.title}
                  </h3>
                </Link>
                <p className="text-gray-500 text-sm mb-3">📍 {property.district}, {property.city}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  {property.rooms && <span>🛏 {property.rooms}</span>}
                  {(property.area_gross || property.area_net || property.area_sqm) && (
                    <span>📐 {property.area_gross || property.area_net || property.area_sqm} m²</span>
                  )}
                </div>
                
                <div className="text-xl font-bold text-red-600 mb-4">
                  {formatPrice(property.price)} {property.currency}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCompare(property)}
                    disabled={!isInCompare(property.id) && !canAddMore}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                      isInCompare(property.id)
                        ? 'bg-blue-600 text-white'
                        : canAddMore
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isInCompare(property.id) ? '✓ Karşılaştırmada' : '⚖️ Karşılaştır'}
                  </button>
                  <button
                    onClick={() => handleWhatsAppShare(property)}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    title="WhatsApp ile Paylaş"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
