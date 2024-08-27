import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Input,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { RingLoader } from "react-spinners";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebaseConfig";
import {
  fetchUserJourneys,
  deleteJourney,
} from "../../firebase/firebaseService";
import defaultImg from "./default-img.jpg";
import trash from "./trash-bin.png";
import { motion } from "framer-motion";

const Home = () => {
  const [user, loading, authError] = useAuthState(auth);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filteredSearch, setFilteredSearch] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [journeyTimes, setJourneyTimes] = useState({});
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["userJourneys", user?.uid],
    queryFn: ({ pageParam = null }) =>
      fetchUserJourneys(user.uid, { pageParam, limit: 6 }),
    getNextPageParam: (lastPage) => lastPage?.lastVisible || undefined,
    enabled: !!user?.uid,
  });

  useEffect(() => {
    if (status === "success" && data) {
      const allDocs = data.pages.flatMap((page) => page.journeys);
      const filtered = allDocs.filter((doc) => {
        return (
          doc.title.toLowerCase().includes(search.toLowerCase()) ||
          doc.description.toLowerCase().includes(search.toLowerCase())
        );
      });
      setFilteredSearch(filtered);

      const journeyTimesData = {};
      filtered.forEach((doc) => {
        if (doc.journey && doc.journey.length > 0) {
          const sortedJourneys = doc.journey.sort((a, b) => {
            return (
              new Date(`${a.date} ${a.startTime}`) -
              new Date(`${b.date} ${b.startTime}`)
            );
          });
          journeyTimesData[doc.id] = {
            start: `${sortedJourneys[0].date} ${sortedJourneys[0].startTime}`,
            end: `${sortedJourneys[sortedJourneys.length - 1].date} ${
              sortedJourneys[sortedJourneys.length - 1].startTime
            }`,
          };
        }
      });
      setJourneyTimes(journeyTimesData);
    }
  }, [data, search, status]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteJourney,
    onSuccess: () => {
      alert("行程刪除成功！");
      queryClient.invalidateQueries(["userJourneys", user?.uid]);
      handleCloseDialog();
    },
    onError: () => {
      alert("刪除行程時出現錯誤");
    },
  });

  const handleOpenDialog = (docId) => {
    setSelectedDoc(docId);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedDoc) {
      deleteMutation.mutate(selectedDoc);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/journey/${id}`);
    setOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } =
        document.documentElement;

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

  if (loading)
    return (
      <LoaderWrapper>
        <RingLoader color="#123abc" />
      </LoaderWrapper>
    );
  if (authError || error)
    return <p>獲取用戶文檔時出錯: {authError?.message || error.message}</p>;

  return (
    <Container>
      <Title>行程總覽</Title>
      <Form>
        <Input placeholder="搜尋行程" onChange={handleSearchChange} />
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/journey")}
        >
          新增行程
        </Button>
      </Form>

      <GridContainer>
        {filteredSearch.map((doc) => {
          console.log(doc.journey);

          return (
            <Card
              key={doc.id}
              style={{ marginBottom: "10px", cursor: "pointer" }}
              onClick={() => handleCardClick(doc.id)}
            >
              <CardContent
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <ImageContainer>
                  {doc.journey &&
                  doc.journey.length > 0 &&
                  doc.journey[0].photos &&
                  doc.journey[0].photos.length > 0 ? (
                    <JourneyImage
                      src={doc.journey[0].photos[0]}
                      alt={doc.journey[0].name || "無標題"}
                    />
                  ) : (
                    <JourneyImage src={defaultImg} alt="Default" />
                  )}
                </ImageContainer>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">{doc.title || "無標題"}</Typography>
                  <RemoveButton
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenDialog("documentId");
                    }}
                    whileHover={{ scale: 1.2 }} // 當鼠標懸停時，按鈕會放大
                    whileTap={{ scale: 0.8 }} // 當按鈕被點擊時，按鈕會縮小
                  >
                    <RemoveImg
                      src={trash}
                      alt="刪除"
                      initial={{ rotate: 0 }} // 初始狀態
                      animate={{ rotate: [0, 20, -20, 0] }} // 當被點擊時旋轉
                      transition={{ duration: 0.5 }} // 旋轉動畫的時長
                    />
                  </RemoveButton>
                </div>
                {journeyTimes[doc.id] && (
                  <Typography>
                    {`${journeyTimes[doc.id].start} ~ ${
                      journeyTimes[doc.id].end
                    }`}
                  </Typography>
                )}
                <Typography variant="body2" color="textSecondary">
                  {doc.description || "無描述"}
                </Typography>
              </CardContent>
            </Card>
          );
        })}

        {isFetchingNextPage && (
          <LoaderWrapper>
            <RingLoader color="#123abc" />
          </LoaderWrapper>
        )}
      </GridContainer>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您確定要刪除此行程嗎？此操作無法撤銷。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            確定刪除
          </Button>
        </DialogActions>
      </Dialog>
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

const ImageContainer = styled.div`
  width: 100%;
  height: 140px;
  overflow: hidden;
  border-radius: 4px;
`;

const JourneyImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const RemoveButton = styled(motion.button)`
  margin-top: 12px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const RemoveImg = styled(motion.img)`
  width: 36px;
  height: 36px;

  &:hover {
    opacity: 0.7;
  }
`;

export default Home;
