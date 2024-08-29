import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  signInWithGoogle,
  updateUserProfile,
} from "../firebase/firebaseService";
import AlertMessage from "../components/AlertMessage";
import googleIcon from "../pages/Login/google.png";
import styled from "styled-components";
import PropTypes from "prop-types";

const GoogleLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const accessToken = response.access_token;
        const userCredential = await signInWithGoogle(accessToken);
        const user = userCredential.user;
        await updateUserProfile(user);
        localStorage.setItem("isLoggedIn", "true");
        onLoginSuccess(user);
        navigate("/home");
      } catch (error) {
        console.error("Authentication with Firebase failed:", error);
        setErrorMessage("看起來遇到了些問題,請稍後重試.");
      }
    },
    onError: (error) => {
      console.log("Login Failed", error);
      setErrorMessage("看起來遇到了些問題,請稍後重試.");
    },
    ux_mode: "popup",
    prompt: "select_account",
  });

  return (
    <>
      <GoogleButton onClick={googleLogin}>
        <GoogleIcon src={googleIcon} alt="Google Icon" />
        Login
      </GoogleButton>
      {errorMessage && <AlertMessage message={errorMessage} severity="error" />}
    </>
  );
};
GoogleLogin.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};
const GoogleIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const GoogleButton = styled.button`
  display: flex;
  position: relative;
  align-items: center;
  border-radius: 24px;
  margin-top: 120px;
  padding: 10px 50px;
  border: 1px solid #ddd;
  color: #333;
  font-size: 24px;
  font-weight: bold;
  text-transform: none;
  width: auto;
  max-width: 300px;
  justify-content: flex-start;
  background-color: rgba(211, 211, 211, 0.8);
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export default GoogleLogin;
