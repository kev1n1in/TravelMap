// Login.js
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import {
  signInWithGoogle,
  updateUserProfile,
} from "../../firebase/firebaseService";

const clientId =
  "385608276124-eve8v6q1t1hb04f62up1ptccq3k2htf7.apps.googleusercontent.com";

const Login = () => {
  const navigate = useNavigate();

  const handleCredentialResponse = async (response) => {
    try {
      const userCredential = await signInWithGoogle(response.credential);
      const user = userCredential.user;
      await updateUserProfile(user);
      navigate("/home");
    } catch (error) {
      console.error("Authentication with Firebase failed:", error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <GoogleLogin
          onSuccess={handleCredentialResponse}
          onError={() => console.log("Login Failed")}
          useOneTap
        />
        <p>使用 Google 登入快速訪問</p>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
