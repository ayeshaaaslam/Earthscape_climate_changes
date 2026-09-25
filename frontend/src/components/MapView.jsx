import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icon in Vite bundler
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom station icon generator
const createStationIcon = (temp, hasAnomaly) => {
  const bgColor = hasAnomaly ? '#ef4444' : temp > 35 ? '#f97316' : temp < 20 ? '#06b6d4' : '#10b981';
  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        padding: 3px 6px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        border: 2px solid #ffffff;
        white-space: nowrap;
        text-align: center;
      ">
        ${temp ? `${temp}°C` : 'Station'}
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12]
  });
};

const MapView = ({ locations = [], selectedLocation = null, onSelectLocation, height = "420px" }) => {
  const center = [30.3753, 69.3451]; // Center of Pakistan / Regional coordinate

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {locations.map((loc) => {
          if (!loc.latitude || !loc.longitude) return null;
          const isSelected = selectedLocation === loc.location || selectedLocation === loc._id;
          const temp = loc.latestTemp || loc.avgTemp;
          const hasAnomaly = loc.anomaliesDetected > 0 || (temp && temp > 45);

          return (
            <Marker
              key={loc.location || loc._id}
              position={[loc.latitude, loc.longitude]}
              icon={createStationIcon(temp, hasAnomaly)}
              eventHandlers={{
                click: () => onSelectLocation && onSelectLocation(loc.location || loc._id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 text-slate-800">
                  <h4 className="font-bold text-sm text-slate-900 border-b pb-1 mb-1">
                    {loc.location || loc._id} Station
                  </h4>
                  <div className="text-xs space-y-1">
                    <p><span className="font-semibold">Avg Temp:</span> {loc.avgTemp ? `${loc.avgTemp}°C` : `${loc.latestTemp}°C`}</p>
                    <p><span className="font-semibold">Rainfall:</span> {loc.avgRainfall ? `${loc.avgRainfall} mm` : `${loc.latestRain || 0} mm`}</p>
                    <p><span className="font-semibold">CO2 Level:</span> {loc.avgCo2 ? `${loc.avgCo2} ppm` : `${loc.latestCo2 || 415} ppm`}</p>
                    <p><span className="font-semibold">Status:</span> {hasAnomaly ? <span className="text-red-600 font-bold">ANOMALY DETECTED</span> : <span className="text-emerald-600 font-medium">Normal</span>}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;