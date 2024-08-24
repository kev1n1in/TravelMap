import GoogleMap from "../SingleJourney/Map";
import { styled } from "styled-components";

const SingleJourney = () => {
  return (
    <Container>
      <MapContainer>
        <GoogleMap />
      </MapContainer>
      <ListContainer>{/* <List /> */}</ListContainer>
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
