import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SingleJourney from "./pages/SingleJourney";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/edit" element={<SingleJourney />} />
      </Routes>
    </Router>
  );
}

export default App;
