import { useJsApiLoader } from "@react-google-maps/api";
import { useCallback, useEffect, useReducer, useState } from "react";
import { fetchPlaces, fetchPlaceDetails } from "../../utils/mapApi";
import { fetchAttractions } from "../../firebase/firebaseService";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Modal from "../../components/Modal";
import StreetViewModal from "./StreetViewModal";
import styled from "styled-components";
import SearchImg from "../SingleJourney/img/search.png";
import JourneyList from "./JourneyList";
import dayjs from "dayjs";
import {
  journeyReducer,
  initialState,
  actionTypes,
} from "../../utils/journeyReducer";
import { useParams } from "react-router-dom";
import {
  deleteAttraction,
  updateAttraction,
  addAttraction,
} from "../../firebase/firebaseService";
import Map from "./Map";
import { RingLoader } from "react-spinners";
import useAlert from "../../Hooks/useAlertMessage";
const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY;
const libraries = ["places"];

const SingleJourney = () => {
  const [state, dispatch] = useReducer(journeyReducer, initialState);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(null);
  const [tripDate, setTripDate] = useState(dayjs());
  const [tripStartTime, setTripStartTime] = useState(
    dayjs().set("hour", 14).startOf("hour")
  );
  const [isStreetView, setIsStreetView] = useState(false);
  const [isCardsVisible, setIsCardsVisible] = useState("");
  const { id: journeyId } = useParams();
  const queryClient = useQueryClient();
  const formattedTripDate = tripDate.format("YYYY-MM-DD");
  const formattedTripStartTime = tripStartTime.format("HH:mm");
  const { addAlert, AlertMessage } = useAlert();

  useEffect(() => {
    const handleResize = () => {
      setIsCardsVisible(window.innerWidth > 768);
      if (window.innerWidth <= 768) {
        setIsStreetView(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const checkDuplicateDate = (
    journeyData,
    formattedTripDate,
    formattedTripStartTime
  ) => {
    return journeyData.some((journey) => {
      return (
        journey.date === formattedTripDate &&
        journey.startTime === formattedTripStartTime
      );
    });
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const {
    data: journeyData,
    isLoading,
    error,
    isFetched,
  } = useQuery({
    queryKey: ["journeys", journeyId],
    queryFn: () => fetchAttractions(journeyId),
    onSuccess: (data) => console.log("Fetched journeys:", data),
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

  useEffect(() => {
    if (!isFetched || !Array.isArray(journeyData)) {
      return;
    }
    const sorted = [...journeyData].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA - dateB;
    });
    dispatch({ type: actionTypes.SET_SORTED_JOURNEY, payload: sorted });
  }, [isFetched, journeyData]);

  useEffect(() => {
    if (!Array.isArray(state.sortedJourney)) {
      return;
    }
    const path = state.sortedJourney.map((journey) => ({
      lat: journey.lat,
      lng: journey.lng,
    }));
    dispatch({ type: actionTypes.SET_POLYLINE_PATH, payload: path });
  }, [state.sortedJourney]);

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
    setTimeout(() => {
      refetchPlace();
    }, 0);
  };

  const handleMarkerClick = (data, isJourney) => {
    if (!journeyId) {
      addAlert("請先填寫行程名稱和描述");
      return;
    }
    const modalType = isJourney ? "update" : "create";
    dispatch({
      type: actionTypes.OPEN_MODAL,
      payload: { modalType, data: data },
    });
  };

  const handleCardClick = (data) => {
    if (!journeyId) {
      addAlert("請先填寫行程名稱和描述");
      return;
    }
    if (map) {
      map.setCenter({ lat: data.lat, lng: data.lng });
    }
    dispatch({
      type: actionTypes.OPEN_MODAL,
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
      dispatch({ type: actionTypes.CLOSE_MODAL });
      addAlert("建立行程成功！");
    },
    onError: (error) => {
      addAlert("建立行程失敗，請重試");
      console.error("Error:", error);
    },
  });

  const handleCreate = () => {
    if (!tripDate || !tripStartTime) {
      addAlert("請選擇日期和時間");
      return;
    }
    const isDuplicate = checkDuplicateDate(
      journeyData,
      formattedTripDate,
      formattedTripStartTime
    );
    if (isDuplicate) {
      addAlert("此時間已經有行程安排，請選擇其他時間");
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
      dispatch({ type: actionTypes.CLOSE_MODAL });
      addAlert("更新行程成功！");
    },
    onError: (error) => {
      addAlert("更新行程失敗，請重試");
      console.log("Error", error);
    },
  });

  const handleUpdate = () => {
    if (!tripDate || !tripStartTime) {
      addAlert("請選擇日期和時間");
      return;
    }
    const isDuplicate = checkDuplicateDate(
      journeyData,
      formattedTripDate,
      formattedTripStartTime
    );
    if (isDuplicate) {
      addAlert("此時間已經有行程安排，請選擇其他時間");
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
      dispatch({ type: actionTypes.CLOSE_MODAL });
      addAlert("刪除行程成功！");
    },
    onError: (error) => {
      addAlert("刪除行程失敗，請重試");
      console.log("Error", error);
    },
  });

  const handleDelete = async (journeyId, placeId) => {
    const journeyPlaceId = placeDetails?.place_id || placeId;
    deleteMutation.mutate({
      journeyId,
      placeId: journeyPlaceId,
    });
  };

  const handleToggleView = () => {
    setIsStreetView((prev) => !prev);
  };

  const handleCardsVisibility = () => {
    setIsCardsVisible((prev) => !prev);
  };

  if (!isLoaded)
    return (
      <LoaderWrapper>
        <RingLoader color="#57c2e9" size={100} />
      </LoaderWrapper>
    );

  return (
    <Container>
      <MapContainer>
        <Map
          onUnmount={handleMapUnmount}
          polylinePath={state.polylinePath}
          center={center}
          places={places}
          journeyData={journeyData}
          onClickMarker={handleMarkerClick}
          sortedJourney={state.sortedJourney}
          onMapLoad={handleMapLoad}
        />
        <SearchButton onClick={handleSearchClick}>
          <SearchIcon src={SearchImg} />
          搜尋此區域景點
        </SearchButton>
      </MapContainer>
      {state.isModalOpen && (
        <>
          {isStreetView ? (
            <StreetViewModal
              journeyId={journeyId}
              placeDetails={placeDetails}
              modalType={state.modalType}
              onClose={() => dispatch({ type: actionTypes.CLOSE_MODAL })}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onCreate={handleCreate}
              onChangeDate={handleDateChange}
              onChangeTime={handleTimeChange}
              tripDate={tripDate}
              tripStartTime={tripStartTime}
              toggleView={handleToggleView}
              isStreetView={isStreetView}
            />
          ) : (
            <Modal
              journeyId={journeyId}
              placeDetails={placeDetails}
              modalType={state.modalType}
              onClose={() => dispatch({ type: actionTypes.CLOSE_MODAL })}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onCreate={handleCreate}
              onChangeDate={handleDateChange}
              onChangeTime={handleTimeChange}
              tripDate={tripDate}
              tripStartTime={tripStartTime}
              toggleView={handleToggleView}
              isStreetView={isStreetView}
            />
          )}
        </>
      )}
      {isCardsVisible && (
        <CardsContainer>
          <JourneyList
            journeys={journeyData}
            journeyId={journeyId}
            isLoading={isLoading}
            error={error}
            onUpdate={handleUpdate}
            onClickCard={handleCardClick}
            onDelete={handleDelete}
            sortedJourney={state.sortedJourney}
            placeId={placeDetails?.place_id}
          />
        </CardsContainer>
      )}
      <ToggleButton onClick={handleCardsVisibility}>
        {isCardsVisible ? "隱藏行程列表" : "顯示行程列表"}
      </ToggleButton>
      <AlertMessage />
    </Container>
  );
};

export default SingleJourney;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Container = styled.div`
  display: flex;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MapContainer = styled.div`
  position: relative;
  width: 75%;
  height: 100vh;

  @media (max-width: 768px) {
    width: 100%;
    z-index: 1;
  }
`;

const CardsContainer = styled.div`
  position: relative;
  width: 25%;
  min-width: 270px;
  height: 100vh;
  background-color: white;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    position: absolute;
    top: 0;
    z-index: 2;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 10px;
  right: 60px;
  padding: 10px 20px;
  background-color: #57c2e9;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  z-index: 3;
  font-weight: 600;
  font-size: 14px;
  @media (min-width: 769px) {
    display: none;
  }
`;

const SearchButton = styled.button`
  color: #2d4057;
  width: 190px;
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
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateX(-50%) scale(1.1);
  }
  @media (min-width: 769px) {
    top: 50px;
  }
`;

const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
`;
