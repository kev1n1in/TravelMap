import { useMutation } from "@tanstack/react-query";
import { createNewJourney } from "../../firebase/firebaseService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import "dayjs/locale/zh-tw";
import JourneyImg from "./creator.png";

const JourneyCreator = () => {
  const navigate = useNavigate();
  const [newJourney, setNewJourney] = useState({
    title: "",
    description: "",
  });

  const createMutation = useMutation({
    mutationFn: ({ title, description }) =>
      createNewJourney(title, description),
    onSuccess: (docId) => {
      alert("行程創建成功！");
      navigate(`/journey/${docId}`);
    },
    onError: (error) => {
      alert(`操作行程時出現錯誤: ${error.message}`);
    },
  });

  const handleInputChange = (e) => {
    setNewJourney({ ...newJourney, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (newJourney.title && newJourney.description) {
      createMutation.mutate({
        title: newJourney.title,
        description: newJourney.description,
      });
    } else {
      alert("請填寫所有必要的字段");
    }
  };

  return (
    <Container>
      <TravelImg src={JourneyImg}></TravelImg>
      <JourneyTitleInput
        placeholder="行程名稱"
        name="title"
        value={newJourney.title}
        onChange={handleInputChange}
      />
      <JourneyDescriptionInput
        placeholder="行程描述"
        name="description"
        value={newJourney.description}
        onChange={handleInputChange}
      />
      <StyledButton onClick={handleSubmit} disabled={createMutation.isLoading}>
        創建行程
      </StyledButton>
    </Container>
  );
};

JourneyCreator.propTypes = {};

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 100;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const JourneyTitleInput = styled.input`
  width: 80%;
  margin-bottom: 20px;
  font-size: 24px;
  padding: 10px;
  background: #fff;
  border: 2px solid #ccc;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #57c2e9;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06),
      0 0 8px rgba(87, 194, 233, 0.5);
  }
`;

const JourneyDescriptionInput = styled.textarea`
  width: 80%;
  height: 100px;
  margin-bottom: 20px;
  font-size: 20px;
  padding: 10px;
  background: #fff;
  border: 2px solid #ccc;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
  resize: none;

  &:focus {
    border-color: #57c2e9;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06),
      0 0 8px rgba(87, 194, 233, 0.5);
  }
`;
const StyledButton = styled.button`
  position: relative;
  width: 80%;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #57c2e9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #49a2d6;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const TravelImg = styled.img``;

export default JourneyCreator;
