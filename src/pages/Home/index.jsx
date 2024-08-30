import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebaseConfig";
import {
  fetchUserJourneys,
  deleteJourney,
} from "../../firebase/firebaseService";
import defaultImg from "./default-img.jpg";
import trashPng from "./delete.png";
import { motion } from "framer-motion";
import ConfirmDialog from "../../components/ConfirmDialog";
import AlertMessage from "../../components/AlertMessage";
import Header from "../../components/Header";
import searchPng from "./search-interface.png";
import bannerPng from "./banner.jpg";

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

      const filtered = allDocs.filter((doc) => {
        return (
          doc.title.toLowerCase().includes(search.toLowerCase()) ||
          doc.description.toLowerCase().includes(search.toLowerCase())
        );
      });

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
            start: sortedJourneys[0].date,
            end: sortedJourneys[sortedJourneys.length - 1].date,
          };
        }
      });

      const sortedFiltered = filtered.sort((a, b) => {
        const aStart = journeyTimesData[a.id]?.start;
        const bStart = journeyTimesData[b.id]?.start;
        return new Date(bStart) - new Date(aStart);
      });

      setFilteredSearch(sortedFiltered);
      setJourneyTimes(journeyTimesData);
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
        <RingLoader color="#57c2e9" />
      </LoaderWrapper>
    );
  if (authError || error)
    return <p>獲取用戶文檔時出錯: {authError?.message || error.message}</p>;

  return (
    <>
      <Header />
      <Container>
        <BannerContainer />
        <SearchContainer>
          <SearchImg src={searchPng} />
          <SearchInput placeholder="搜尋行程" onChange={handleSearchChange} />
        </SearchContainer>
        <GridContainer>
          {filteredSearch.map((doc) => {
            return (
              <CardContainer
                key={doc.id}
                onClick={() => handleCardClick(doc.id)}
                backgroundImage={
                  doc.journey &&
                  doc.journey.length > 0 &&
                  doc.journey[0].photos &&
                  doc.journey[0].photos.length > 0
                    ? doc.journey[0].photos[0]
                    : defaultImg
                }
              >
                <JourneyDetailContainer>
                  <JourneyTitle>{doc.title || "無標題"}</JourneyTitle>
                  <JourneyTime>
                    {journeyTimes[doc.id] &&
                    journeyTimes[doc.id].start &&
                    journeyTimes[doc.id].end
                      ? `${journeyTimes[doc.id].start} ~ ${
                          journeyTimes[doc.id].end
                        }`
                      : "尚未新增行程"}
                  </JourneyTime>
                  <TextOverlay>
                    <JourneyDescription variant="body2" color="textSecondary">
                      {doc.description || "無描述"}
                    </JourneyDescription>
                  </TextOverlay>
                </JourneyDetailContainer>
                <RemoveImg
                  onClick={(event) => {
                    event.stopPropagation();
                    handleOpenDialog(doc.id, doc.title);
                  }}
                  src={trashPng}
                  alt="刪除"
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 0.5 }}
                />
              </CardContainer>
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
    </>
  );
};

const Container = styled.div`
  height: 120vh;
  overflow-y: auto;
  margin-top: 80px;
`;

const BannerContainer = styled.div`
  background-image: url(${bannerPng});
  width: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  height: 150px;
`;

const SearchContainer = styled.div`
  position: absolute;
  top: 230px;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0px 20px;
  background-color: rgb(255, 255, 255);
  border-radius: 8px;
  padding: 10px 20px;
  width: 80%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  height: 80px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  padding: 20px 0px 20px 10px;
  margin: 0;
  box-shadow: none;
  background: transparent;
  width: 80%;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
`;

const SearchImg = styled.img`
  width: 20px;
  height: 20px;
  margin-left: 20px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 80px 40px 20px 40px;
  padding: 20px;
`;

const CardContainer = styled.div`
  border-radius: 13px;
  height: 250px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  height: 250px;
  width: 100%;
  background-image: url(${(props) => props.backgroundImage || defaultImg});
  background-size: cover;
  background-position: center;
  border-radius: 13px;
  &:hover {
    transform: translateY(-10px);
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const JourneyDetailContainer = styled.div`
  margin: 20px;
  position: absolute;
  left: 0;
  bottom: 0;
`;

const JourneyTitle = styled.h2`
  padding-top: 8px;
  font-size: 28px;
  font-weight: 800;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const TextOverlay = styled.div`
  padding: 5px;
  border-radius: 5px;
  /* background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.852) 0%,
    rgba(0, 0, 0, 0) 30%
  ); */
`;

const JourneyTime = styled.span`
  font-weight: 600;
  color: #f8f8f8;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-size: 16px;
`;

const JourneyDescription = styled.span`
  color: #fff;
  font-size: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const RemoveImg = styled(motion.img)`
  position: absolute;
  cursor: pointer;
  margin: 12px;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  &:hover {
    animation: rotate-animation 0.5s;
  }

  @keyframes rotate-animation {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(20deg);
    }
    50% {
      transform: rotate(-20deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`;
export default Home;
