import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue in react-leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LocationData {
  coordinates: number[]; // [longitude, latitude]
  address: string;
  placeId: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
}

function MapClickHandler({
  onLocationClick,
}: {
  onLocationClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function LocationPicker({
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLocation
      ? [initialLocation.coordinates[1], initialLocation.coordinates[0]]
      : null,
  );
  const [address, setAddress] = useState(initialLocation?.address || "");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India center
  const defaultZoom = 5;

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setPosition([lat, lng]);
      setIsLoadingAddress(true);

      try {
        // Reverse geocoding using Nominatim (OpenStreetMap)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        );
        const data = await response.json();

        const addressStr = data.display_name || `${lat}, ${lng}`;
        const placeId = data.place_id?.toString() || `${lat}_${lng}`;

        setAddress(addressStr);

        onLocationSelect({
          coordinates: [lng, lat], // [longitude, latitude]
          address: addressStr,
          placeId: placeId,
        });
      } catch (error) {
        console.error("Error fetching address:", error);
        const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(fallbackAddress);

        onLocationSelect({
          coordinates: [lng, lat],
          address: fallbackAddress,
          placeId: `${lat}_${lng}`,
        });
      } finally {
        setIsLoadingAddress(false);
      }
    },
    [onLocationSelect],
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
        Location
      </p>
      <div className="border-1 border-inputBorder rounded-lg overflow-hidden">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 13 : defaultZoom}
          style={{ height: "300px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationClick={handleMapClick} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {isLoadingAddress && (
        <p className="text-sm text-gray-500 pl-2">Loading address...</p>
      )}
      {address && !isLoadingAddress && (
        <div className="bg-gray-50 p-3 rounded-lg border-1 border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Selected Location:</p>
          <p className="text-sm text-gray-700">{address}</p>
        </div>
      )}
      <p className="text-xs text-gray-500 pl-2">
        Click on the map to select a location
      </p>
    </div>
  );
}

export default LocationPicker;
