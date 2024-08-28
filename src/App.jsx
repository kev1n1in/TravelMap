import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "./utils/ProtectedRoute";
import Home from "./pages/Home";
import SingleJourney from "./pages/SingleJourney/index";
import Login from "./pages/Login";

const theme = createTheme();
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journey"
                element={
                  <ProtectedRoute>
                    <SingleJourney />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journey/:id"
                element={
                  <ProtectedRoute>
                    <SingleJourney />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
