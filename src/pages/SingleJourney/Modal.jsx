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

  return (
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
          <SwitchContainer>
            <StyledSwitch checked={isStreetView} onChange={toggleView} />
          </SwitchContainer>
          <CloseWrapper>
            <CloseIcon src={closeImg} onClick={onClose} />
          </CloseWrapper>
          <AttractionName>{placeDetails.name}</AttractionName>
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
                <StyledDateCalendar value={tripDate} onChange={onChangeDate} />
              </Grid>
              <Grid item>
                <StyledTimePicker
                  value={tripStartTime}
                  onChange={onChangeTime}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>

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
            <span style={{ color: "#d02c2c", fontWeight: "500" }}>
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
        html_attributions: PropTypes.arrayOf(PropTypes.string),
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
  max-width: 1032px;
  width: 90%;
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
  position: relative;
  right: 10px;
  width: 368px;
  margin-left: 20px;
  padding-left: 20px;
`;

const CloseWrapper = styled.div`
  width: 100%;
  padding: 20px 20px 0 0;
  height: 30px;
  display: flex;
  justify-content: end;
  z-index: 30;
`;

const CloseIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const StyledDateCalendar = styled(DateCalendar)`
  position: relative;
  right: 30px;
  bottom: 10px;
  width: 300px;
  height: 400px;
  margin: 0;
  padding: 0;
`;

const StyledTimePicker = styled(TimePicker)`
  position: relative;
  right: 55px;
  bottom: 50px;
  margin: 0;
  padding: 0;
`;

const ButtonWrapper = styled.div`
  position: absolute;
  right: -10px;
  bottom: 0;
  display: flex;
  justify-content: end;
`;

const ModalButton = styled.button`
  background-color: #57c2e9;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
`;

const AttractionName = styled.h1`
  position: relative;
  width: 250px;
  bottom: 20px;
  right: 10px;
  color: #2d4057;
  font-size: 24px;
  font-weight: 700;
`;

const RatingWrapper = styled.div`
  position: relative;
  right: 10px;
  bottom: 20px;
  margin-bottom: 10px;
`;

const RatingText = styled.p`
  color: #2d4057;
  font-size: 16px;
  font-weight: 400;
`;

const AddressWrapper = styled.div`
  display: flex;
  position: relative;
  bottom: 20px;
  right: 10px;
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

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 10px;
  left: 0;
`;

const StyledSwitch = styled(Switch)`
  margin: 0 10px;
`;
