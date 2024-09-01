import PropTypes from "prop-types";
import { useMutation } from "@tanstack/react-query";
import {
  createNewJourney,
  saveJourneyInfo,
  fetchJourneyInfo,
  deleteJourney,
} from "../../firebase/firebaseService";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import trash from "./img/trash-bin.png";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/zh-tw";
import clockImg from "./img/clock.png";
import ConfirmDialog from "../../components/ConfirmDialog";
import AlertMessage from "../../components/AlertMessage";
import travelGif from "./img/travelImg.png";
import homeImg from "./img/home.png";

dayjs.extend(duration);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale("zh-tw");

const JourneyList = ({
  journeyId,
  isLoading,
  error,
  onClickCard,
  sortedJourney,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [newJourney, setNewJourney] = useState({
    title: "",
    description: "",
  });
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  const handleOpenDialog = (journey, type) => {
    setSelectedJourney(journey);
    setDialogType(type);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedJourney) {
      try {
        if (dialogType === "journey") {
          await deleteJourney(selectedJourney.id);
          setAlertMessage("行程已成功刪除！");
          navigate("/home");
        } else if (dialogType === "place") {
          onDelete(journeyId, selectedJourney.place_id);
          setAlertMessage("地點已成功刪除！");
        }
      } catch (error) {
        setAlertMessage("刪除時出現錯誤");
        console.log(error.message);
      } finally {
        setOpen(false);
      }
    }
  };

  const handleDeleteJourney = () => {
    handleOpenDialog({ id: journeyId, name: newJourney.title }, "journey");
  };

  const formatDate = (dateStr) => {
    const date = dayjs(dateStr);
    const weekdayName = date.format("dddd");
    return `${date.format("MM/DD")} ${weekdayName}`;
  };

  const groupJourneyByDate = (data) => {
    return data.reduce((groups, item) => {
      const { date } = item;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});
  };

  const groupedData = groupJourneyByDate(sortedJourney);

  const calculateTimeDifference = (startTime1, startTime2) => {
    const time1 = dayjs(startTime1, "HH:mm");
    const time2 = dayjs(startTime2, "HH:mm");
    const diff = dayjs.duration(time2.diff(time1));
    const hours = diff.hours();
    const minutes = diff.minutes();

    if (minutes === 0) {
      return `${hours} 小時`;
    } else {
      return `${hours} 小時 ${minutes} 分鐘`;
    }
  };

  const createMutation = useMutation({
    mutationFn: ({ title, description }) =>
      journeyId
        ? saveJourneyInfo(journeyId, title, description)
        : createNewJourney(title, description, navigate),
    onSuccess: () => {
      setAlertMessage(journeyId ? "行程已成功保存！" : "行程創建成功！");
      setNewJourney({ title: "", description: "" });
      handleWindowReload();
    },
    onError: () => {
      setAlertMessage("操作行程時出現錯誤");
    },
  });

  const handleCreateOrSaveJourneyClick = () => {
    if (newJourney.title && newJourney.description) {
      createMutation.mutate({
        title: newJourney.title,
        description: newJourney.description,
      });
    } else {
      alert("請填寫所有必要的字段");
    }
  };

  const handleInputChange = (e) => {
    setNewJourney({ ...newJourney, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (journeyId) {
      const fetchJourneyData = async () => {
        const data = await fetchJourneyInfo(journeyId);
        setNewJourney({ title: data.title, description: data.description });
      };
      fetchJourneyData();
    }
  }, [journeyId]);

  const handleWindowReload = () => {
    window.location.reload();
  };
  const handleBackHome = () => {
    navigate("/home");
  };

  return (
    <>
      <TitleWrapper>
        <Title>行程列表</Title>
        <ButtonGroup>
          <HomeButton onClick={handleBackHome} src={homeImg} />
        </ButtonGroup>
      </TitleWrapper>
      <ListWrapper>
        <TypeWrapper>
          <JourneyTitleInput
            placeholder="行程名稱"
            name="title"
            value={newJourney.title}
            onChange={handleInputChange}
          />
          <JourneyDescriptionInput
            placeholder="行程描述"
            name="description"
            value={newJourney.description}
            onChange={handleInputChange}
          />
          <ActionButtonWrapper>
            <DeleteJourneyButton onClick={handleDeleteJourney}>
              刪除行程
            </DeleteJourneyButton>
            <StyledButton
              onClick={handleCreateOrSaveJourneyClick}
              disabled={createMutation.isLoading}
            >
              {journeyId ? "保存行程" : "創建行程"}
            </StyledButton>
          </ActionButtonWrapper>
        </TypeWrapper>
        <ContentWrapper>
          {isLoading ? (
            <Message>加載中...</Message>
          ) : error ? (
            <Message>Oops: {error.message}</Message>
          ) : groupedData && Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).map((date) => (
              <JourneyDateSection key={date}>
                <DateTitle>{formatDate(date)}</DateTitle>
                {groupedData[date].map((journey, index, arr) => {
                  const labelIndex = sortedJourney.findIndex(
                    (sorted) => sorted.id === journey.id
                  );

                  const nextJourney = arr[index + 1];
                  const timeDifference = nextJourney
                    ? calculateTimeDifference(
                        journey.startTime,
                        nextJourney.startTime
                      )
                    : null;

                  return (
                    <div key={journey.id}>
                      <JourneyCard onClick={() => onClickCard(journey)}>
                        <JourneyImageWrapper>
                          {labelIndex >= 0 && (
                            <JourneyLabel>{` ${labelIndex + 1}`}</JourneyLabel>
                          )}
                          {journey.photos && journey.photos.length > 0 && (
                            <JourneyImage
                              src={journey.photos[0]}
                              alt={journey.name || ""}
                            />
                          )}
                        </JourneyImageWrapper>
                        <JourneyContent>
                          <JourneyTitle>{journey.name || ""}</JourneyTitle>
                          <TimeContainer>
                            <ClockIcon src={clockImg} alt="Clock Icon" />
                            <JourneyTime>{journey.startTime || ""}</JourneyTime>
                          </TimeContainer>
                          <RemoveButton
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenDialog(journey, "place");
                            }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            <RemoveImg
                              src={trash}
                              alt="刪除"
                              initial={{ rotate: 0 }}
                              animate={{ rotate: [0, 20, -20, 0] }}
                              transition={{ duration: 0.5 }}
                            />
                          </RemoveButton>
                        </JourneyContent>
                      </JourneyCard>
                      {timeDifference && (
                        <TimeDifference>{timeDifference}</TimeDifference>
                      )}
                    </div>
                  );
                })}
              </JourneyDateSection>
            ))
          ) : (
            <>
              <TravelImg src={travelGif} />
              <Message>這裡空空如也～</Message>
            </>
          )}
        </ContentWrapper>
        {alertMessage && (
          <AlertMessage message={alertMessage} severity="success" />
        )}
        <ConfirmDialog
          open={open}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
          title={dialogType === "journey" ? "確認刪除行程" : "確認刪除地點"}
          contentText={
            <span>
              您確定要刪除{" "}
              <span style={{ color: "#d02c2c", fontWeight: "500" }}>
                {selectedJourney?.name}
              </span>{" "}
              嗎？此操作無法撤銷。
            </span>
          }
          confirmButtonText="確定刪除"
          cancelButtonText="取消"
          confirmButtonColor="warning"
        />
      </ListWrapper>
    </>
  );
};

