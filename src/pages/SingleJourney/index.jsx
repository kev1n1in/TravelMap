import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Polyline,
} from "@react-google-maps/api";
import { useCallback, useEffect, useReducer, useState } from "react";
import { fetchPlaces, fetchPlaceDetails } from "../../utils/mapApi";
import { fetchJourney } from "../../firebase/firebaseService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Modal from "./Modal";
import bluePin from "./img/bluePin.png";
import redPin from "./img/redPin.png";
import styled from "styled-components";
import SearchImg from "../SingleJourney/img/search.png";
import JourneyList from "./JourneyList";
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

  const queryClient = useQueryClient();

  const {
    data: journeyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["journeys", journeyId],
    queryFn: () => fetchJourney(journeyId),
    onSuccess: (data) => console.log("Fetched journeys:", data),
  });

  // console.log("journeys", journeyData);

  const getSortedJourneys = () => {
    if (!Array.isArray(journeyData)) {
      return [];
    }

    return [...journeyData].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA - dateB;
    });
  };

  const sortedJourney = getSortedJourneys();

  // console.log("sortedJourney ", sortedJourney);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const { data: places, refetch: refetchPlace } = useQuery({
    queryKey: ["places", center],
    queryFn: () => fetchPlaces(map, center),
    enabled: false,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const polylinePath = sortedJourney.map((journey) => ({
    lat: journey.lat,
    lng: journey.lng,
  }));

  const handleSearchClick = () => {
    const mapCenter = map.getCenter();
    setCenter({
      lat: mapCenter.lat(),
      lng: mapCenter.lng(),
    });
    refetchPlace();
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
    if (!journeyId) {
      alert("請先填寫行程名稱和描述");
      return;
    }
    const modalType = isJourney ? "update" : "create";
    dispatch({
      type: modalActionTypes.OPEN_MODAL,
      payload: { modalType, data: data },
    });
  };
  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleCardClick = (data) => {
    if (!journeyId) {
      alert("請先填寫行程名稱和描述");
      return;
    }
    dispatch({
      type: modalActionTypes.OPEN_MODAL,
      payload: { modalType: "update", data: data },
    });
  };

  const updateMutation = useMutation({
    mutationFn: async ({ journeyId, placeId, tripDate, tripStartTime }) => {
      return await updateAttraction(
        journeyId,
        placeId,
        tripDate,
        tripStartTime
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["journeys", journeyId]);
      dispatch({ type: modalActionTypes.CLOSE_MODAL });
      alert("更新行程成功！");
    },
    onError: (error) => {
      alert("更新行程失敗，請重試");
      console.log("Error", error);
    },
  });

  const handleUpdate = () => {
    if (!tripDate || !tripStartTime) {
      alert("請選擇日期和時間");
      return;
    }
    updateMutation.mutate({
      journeyId,
      placeId: placeDetails.place_id,
      tripDate,
      tripStartTime,
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async ({ journeyId, placeId }) => {
      return await deleteAttraction(journeyId, placeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["journeys", journeyId]);
      dispatch({ type: modalActionTypes.CLOSE_MODAL });
      alert("刪除行程成功！");
    },
    onError: (error) => {
      alert("刪除行程失敗，請重試");
      console.log("Error", error);
    },
  });

  const handleDelete = async () => {
    deleteMutation.mutate({
      journeyId,
      placeId: placeDetails.place_id,
    });
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
          {polylinePath.length > 1 && (
            <Polyline
              key={JSON.stringify(polylinePath)}
              path={polylinePath}
              options={{
                strokeColor: "#D22D2D",
                strokeOpacity: 2.0,
                strokeWeight: 2,
              }}
            />
          )}
          {places?.map((place) => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const isInJourneys = journeyData?.some(
              (journey) => journey.lat === lat && journey.lng === lng
            );
            return (
              <MarkerF
                key={place.place_id}
                position={{ lat: lat, lng: lng }}
                onClick={() => handleMarkerClick(place, isInJourneys)}
                label={{
                  text: `${place.name}`,
                  color: "black",
                  fontSize: "12px",
                  fontWeight: "bold",
                  labelOrigin: new window.google.maps.Point(20, -40),
                }}
                icon={{
                  url: isInJourneys ? redPin : bluePin,
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            );
          })}
          {sortedJourney?.map((journey, index) => (
            <MarkerF
              key={journey.id}
              position={{ lat: journey.lat, lng: journey.lng }}
              onClick={() => handleMarkerClick(journey, true)}
              label={{
                text: (index + 1).toString(),
                color: "white",
                fontSize: "20px",
                fontWeight: "bold",
                labelOrigin: new window.google.maps.Point(20, -30),
              }}
              icon={{
                url: redPin,
                scaledSize: new window.google.maps.Size(35, 35),
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
            isLoading={isLoading}
            error={error}
          />
        )}
        <SearchButton onClick={handleSearchClick}>
          <SearchIcon src={SearchImg} />
          搜尋此區域景點
        </SearchButton>
      </MapContainer>
      <CardsContainer>
        <JourneyList
          journeys={journeyData}
          journeyId={journeyId}
          isLoading={isLoading}
          error={error}
          onUpdate={handleUpdate}
          onClickCard={handleCardClick}
          onDelete={handleDelete}
        />
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
  cursor: pointer;
`;

const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
`;
