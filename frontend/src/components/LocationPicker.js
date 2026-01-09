import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const LocationPicker = ({ 
  latitude, 
  longitude, 
  city,
  onLocationChange,
  height = '300px'
}) => {
  const [position, setPosition] = useState(
    latitude && longitude 
      ? { lat: latitude, lng: longitude } 
      : null
  );

  // Get map center based on city or current position
  const getMapCenter = useCallback(() => {
    if (position) {
      return [position.lat, position.lng];
    }
    if (city && cityCoordinates[city]) {
      return [cityCoordinates[city].lat, cityCoordinates[city].lng];
    }
    return [cityCoordinates.default.lat, cityCoordinates.default.lng];
  }, [position, city]);

  const [mapCenter, setMapCenter] = useState(getMapCenter());
  const [mapKey, setMapKey] = useState(0);

  // Update map center when city changes
  useEffect(() => {
    if (!position && city && cityCoordinates[city]) {
      setMapCenter([cityCoordinates[city].lat, cityCoordinates[city].lng]);
      setMapKey(prev => prev + 1); // Force map re-render
    }
  }, [city, position]);

  // Update position when props change
  useEffect(() => {
    if (latitude && longitude) {
      setPosition({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  // Notify parent of position changes
  useEffect(() => {
    if (position && onLocationChange) {
      onLocationChange(position.lat, position.lng);
    }
  }, [position, onLocationChange]);

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
          key={mapKey}
          center={mapCenter}
          zoom={position ? 15 : city ? 11 : 6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
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
          İlanın konumunu belirlemek için haritaya tıklayın
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
