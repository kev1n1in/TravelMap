import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { styled } from "styled-components";
import whiteCloseImg from "./img/close-white.png";
import whiteLocationImg from "./img/location-white.png";
import Grid from "@mui/material/Grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import ConfirmDialog from "../../components/ConfirmDialog";
import Rating from "@mui/material/Rating";
import Switch from "@mui/material/Switch";

const StreetViewModal = ({
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
  const streetViewRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (
      placeDetails &&
      placeDetails.geometry &&
      placeDetails.geometry.location
    ) {
      new window.google.maps.StreetViewPanorama(streetViewRef.current, {
        position: {
          lat: placeDetails.geometry.location.lat(),
          lng: placeDetails.geometry.location.lng(),
        },
        pov: { heading: 165, pitch: 0 },
        zoom: 1,
      });
    }
  }, [placeDetails]);

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
        <StreetViewContainer ref={streetViewRef}> </StreetViewContainer>
        <InfoContainer>
          <SwitchContainer>
            <StyledSwitch checked={isStreetView} onChange={toggleView} />
          </SwitchContainer>
          <CloseWrapper>
            <CloseIcon src={whiteCloseImg} onClick={onClose} />
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
            <AddressIcon src={whiteLocationImg} />
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

StreetViewModal.propTypes = {
  journeyId: PropTypes.string.isRequired,
  modalType: PropTypes.string.isRequired,
  placeDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    formatted_address: PropTypes.string.isRequired,
    rating: PropTypes.number,
    geometry: PropTypes.shape({
      location: PropTypes.shape({
        lat: PropTypes.func.isRequired,
        lng: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
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
  position: relative;
  display: flex;
  background-color: white;
  padding: 0;
  border-radius: 8px;
  max-width: 1032px;
  width: 90%;
  height: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const StreetViewContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const InfoContainer = styled.div`
  position: relative;
  width: 368px;
  margin-left: auto;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding-left: 30px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CloseWrapper = styled.div`
  position: absolute;
  top: 20px;
  right: 40px;
  display: flex;
  justify-content: flex-end;
`;
const CloseIcon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

const StyledDateCalendar = styled(DateCalendar)`
  position: relative;
  right: 15px;
  width: 100%;
  height: 280px !important;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  .MuiTypography-root {
    color: #fff;
  }

  .MuiPickersCalendarHeader-label,
  .MuiPickersCalendarHeader-switchViewButton,
  .MuiIconButton-root {
    color: #fff;
  }

  .MuiPickersDay-root {
    color: #fff;
  }

  .Mui-selected {
    background-color: rgba(255, 255, 255, 0.3) !important;
  }
`;

const StyledTimePicker = styled(TimePicker)`
  position: relative;
  top: 10px;
  right: 60px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  margin-top: 16px;

  .MuiTypography-root {
    color: #fff;
  }

  .MuiOutlinedInput-root {
    color: #fff;
  }

  .MuiInputAdornment-root {
    color: #fff;
  }
`;

const ButtonWrapper = styled.div`
  position: relative;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
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
  width: 200px;
  top: 10px;
  color: white;
  font-size: 24px;
  font-weight: 700;
`;

const RatingWrapper = styled.div`
  margin-top: 10px;
`;

const RatingText = styled.p`
  color: white;
  font-size: 16px;
  font-weight: 400;
`;

const AddressWrapper = styled.div`
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 56px;
`;

const AddressIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const AttractionAddress = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 400;
  padding-left: 10px;
  text-align: left;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 10px;
  left: 0;
  z-index: 11;
`;

const StyledSwitch = styled(Switch)`
  margin: 0 10px;
`;

export default StreetViewModal;
