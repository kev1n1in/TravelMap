import GoogleMap from "../SingleJourney/Map";
import { styled } from "styled-components";
// import { useParams } from "react-router-dom";
// import { fetchAttraction } from "../../firebase/firebaseService";
// import { useQuery } from "@tanstack/react-query";

const SingleJourney = () => {
  // const { id } = useParams();

  // const { data } = useQuery({
  //   queryKey: ["attraction", id],
  //   queryFn: () => fetchAttraction(id),
  //   enabled: !!id,
  //   staleTime: 1000 * 60 * 5,
  //   retry: false,
  // });

  // console.log("data", data);

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
