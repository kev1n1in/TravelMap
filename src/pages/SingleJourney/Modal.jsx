import { useState } from "react";
import { handleCreateTrip } from "../../firebase/firebaseService";
import { styled } from "styled-components";
const Modal = ({ placeDetails, onClose }) => {
  const [tripDate, setTripDate] = useState("");
  const [tripStartTime, setTripStartTime] = useState("");
  if (!placeDetails) return null;

  return (
    <ModalContainer>
      <ModalContent>
        <input
          type="date"
          value={tripDate}
          onChange={(e) => setTripDate(e.target.value)}
        />
        <input
          type="time"
          value={tripStartTime}
          onChange={(e) => setTripStartTime(e.target.value)}
        />
        <button onClick={onClose}>Close</button>
        <button
          onClick={() =>
            handleCreateTrip(placeDetails, tripDate, tripStartTime)
          }
        >
          Create
        </button>
      </ModalContent>
    </ModalContainer>
  );
};

export default Modal;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0, 5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 700px;
  width: 100%;
  height: 300px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;
