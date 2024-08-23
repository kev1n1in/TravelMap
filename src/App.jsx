import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SingleJourney from "./pages/SingleJourney";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/journey" element={<SingleJourney />} />
      </Routes>
    </Router>
  );
}

export default App;
