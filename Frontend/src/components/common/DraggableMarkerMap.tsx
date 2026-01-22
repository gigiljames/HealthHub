import { useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix the default marker icon issue with Webpack/Create React App
// This is a common issue and ensures the default marker icons are displayed correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com",
  iconUrl: "https://unpkg.com",
  shadowUrl: "https://unpkg.com",
});

const DraggableMarkerMap = ({
  initialLatLong,
  height,
}: {
  initialLatLong: { lat: number; lng: number };
  height?: string;
}) => {
  const [position, setPosition] = useState(initialLatLong);
  const markerRef = useRef(null);

  // Define event handlers for the marker
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          // Update the position state with the new latitude and longitude after dragging
          setPosition(marker.getLatLng());
        }
      },
    }),
    [],
  );

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      {/* <p>
        Marker Position: Latitude: {position.lat.toFixed(4)}, Longitude:{" "}
        {position.lng.toFixed(4)}
      </p> */}
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: height ?? "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={position}
          ref={markerRef}
        >
          <Popup>Drag me to a new location!</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DraggableMarkerMap;
