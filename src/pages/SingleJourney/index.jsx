import GoogleMap from "../SingleJourney/Map";
import { styled } from "styled-components";
import JourneyCardDrawer from "./JourneyCardDrawer";
import { Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { fetchJourney } from "../../firebase/firebaseService";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const SingleJourney = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { id: journeyId } = useParams();

  const {
    data: journeys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["journeys", journeyId],
    queryFn: () => fetchJourney(journeyId),
    onSuccess: (data) => console.log("Fetched journeys:", data),
  });

  return (
    <Container>
      <MapContainer>
        <GoogleMap journeyId={journeyId} />
      </MapContainer>
      <Button
        variant="contained"
        color="primary"
        style={{ position: "absolute", top: "20px", right: "20px" }}
        onClick={() => setIsDrawerOpen(true)}
      >
        Open Drawer
      </Button>
      <JourneyCardDrawer
        journeys={journeys}
        isLoading={isLoading}
        error={error}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </Container>
  );
};

export default SingleJourney;

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
`;

const MapContainer = styled.div`
  width: 100%;
`;
