import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red marker
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={redIcon} />
  ) : null;
};

// Component to change map view
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// City coordinates for centering map
const cityCoordinates = {
  'İstanbul': { lat: 41.0082, lng: 28.9784 },
  'Ankara': { lat: 39.9334, lng: 32.8597 },
  'İzmir': { lat: 38.4237, lng: 27.1428 },
  'Bursa': { lat: 40.1885, lng: 29.0610 },
  'Antalya': { lat: 36.8969, lng: 30.7133 },
  'Adana': { lat: 37.0, lng: 35.3213 },
  'Konya': { lat: 37.8714, lng: 32.4846 },
  'Gaziantep': { lat: 37.0662, lng: 37.3833 },
  'Mersin': { lat: 36.8, lng: 34.6333 },
  'Kayseri': { lat: 38.7312, lng: 35.4787 },
  'Eskişehir': { lat: 39.7767, lng: 30.5206 },
  'Diyarbakır': { lat: 37.9144, lng: 40.2306 },
  'Samsun': { lat: 41.2867, lng: 36.33 },
  'Denizli': { lat: 37.7765, lng: 29.0864 },
  'Şanlıurfa': { lat: 37.1591, lng: 38.7969 },
  'Trabzon': { lat: 41.0027, lng: 39.7168 },
  'Malatya': { lat: 38.3552, lng: 38.3095 },
  'Erzurum': { lat: 39.9043, lng: 41.2679 },
  'Van': { lat: 38.4891, lng: 43.4089 },
  'default': { lat: 39.0, lng: 35.0 } // Turkey center
};

// İstanbul ilçe koordinatları
const districtCoordinates = {
  'İstanbul': {
    'Adalar': { lat: 40.8761, lng: 29.0911 },
    'Arnavutköy': { lat: 41.1848, lng: 28.7394 },
    'Ataşehir': { lat: 40.9923, lng: 29.1244 },
    'Avcılar': { lat: 40.9792, lng: 28.7217 },
    'Bağcılar': { lat: 41.0386, lng: 28.8572 },
    'Bahçelievler': { lat: 41.0022, lng: 28.8594 },
    'Bakırköy': { lat: 40.9800, lng: 28.8700 },
    'Başakşehir': { lat: 41.0936, lng: 28.8028 },
    'Bayrampaşa': { lat: 41.0469, lng: 28.9039 },
    'Beşiktaş': { lat: 41.0422, lng: 29.0083 },
    'Beykoz': { lat: 41.1322, lng: 29.1017 },
    'Beylikdüzü': { lat: 41.0000, lng: 28.6400 },
    'Beyoğlu': { lat: 41.0370, lng: 28.9770 },
    'Büyükçekmece': { lat: 41.0200, lng: 28.5850 },
    'Çatalca': { lat: 41.1433, lng: 28.4617 },
    'Çekmeköy': { lat: 41.0353, lng: 29.1819 },
    'Esenler': { lat: 41.0436, lng: 28.8764 },
    'Esenyurt': { lat: 41.0333, lng: 28.6833 },
    'Eyüpsultan': { lat: 41.0478, lng: 28.9344 },
    'Fatih': { lat: 41.0186, lng: 28.9497 },
    'Gaziosmanpaşa': { lat: 41.0639, lng: 28.9128 },
    'Güngören': { lat: 41.0194, lng: 28.8764 },
    'Kadıköy': { lat: 40.9927, lng: 29.0277 },
    'Kağıthane': { lat: 41.0819, lng: 28.9764 },
    'Kartal': { lat: 40.8900, lng: 29.1900 },
    'Küçükçekmece': { lat: 41.0000, lng: 28.7667 },
    'Maltepe': { lat: 40.9333, lng: 29.1333 },
    'Pendik': { lat: 40.8761, lng: 29.2333 },
    'Sancaktepe': { lat: 41.0022, lng: 29.2350 },
    'Sarıyer': { lat: 41.1667, lng: 29.0500 },
    'Silivri': { lat: 41.0731, lng: 28.2464 },
    'Sultanbeyli': { lat: 40.9667, lng: 29.2667 },
    'Sultangazi': { lat: 41.1069, lng: 28.8672 },
    'Şile': { lat: 41.1761, lng: 29.6131 },
    'Şişli': { lat: 41.0600, lng: 28.9870 },
    'Tuzla': { lat: 40.8167, lng: 29.3000 },
    'Ümraniye': { lat: 41.0167, lng: 29.1167 },
    'Üsküdar': { lat: 41.0236, lng: 29.0153 },
    'Zeytinburnu': { lat: 41.0053, lng: 28.9036 },
  },
  'Ankara': {
    'Çankaya': { lat: 39.9000, lng: 32.8600 },
    'Keçiören': { lat: 39.9833, lng: 32.8667 },
    'Mamak': { lat: 39.9333, lng: 32.9333 },
    'Yenimahalle': { lat: 39.9667, lng: 32.8000 },
    'Etimesgut': { lat: 39.9500, lng: 32.6667 },
    'Sincan': { lat: 39.9667, lng: 32.5833 },
    'Altındağ': { lat: 39.9500, lng: 32.8667 },
    'Pursaklar': { lat: 40.0333, lng: 32.9000 },
    'Gölbaşı': { lat: 39.7833, lng: 32.8000 },
    'Polatlı': { lat: 39.5833, lng: 32.1500 },
  },
  'İzmir': {
    'Konak': { lat: 38.4189, lng: 27.1287 },
    'Karşıyaka': { lat: 38.4561, lng: 27.1119 },
    'Bornova': { lat: 38.4687, lng: 27.2157 },
    'Buca': { lat: 38.3833, lng: 27.1667 },
    'Çiğli': { lat: 38.5000, lng: 27.0667 },
    'Gaziemir': { lat: 38.3167, lng: 27.1333 },
    'Bayraklı': { lat: 38.4667, lng: 27.1667 },
    'Karabağlar': { lat: 38.3833, lng: 27.1167 },
    'Balçova': { lat: 38.3833, lng: 27.0500 },
    'Narlıdere': { lat: 38.4000, lng: 27.0167 },
  },
  'Bursa': {
    'Nilüfer': { lat: 40.2128, lng: 28.9436 },
    'Osmangazi': { lat: 40.1833, lng: 29.0500 },
    'Yıldırım': { lat: 40.2000, lng: 29.1000 },
    'Mudanya': { lat: 40.3833, lng: 28.8833 },
    'Gemlik': { lat: 40.4333, lng: 29.1667 },
    'İnegöl': { lat: 40.0833, lng: 29.5167 },
    'Gürsu': { lat: 40.2333, lng: 29.1167 },
    'Kestel': { lat: 40.2000, lng: 29.2167 },
  },
  'Antalya': {
    'Muratpaşa': { lat: 36.8841, lng: 30.7056 },
    'Konyaaltı': { lat: 36.8693, lng: 30.6378 },
    'Kepez': { lat: 36.9500, lng: 30.7167 },
    'Döşemealtı': { lat: 37.0167, lng: 30.5833 },
    'Aksu': { lat: 36.9333, lng: 30.8500 },
    'Alanya': { lat: 36.5500, lng: 32.0000 },
    'Manavgat': { lat: 36.7833, lng: 31.4333 },
    'Serik': { lat: 36.9167, lng: 31.1000 },
    'Kaş': { lat: 36.2000, lng: 29.6500 },
    'Kemer': { lat: 36.6000, lng: 30.5667 },
  }
};

