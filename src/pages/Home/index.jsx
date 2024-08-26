import { useEffect, useState } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Skeleton,
  Input,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { RingLoader } from "react-spinners";
import {
  fetchUserDocuments,
  deleteJourney,
} from "../../firebase/firebaseService";

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filteredSearch, setFilteredSearch] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

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

  useEffect(() => {
    if (status === "success" && data) {
      const allDocs = data.pages.flatMap((page) => page.usersList);
      const filtered = allDocs.filter((doc) => {
        return (
          doc.title.toLowerCase().includes(search.toLowerCase()) ||
          doc.description.toLowerCase().includes(search.toLowerCase())
        );
      });
      setFilteredSearch(filtered);
    }
  }, [data, search, status]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteJourney,
    onSuccess: () => {
      alert("行程刪除成功！");
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

  return (
    <Container>
      <Title>行程總覽</Title>
      <Form>
        <Input placeholder="搜尋行程" onChange={handleSearchChange} />
        <Button variant="contained" color="primary" onClick={handleCardClick}>
          新增行程
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
          {filteredSearch.map((doc) => (
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
                {doc.journey &&
                doc.journey.length > 0 &&
                doc.journey[0].photos &&
                doc.journey[0].photos.length > 0 ? (
                  <img
                    src={doc.journey[0].photos[0]}
                    alt={doc.journey[0].name || "無標題"}
                    style={{
                      width: "100%",
                      height: "140px",
                      borderRadius: 4,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={140}
                    style={{ borderRadius: 4 }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">{doc.title || "無標題"}</Typography>
                  <Button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenDialog(doc.id);
                    }}
                    style={{
                      padding: 0,
                      minWidth: "unset",
                      background: "transparent",
                    }}
                  >
                    <Chip
                      label="刪除"
                      style={{
                        backgroundColor: "#ff6666",
                        color: "#ffffff",
                        marginTop: "10px",
                      }}
                    />
                  </Button>
                </div>
                <Typography>我是時間</Typography>
                <Typography variant="body2" color="textSecondary">
                  {doc.description || "無描述"}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {isFetchingNextPage && (
            <LoaderWrapper>
              <RingLoader color="#123abc" />
            </LoaderWrapper>
          )}
        </GridContainer>
      )}
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

export default Home;
