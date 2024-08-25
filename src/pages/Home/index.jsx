import { useState, useEffect } from "react";
import styled from "styled-components";
import { Button, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createTravel,
  createUser,
  fetchJourneys,
} from "../../firebase/firebaseService";

const Home = () => {
  const [newTrip, setNewTrip] = useState({
    title: "",
    description: "",
  });

  const [userDocId, setUserDocId] = useState(null);

  // 假設用戶文檔在組件掛載時創建
  useEffect(() => {
    const createUserDoc = async () => {
      const userId = localStorage.getItem("userId"); // 從 localStorage 中獲取 userId
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const docId = await createUser(userId);
      setUserDocId(docId);
    };
    createUserDoc();
  }, []);

  // 使用 useQuery 抓取 journeys 資料
  const {
    data: journeys,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["journeys", userDocId],
    queryFn: () => fetchJourneys(userDocId),
    enabled: !!userDocId, // 只有當 userDocId 存在時才執行
  });

  const mutation = useMutation({
    mutationFn: (tripData) => createTravel(userDocId, tripData),
    onSuccess: () => {
      alert("行程已成功建立！");
      setNewTrip({
        title: "",
        description: "",
      });
    },
    onError: (error) => {
      console.error("Error creating trip:", error);
      alert("創建失敗");
    },
  });

  const handleCreateTrip = () => {
    if (newTrip.title && newTrip.description) {
      if (userDocId) {
        mutation.mutate(newTrip);
      } else {
        alert("用戶文檔未正確創建，請稍後再試");
      }
    } else {
      alert("请填写所有必要的字段");
    }
  };

  const handleInputChange = (e) => {
    setNewTrip({ ...newTrip, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <Title>創建新行程</Title>
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
        <Button variant="contained" color="primary" onClick={handleCreateTrip}>
          創建行程
        </Button>
      </Form>

      <Title>我的行程</Title>
      {isLoading ? (
        <p>加載中...</p>
      ) : error ? (
        <p>獲取行程數據時出錯: {error.message}</p>
      ) : (
        <JourneysList>
          {journeys?.map((journey) => (
            <JourneyItem key={journey.id}>
              <h3>{journey.title}</h3>
              <p>{journey.description}</p>
              <p>
                創建時間:{" "}
                {new Date(journey.createAt.seconds * 1000).toLocaleString()}
              </p>
            </JourneyItem>
          ))}
        </JourneysList>
      )}
    </Container>
  );
};

const Form = styled.div`
  margin: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 36px;
`;

const JourneysList = styled.div`
  margin-top: 20px;
`;

const JourneyItem = styled.div`
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
`;

export default Home;
