import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";
import { fetchPlaces, fetchPlaceDetails } from "../../utils/mapApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "./Modal";
import attractionPin from "./img/bluePin.png";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const Map = () => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const { data: places } = useQuery({
    queryKey: ["places", center],
    queryFn: () => fetchPlaces(map, center),
    enabled: !!map && !!center,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const { data: placeDetails } = useQuery({
    queryKey: ["placeDetails", selectedPlace?.place_id],
    queryFn: () => fetchPlaceDetails(map, selectedPlace.place_id),
    enable: !!selectedPlace,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const handleMapLoad = useCallback(
    (mapInstance) => {
      setMap(mapInstance);
      if (center) {
        queryClient.invalidateQueries({ queryKey: ["places"] });
      }
    },
    [center, queryClient]
  );

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCenter({ lat: latitude, lng: longitude });
      },
      (error) => {
        setCenter({ lat: 25.033, lng: 121.5654 });
        console.error("Error getting user's location:", error);
      }
    );
  }, []);

  if (!isLoaded) return <div>Loading...</div>;
  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={14}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
      >
        {places?.map((place) => {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          return (
            <MarkerF
              key={place.place_id}
              position={{ lat: lat, lng: lng }}
              onClick={() => handleMarkerClick(place)}
              icon={{
                url: attractionPin,
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          );
        })}
      </GoogleMap>
      {isModalOpen && (
        <Modal
          placeDetails={placeDetails}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Map;
