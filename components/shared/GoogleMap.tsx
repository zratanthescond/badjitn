import React, { useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
  Libraries,
} from "@react-google-maps/api";
import SearchBox from "./GoogleMapsSearchBox";

const googleMapsLibraries: Libraries = ["places"];

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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useLoadScript({
    id: "google-map-script",
    libraries: googleMapsLibraries,
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(
    () => ({ lat: latitude, lng: longitude }),
    [latitude, longitude]
  );

  const handlePlaceChanged = (place: google.maps.places.PlaceResult) => {
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

  useEffect(() => {
    if (!map || !isLoaded) {
      return;
    }

    const resizeTimer = window.setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      map.panTo(center);
    }, 200);

    return () => window.clearTimeout(resizeTimer);
  }, [center, isLoaded, map]);

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-2xl md:h-[600px]">
      {!apiKey ? (
        <div className="flex h-full items-center justify-center rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ajoutez `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` dans `.env.local`, puis redemarrez le serveur Next.js.
        </div>
      ) : loadError ? (
        <div className="flex h-full items-center justify-center rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Google Maps n&apos;a pas pu se charger. Verifiez que la cle API est active, que la facturation est active et que `http://localhost:3000/*` est autorise dans les restrictions HTTP referrer.
        </div>
      ) : !isLoaded ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="absolute left-4 right-4 top-4 z-10">
            <SearchBox onPlaceSelect={(place) => handlePlaceChanged(place)} />
          </div>
          <GoogleMap
            center={center}
            zoom={15}
            mapContainerStyle={style || { width: "100%", height: "100%" }}
            mapTypeId="roadmap"
            onLoad={(mapInstance) => setMap(mapInstance)}
            mapContainerClassName="w-full h-full"
          >
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
        </>
      )}
    </div>
  );
}
