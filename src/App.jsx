import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/WelcomePage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Layout from "./components/layout";
import "./styles/global.css"; // Import global styles

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
