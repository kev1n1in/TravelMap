import GoogleMap from "../SingleJourney/Map";
import { styled } from "styled-components";
import { useParams } from "react-router-dom";
import { fetchAttraction } from "../../firebase/firebaseService";
import { useEffect, useState } from "react";

const SingleJourney = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);
  console.log("data", data);

  useEffect(() => {
    const attactions = fetchAttraction(id);
    setData(attactions);
  }, [id]);

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
