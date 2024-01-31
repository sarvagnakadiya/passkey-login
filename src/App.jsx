import Navbar from "./components/Navbar";
import Login from "./components/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Footer from "./components/Footer";
import login from "./components/login";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
}

export default App;
