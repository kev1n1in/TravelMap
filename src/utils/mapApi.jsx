import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback, useState } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 25.033,
  lng: 121.5654,
};

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

const Map = () => {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries: ["places"],
  });

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    const service = new window.google.maps.places.PlacesService(mapInstance);
    const request = {
      location: center,
      radius: "5000",
      type: ["tourist_attraction"],
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
      }
    });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  console.log("map", map);
  console.log("places", places);
  if (!isLoaded) return <div>Loading...</div>;
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      onLoad={handleMapLoad}
      onUnmount={onUnmount}
    >
      {places.map((place) => {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // console.log("Place:", lat, lng);
        return (
          <MarkerF
            key={place.place_id}
            position={{ lat: lat, lng: lng }}
            onClick={() => setSelectedPlace(place)}
          />
        );
      })}
      {selectedPlace && (
        <InfoWindowF
          position={{
            lat: selectedPlace.geometry.location.lat(),
            lng: selectedPlace.geometry.location.lng(),
          }}
          onCloseClick={() => selectedPlace(null)}
        >
          <div>
            <h2>{selectedPlace.name}</h2>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default Map;
