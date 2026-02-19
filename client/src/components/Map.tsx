import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Place } from "@shared/schema";
import { Link } from "wouter";

// Fix Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  places: Place[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Component to handle map center updates
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function Map({ places, center = [40.7128, -74.0060], zoom = 13, className }: MapProps) {
  // Use a custom warm map style or standard OSM
  // CartoDB Voyager is good for modern/clean look

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className={className}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapUpdater center={center} zoom={zoom} />
      
      {places.map((place) => (
        <Marker 
          key={place.id} 
          position={[place.lat, place.lng]}
        >
          <Popup className="custom-popup">
            <div className="p-1 min-w-[150px]">
              <h3 className="font-bold text-sm mb-1">{place.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{place.category}</p>
              <Link 
                href={`/place/${place.id}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
