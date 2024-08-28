import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import { Box, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  handleCreateJourney,
  handleSaveJourney,
  fetchSingleJourney,
} from "../../firebase/firebaseService";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";

const JourneyList = ({
  journeyId,
  journeys,
  isLoading,
  error,
  onClickCard,
}) => {
  const navigate = useNavigate();
  const [newJourney, setNewJourney] = useState({
    title: "",
    description: "",
  });

  const groupedJourneys = journeys?.reduce((acc, journey) => {
    const date = new Date(journey.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(journey);
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: ({ title, description }) =>
      journeyId
        ? handleSaveJourney(journeyId, title, description)
        : handleCreateJourney(title, description, navigate),
    onSuccess: () => {
      alert(journeyId ? "行程已成功保存！" : "行程創建成功！");
      setNewJourney({ title: "", description: "" });
      handleGoBack();
    },
    onError: () => {
      alert("操作行程時出現錯誤");
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
        const data = await fetchSingleJourney(journeyId);
        setNewJourney({ title: data.title, description: data.description });
      };
      fetchJourneyData();
    }
  }, [journeyId]);

  const handleGoBack = () => {
    window.location.reload();
  };
  return (
    <ListWrapper>
      <Box p={2}>
        <TypeWrapper>
          <Typography variant="h6">
            {journeyId ? "編輯行程" : "新增行程"}
          </Typography>
          <JourneyTitle
            placeholder="行程名稱"
            name="title"
            value={newJourney.title}
            onChange={handleInputChange}
          />
          <JourneyDes
            placeholder="行程描述"
            name="description"
            value={newJourney.description}
            onChange={handleInputChange}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateOrSaveJourneyClick}
            disabled={createMutation.isLoading}
            sx={{ mb: 2 }}
          >
            {journeyId ? "儲存行程" : "建立行程"}
          </Button>
        </TypeWrapper>
        <ContentWrapper>
          {isLoading ? (
            <Typography>加載中...</Typography>
          ) : error ? (
            <Typography>Oops: {error.message}</Typography>
          ) : groupedJourneys && Object.keys(groupedJourneys).length > 0 ? (
            Object.keys(groupedJourneys).map((date) => (
              <Box key={date} mb={2}>
                <Typography variant="h6">{date}</Typography>
                {groupedJourneys[date].map((journey) => (
                  <JourneyCard
                    key={journey.id}
                    onClick={() => onClickCard(journey)}
                  >
                    {journey.photos && journey.photos.length > 0 && (
                      <Box mb={1}>
                        <JourneyImage
                          src={journey.photos[0]}
                          alt={journey.name || ""}
                        />
                      </Box>
                    )}
                    <Typography variant="body1">
                      {journey.name || ""}
                    </Typography>
                    <Typography variant="body2">
                      {journey.startTime || ""}
                    </Typography>
                    <button>刪除</button>
                  </JourneyCard>
                ))}
              </Box>
            ))
          ) : (
            <Typography>趕緊新增行程吧</Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoBack}
            sx={{ mt: 2 }}
          >
            返回行程總覽
          </Button>
        </ContentWrapper>
      </Box>
    </ListWrapper>
  );
};

export default JourneyList;

JourneyList.propTypes = {
  journeys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      photos: PropTypes.array,
    })
  ),
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  journeyId: PropTypes.string,
  onClickCard: PropTypes.func,
  onDelete: PropTypes.func,
};

const JourneyTitle = styled.input`
  width: 100%;
  padding-top: 16px;
  margin-bottom: 16px;
  font-size: 1rem;
  border: none;
  border-bottom: none;
  &:focus {
    outline: none;
    border-bottom: none;
  }
`;

const JourneyDes = styled.textarea`
  width: 100%;
  height: 100px;
  padding-top: 16px;
  margin-bottom: 16px;
  font-size: 1rem;
  border: none;
  border-bottom: none;
  resize: none;
  &:focus {
    outline: none;
    border-bottom: none;
  }
`;

const ListWrapper = styled.div`
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const TypeWrapper = styled.div`
  position: absolute;
  background: white;
  padding: 16px;
  height: 320px;
  top: 0;
`;

const ContentWrapper = styled.div`
  margin-top: 320px;
  max-height: calc(100vh - 320px);
  padding: 0px 16px 20px 0px;
  overflow-y: auto;
  box-sizing: border-box;
`;

const JourneyCard = styled(Box)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 16px;
`;

const JourneyImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`;
