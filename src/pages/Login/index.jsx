import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import styled from "styled-components";
import GoogleLogin from "../../utils/googleLogin";
import { getUserProfile } from "../../firebase/firebaseService";
import AlertMessage from "../../components/AlertMessage";

const Login = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile();
        setUserProfile(profile);
        if (localStorage.getItem("isLoggedIn") !== "true") {
          localStorage.setItem("isLoggedIn", "true");
          navigate("/home");
        }
      } else {
        localStorage.removeItem("isLoggedIn");
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem("isLoggedIn");
      setUserProfile(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      setErrorMessage("登出失敗，請稍後重試.");
    }
  };

  if (userProfile) {
    return (
      <Wrapper>
        <Banner>
          <VideoBackground
            src="https://storage.coverr.co/videos/IIHifY02t9LqcHkbEs2DTK8NElI2JKm4H?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjEzNjM3NDE5fQ.UUz6vmTAmUCQzbhRYZNL3WuFntsfFNQn_sPhJit3Hnk"
            type="video/mp4"
            autoPlay
            muted
            loop
          />
          <Title>Travel</Title>
        </Banner>
        <ProfileContainer>
          <ProfileImage src={userProfile.photoURL} alt="Profile" />
          <UserName>{userProfile.displayName}</UserName>
          <UserEmail>{userProfile.email}</UserEmail>
          <ButtonContainer>
            <HomeButton onClick={() => navigate("/home")}>行程總覽</HomeButton>
            <LogoutButton onClick={handleLogout}>登出</LogoutButton>
          </ButtonContainer>
        </ProfileContainer>
      </Wrapper>
    );
  }

  return (
    <Container>
      <Banner>
        <VideoBackground
          src="https://storage.coverr.co/videos/IIHifY02t9LqcHkbEs2DTK8NElI2JKm4H?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjEzNjM3NDE5fQ.UUz6vmTAmUCQzbhRYZNL3WuFntsfFNQn_sPhJit3Hnk"
          type="video/mp4"
          autoPlay
          muted
          loop
        />
        <Title>Travel</Title>
      </Banner>
      <Content>
        <GoogleLogin onLoginSuccess={(user) => setUserProfile(user)} />
        {errorMessage && (
          <AlertMessage message={errorMessage} severity="error" />
        )}
      </Content>
    </Container>
  );
};

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
`;

const Container = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: -1;
`;

const VideoBackground = styled.video`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  object-fit: cover;
`;

const Title = styled.h2`
  font-family: "Seaweed Script", cursive;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: calc(10vw + 10vh);
  text-align: center;
  line-height: 80vh;
  /* text-transform: uppercase; */
  background-color: rgba(211, 211, 211, 0.6);
  mix-blend-mode: normal;
  color: #333;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: calc(8vw + 8vh);
    line-height: 60vh;
  }

  @media (max-width: 480px) {
    font-size: calc(6vw + 6vh);
    line-height: 50vh;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 400px);
  z-index: 1;

  @media (max-width: 768px) {
    height: auto;
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  position: fixed;
  bottom: 5vh;
  left: 50%;

  transform: translateX(-50%);
  height: calc(20vh + 150px);
  width: calc(20vw + 100px);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: rgba(211, 211, 211, 0.6);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 2;
  @media (max-width: 1280px) {
    min-width: 240px;
  }
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;

  @media (max-width: 1280px) {
    width: 80px;
    height: 80px;
  }
`;

const UserName = styled.h3`
  font-size: 20px;
  margin: 0;

  @media (max-width: 1280px) {
    font-size: 18px;
  }
`;

const UserEmail = styled.p`
  font-size: 14px;
  color: #666;

  @media (max-width: 1280px) {
    font-size: 12px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HomeButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  border: none;
  background-color: #57c2e9;
  color: white;
  font-size: 16px;
  cursor: pointer;
  border-radius: 10px;
  font-weight: 600;
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

const LogoutButton = styled.button`
  margin: 10px;
  padding: 10px 20px;
  border: none;
  background-color: #919191;
  color: white;
  font-size: 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

export default Login;
