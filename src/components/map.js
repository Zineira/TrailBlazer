import React, { useState, useCallback, memo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "70%", // Update width to take remaining space
  height: "100vh",
};

const defaultCenter = {
  lat: 41.1496,
  lng: -8.6109,
};

const defaultZoom = 13;

// Define libraries consistently

function MapComponent() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [zoom, setZoom] = useState(defaultZoom);

  // Map load handler
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Map unload handler
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle marker click
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  // Handle map click to add new marker
  const handleMapClick = (event) => {
    const newMarker = {
      id: Date.now(),
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
      title: `Location ${markers.length + 1}`,
    };
    setMarkers([...markers, newMarker]);
  };

  // Handle zoom change
  const handleZoomChanged = () => {
    if (map) {
      setZoom(map.getZoom());
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      onZoomChanged={handleZoomChanged}
      options={{
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
        minZoom: 3,
        maxZoom: 18,
      }}
    >
      {/* Render markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.title}
          onClick={() => handleMarkerClick(marker)}
        />
      ))}

      {/* Info Window for selected marker */}
      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div>
            <h3>{selectedMarker.title}</h3>
            <p>Latitude: {selectedMarker.position.lat.toFixed(6)}</p>
            <p>Longitude: {selectedMarker.position.lng.toFixed(6)}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export default memo(MapComponent);