JourneyList.propTypes = {
  journeys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      photos: PropTypes.array,
      date: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
    })
  ),
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  journeyId: PropTypes.string,
  onClickCard: PropTypes.func,
  sortedJourney: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
    })
  ),
  onDelete: PropTypes.func.isRequired,
};

const ListWrapper = styled.div`
  width: 100%;
  min-width: 280px;
  padding: 5px 25px 10px 25px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 5px 15px;
  }
`;

const TypeWrapper = styled.div`
  margin-bottom: 64px;
  position: relative;
`;

const ActionButtonWrapper = styled.div`
  display: flex;
  gap: 10px;
  position: absolute;
  right: 0;
  bottom: -56px;
  @media (max-width: 1280px) {
    right: 10px;
  }
`;

const TitleWrapper = styled.div`
  width: 100%;
  background-color: #fff;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px 10px 20px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 10px 15px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
`;

const ButtonBase = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const DeleteJourneyButton = styled(ButtonBase)`
  background-color: #e74c3c;
  &:hover {
    background-color: #c0392b;
  }
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StyledButton = styled(ButtonBase)``;

const Title = styled.h2`
  font-size: 26px;
  color: rgb(30, 159, 210);
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(214, 212, 212, 0.642);
`;

const JourneyTitleInput = styled.input`
  width: 100%;

  margin-top: 16px;
  font-size: 24px;
  border: none;
  border-bottom: 2px solid #ccc;
  border-radius: 0; /* 移除圓角 */
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  &:focus {
    border-bottom: 2px solid #000; /* 聚焦時改變底部邊框顏色 */
  }
