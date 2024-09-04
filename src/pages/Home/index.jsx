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
  fetchAndSortUserJourneys,
  deleteJourney,
} from "../../firebase/firebaseService";
import defaultImg from "./img/default-img.jpg";
import trashPng from "./img/delete.png";
import { motion } from "framer-motion";
import useAlert from "../../Hooks/useAlertMessage";
import Header from "../../components/Header";
import searchPng from "./img/search-interface.png";
import bannerPng from "./img/banner.jpg";
import JourneyCreator from "./JourneyCreator";
import bannerMobile from "./img/banner-mobile.jpg";
import useConfirmDialog from "../../Hooks/useConfirmDialog";

const Home = () => {
  const [user, loading, authError] = useAuthState(auth);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const [showJourneyCreator, setShowJourneyCreator] = useState(false);
  const { ConfirmDialogComponent, openDialog } = useConfirmDialog();
  const { addAlert, AlertMessage } = useAlert();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useInfiniteQuery({
      queryKey: ["userJourneys", user?.uid, search],
      queryFn: async ({ pageParam = 0 }) => {
        const allJourneys = await fetchAndSortUserJourneys(user.uid);
        const filteredJourneys = allJourneys.filter(
          (journey) =>
            journey.title.toLowerCase().includes(search.toLowerCase()) ||
            journey.description.toLowerCase().includes(search.toLowerCase())
        );
        const start = pageParam * 12;
        const end = start + 12;
        return {
          journeys: filteredJourneys.slice(start, end),
          nextPage: pageParam + 1,
          hasMore: filteredJourneys.length > end,
        };
      },
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.nextPage : undefined,
      enabled: !!user?.uid,
    });

  useEffect(() => {
    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } =
        document.documentElement;

      if (
        scrollHeight - scrollTop === clientHeight &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteJourney,
    onSuccess: () => {
      addAlert("行程刪除成功！");
      queryClient.invalidateQueries(["userJourneys", user?.uid]);
    },
    onError: () => {
      addAlert("刪除行程時出現錯誤");
    },
  });

  const handleDeleteJourney = (JourneyId, JourneyName) => {
    openDialog(JourneyName, () => {
      deleteMutation.mutate(JourneyId);
    });
  };

  const handleCardClick = (id) => {
    navigate(`/journey/${id}`);
  };

  if (loading) {
    return (
      <LoaderWrapper>
        <RingLoader color="#57c2e9" size={100} />
      </LoaderWrapper>
    );
  }

  if (authError || error) {
    return <p>獲取用戶資料時出錯: {authError?.message || error?.message}</p>;
  }

  const toggleJourneyCreator = () => {
    setShowJourneyCreator(!showJourneyCreator);
  };

  return (
    <>
      <Header
        onSearchChange={handleSearchChange}
        onCreateJourney={toggleJourneyCreator}
        isCreatingJourney={showJourneyCreator}
        search={search}
        setSearch={setSearch}
      />
      {showJourneyCreator && (
        <JourneyCreator onClose={() => setShowJourneyCreator(false)} />
      )}
      <Container>
        <BannerContainer />
        <SearchContainer>
          <SearchImg src={searchPng} />
          <SearchInput
            placeholder="搜尋行程"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </SearchContainer>
        <GridContainer>
          {data?.pages.map((page) =>
            page.journeys.map((doc) => (
              <CardContainer
                key={doc.id}
                onClick={() => handleCardClick(doc.id)}
                backgroundimage={doc?.journey?.[0]?.photos?.[0] || defaultImg}
              >
                <JourneyDetailContainer>
                  <JourneyTitle>{doc.title || "無標題"}</JourneyTitle>
                  <JourneyTime>
                    {doc.start && doc.end
                      ? `${doc.start} ~ ${doc.end}`
                      : "尚未新增行程"}
                  </JourneyTime>
                  <JourneyDescription>
                    {doc.description || "無描述"}
                  </JourneyDescription>
                </JourneyDetailContainer>
                <RemoveImg
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteJourney(doc.id, doc.title);
                  }}
                  src={trashPng}
                  alt="刪除"
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 0.5 }}
                />
              </CardContainer>
            ))
          )}
        </GridContainer>
        {isFetchingNextPage && (
          <LoaderScrollWrapper>
            <RingLoader color="#57c2e9" size={150} />
          </LoaderScrollWrapper>
        )}
        {ConfirmDialogComponent}
        <AlertMessage />
      </Container>
    </>
  );
};

const Container = styled.div`
  height: 120vh;
  overflow-y: cover;
  margin-top: 80px;
`;

const BannerContainer = styled.div`
  background-image: url(${bannerPng});
  width: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    height: 250px;
    background-image: url(${bannerMobile});

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0.8) 90%,
        rgba(255, 255, 255, 1) 100%
      );
      pointer-events: none;
    }
  }
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
  @media (max-width: 768px) {
    display: none;
  }
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
  padding: 20px 20px 200px 20px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
    margin: 30px 40px 20px 40px;
  }
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
  background-image: url(${(props) => props.backgroundimage});
  background-size: cover;
  background-position: center;
  border-radius: 13px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-10px);
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const LoaderScrollWrapper = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  top: -200px;
  padding: 20px;
`;

const JourneyDetailContainer = styled.div`
  margin: 20px;
  position: absolute;
  max-width: 80%;
  left: 0;
  bottom: 0;
  white-space: nowrap;
`;

const JourneyTitle = styled.h2`
  display: flex;
  position: absolute;
  bottom: 64px;
  font-size: 28px;
  font-weight: 800;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const JourneyTime = styled.span`
  display: block;
  position: absolute;
  bottom: 24px;
  width: 150px;
  font-weight: 600;
  color: #f8f8f8;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  font-size: 16px;
  white-space: normal;
`;

const JourneyDescription = styled.span`
  color: #fff;
  font-size: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;
const RemoveImg = styled(motion.img)`
  width: 36px;
  height: 36px;
  position: absolute;
  cursor: pointer;
  margin: 12px;
  top: 10px;
  right: 10px;
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
