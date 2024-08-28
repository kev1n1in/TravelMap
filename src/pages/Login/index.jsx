import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  signInWithGoogle,
  updateUserProfile,
} from "../../firebase/firebaseService";
import styled from "styled-components";
import googleIcon from "./google.png";

const Login = () => {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <GoogleButton onClick={googleLogin}>
        <GoogleIcon src={googleIcon} alt="Google Icon" />
        Sign in with Google
      </GoogleButton>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
    </div>
  );
};

const GoogleIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  border-radius: 24px;
  padding: 10px 20px;
  border: 1px solid #ddd;
  color: #333;
  font-weight: bold;
  text-transform: none;
  width: auto;
  max-width: 300px;
  justify-content: flex-start;
  background-color: white;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 16px;
  color: red;
  font-size: 14px;
`;

export default Login;
