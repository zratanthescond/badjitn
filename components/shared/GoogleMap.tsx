import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import SearchBox from "./GoogleMapsSearchBox";

export default function GoogleMapComponent({
  radius,
  setLatitude,
  setLongitude,
  latitude,
  longitude,
  address,
  setAddress,
  style,
}: {
  radius: number;
  setLatitude: React.Dispatch<React.SetStateAction<number>>;
  setLongitude: React.Dispatch<React.SetStateAction<number>>;
  latitude: number;
  longitude: number;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  style?: React.CSSProperties;
}) {
  const [libraries] = useState<"places"[]>(["places"]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const { isLoaded } = useLoadScript({
    libraries,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const center = useMemo(
    () => ({ lat: latitude, lng: longitude }),
    [latitude, longitude]
  );

  const handlePlaceChanged = (adr) => {
    const place = adr;
    if (place.geometry?.location) {
      setAddress(place.formatted_address || "");
      setLatitude(place.geometry.location.lat());
      setLongitude(place.geometry.location.lng());
    }
  };

  const handleDragEnd = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setLatitude(event.latLng.lat());
      setLongitude(event.latLng.lng());
    }
  };

  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [center, map]);

  return (
    <div className="w-full h-[400px] md:h-[600px]">
      {!isLoaded ? (
        <div>Loading...</div>
      ) : (
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={style || { width: "100%", height: "100%" }}
          mapTypeId="roadmap"
          onLoad={(mapInstance) => setMap(mapInstance)}
          mapContainerClassName="w-full h-full rounded-2xl p-10"
        >
          <SearchBox onPlaceSelect={(adr) => handlePlaceChanged(adr)} />
          <Marker
            draggable
            position={center}
            onDragEnd={handleDragEnd}
            animation={google.maps.Animation.DROP}
          />
          <Circle
            center={center}
            options={{
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#1976D2",
              fillOpacity: 0.35,
              clickable: false,
              draggable: false,
              editable: false,
              visible: true,
              radius,
            }}
          />
        </GoogleMap>
      )}
    </div>
  );
}
