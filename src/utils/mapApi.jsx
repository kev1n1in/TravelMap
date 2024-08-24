import {
  GoogleMap,
  //   InfoWindowF,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;

const Map = () => {
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [center, setCenter] = useState({
    lat: 25.033,
    lng: 121.5654,
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries: ["places"],
  });

  const fetchPlaces = useCallback((mapInstance, center) => {
    const service = new window.google.maps.places.PlacesService(mapInstance);
    const request = {
      location: center,
      radius: "5000",
      type: ["tourist_attraction"],
      language: "zh-TW",
    };
    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlaces(results);
      }
    });
  }, []);

  const handleMapLoad = useCallback(
    (mapInstance) => {
      setMap(mapInstance);
      fetchPlaces(mapInstance, center);
    },
    [center, fetchPlaces]
  );

  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const fetchPlaceDetails = useCallback(
    (placeId) => {
      const service = new window.google.maps.places.PlacesService(map);
      service.getDetails({ placeId, language: "zh-TW" }, (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaceDetails(result);
        } else {
          console.error("Place details request failed due to", status);
        }
      });
    },
    [map]
  );

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCenter({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting user's location:", error);
      }
    );
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      fetchPlaceDetails(selectedPlace.place_id);
    }
  }, [selectedPlace, fetchPlaceDetails]);

  console.log("places", places);
  console.log("placesDetail", placeDetails);
  if (!isLoaded) return <div>Loading...</div>;
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={14}
      onLoad={handleMapLoad}
      onUnmount={handleMapUnmount}
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
      {/* {selectedPlace && (
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
      )} */}
    </GoogleMap>
  );
};

export default Map;
