import { MapPin } from "lucide-react";
import React, { useState, useRef } from "react";

// Type definitions for Google Maps Places API responses
interface PlacePrediction {
  description: string;
  place_id: string;
}

interface PlaceDetails {
  formatted_address?: string;
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface SearchBoxProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  placeholder?: string;
}

// Google Maps Places API utility functions
const fetchSuggestions = (
  query: string,
  setSuggestions: React.Dispatch<React.SetStateAction<PlacePrediction[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!query.trim()) {
    setSuggestions([]);
    return;
  }

  const service = new google.maps.places.AutocompleteService();
  service.getPlacePredictions({ input: query }, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      setSuggestions(results || []);
    } else {
      setSuggestions([]);
    }
    setLoading(false);
  });
};

const getPlaceDetails = (
  placeId: string,
  onSelect: (place: PlaceDetails) => void
) => {
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  );
  service.getDetails({ placeId }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      onSelect(place);
    }
  });
};

const SearchBox: React.FC<SearchBoxProps> = ({
  onPlaceSelect,
  placeholder = "Search for a place...",
}) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setLoading(true);
    fetchSuggestions(value, setSuggestions, setLoading);
  };

  const handleSuggestionClick = (placeId: string) => {
    getPlaceDetails(placeId, (place) => {
      if (place) {
        onPlaceSelect(place);
        setQuery(place.formatted_address || "");
        setSuggestions([]);
      }
    });
  };

  return (
    <div className="relative w-full">
      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full h-12 px-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {loading && <li className="px-4 py-2 text-gray-500">Loading...</li>}
          {!loading &&
            suggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion.place_id);
                }}
                className="px-4 py-2 cursor-pointer gap-2 hover:bg-gray-100 flex flex-row"
              >
                <MapPin stroke="pink" />
                {suggestion.description}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
