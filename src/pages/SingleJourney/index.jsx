import GoogleMap from "../SingleJourney/Map";
import { styled } from "styled-components";
import JourneyCardDrawer from "./JourneyCardDrawer";
import { Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { fetchAttraction } from "../../firebase/firebaseService";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const SingleJourney = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: ["attraction", id],
    queryFn: () => fetchAttraction(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  console.log("data", data);

  return (
    <Container>
      <MapContainer>
        <GoogleMap />
      </MapContainer>
      <ListContainer>{/* <List /> */}</ListContainer>
      <Button
        variant="contained"
        color="primary"
        style={{ position: "absolute", top: "20px", right: "20px" }}
        onClick={() => setIsDrawerOpen(true)}
      >
        Open Drawer
      </Button>
      <JourneyCardDrawer
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

const ListContainer = styled.div``;
