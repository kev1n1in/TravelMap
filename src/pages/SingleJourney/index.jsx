import { useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useReducer, useState } from "react";
import { fetchPlaces, fetchPlaceDetails } from "../../utils/mapApi";
import { fetchJourney } from "../../firebase/firebaseService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Modal from "./Modal";
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
  addAttraction,
} from "../../firebase/firebaseService";
import Map from "./Map";

const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const SingleJourney = () => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(null);
  const { id: journeyId } = useParams();
  const queryClient = useQueryClient();
  const [tripDate, setTripDate] = useState(dayjs());
  const [tripStartTime, setTripStartTime] = useState(
    dayjs().set("hour", 14).startOf("hour")
  );
  const [polylinePath, setPolylinePath] = useState([]);
  const [sortedJourney, setSortedJourney] = useState([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries,
  });

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

  const {
    data: journeyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["journeys", journeyId],
    queryFn: () => fetchJourney(journeyId),
    onSuccess: (data) => console.log("Fetched journeys:", data),
  });

  useEffect(() => {
    if (!Array.isArray(journeyData)) {
      return;
    }
    const sorted = [...journeyData].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA - dateB;
    });
    setSortedJourney(sorted);
  }, [journeyData]);

  useEffect(() => {
    if (!Array.isArray(sortedJourney)) {
      return;
    }
    const path = sortedJourney.map((journey) => ({
      lat: journey.lat,
      lng: journey.lng,
    }));
    setPolylinePath(path);
  }, [sortedJourney]);

  const { data: places, refetch: refetchPlace } = useQuery({
    queryKey: ["places", center],
    queryFn: () => fetchPlaces(map, center),
    enabled: false,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

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

  const handleMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleSearchClick = () => {
    queryClient.setQueryData(["place", center], []);
    const mapCenter = map.getCenter();
    setCenter({
      lat: mapCenter.lat(),
      lng: mapCenter.lng(),
    });
  };

  useEffect(() => {
    if (center) {
      refetchPlace();
    }
  }, [center, refetchPlace]);

  const handleMarkerClick = (data, isJourney) => {
    if (!journeyId) {
      alert("請先填寫行程名稱和描述");
      return;
    }
    if (map) {
      map.setCenter({ lat: data.lat, lng: data.lng });
    }
    const modalType = isJourney ? "update" : "create";
    dispatch({
      type: modalActionTypes.OPEN_MODAL,
      payload: { modalType, data: data },
    });
  };

  const handleCardClick = (data) => {
    if (!journeyId) {
      alert("請先填寫行程名稱和描述");
      return;
    }
    if (map) {
      map.setCenter({ lat: data.lat, lng: data.lng });
    }
    dispatch({
      type: modalActionTypes.OPEN_MODAL,
      payload: { modalType: "update", data: data },
    });
  };

  const handleDateChange = (newValue) => {
    setTripDate(newValue);
  };

  const handleTimeChange = (newValue) => {
    setTripStartTime(newValue);
  };

  const createMutation = useMutation({
    mutationFn: async (newAttraction) => {
      await addAttraction(
        newAttraction.journeyId,
        newAttraction.placeDetails,
        newAttraction.tripDate,
        newAttraction.tripStartTime
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["journeys", journeyId]);
      dispatch({ type: modalActionTypes.CLOSE_MODAL });
      alert("建立行程成功！");
    },
    onError: (error) => {
      alert("建立行程失敗，請重試");
      console.error("Error:", error);
    },
  });

  const handleCreate = () => {
    if (!tripDate || !tripStartTime) {
      alert("請選擇日期和時間");
      return;
    }
    const formattedTripDate = tripDate.format("YYYY-MM-DD");
    const formattedTripStartTime = tripStartTime.format("HH:mm");

    const isDuplicate = journeyData.some((journey) => {
      return (
        journey.date === formattedTripDate &&
        journey.startTime === formattedTripStartTime
      );
    });

    if (isDuplicate) {
      alert("此時間已經有行程安排，請選擇其他時間");
      return;
    }

    createMutation.mutate({
      journeyId,
      placeDetails,
      tripDate: formattedTripDate,
      tripStartTime: formattedTripStartTime,
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

    const formattedTripDate = tripDate.format("YYYY-MM-DD");
    const formattedTripStartTime = tripStartTime.format("HH:mm");

    const isDuplicate = journeyData.some((journey) => {
      return (
        journey.date === formattedTripDate &&
        journey.startTime === formattedTripStartTime
      );
    });

    if (isDuplicate) {
      alert("此時間已經有行程安排，請選擇其他時間");
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

  const handleDelete = () => {
    deleteMutation.mutate({
      journeyId,
      placeId: placeDetails.place_id,
    });
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Container>
      <MapContainer>
        <Map
          onUnmount={handleMapUnmount}
          polylinePath={polylinePath}
          center={center}
          places={places}
          journeyData={journeyData}
          onClickMarker={handleMarkerClick}
          sortedJourney={sortedJourney}
          onMapLoad={handleMapLoad}
        />
        <SearchButton onClick={handleSearchClick}>
          <SearchIcon src={SearchImg} />
          搜尋此區域景點
        </SearchButton>
        {state.isModalOpen && (
          <Modal
            journeyId={journeyId}
            placeDetails={placeDetails}
            modalType={state.modalType}
            onClose={() => dispatch({ type: modalActionTypes.CLOSE_MODAL })}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onCreate={() => handleCreate()}
            onChangeDate={handleDateChange}
            onChangeTime={handleTimeChange}
            tripDate={tripDate}
            tripStartTime={tripStartTime}
            isLoading={isLoading}
            error={error}
          />
        )}
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

export default SingleJourney;

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