const LocationPicker = ({ 
  latitude, 
  longitude, 
  city,
  district,
  onLocationChange,
  height = '300px'
}) => {
  const [position, setPosition] = useState(
    latitude && longitude 
      ? { lat: latitude, lng: longitude } 
      : null
  );

  const [mapCenter, setMapCenter] = useState([39.0, 35.0]); // Turkey center
  const [mapZoom, setMapZoom] = useState(6);

  // Update map center when city or district changes
  useEffect(() => {
    if (district && city && districtCoordinates[city] && districtCoordinates[city][district]) {
      const coords = districtCoordinates[city][district];
      setMapCenter([coords.lat, coords.lng]);
      setMapZoom(13);
    } else if (city && cityCoordinates[city]) {
      setMapCenter([cityCoordinates[city].lat, cityCoordinates[city].lng]);
      setMapZoom(11);
    } else {
      setMapCenter([39.0, 35.0]);
      setMapZoom(6);
    }
  }, [city, district]);

  // Update position when props change
  useEffect(() => {
    if (latitude && longitude) {
      setPosition({ lat: latitude, lng: longitude });
      setMapCenter([latitude, longitude]);
      setMapZoom(15);
    }
  }, [latitude, longitude]);

  // Notify parent of position changes
  useEffect(() => {
    if (position && onLocationChange) {
      onLocationChange(position.lat, position.lng);
    }
  }, [position]);

  const handleClearLocation = () => {
    setPosition(null);
    if (onLocationChange) {
      onLocationChange(null, null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold">
          📍 Konum Seçin (Haritaya Tıklayın)
        </label>
        {position && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Konumu Temizle
          </button>
        )}
      </div>
      
      <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{ height }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeMapView center={mapCenter} zoom={mapZoom} />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      
      {position && (
        <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <span><strong>Enlem:</strong> {position.lat.toFixed(6)}</span>
          <span><strong>Boylam:</strong> {position.lng.toFixed(6)}</span>
        </div>
      )}
      
      {!position && (
        <p className="text-sm text-gray-500 italic">
          💡 Şehir ve ilçe seçtiğinizde harita otomatik olarak o bölgeye odaklanacaktır
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
