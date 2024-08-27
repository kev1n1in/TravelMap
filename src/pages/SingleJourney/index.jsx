import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useCallback, useEffect, useReducer, useState } from "react";
import { fetchPlaces, fetchPlaceDetails } from "../../utils/mapApi";
import { fetchJourney } from "../../firebase/firebaseService";
import { useQuery } from "@tanstack/react-query";
import Modal from "./Modal";
import bluePin from "./img/bluePin.png";
import redPin from "./img/redPin.png";
import styled from "styled-components";
import SearchImg from "../SingleJourney/img/search.png";
// import JourneyCardDrawer from "./JourneyCardDrawer";
import JourneyCards from "./JourneyList";
import dayjs from "dayjs";
import {
  modalReducer,
  initialState,
  modalActionTypes,
} from "../../utils/journeyReducer";
import { useParams } from "react-router-dom";
import {
  deleteAttraction,
  updateAttraction,
} from "../../firebase/firebaseService";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const Map = () => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(null);
  const { id: journeyId } = useParams();
  const [tripDate, setTripDate] = useState(dayjs());
  const [tripStartTime, setTripStartTime] = useState(
    dayjs().set("hour", 14).startOf("hour")
  );

  const {
    data: journeys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["journeys", journeyId],
    queryFn: () => fetchJourney(journeyId),
    onSuccess: (data) => console.log("Fetched journeys:", data),
  });

  console.log("journeys", journeys);
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

  const { data: placeDetails } = useQuery({
    queryKey: ["placeDetails", state.jourenyData?.place_id],
    queryFn: () => fetchPlaceDetails(map, state.jourenyData.place_id),
    enabled: !!state.isModalOpen,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
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

  const handleMarkerClick = (data, isJourney) => {
    const modalType = isJourney ? "update" : "create";
    console.log("Dispatching action:", {
      type: modalActionTypes.OPEN_MODAL,
      payload: { modalType, data },
    });

    dispatch({
      type: modalActionTypes.OPEN_MODAL,
      payload: { modalType, data: data },
    });
  };
  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleUpdate = async () => {
    if (!tripDate || !tripStartTime) {
      alert("請選擇日期和時間");
      return;
    }
    const success = await updateAttraction(
      journeyId,
      placeDetails.place_id,
      tripDate,
      tripStartTime
    );
    if (success) {
      dispatch({ type: modalActionTypes.CLOSE_MODAL });
      alert("更新行程成功！");
    } else {
      alert("更新行程失敗，請重試");
    }
  };

  const handleDelete = async () => {
    const success = await deleteAttraction(journeyId, placeDetails.place_id);
    if (success) {
      dispatch({ type: modalActionTypes.CLOSE_MODAL });
      alert("刪除行程成功！");
    } else {
      alert("刪除行程失敗，請重試");
    }
  };

  const handleDateChange = (newValue) => {
    setTripDate(newValue);
  };

  const handleTimeChange = (newValue) => {
    setTripStartTime(newValue);
  };

  const mapStyles = [
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Container>
      <MapContainer>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={{ styles: mapStyles }}
          onLoad={handleMapLoad}
          onUnmount={handleMapUnmount}
        >
          {places?.map((place) => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const isInJourneys = journeys?.some(
              (journey) => journey.lat === lat && journey.lng === lng
            );
            return (
              <MarkerF
                key={place.place_id}
                position={{ lat: lat, lng: lng }}
                onClick={() => handleMarkerClick(place, false)}
                icon={{
                  url: isInJourneys ? redPin : bluePin,
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            );
          })}
          {journeys?.map((journey) => (
            <MarkerF
              key={journey.id}
              position={{ lat: journey.lat, lng: journey.lng }}
              onClick={() => handleMarkerClick(journey, true)}
              icon={{
                url: redPin,
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
        </GoogleMap>
        {state.isModalOpen && (
          <Modal
            journeyId={journeyId}
            placeDetails={placeDetails}
            modalType={state.modalType}
            onClose={() => dispatch({ type: modalActionTypes.CLOSE_MODAL })}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onChangeDate={handleDateChange}
            onChangeTime={handleTimeChange}
            tripDate={tripDate}
            tripStartTime={tripStartTime}
          />
        )}
        <SearchButton onClick={handleSearchClick}>
          <SearchIcon src={SearchImg} />
          搜尋此區域景點
        </SearchButton>
      </MapContainer>
      <CardsContainer>
        <JourneyCards journeys={journeys} isLoading={isLoading} error={error} />
      </CardsContainer>
    </Container>
  );
};

export default Map;

const Container = styled.div`
  display: flex;
  width: 100%;
`;

const MapContainer = styled.div`
  position: relative;
  width: 75%;
  height: 100vh;
`;

const CardsContainer = styled.div`
  position: relative;
  width: 25%;
  height: 100vh;
`;

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
