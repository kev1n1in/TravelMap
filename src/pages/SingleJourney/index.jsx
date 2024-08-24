import GoogleMap from "../../utils/mapApi";
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
  width: 70%;
`;

const ListContainer = styled.div`
  /* width: 30%; */
`;
