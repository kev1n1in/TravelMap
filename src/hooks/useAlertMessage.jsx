import { useState, useCallback, useEffect } from "react";
import AlertMessage from "../components/AlertMessage";
import PropTypes from "prop-types";

const useAlert = () => {
  const [alertMessages, setAlertMessages] = useState([]);
  const [visibleMessage, setVisibleMessage] = useState(null);
  const addAlert = useCallback((message) => {
    if (!message) {
      return null;
    }
    setAlertMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  useEffect(() => {
    if (alertMessages.length > 0) {
      const [currentMessage, ...rest] = alertMessages;
      setVisibleMessage(currentMessage);

      const hideTimer = setTimeout(() => {
        setVisibleMessage(null);
        setAlertMessages(rest);
      }, 2000);

      return () => clearTimeout(hideTimer);
    }
  }, [alertMessages]);

  return {
    addAlert,
    AlertMessage: () => <AlertMessage message={visibleMessage} />,
  };
};

AlertMessage.propTypes = {
  message: PropTypes.string, // 不再是必需
};

export default useAlert;
