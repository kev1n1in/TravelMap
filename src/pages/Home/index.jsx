import { useState, useEffect } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
} from "@mui/material";
import { RingLoader } from "react-spinners";
import {
  fetchUserDocuments,
  handleCreateJourney,
  deleteJourney,
} from "../../firebase/firebaseService";

const Home = () => {
  const [newTrip, setNewTrip] = useState({
    title: "",
    description: "",
  });

  const navigate = useNavigate();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["usersDocuments"],
    queryFn: ({ pageParam = null }) =>
      fetchUserDocuments({ pageParam, limit: 6 }),
    getNextPageParam: (lastPage) => lastPage?.lastVisible || undefined,
  });

  const createMutation = useMutation({
    mutationFn: ({ title, description }) =>
      handleCreateJourney(title, description),
    onSuccess: () => {
      alert("行程創建成功！");
      setNewTrip({ title: "", description: "" });
    },
    onError: () => {
      alert("創建行程時出現錯誤");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJourney,
    onSuccess: () => {
      alert("行程刪除成功！");
    },
    onError: () => {
      alert("刪除行程時出現錯誤");
    },
  });

  const handleInputChange = (e) => {
    setNewTrip({ ...newTrip, [e.target.name]: e.target.value });
  };

  const handleCreateTripClick = () => {
    if (newTrip.title && newTrip.description) {
      createMutation.mutate({
        title: newTrip.title,
        description: newTrip.description,
      });
    } else {
      alert("請填寫所有必要的字段");
    }
  };

  const handleCardClick = (id) => {
    navigate(`/journey/${id}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } =
        document.documentElement;
      console.log("Scroll Event Triggered");
      console.log("scrollHeight:", scrollHeight);
      console.log("scrollTop:", scrollTop);
      console.log("clientHeight:", clientHeight);

      if (
        scrollHeight - scrollTop <= clientHeight + 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        console.log("Fetching next page...");
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Container>
      <Title>用戶列表</Title>
      <Form>
        <TextField
          label="行程名稱"
          name="title"
          value={newTrip.title}
          onChange={handleInputChange}
          fullWidth
        />
        <TextField
          label="行程描述"
          name="description"
          value={newTrip.description}
          onChange={handleInputChange}
          fullWidth
          multiline
          rows={4}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateTripClick}
          disabled={createMutation.isLoading}
        >
          創建行程
        </Button>
      </Form>

      {status === "loading" ? (
        <LoaderWrapper>
          <RingLoader color="#123abc" />
        </LoaderWrapper>
      ) : status === "error" ? (
        <p>獲取用戶文檔時出錯: {error.message}</p>
      ) : (
        <GridContainer>
          {data?.pages?.flatMap((page) =>
            page.usersList.map((doc) => (
              <Card
                key={doc.id}
                style={{ marginBottom: "10px", cursor: "pointer" }}
              >
                <CardContent>
                  <div
                    onClick={() => handleCardClick(doc.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <Typography variant="h6">
                      {doc.title || "無標題"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {doc.description || "無描述"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      User ID: {doc.user_id || "無 User ID"}
                    </Typography>
                  </div>
                  <Chip
                    label="刪除"
                    onDelete={() => deleteMutation.mutate(doc.id)}
                    color="secondary"
                    style={{ marginTop: "10px" }}
                  />
                </CardContent>
              </Card>
            ))
          )}
          {isFetchingNextPage && (
            <LoaderWrapper>
              <RingLoader color="#123abc" /> {/* 使用 RingLoader */}
            </LoaderWrapper>
          )}
        </GridContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  height: 120vh;
  overflow-y: auto;
  padding: 20px;
`;

const Form = styled.div`
  margin: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 36px;
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export default Home;
