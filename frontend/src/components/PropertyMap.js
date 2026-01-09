import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red marker for property location
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Single property map (for property detail page)
export const SinglePropertyMap = ({ property, height = '300px' }) => {
  if (!property?.latitude || !property?.longitude) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>Harita bilgisi mevcut değil</p>
        </div>
      </div>
    );
  }

  const position = [property.latitude, property.longitude];

  return (
    <div className="rounded-lg overflow-hidden shadow-md" style={{ height }}>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={redIcon}>
          <Popup>
            <div className="text-center">
              <strong>{property.title}</strong>
              <br />
              <span className="text-sm text-gray-600">
                {property.district}, {property.city}
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

// Multiple properties map (for properties list page)
export const MultiPropertyMap = ({ properties, height = '400px', onPropertyClick }) => {
  if (!properties || properties.length === 0) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        <p>Gösterilecek ilan bulunamadı</p>
      </div>
    );
  }

  // Filter properties with valid coordinates
  const validProperties = properties.filter(p => p.latitude && p.longitude);
  
  if (validProperties.length === 0) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        <p>Konum bilgisi olan ilan bulunamadı</p>
      </div>
    );
  }

  // Calculate center from all properties
  const avgLat = validProperties.reduce((sum, p) => sum + p.latitude, 0) / validProperties.length;
  const avgLng = validProperties.reduce((sum, p) => sum + p.longitude, 0) / validProperties.length;
  const center = [avgLat, avgLng];

  // Calculate appropriate zoom level based on spread
  const latSpread = Math.max(...validProperties.map(p => p.latitude)) - Math.min(...validProperties.map(p => p.latitude));
  const lngSpread = Math.max(...validProperties.map(p => p.longitude)) - Math.min(...validProperties.map(p => p.longitude));
  const maxSpread = Math.max(latSpread, lngSpread);
  
  let zoom = 6; // Default for Turkey-wide view
  if (maxSpread < 0.1) zoom = 13;
  else if (maxSpread < 0.5) zoom = 11;
  else if (maxSpread < 1) zoom = 9;
  else if (maxSpread < 2) zoom = 8;

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('tr-TR').format(price) + ' ' + currency;
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-md" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={redIcon}
            eventHandlers={{
              click: () => onPropertyClick && onPropertyClick(property)
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                {property.images && property.images[0] && (
                  <img 
                    src={property.images[0].startsWith('http') ? property.images[0] : `${process.env.REACT_APP_BACKEND_URL}${property.images[0]}`}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <strong className="block text-sm">{property.title}</strong>
                <span className="text-xs text-gray-600 block">
                  {property.district}, {property.city}
                </span>
                <span className="text-red-600 font-bold text-sm block mt-1">
                  {formatPrice(property.price, property.currency)}
                </span>
                <a 
                  href={`/properties/${property.id}`}
                  className="text-xs text-blue-600 hover:underline mt-1 block"
                >
                  Detayları Gör →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default { SinglePropertyMap, MultiPropertyMap };
