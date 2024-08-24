import { useState } from "react";
import styled from "styled-components";
import { Input } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchTrips } from "../../firebase/firebaseService";
import { RingLoader } from "react-spinners";

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["trips", searchTerm],
      queryFn: async ({ pageParam }) => {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 加入延迟
        return fetchTrips({ pageParam, limit: 6 });
      }, // 一次加载6笔数据
      getNextPageParam: (lastPage) => lastPage.lastVisible || undefined,
    });

  const handleCardClick = (destination) => {
    navigate(destination);
  };

  // 防止连续发出加载请求
  const handleScroll = (e) => {
    const { scrollHeight, scrollTop, clientHeight } = e.target;
    if (
      scrollHeight - scrollTop <= clientHeight + 500 && // 当距离底部500px时触发
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <Container onScroll={handleScroll}>
      <Title>行程</Title>
      <Input
        placeholder="搜尋行程..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <CardsWrapper>
        {status === "loading" ? (
          <LoaderWrapper>
            <RingLoader color="#007BFF" size={50} />
          </LoaderWrapper>
        ) : status === "error" ? (
          <p>加载失败...</p>
        ) : (
          data?.pages.flatMap((page) =>
            page.trips
              .filter((card) => card.title.includes(searchTerm))
              .map((card) => (
                <Card
                  key={card.id}
                  onClick={() => handleCardClick(card.destination)}
                >
                  <CardImage src={card.imageUrl} alt={card.title} />
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.time}</CardDescription>
                </Card>
              ))
          )
        )}
      </CardsWrapper>
      {isFetchingNextPage && (
        <LoaderWrapper>
          <RingLoader color="#007BFF" size={50} />
        </LoaderWrapper>
      )}
    </Container>
  );
};

const Container = styled.div`
  height: 100vh; /* 确保容器高度 */
  overflow-y: auto;
`;

const Title = styled.h2`
  margin: 20px 0 0 20px;
  font-size: 48px;
`;

const CardsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
`;

const CardTitle = styled.p``;
const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardDescription = styled.p`
  padding: 10px;
  color: #666;
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

export default Home;
