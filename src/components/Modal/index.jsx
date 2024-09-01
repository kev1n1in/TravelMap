import ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { styled } from "styled-components";
import closeImg from "./img/close.png";
import locationImg from "./img/location.png";
import Grid from "@mui/material/Grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import ConfirmDialog from "../../components/ConfirmDialog";
import Rating from "@mui/material/Rating";
import Switch from "@mui/material/Switch";

const Modal = ({
  placeDetails,
  onClose,
  modalType,
  onDelete,
  onUpdate,
  onChangeDate,
  onChangeTime,
  tripDate,
  tripStartTime,
  onCreate,
  journeyId,
  toggleView,
  isStreetView,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  useEffect(() => {
    if (placeDetails && placeDetails.photos) {
      const urls = placeDetails.photos
        .map((photo) => (photo.getUrl ? photo.getUrl() : null))
        .filter((url) => url !== null);
      setPhotoUrls(urls);
    }
  }, [placeDetails]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photoUrls.length);
  };

  const prevSlide = () => {
    if (photoUrls.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + photoUrls.length) % photoUrls.length
    );
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(journeyId);
      setOpenDialog(false);
    }
  };

  if (!placeDetails) return null;

  const modalContent = (
    <ModalOverlay>
      <ModalContainer>
        <PhotosContainer>
          {placeDetails.photos && placeDetails.photos.length > 0 && (
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
          <CloseIcon src={closeImg} onClick={onClose} />
          <ModalHeader>
            <AttractionName>{placeDetails.name}</AttractionName>
          </ModalHeader>
          <ModalMain>
            <RatingWrapper>
              <Rating
                name="read-only"
                value={placeDetails.rating || 0}
                readOnly
                precision={0.1}
              />
              <RatingText>
                {placeDetails.rating ? `${placeDetails.rating} 分` : "無評價"}
              </RatingText>
            </RatingWrapper>
            <AddressWrapper>
              <AddressIcon src={locationImg} />
              <AddressText>{placeDetails.formatted_address}</AddressText>
            </AddressWrapper>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Grid item>
                  <DateCalendar
                    value={tripDate}
                    onChange={onChangeDate}
                    style={{ width: "300px", height: "300px" }}
                  />
                </Grid>
                <Grid item>
                  <TimePicker
                    value={tripStartTime}
                    onChange={onChangeTime}
                    style={{ padding: "8px" }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </ModalMain>
          <ModalFooter>
            <SwitchContainer>
              <StyledSwitch checked={isStreetView} onChange={toggleView} />
            </SwitchContainer>
            {modalType === "create" ? (
              <ButtonWrapper>
                <ModalButton onClick={onCreate}>新增至行程</ModalButton>
              </ButtonWrapper>
            ) : (
              <ButtonWrapper>
                <ModalButton onClick={onUpdate}>更新行程時間</ModalButton>
                <ModalButton onClick={handleOpenDialog}>刪除此地標</ModalButton>
              </ButtonWrapper>
            )}
          </ModalFooter>
        </InfoContainer>
      </ModalContainer>
      <ConfirmDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="確認刪除"
        contentText={
          <span>
            您確定要刪除{" "}
            <span style={{ color: "#57c2e9", fontWeight: "500" }}>
              {placeDetails.name}
            </span>{" "}
            嗎？ 此操作無法撤銷。
          </span>
        }
        confirmButtonText="確定刪除"
        cancelButtonText="取消"
        confirmButtonColor="error"
      />
    </ModalOverlay>
  );
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("modal-root")
  );
};

Modal.propTypes = {
  journeyId: PropTypes.string.isRequired,
  modalType: PropTypes.string.isRequired,
  placeDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    formatted_address: PropTypes.string.isRequired,
    rating: PropTypes.number,
    photos: PropTypes.arrayOf(
      PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
      })
    ),
    place_id: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  onCreate: PropTypes.func,
  onChangeDate: PropTypes.func,
  onChangeTime: PropTypes.func,
  tripDate: PropTypes.instanceOf(dayjs),
  tripStartTime: PropTypes.instanceOf(dayjs),
  toggleView: PropTypes.func.isRequired,
  isStreetView: PropTypes.bool.isRequired,
};

export default Modal;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const ModalContainer = styled.div`
  display: flex;
  position: relative;
  background-color: white;
  border-radius: 8px;
  width: 80%;
  height: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 0px;
    width: 100%;
    height: 100vh;
  }
`;

const PhotosContainer = styled.div`
  border-radius: 8px 0px 0px 8px;
  width: 60%;
  position: relative;
  overflow: hidden;
  @media (max-width: 768px) {
    border-radius: 0px;
    margin-top: 60px;
    display: flex;
    position: sticky;
    z-index: 2;
    width: 100%;
    justify-content: center;
    align-items: center;
  }
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
  border-radius: 50%;

  &:first-of-type {
    left: 10px;
  }
  &:last-of-type {
    right: 10px;
  }
`;

const InfoContainer = styled.div`
  width: 40%;
  margin: 10px 20px 25px 25px;

  @media (max-width: 768px) {
    width: auto;
    margin: 0;
  }
`;

const ModalHeader = styled.div`
  width: 100%;
  height: 50px;
  margin: 10px 0px 0px 0px;
  @media (max-width: 768px) {
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    position: fixed;
    top: 0;
    z-index: 1;
  }
`;

const AttractionName = styled.h1`
  width: 250px;
  color: #2d4057;
  font-size: 24px;
  font-weight: 700;
`;

const CloseIcon = styled.img`
  position: absolute;
  top: 15px;
  right: 18px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  @media (max-width: 768px) {
    z-index: 2;
  }
`;

const ModalMain = styled.div`
  width: 100%;
  margin-bottom: 70px;
  @media (max-width: 768px) {
    overflow-y: auto;
    padding: 10px 0px 25px 25px;
    flex: 1;
    margin-bottom: 60px;
  }
`;

const RatingWrapper = styled.div`
  display: flex;
`;

const RatingText = styled.p`
  color: #2d4057;
  font-size: 16px;
  font-weight: 400;
  margin-left: 10px;
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 20px 0px 10px 0px;
`;

const AddressIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const AddressText = styled.h3`
  color: #2d4057;
  font-size: 16px;
  font-weight: 400;
  padding-left: 10px;
`;

const ModalFooter = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  @media (max-width: 768px) {
    position: fixed;
    z-index: 1;
    bottom: 5px;
    justify-content: space-around;
    align-items: center;
    padding: 10px 10px 5px 20px;
    background-color: white;
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  @media (max-width: 768px) {
    display: none;
  }
`;

const StyledSwitch = styled(Switch)`
  margin: 0 10px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

const ModalButton = styled.button`
  background-color: #57c2e9;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-left: 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
`;
