import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Card, Button, Input } from "@mui/material";
import { RingLoader } from "react-spinners";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  fetchUserJourneys,
  deleteJourney,
} from "../../firebase/firebaseService";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc as firestoreDoc,
  serverTimestamp,
} from "firebase/firestore";
import defaultImg from "./default-img.jpg";
import trash from "./trash-bin-white.png";
import { motion } from "framer-motion";
import ConfirmDialog from "../../components/ConfirmDialog";
import AlertMessage from "../../components/AlertMessage";

const Home = () => {
  const [user, loading, authError] = useAuthState(auth);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filteredSearch, setFilteredSearch] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [journeyTimes, setJourneyTimes] = useState({});
  const queryClient = useQueryClient();
  const [selectedDocName, setSelectedDocName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertKey, setAlertKey] = useState(0);

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

      const filtered = allDocs.filter((journeyDoc) => {
        return (
          journeyDoc.title.toLowerCase().includes(search.toLowerCase()) ||
          journeyDoc.description.toLowerCase().includes(search.toLowerCase())
        );
      });

      const journeyTimesData = {};
      const unsubscribeList = [];

      filtered.forEach((journeyDoc) => {
        if (journeyDoc.journey && journeyDoc.journey.length > 0) {
          const sortedJourneys = journeyDoc.journey.sort((a, b) => {
            return (
              new Date(`${a.date} ${a.startTime}`) -
              new Date(`${b.date} ${b.startTime}`)
            );
          });
          journeyTimesData[journeyDoc.id] = {
            start: sortedJourneys[0].date,
            end: sortedJourneys[sortedJourneys.length - 1].date,
          };

          const journeySubcollectionRef = collection(
            db,
            "journeys",
            journeyDoc.id,
            "journey"
          );
          const unsubscribe = onSnapshot(journeySubcollectionRef, () => {
            const journeyDocRef = firestoreDoc(db, "journeys", journeyDoc.id);
            updateDoc(journeyDocRef, {
              updatedAt: serverTimestamp(),
            }).catch((error) => {
              console.error("Error updating document: ", error);
            });
          });

          unsubscribeList.push(unsubscribe);
        }
      });

      const sortedFiltered = filtered.sort((a, b) => {
        const aStart = journeyTimesData[a.id]?.start
          ? new Date(journeyTimesData[a.id].start)
          : null;
        const bStart = journeyTimesData[b.id]?.start
          ? new Date(journeyTimesData[b.id].start)
          : null;

        if (aStart && bStart) {
          // 如果都有行程时间，按时间排序（最近的在前）
          return bStart - aStart;
        }

        if (!aStart && !bStart) {
          // 如果都没有行程时间，用 updatedAt 排序
          const aUpdated = a.updatedAt
            ? new Date(a.updatedAt.seconds * 1000)
            : new Date(0);
          const bUpdated = b.updatedAt
            ? new Date(b.updatedAt.seconds * 1000)
            : new Date(0);
          return bUpdated - aUpdated;
        }

        // 如果一个有行程时间，另一个没有，有行程的排在前
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;

        return 0;
      });

      setFilteredSearch(sortedFiltered);
      setJourneyTimes(journeyTimesData);

      // 清理所有监听器
      return () => {
        unsubscribeList.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [data, search, status]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const showMessage = (msg) => {
    setAlertMessage(msg);
    setAlertKey(Date.now());
  };

  const deleteMutation = useMutation({
    mutationFn: deleteJourney,
    onSuccess: () => {
      showMessage("行程刪除成功！");
      queryClient.invalidateQueries(["userJourneys", user?.uid]);
      handleCloseDialog();
    },
    onError: () => {
      showMessage("刪除行程時出現錯誤");
    },
  });

  const handleOpenDialog = (docId, docName) => {
    setSelectedDoc(docId);
    setSelectedDocName(docName);
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
          style={{ background: "rgb(30, 159, 210)" }}
        >
          新增行程
        </Button>
      </Form>

      <GridContainer>
        {filteredSearch.map((journeyDoc) => {
          return (
            <Card
              key={journeyDoc.id}
              style={{ marginBottom: "10px", cursor: "pointer" }}
              onClick={() => handleCardClick(journeyDoc.id)}
            >
              <CardContent
                backgroundImage={
                  journeyDoc.journey &&
                  journeyDoc.journey.length > 0 &&
                  journeyDoc.journey[0].photos &&
                  journeyDoc.journey[0].photos.length > 0
                    ? journeyDoc.journey[0].photos[0]
                    : defaultImg
                }
              >
                <Overlay>
                  <ImageContainer></ImageContainer>
                  <JourneyDetailContainer>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <JourneyTitle>
                        {journeyDoc.title || "無標題"}
                      </JourneyTitle>
                    </div>
                    <JourneyTime>
                      {journeyTimes[journeyDoc.id] &&
                      journeyTimes[journeyDoc.id].start &&
                      journeyTimes[journeyDoc.id].end
                        ? `${journeyTimes[journeyDoc.id].start} ~ ${
                            journeyTimes[journeyDoc.id].end
                          }`
                        : "尚未新增行程"}
                    </JourneyTime>
                    <DescriptionContainer>
                      <JourneyDescription variant="body2" color="textSecondary">
                        {journeyDoc.description || "無描述"}
                      </JourneyDescription>
                    </DescriptionContainer>
                  </JourneyDetailContainer>
                  <RemoveButton
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenDialog(journeyDoc.id, journeyDoc.title);
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
                </Overlay>
              </CardContent>
            </Card>
          );
        })}

        {isFetchingNextPage && (
          <LoaderWrapper>
            <RingLoader color="#57c2e9" />
          </LoaderWrapper>
        )}
      </GridContainer>

      <ConfirmDialog
        open={open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="確認刪除"
        contentText={
          <span>
            您確定要刪除{" "}
            <span style={{ color: "#d02c2c" }}>{selectedDocName}</span>{" "}
            嗎？此操作無法撤銷。
          </span>
        }
        confirmButtonText="確定刪除"
        cancelButtonText="取消"
        confirmButtonColor="secondary"
      />

      {alertMessage && (
        <AlertMessage message={alertMessage} keyProp={alertKey} />
      )}
    </Container>
  );
};

const Container = styled.div`
  height: 120vh;
  overflow-y: auto;
  padding: 20px;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
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

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: 250px;
  background-image: url(${(props) => props.backgroundImage || defaultImg});
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.2);
  }
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

const JourneyDetailContainer = styled.div`
  margin: 12px 0 0 8px;
`;

const JourneyTitle = styled.h2`
  padding-top: 8px;
  font-size: 20px;
  font-weight: 700;
  color: white;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 140px;
  background-image: url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const JourneyTime = styled.span`
  margin: 8px 0;
  color: white;
`;

const RemoveButton = styled(motion.button)`
  position: absolute;
  right: 16px;
  bottom: 4px;
  margin-top: 12px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const RemoveImg = styled(motion.img)``;

const DescriptionContainer = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  white-space: normal;
  max-width: 200px;
`;

const JourneyDescription = styled.span`
  color: #fff;
`;

export default Home;
