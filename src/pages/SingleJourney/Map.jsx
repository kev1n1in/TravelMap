import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useCallback, useEffect, useState } from "react";
import { fetchPlaces, fetchPlaceDetails } from "../../utils/mapApi";
import { useQuery } from "@tanstack/react-query";
import Modal from "./Modal";
// import { useParams } from "react-router-dom";
import attractionPin from "./img/bluePin.png";
import styled from "styled-components";
import SearchImg from "../SingleJourney/img/search.png";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const Map = ({ journeyId }) => {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const { data: places, refetch } = useQuery({
    queryKey: ["places", center],
    queryFn: () => fetchPlaces(map, center),
    enabled: false,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const handleSearchClick = () => {
    refetch();
  };

  console.log("places", places);
  const { data: placeDetails } = useQuery({
    queryKey: ["placeDetails", selectedPlace?.place_id],
    queryFn: () => fetchPlaceDetails(map, selectedPlace.place_id),
    enabled: !!selectedPlace,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  useEffect(() => {
    console.log("Fetching user location");
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

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const handleMapUnmount = useCallback(() => {
    setMap(null);
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
          journeyId={journeyId}
          placeDetails={placeDetails}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <SearchButton onClick={handleSearchClick}>
        <SearchIcon src={SearchImg} />
        搜尋此區域景點
      </SearchButton>
    </>
  );
};

export default Map;

const SearchButton = styled.button`
  color: #2d4057;
  width: 180px;
  height: 44px;
  background-color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 50px;
  font-size: 16px;
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
`;
