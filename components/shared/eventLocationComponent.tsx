import { Event } from "@/types";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function EventLocationComponent({ event }: { event: Event }) {
  const t = useTranslations("event");
  const tx = (key: string, fallback: string) => (t.has(key as any) ? t(key as any) : fallback);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapFailed, setMapFailed] = useState(false);

  // Replace with the latitude and longitude you want to center the map
  const lat = event.location.lat; // Example latitude
  const lng = event.location.lon; // Example longitude

  const center = {
    lat: lat,
    lng: lng,
  };

  const markerPosition = {
    lat: lat,
    lng: lng,
  };

  const handleLoad = (map: google.maps.Map) => {
    setMap(map);
  };
  const containerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "1rem",
  };
  const mapStyles = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#f5f5f5",
        },
      ],
    },

    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#4a4a4a",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#e8e8e8",
        },
      ],
    },
    {
      featureType: "administrative",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [
        {
          color: "#624CF5",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        {
          color: "#a855f7",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#ff66b2",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#ff66b2",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.icon",
      stylers: [
        {
          color: "#9e9e9e",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#00b3b3",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
  ];
  const mapOptions = {
    styles: mapStyles, // Apply custom styles
  };
  // Avoid "HAMMAMET - HAMMAMET": city and village are sometimes the same
  // value (city + governorate aliasing); only show the village when it adds
  // information the city name doesn't already carry.
  const villageAddsInfo =
    event.village && event.village.trim().toLowerCase() !== (event.city || "").trim().toLowerCase();
  const locationLabel = event.city
    ? villageAddsInfo
      ? `${event.city} - ${event.village}`
      : event.city
    : tx("onlineAt", "Cet événement est organisé en ligne") + (event.location?.name ? ` · ${event.location.name}` : "");

  const address = event.location?.name || locationLabel;
  const mapsUrl = lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return event.isOnline ? (
    <span className="block w-full text-center p-4 rounded-2xl bg-white border border-[#E4E4EF] text-[#55576B]">
      {tx("onlineEvent", "Cet événement est organisé en ligne, consultez l'url de l'événement")}{" "}
      <a href={event.url} className="text-[#4338CA] underline">
        {tx("here", "ici")}
      </a>
    </span>
  ) : (
    <div className="w-full bg-white flex rounded-[20px] border border-[#E4E4EF] p-5 gap-4 flex-col">
      <h2 className="text-xl font-bold text-[#15152B]">{tx("locationTitle", "Lieu")}</h2>
      <div className="flex flex-row w-full items-center gap-3">
        <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#EEF0FF] text-[#4338CA] shrink-0">
          <MapPin aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="font-bold text-[#15152B] uppercase tracking-wide text-sm">
          {locationLabel}
        </span>
      </div>

      {!mapFailed ? (
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
          onError={() => setMapFailed(true)}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={handleLoad}
            options={mapOptions}
          >
            <Marker position={markerPosition} />
          </GoogleMap>
        </LoadScript>
      ) : (
        // Fallback when the Maps JS API fails to load (bad key, billing,
        // domain restriction) — spec issue #7 — show the address as text
        // plus a direct link instead of the raw Google error banner.
        <div className="min-h-[220px] rounded-2xl border border-[#E4E4EF] bg-[#F6F6FB] flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-[#3B3D55]">{address}</p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4338CA] font-bold underline underline-offset-2"
          >
            {tx("openInMaps", "Ouvrir dans Google Maps")}
          </a>
        </div>
      )}
    </div>
  );
}
