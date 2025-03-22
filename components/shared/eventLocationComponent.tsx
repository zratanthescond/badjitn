import { Event } from "@/types";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import { useState } from "react";

export default function EventLocationComponent({ event }: { event: Event }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

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
  return event.isOnline ? (
    <span className="glass w-full text-center p-2 rounded-2xl m-1 text-gray-500">
      This event is organized online check the event url{" "}
      <a href={event.url} className="text-indigo-500">
        here
      </a>
    </span>
  ) : (
    <div className="w-full glass flex rounded-2xl p-1 gap-2 flex-col ">
      <div className="flex flex-row w-full p-2 items-center justify-between  rounded-2xl bg-card">
        <label className="flex flex-row  p-2  font-semibold rounded-lg gap-2 items-start ">
          <MapPin />
        </label>
        <span className="bg-card text-center p-2 rounded-2xl m-1 w-full">
          This event is organized on {event.location.name}
        </span>
      </div>

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
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
    </div>
  );
}
