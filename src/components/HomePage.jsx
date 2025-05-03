import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase"; // Firebase authentication
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getUserProgress } from "../services/firebaseService";
import "../styles/HomePage.css"; // Import styling
import Tutorial from "./Tutorial";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true); 
  const navigate = useNavigate();

  // Check if user is logged in and fetch progress
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const progress = await getUserProgress();
          setUserProgress(progress);
          const tutorialShown = sessionStorage.getItem("tutorialShown");
          if (!tutorialShown) {
            setShowTutorial(true);
            sessionStorage.setItem("tutorialShown", "true");
          } else {
            setShowTutorial(false);
          }
        } catch (error) {
          console.error("Error fetching user progress:", error);
        }
      } else {
        navigate("/SignIn"); // Redirect to SignIn if not logged in
      }
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/SignIn");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const navigateToProfile = () => navigate("/Profile");
  const navigateToSettings = () => navigate("/Setting");
  const navigateToleaderboard = () => navigate("/leaderboard");

  const isLevelUnlocked = (levelId) => {
    if (!userProgress) return levelId === 'level1'; // Only level 1 is unlocked by default
    
    // Check if previous level is completed
    const levels = ['level1', 'level2', 'level3'];
    const currentIndex = levels.indexOf(levelId);
    
    if (currentIndex === 0) return true; // Level 1 is always unlocked
    
    // Check if previous level is completed
    const previousLevel = levels[currentIndex - 1];
    return userProgress.progress?.completedLevels?.[previousLevel] === true;
  };

  const handleLevelClick = (levelPath) => {
    if (isLevelUnlocked(levelPath.slice(1))) { // Remove the leading '/'
      navigate(levelPath);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      {/* Tutorial overlay */}
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
      
      {/* Top Left: BrainByte Logo */}
      <div className="brainbyte-logo">BrainByte</div>

      {/* Top Right: User Info & Buttons */}
      <div className="icon-bar">
        <button className="profile-btn" onClick={navigateToProfile}>
          <span className="profile-icon">👤</span> Profile
        </button>

        <button className="settings-btn" onClick={navigateToSettings}>
          ⚙️ Settings
        </button>
        <button className="leaderboard-btn" onClick={navigateToleaderboard}>
          🏆 Leaderboard
        </button>
      </div>

      {/* User's Name at the Top */}
      {user && (
        <h2 className="user-name">
          Hello, {user.displayName || "Player"}
          <span className="motto">
            ! Embark on an Epic Journey and Conquer The Islands.
          </span>
        </h2>
      )}

      {/* Islands (Levels) */}
      <div className="levels-container">
        <div className="level-image-wrapper">
        <div
          className={`level ${isLevelUnlocked('level1') ? 'unlocked' : 'locked'}`}
          onClick={() => handleLevelClick('/level1')}
        >
          <h3 className="island-name">The Cave of C++</h3>
          <div className="level-image-container">
            <img
              src="/assets/island01.webp"
              alt="Level 1"
              className="island-image"
            />
            {!isLevelUnlocked('level1') && (
              <div className="lock-overlay">
                <span className="lock-icon">🔒</span>
              </div>
            )}
          </div>
          <p className="level-description">
            Level 1 <br /> Begin your adventure here🌿
          </p>
        </div>
        </div>
        <div 
          className={`level ${isLevelUnlocked('level2') ? 'unlocked' : 'locked'}`}
          onClick={() => handleLevelClick('/level2')}
        >
          <h3 className="island-name">The Pythonic Labyrinth </h3>
          <div className="level-image-container">
            <img
              src="/assets/island2.jpg"
              alt="Level 2"
              className="island-image"
            />
            {!isLevelUnlocked('level2') && (
              <div className="lock-overlay">
                <span className="lock-icon">🔒</span>
              </div>
            )}
          </div>
          <p className="level-description">
            Level 2 <br /> Survive the frozen lands❄️
          </p>
        </div>

        <div 
          className={`level ${isLevelUnlocked('level3') ? 'unlocked' : 'locked'}`}
          onClick={() => handleLevelClick('/level3')}
        >
          <h3 className="island-name">The Trial of Lost Semicolons</h3>
          <div className="level-image-container">
            <img
              src="/assets/island03.PNG"
              alt="Level 3"
              className="island-image"
            />
            {!userProgress?.premium?.status && (
              <div className="premium-badge">Premium</div>
            )}
            {!isLevelUnlocked('level3') && (
              <div className="lock-overlay">
                <span className="lock-icon">🔒</span>
              </div>
            )}
          </div>
          <p className="level-description">
            Level 3 <br /> Face the fire realm🔥
          </p>
        </div>
      </div>

      {/* Bottom right: Logout Button & Email */}
      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
        {user && <p className="user-email">{user.email}</p>}
      </div>
    </div>
  );
}
