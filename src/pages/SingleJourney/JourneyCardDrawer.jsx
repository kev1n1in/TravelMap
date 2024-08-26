import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { Box, TextField, Button } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJourney } from "../../firebase/firebaseService";
import { useState } from "react";
import { handleCreateJourney } from "../../firebase/firebaseService";
import styled from "styled-components";

const JourneyCardDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();

  const {
    data: journeys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["journeys"],
    queryFn: fetchJourney,
    onSuccess: (data) => console.log("Fetched journeys:", data),
  });

  const groupedJourneys = journeys?.reduce((acc, journey) => {
    const date = new Date(journey.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(journey);
    return acc;
  }, {});

  const handleGoBack = () => {
    navigate("/home");
  };

  const [newJourney, setNewJourney] = useState({
    title: "",
    description: "",
  });

  const handleCreateJourneyClick = () => {
    if (newJourney.title && newJourney.description) {
      createMutation.mutate({
        title: newJourney.title,
        description: newJourney.description,
      });
    } else {
      alert("請填寫所有必要的字段");
    }
  };

  const createMutation = useMutation({
    mutationFn: ({ title, description }) =>
      handleCreateJourney(title, description),
    onSuccess: () => {
      alert("行程創建成功！");
    },
    onError: () => {
      alert("創建行程時出現錯誤");
    },
  });

  const handleInputChange = (e) => {
    setNewJourney({ ...newJourney, [e.target.name]: e.target.value });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ style: { width: 300 } }}
    >
      <Box p={2}>
        <TypeWrapper>
          <Typography variant="h6">新增行程</Typography>
          <TextField
            label="行程名稱"
            name="title"
            value={newJourney.title}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="行程描述"
            name="description"
            value={newJourney.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateJourneyClick}
            disabled={createMutation.isLoading}
            sx={{ mb: 2 }}
          >
            儲存此行程
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
                  <Box key={journey.id} mb={2} ml={2}>
                    {journey.photos && journey.photos.length > 0 && (
                      <Box mb={1}>
                        <img
                          src={journey.photos[0]}
                          alt={journey.name || ""}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    )}
                    <Typography variant="body1">
                      {journey.name || ""}
                    </Typography>
                    <Typography variant="body2">
                      {journey.startTime || ""}
                    </Typography>
                  </Box>
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
    </Drawer>
  );
};

JourneyCardDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const TypeWrapper = styled.div`
  position: fixed;
  top: 0;
  background: white;
  z-index: 1200;
  padding: 16px;
`;

const ContentWrapper = styled.div`
  margin-top: 320px;
`;

export default JourneyCardDrawer;