`;

const JourneyDescriptionInput = styled.textarea`
  width: 100%;
  height: 40px;
  padding: 16px 0 0 0; /* 調整 padding */
  margin: 12px 0 0px 0;
  font-size: 20px;
  border: none;
  border-bottom: 2px solid #ccc; /* 增加底部邊框 */
  resize: none;
  outline: none;

  @media (max-width: 768px) {
    font-size: 18px;
    padding: 12px 0 0 0; /* 調整 padding */
  }

  &:focus {
    border-bottom: 2px solid #000; /* 聚焦時改變底部邊框顏色 */
  }
`;

const ContentWrapper = styled.div`
  height: calc(100vh - 320px);
  margin-top: 16px;
  overflow-y: auto;
  padding: 10px; /* 增加 padding 以確保陰影顯示 */

  @media (max-width: 768px) {
    height: calc(100vh - 260px);
    padding: 8px; /* 為小螢幕設置較小的 padding */
  }
`;

const JourneyDateSection = styled.div`
  margin-bottom: 32px;
`;

const DateTitle = styled.h3`
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 16px;
  color: #6c6c6c;
`;

const JourneyCard = styled.div`
  position: relative;
  border: none;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  background-color: white;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
  }
`;

const JourneyImageWrapper = styled.div`
  width: 100%;
  max-height: 180px;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
`;

const JourneyImage = styled.img`
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

const JourneyContent = styled.div`
  padding: 12px 12px 20px 12px;
`;

const JourneyTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const JourneyTime = styled.p`
  display: flex;
  width: 56px;
  margin-top: 13px;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 4px;
  color: #57c2e9;

  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-top: 8px;
  }
`;

const TimeContainer = styled.div`
  display: flex;
  position: relative;
`;

const ClockIcon = styled.img`
  position: relative;
  top: 12px;
  right: 4px;
  width: 24px;
  height: 24px;

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
`;

const TimeDifference = styled.p`
  padding: 8px 0 8px 16px;
  color: #555;
  margin: 0 0 8px 16px;
  border-left: 1px dashed #000;
`;

const HomeButton = styled.img`
  position: absolute;
  right: 32px;
  width: 36px;
  height: 36px;
  cursor: pointer;

  @media (max-width: 768px) {
    right: 15px;
    width: 30px;
    height: 30px;
  }
`;

const TravelImg = styled.img`
  height: 280px;
  margin-top: 48px;
  width: auto;
`;

const Message = styled.p`
  text-align: center;
  font-size: 2rem;
  color: #333;
`;

const JourneyLabel = styled.div`
  position: absolute;
  top: 16px;
  background-color: #d02c2c;
  color: white;
  padding: 4px 16px;
  font-size: 0.875rem;
  font-weight: bold;
  z-index: 2;
  clip-path: polygon(
    0 0,
    calc(100% - 10px) 0,
    100% 50%,
    calc(100% - 10px) 100%,
    0 100%
  );

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: -10px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent #002138;
    z-index: 1;
  }
`;

const RemoveButton = styled(motion.button)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const RemoveImg = styled(motion.img)`
  &:hover {
    opacity: 0.7;
  }
`;

export default JourneyList;
