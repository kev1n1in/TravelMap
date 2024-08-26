import { useEffect, useState } from "react";
import { addAttraction } from "../../firebase/firebaseService";
import PropTypes from "prop-types";
import { styled } from "styled-components";
import closeImg from "./img/close.png";
import locationImg from "./img/location.png";
import dayjs from "dayjs";
import Grid from "@mui/material/Grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

const Modal = ({ placeDetails, onClose }) => {
  const [tripDate, setTripDate] = useState(dayjs());
  const [tripStartTime, setTripStartTime] = useState(
    dayjs().set("hour", 14).startOf("hour")
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoUrls, setPhotoUrls] = useState([]);
  useEffect(() => {
    if (placeDetails && placeDetails.photos) {
      const urls = placeDetails.photos
        .map((photo) => (photo.getUrl ? photo.getUrl() : null))
        .filter((url) => url !== null);
      setPhotoUrls(urls);
    }
  }, [placeDetails]);
  if (!placeDetails) return null;
  const photos = placeDetails.photos || [];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photoUrls.length);
  };

  const prevSlide = () => {
    if (photoUrls.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + photoUrls.length) % photoUrls.length
    );
  };

  const handleDateChange = (newValue) => {
    setTripDate(newValue);
  };

  const handleTimeChange = (newValue) => {
    setTripStartTime(newValue);
  };

  const handleCreate = async () => {
    if (!tripDate || !tripStartTime) {
      alert("請選擇日期和時間");
      return;
    }
    const success = await addAttraction(placeDetails, tripDate, tripStartTime);
    if (success) {
      onClose();
      alert("建立行程成功！");
    } else {
      alert("建立行程失敗，請重試");
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <PhotosContainer>
          {photos && photos.length > 0 && (
            <>
              <SlideButton onClick={prevSlide}>◀</SlideButton>
              <SlideImage
                src={photoUrls[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
              />
              <SlideButton onClick={nextSlide}>▶</SlideButton>
            </>
          )}
        </PhotosContainer>
        <InfoContainer>
          <CloseWrapper>
            <CloseIcon src={closeImg} onClick={onClose} />
          </CloseWrapper>
          <AttractionName>{placeDetails.name}</AttractionName>
          <AddressWrapper>
            <AddressIcon src={locationImg} />
            <AttractionAddress>
              {placeDetails.formatted_address}
            </AttractionAddress>
          </AddressWrapper>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid
              container
              columns={{ xs: 1, lg: 2 }}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item>
                <StyledDateCalendar
                  value={tripDate}
                  onChange={handleDateChange}
                />
              </Grid>
              <Grid item>
                <StyledTimePicker
                  value={tripStartTime}
                  onChange={handleTimeChange}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <CreateWrapper>
            <CreateButton onClick={handleCreate}>建立行程</CreateButton>
          </CreateWrapper>
        </InfoContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

Modal.propTypes = {
  placeDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    formatted_address: PropTypes.string.isRequired,
    photos: PropTypes.array,
  }),
  onClose: PropTypes.func.isRequired,
};

export default Modal;

const ModalOverlay = styled.div`
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

const ModalContainer = styled.div`
  display: flex;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 1032px;
  width: 100%;
  height: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const PhotosContainer = styled.div`
  width: 664px;
  position: relative;
  overflow: hidden;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const SlideButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 1;
  border-radius: 50px;

  &:first-of-type {
    left: 10px;
  }
  &:last-of-type {
    right: 10px;
  }
`;

const InfoContainer = styled.div`
  width: 368px;
  margin-left: 40px;
`;

const CloseWrapper = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: end;
`;

const CloseIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const StyledDateCalendar = styled(DateCalendar)`
  width: 300px;
  height: 400px;
  margin: 0;
  padding: 0;
`;

const StyledTimePicker = styled(TimePicker)`
  margin: 0;
  padding: 0;
`;

const CreateWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

const CreateButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
`;

const AttractionName = styled.h1`
  color: #2d4057;
  font-size: 20px;
  font-weight: 500;
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
`;

const AddressIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const AttractionAddress = styled.h3`
  color: #2d4057;
  font-size: 16px;
  font-weight: 400;
  padding-left: 10px;
`;
