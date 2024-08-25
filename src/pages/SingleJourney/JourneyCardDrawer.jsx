import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import { fetchTrips } from "../../firebase/firebaseService";

const JourneyCardDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const {
    data: trips,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["trips", userId],
    queryFn: () => fetchTrips(userId),
  });

  const groupedTrips = trips?.reduce((acc, trip) => {
    const date = new Date(trip.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(trip);
    return acc;
  }, {});

  const handleGoBack = () => {
    navigate("/home");
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ style: { width: 250 } }}
    >
      <Box p={2}>
        <Typography variant="h6">Journey Details</Typography>
        {isLoading ? (
          <Typography>加载中...</Typography>
        ) : error ? (
          <Typography>Oops: {error.message}</Typography>
        ) : groupedTrips ? (
          Object.keys(groupedTrips).map((date) => (
            <Box key={date} mb={2}>
              <Typography variant="h6">{date}</Typography>
              {groupedTrips[date].map((trip) => (
                <Box key={trip.id} mb={2} ml={2}>
                  {trip.photos && trip.photos.length > 0 && (
                    <Box mb={1}>
                      <img
                        src={trip.photos[0]}
                        alt={trip.name || ""}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  )}
                  <Typography variant="body1">{trip.name || ""}</Typography>
                  <Typography variant="body2">
                    {trip.startTime || ""}
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
      </Box>
    </Drawer>
  );
};

JourneyCardDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default JourneyCardDrawer;
