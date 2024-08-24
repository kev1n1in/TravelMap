import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);

  const handleCardClick = (destination) => {
    navigate(destination);
  };

  const cards = [
    {
      id: 1,
      title: "Card 1",
      time: "2024-09-15",
      imageUrl: "https://via.placeholder.com/400x200",
      destination: "/journey",
    },
    {
      id: 2,
      title: "Card 2",
      time: "2024-10-22",
      imageUrl: "https://via.placeholder.com/400x200",
      destination: "/journey",
    },
    {
      id: 3,
      title: "Card 3",
      time: "2024-11-30",
      imageUrl: "https://via.placeholder.com/400x200",
      destination: "/journey",
    },
  ];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);
};

const Container = styled.div``;

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

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardDescription = styled.p`
  padding: 10px;
  color: #666;
`;

export default Home;
