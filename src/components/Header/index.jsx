import PropTypes from "prop-types";
import { styled } from "styled-components";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import searchImg from "./search-interface.png";

const Header = ({ onSearchChange, onCreateJourney, isCreatingJourney }) => {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      onSearchChange("");
    }
  };

  const handleSearchChange = (event) => {
    onSearchChange(event.target.value);
    if (!event || !event.target || typeof event.target.value === "undefined") {
      return;
    }
    const value = event.target.value || "";
    onSearchChange(value);
  };

  return (
    <HeaderWrapper opacity={opacity}>
      <LogoText>Time to Travel</LogoText>
      <SearchContainer>
        {isSearchOpen ? (
          <>
            <SearchInput
              type="text"
              placeholder="搜尋行程..."
              onChange={handleSearchChange}
              autoFocus
              $isSearchOpen={isSearchOpen}
            />
            <SearchImg src={searchImg} onClick={handleSearchToggle} />
          </>
        ) : (
          <SearchImg src={searchImg} onClick={handleSearchToggle} />
        )}
      </SearchContainer>
      <IconWrapper>
        <CreateJourneyButton onClick={onCreateJourney}>
          {isCreatingJourney ? "關閉選單" : "新增行程"}
        </CreateJourneyButton>
        <Logout onClick={() => navigate("/")}>登出</Logout>
      </IconWrapper>
    </HeaderWrapper>
  );
};

Header.propTypes = {
  onSearchChange: PropTypes.func.isRequired,
  onCreateJourney: PropTypes.func.isRequired,
  isCreatingJourney: PropTypes.bool.isRequired,
  search: PropTypes.string,
  setSearch: PropTypes.func,
};

const HeaderWrapper = styled.header`
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
  @media (max-width: 768px) {
    font-size: 30px;
  }
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: scale(1.1);
  }
  @media (max-width: 768px) {
    position: fixed;
    right: 20px;
    bottom: 20px;
  }
`;
const Logout = styled.div`
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  color: #57c2e9;
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.2);
  }
`;
const SearchContainer = styled.div`
  display: none;
  position: relative;
  margin-right: 10px;
  width: ${({ isSearchOpen }) => (isSearchOpen ? "50%" : "24px")};
  width: ${({ $isSearchOpen }) => ($isSearchOpen ? "50%" : "24px")};
  transition: width 0.3s ease;
  justify-content: flex-end;
  align-items: center;
  @media (max-width: 768px) {
    display: flex;
    flex-grow: 1;
  }
`;

const SearchInput = styled.input`
  width: ${({ isSearchOpen }) => (isSearchOpen ? "80%" : "0")};
  width: ${({ $isSearchOpen }) => ($isSearchOpen ? "80%" : "0")};
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
  margin-right: 40px;
  transition: width 0.3s ease;
  position: absolute;
  right: 0;
  opacity: ${({ isSearchOpen }) => (isSearchOpen ? 1 : 0)};
  opacity: ${({ $isSearchOpen }) => ($isSearchOpen ? 1 : 0)};
  visibility: ${({ $isSearchOpen }) => ($isSearchOpen ? "visible" : "hidden")};
`;

const SearchImg = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

export default Header;
