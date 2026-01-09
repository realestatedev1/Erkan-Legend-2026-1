import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCompare } from '../context/CompareContext';
import { useFavorites } from '../context/FavoritesContext';

const Compare = () => {
  const { t } = useTranslation();
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { toggleFavorite, isFavorite } = useFavorites();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR').format(price);
  };

  const handleWhatsAppShare = (property) => {
    const text = `🏠 ${property.title}\n📍 ${property.district}, ${property.city}\n💰 ${formatPrice(property.price)} ${property.currency}\n\n🔗 ${window.location.origin}/properties/${property.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-8xl mb-6">⚖️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {t('compare.empty', 'Karşılaştırma Listeniz Boş')}
          </h1>
          <p className="text-gray-600 mb-8">
            {t('compare.emptyDesc', 'İlanları karşılaştırmak için en az 2 ilan ekleyin.')}
          </p>
          <Link 
            to="/properties" 
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition inline-block"
          >
            {t('compare.browseProperties', 'İlanları Keşfet')}
          </Link>
        </div>
      </div>
    );
  }

  // Karşılaştırma özellikleri
  const compareFeatures = [
    { key: 'price', label: t('compare.price', 'Fiyat'), format: (v, p) => `${formatPrice(v)} ${p.currency}` },
    { key: 'property_type', label: t('compare.type', 'İlan Tipi'), format: (v) => v === 'sale' ? 'Satılık' : 'Kiralık' },
    { key: 'category', label: t('compare.category', 'Kategori'), format: (v) => {
      const cats = { residential: 'Konut', commercial: 'Ticari', land: 'Arsa', tourism: 'Turizm' };
      return cats[v] || v;
    }},
    { key: 'city', label: t('compare.city', 'Şehir') },
    { key: 'district', label: t('compare.district', 'İlçe') },
    { key: 'rooms', label: t('compare.rooms', 'Oda Sayısı') },
    { key: 'area_gross', label: t('compare.areaGross', 'Brüt m²'), format: (v) => v ? `${v} m²` : '-' },
    { key: 'area_net', label: t('compare.areaNet', 'Net m²'), format: (v) => v ? `${v} m²` : '-' },
    { key: 'floor', label: t('compare.floor', 'Kat') },
    { key: 'total_floors', label: t('compare.totalFloors', 'Bina Kat Sayısı') },
    { key: 'age', label: t('compare.age', 'Bina Yaşı'), format: (v) => v === 0 ? 'Sıfır' : v ? `${v} yıl` : '-' },
    { key: 'heating', label: t('compare.heating', 'Isınma') },
    { key: 'furnished', label: t('compare.furnished', 'Eşya Durumu') },
    { key: 'parking', label: t('compare.parking', 'Otopark') },
    { key: 'dues', label: t('compare.dues', 'Aidat'), format: (v) => v ? `${formatPrice(v)} ₺` : '-' },
    { key: 'credit_eligible', label: t('compare.creditEligible', 'Krediye Uygun'), format: (v) => v ? '✓ Evet' : '✗ Hayır' },
    { key: 'elevator', label: t('compare.elevator', 'Asansör'), format: (v) => v ? '✓ Var' : '✗ Yok' },
    { key: 'balcony', label: t('compare.balcony', 'Balkon'), format: (v) => v ? '✓ Var' : '✗ Yok' },
    { key: 'pool', label: t('compare.pool', 'Havuz'), format: (v) => v ? '✓ Var' : '✗ Yok' },
    { key: 'security', label: t('compare.security', 'Güvenlik'), format: (v) => v ? '✓ Var' : '✗ Yok' },
    { key: 'in_complex', label: t('compare.inComplex', 'Site İçinde'), format: (v) => v ? '✓ Evet' : '✗ Hayır' },
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              ⚖️ {t('compare.title', 'İlan Karşılaştırma')}
            </h1>
            <p className="text-gray-600 mt-1">
              {compareList.length} {t('compare.count', 'ilan karşılaştırılıyor')}
            </p>
          </div>
          <button
            onClick={clearCompare}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            {t('compare.clearAll', 'Listeyi Temizle')}
          </button>
        </div>

        {/* Karşılaştırma Tablosu */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Property Headers */}
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-semibold text-gray-600 w-48 sticky left-0 bg-gray-50">
                    {t('compare.property', 'İlan')}
                  </th>
                  {compareList.map((property) => (
                    <th key={property.id} className="p-4 min-w-[280px]">
                      <div className="relative">
                        {/* Remove button */}
                        <button
                          onClick={() => removeFromCompare(property.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 transition text-sm"
                          title={t('compare.remove', 'Karşılaştırmadan Çıkar')}
                        >
                          ✕
                        </button>
                        
                        {/* Property Image */}
                        <Link to={`/properties/${property.id}`}>
                          <img
                            src={property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'}
                            alt={property.title}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                          />
                        </Link>
                        
                        {/* Property Title */}
                        <Link to={`/properties/${property.id}`} className="hover:text-red-600">
                          <h3 className="font-bold text-gray-800 line-clamp-2 text-sm">
                            {property.title}
                          </h3>
                        </Link>
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => toggleFavorite(property)}
                            className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${
                              isFavorite(property.id)
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {isFavorite(property.id) ? '❤️ Favorilerde' : '🤍 Favorile'}
                          </button>
                          <button
                            onClick={() => handleWhatsAppShare(property)}
                            className="px-2 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition"
                            title="WhatsApp ile Paylaş"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Comparison Rows */}
              <tbody>
                {compareFeatures.map((feature, index) => (
                  <tr key={feature.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 font-medium text-gray-600 sticky left-0 bg-inherit border-r">
                      {feature.label}
                    </td>
                    {compareList.map((property) => {
                      const value = property[feature.key];
                      const displayValue = feature.format 
                        ? feature.format(value, property) 
                        : (value || '-');
                      
                      return (
                        <td key={property.id} className="p-4 text-center">
                          <span className={feature.key === 'price' ? 'font-bold text-red-600 text-lg' : ''}>
                            {displayValue}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add more properties hint */}
        {compareList.length < 3 && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              {t('compare.addMore', `${3 - compareList.length} ilan daha ekleyebilirsiniz`)}
            </p>
            <Link 
              to="/properties" 
              className="text-red-600 hover:text-red-700 font-medium"
            >
              {t('compare.browseMore', '+ İlan Ekle')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
