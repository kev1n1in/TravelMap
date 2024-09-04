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
import Rating from "@mui/material/Rating";
import Switch from "@mui/material/Switch";
import useConfirmDialog from "../../Hooks/useConfirmDialog";

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
  const { ConfirmDialogComponent, openDialog } = useConfirmDialog();
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

  const openDeleteDialog = () => {
    if (!placeDetails || !journeyId) {
      return;
    }
    openDialog(placeDetails.name, () => {
      onDelete(journeyId);
    });
  };

  if (!placeDetails) return null;

  const modalContent = (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader></ModalHeader>
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
          <AttractionName>{placeDetails.name}</AttractionName>
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
                  <StyledTimePicker
                    value={tripStartTime}
                    onChange={onChangeTime}
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
                <ModalButton onClick={openDeleteDialog}>刪除此地標</ModalButton>
              </ButtonWrapper>
            )}
            <Message>街景模式僅在桌機版可使用</Message>
          </ModalFooter>
        </InfoContainer>
      </ModalContainer>
      {ConfirmDialogComponent}
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
  width: 819px;
  height: 661px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 0px;
    width: 100%;
    height: 100vh;
    box-shadow: none;
  }
`;

const PhotosContainer = styled.div`
  border-radius: 8px 0px 0px 8px;
  width: 60%;
  position: relative;
  @media (max-width: 768px) {
    border-radius: 0px;
    margin-top: 60px;
    display: flex;
    height: 300px;
    z-index: 2;
    width: 100%;
    justify-content: center;
    align-items: center;
  }
`;

const SlideImage = styled.img`
  border-radius: 8px 0px 0px 8px;
  width: 100%;
  height: 100%;
  object-fit: cover;
  @media (max-width: 768px) {
    border-radius: 0px;
  }
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
  width: 367px;
  margin: 10px 20px 25px 25px;

  @media (max-width: 768px) {
    width: auto;
    margin: 0;
  }
`;

const ModalHeader = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    /* position: absolute; */
    top: 0;
    background-color: white;
    height: 60px;
    position: fixed;
    z-index: 5;
    width: 100%;
  }
`;

const AttractionName = styled.h1`
  width: 250px;
  color: #2d4057;
  font-size: 24px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  @media (max-width: 768px) {
    margin: 0;
    position: fixed;
    top: 0;
    z-index: 5;
    width: 100%;
    text-align: center;
    padding: 10px 0px;
  }
`;

const CloseIcon = styled.img`
  position: absolute;
  top: 15px;
  right: 18px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  @media (max-width: 768px) {
    z-index: 8;
    position: fixed;
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
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const RatingWrapper = styled.div`
  display: flex;
  margin-top: 10px;
`;

const RatingText = styled.p`
  color: #2d4057;
  font-size: 16px;
  font-weight: 400;
  margin-left: 10px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: left;
  width: 100%;
  margin: 20px 0px 10px 0px;
  @media (max-width: 768px) {
    justify-content: center;
  }
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
  position: relative;
  @media (max-width: 768px) {
    position: fixed;
    z-index: 1;
    bottom: 0;
    padding: 5px;
    justify-content: space-around;
    align-items: center;
    background-color: white;
  }
`;

const SwitchContainer = styled.div`
  position: relative;
  right: 8px;
  width: 50px;
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
const StyledTimePicker = styled(TimePicker)`
  padding: 8px;
  position: relative;
  right: 35px;
  top: 10px;
  @media (max-width: 768px) {
    right: 0;
  }
`;
const Message = styled.span`
  position: absolute;
  top: 48px;
  font-size: 10px;
  @media (max-width: 768px) {
    display: none;
  }
`;
