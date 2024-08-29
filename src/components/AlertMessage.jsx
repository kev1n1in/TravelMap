import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";

const slideIn = keyframes`
  0% {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  0% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-100%);
    opacity: 0;
  }
`;

const AlertContainer = styled.div`
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  color: black;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  font-size: 16px;
  font-weight: bold;
  animation: ${slideIn} 0.5s ease-out, ${slideOut} 0.5s ease-in 1.5s forwards;
`;

const AlertMessage = ({ message, duration = 2000 }) => {
  const [visible, setVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (message && typeof message === "string" && message.length > 0) {
      setCurrentMessage(message);
      setVisible(true);

      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, duration);

      return () => clearTimeout(hideTimer);
    }
  }, [message, duration]);

  return visible && <AlertContainer>{currentMessage}</AlertContainer>;
};

AlertMessage.propTypes = {
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
};

export default AlertMessage;
