import { styled } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Haeder = () => {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const newOpacity = Math.max(1 - scrollTop / 200, 0.7);
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <Header opacity={opacity}>
      <IconWrapper>
        <LogoText>Time to Travel</LogoText>
      </IconWrapper>
      <IconWrapper>
        <CreateJourneyButton onClick={() => navigate("/journey")}>
          新增行程
        </CreateJourneyButton>
        <Logout onClick={() => navigate("/")}>Logout</Logout>
      </IconWrapper>
    </Header>
  );
};

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, ${(props) => props.opacity});
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 5px 2px -2px rgba(0, 0, 0, 0.1);
  height: 80px;
  z-index: 1000;
`;

const LogoText = styled.div`
  font-family: "Seaweed Script", cursive;
  font-size: 40px;
  font-weight: 700;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding-right: 20px;
`;

const CreateJourneyButton = styled.div`
  color: white;
  padding: 10px;
  font-size: 18px;
  font-weight: 700;
  width: 120px;
  background-color: #57c2e9;
  border-radius: 30px;
  text-align: center;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

const Logout = styled.div`
  font-family: "Seaweed Script", cursive;
  font-size: 25px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

export default Haeder;
