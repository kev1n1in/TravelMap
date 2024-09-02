import { useState, useCallback, useEffect } from "react";
import AlertMessage from "../components/AlertMessage";

const useAlert = () => {
  const [alertMessages, setAlertMessages] = useState([]);
  const [visibleMessage, setVisibleMessage] = useState(null);
  const addAlert = useCallback((message) => {
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

export default useAlert;
