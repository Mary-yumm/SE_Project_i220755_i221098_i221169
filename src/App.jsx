import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LandingPage from "./components/WelcomePage";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Layout from "./components/layout";
import HomePage from "./components/HomePage";
import "./styles/global.css"; // Import global styles
import ProfilePage from "./components/Profile";
import Certificate from "./components/Certificate";
import SettingPage from "./components/Setting";
import Level1 from "./components/level1";
import Level2 from "./components/level2";
import Level3 from "./components/level3";
import { initializeUserProgress } from "./services/firebaseService";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = getAuth();
  return auth.currentUser ? children : <Navigate to="/SignIn" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Initialize user progress in Firebase when user logs in
        try {
          await initializeUserProgress();
        } catch (error) {
          console.error("Error initializing user progress:", error);
        }
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route
            path="/Home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Setting"
            element={
              <ProtectedRoute>
                <SettingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Certificate"
            element={
              <ProtectedRoute>
                <Certificate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level1"
            element={
              <ProtectedRoute>
                <Level1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level2"
            element={
              <ProtectedRoute>
                <Level2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/level3"
            element={
              <ProtectedRoute>
                <Level3 />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
