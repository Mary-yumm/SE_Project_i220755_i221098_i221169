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
import { initializeUserProgress, getUserProgress } from "./services/firebaseService";
import Leaderboard from './components/Leaderboard';
import AudioPlayer from './components/AudioPlayer';
import { AudioProvider } from './context/AudioContext';

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
          
          // Apply user theme preferences
          const userProgress = await getUserProgress();
          if (userProgress && userProgress.preferences) {
            const theme = userProgress.preferences.environment.theme || "dark";
            document.documentElement.setAttribute('data-theme', theme);
            
            // Apply font size
            const fontSize = userProgress.preferences.environment.fontSize || 14;
            document.documentElement.style.fontSize = `${fontSize}px`;
          }
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
    <AudioProvider>
      <Router>
        <Layout>
          <AudioPlayer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route
              path="/Home"
              element={
                  <HomePage />
              }
            />
            <Route
              path="/Profile"
              element={
                  <ProfilePage />
              }
            />
            <Route
              path="/Setting"
              element={
                  <SettingPage />
              }
            />
            <Route
              path="/Certificate"
              element={
                  <Certificate />
              }
            />
            <Route
              path="/level1"
              element={
                  <Level1 />
              }
            />
            <Route
              path="/level2"
              element={
                  <Level2 />
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
            <Route
              path="/leaderboard"
              element={
                  <Leaderboard />
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AudioProvider>
  );
}

export default App;
