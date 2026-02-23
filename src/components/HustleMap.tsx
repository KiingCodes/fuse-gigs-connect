import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HustleWithDetails } from "@/hooks/useData";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface HustleMapProps {
  hustles: HustleWithDetails[];
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

const HustleMap = ({ hustles, userLocation, className }: HustleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const center: L.LatLngExpression = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [-26.2041, 28.0473]; // Johannesburg default

    const map = L.map(mapRef.current).setView(center, 12);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // User location marker
    if (userLocation) {
      L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        color: "hsl(24, 95%, 53%)",
        fillColor: "hsl(24, 95%, 53%)",
        fillOpacity: 0.3,
        weight: 2,
      })
        .addTo(map)
        .bindPopup("You are here");
    }

    // Hustle markers
    const markers: L.Marker[] = [];
    hustles.forEach((hustle) => {
      if (hustle.latitude && hustle.longitude) {
        const marker = L.marker([hustle.latitude, hustle.longitude])
          .addTo(map)
          .bindPopup(
            `<div style="min-width:150px">
              <strong>${hustle.title}</strong>
              <br/><span style="color:#666">${hustle.location || ""}</span>
              ${hustle.price ? `<br/><strong>R${hustle.price}</strong>` : ""}
              ${hustle.distance != null ? `<br/><small>${hustle.distance.toFixed(1)} km away</small>` : ""}
            </div>`
          );
        markers.push(marker);
      }
    });

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      if (userLocation) {
        group.addLayer(L.marker([userLocation.lat, userLocation.lng]));
      }
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [hustles, userLocation]);

  return <div ref={mapRef} className={`w-full rounded-lg ${className || "h-[400px]"}`} />;
};

export default HustleMap;
