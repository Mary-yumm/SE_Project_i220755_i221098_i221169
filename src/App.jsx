import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/WelcomePage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Layout from "./components/layout";
import HomePage from "./components/HomePage";
import "./styles/global.css"; // Import global styles
import ProfilePage from "./components/Profile";
import Certificate from "./components/Certificate";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Home" element={<HomePage />} /> 
          <Route path="/Profile" element={<ProfilePage />} /> 
          <Route path="/CertificatePage" element={<Certificate />} /> 

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
