import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation(); // Get the current location
  
  // Initialize with location state if it exists, or from localStorage, or use defaults
  const [currentScore, setCurrentScore] = useState(() => {
    if (location.state?.score !== undefined) return location.state.score;
    
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const { score } = JSON.parse(savedState);
      return score || 0;
    }
    return 0;
  });
  
  const [remainingLives, setRemainingLives] = useState(() => {
    if (location.state?.remainingLives !== undefined) return location.state.remainingLives;
    
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const { lives } = JSON.parse(savedState);
      return lives || 3;
    }
    return 3;
  });

  // Check if user is logged in and fetch progress
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Fetch progress from Firebase
          const progress = await getUserProgress();
          
          // Determine whether to use state from navigation, local storage, or database
          if (location.state) {
            setUserProgress({
              ...progress,
              // Use navigation state if available, fall back to database values
              score: location.state.score !== undefined ? location.state.score : progress.score,
              lives: location.state.remainingLives !== undefined ? location.state.remainingLives : progress.lives,
            });
            
            // Update local variables to match
            setCurrentScore(location.state.score !== undefined ? location.state.score : progress.score);
            setRemainingLives(location.state.remainingLives !== undefined ? location.state.remainingLives : progress.lives);
          } else {
            setUserProgress(progress);
          }

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
        navigate("/SignIn");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, location]); // Add location to dependencies

  // Life regeneration system - check every 10 seconds if a life should be regenerated
  useEffect(() => {
    const interval = setInterval(() => {
      // Get latest lives and lastLifeLost time from localStorage
      const savedState = localStorage.getItem('gameState');
      if (savedState) {
        const { lives, lastLifeLost } = JSON.parse(savedState);
        
        // Only proceed if lives are less than max (3) and we have a lastLifeLost timestamp
        if (lives !== undefined && lives < 3 && lastLifeLost) {
          const now = Date.now();
          // Check if at least 1 minute (60000ms) has passed since last life was lost
          if (now - lastLifeLost >= 60000) {
            // Add a life
            const updatedLives = lives + 1;
            
            // Update state and localStorage
            setRemainingLives(updatedLives);
            
            // Update gameState in localStorage with new lives count
            localStorage.setItem('gameState', JSON.stringify({
              score: currentScore,
              lives: updatedLives,
              lastLifeLost: updatedLives < 3 ? now : null // Reset timer for next life or clear if full
            }));
          }
        }
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [currentScore]); // Dependency on currentScore to not lose that value in the localStorage update

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  // Save the current game state to localStorage whenever it changes
  useEffect(() => {
    // Get the existing lastLifeLost value if it exists
    const savedState = localStorage.getItem('gameState');
    let lastLifeLost = null;
    
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      lastLifeLost = parsedState.lastLifeLost;
    }
    
    localStorage.setItem('gameState', JSON.stringify({
      score: currentScore,
      lives: remainingLives,
      lastLifeLost: lastLifeLost // Preserve the lastLifeLost timestamp
    }));
  }, [currentScore, remainingLives]);

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
    if (!userProgress) return levelId === "level1"; // Only level 1 is unlocked by default

    // Check if previous level is completed
    const levels = ["level1", "level2", "level3"];
    const currentIndex = levels.indexOf(levelId);

    if (currentIndex === 0) return true; // Level 1 is always unlocked

    // Check if previous level is completed
    const previousLevel = levels[currentIndex - 1];
    return userProgress.progress?.completedLevels?.[previousLevel] === true;
  };

  const handleLevelClick = (levelPath) => {
    if (isLevelUnlocked(levelPath.slice(1))) {
      // Pass the current score and lives to the level
      navigate(levelPath, {
        state: {
          score: currentScore,
          remainingLives: remainingLives
        }
      });
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
        <p>
          Lives: {remainingLives}, Score: {currentScore}
        </p>
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
            className={`level ${
              isLevelUnlocked("level1") ? "unlocked" : "locked"
            }`}
            onClick={() =>
              handleLevelClick("/level1")
            }
          >
            <h3 className="island-name">The Cave of C++</h3>
            <div className="level-image-container">
              <img
                src="/assets/island01.webp"
                alt="Level 1"
                className="island-image"
              />
              {!isLevelUnlocked("level1") && (
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
          className={`level ${
            isLevelUnlocked("level2") ? "unlocked" : "locked"
          }`}
          onClick={() => handleLevelClick("/level2")}
        >
          <h3 className="island-name">The Pythonic Labyrinth </h3>
          <div className="level-image-container">
            <img
              src="/assets/island2.jpg"
              alt="Level 2"
              className="island-image"
            />
            {!isLevelUnlocked("level2") && (
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
          className={`level ${
            isLevelUnlocked("level3") ? "unlocked" : "locked"
          }`}
          onClick={() => handleLevelClick("/level3")}
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
            {!isLevelUnlocked("level3") && (
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

/*import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation(); // Get the current location
  const [currentScore, setCurrentScore] = useState(location.state?.score || 0);
  const [remainingLives, setRemainingLives] = useState(location.state?.remainingLives || 3);
  // Check if user is logged in and fetch progress
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // Check for navigation state first
          if (location.state) {
            const progress = await getUserProgress();
            // Update progress with the values from navigation state
            setUserProgress({
              ...progress,
              score: location.state.score || progress.score,
              lives: location.state.remainingLives || progress.lives,
            });
          } else {
            const progress = await getUserProgress();
            setUserProgress(progress);
          }

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
        navigate("/SignIn");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, location]); // Add location to dependencies
  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };
  useEffect(() => {
    if (location.state) {
      setCurrentScore(location.state.score ?? currentScore);
      setRemainingLives(location.state.lives ?? remainingLives);
    }
  }, [location.state]);
  useEffect(() => {
    if (location.state) {
      // Update local storage with the new values
      if (location.state.remainingLives !== undefined) {
        localStorage.setItem("remainingLives", location.state.remainingLives);
      }
    }
  }, [location.state]);
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/SignIn");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };



  useEffect(() => {
    localStorage.setItem('gameState', JSON.stringify({
      score: currentScore,
      lives: remainingLives
    }));
  }, [currentScore, remainingLives]);
  useEffect(() => {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      const { score, lives } = JSON.parse(saved);
      setCurrentScore(score);
      setRemainingLives(lives);
    }
    
    // Initialize from location.state if available
    if (location.state) {
      if (location.state.score !== undefined) {
        setCurrentScore(location.state.score);
      }
      if (location.state.remainingLives !== undefined) {
        setRemainingLives(location.state.remainingLives);
      }
    }
  }, [location.state]);

  const navigateToProfile = () => navigate("/Profile");
  const navigateToSettings = () => navigate("/Setting");
  const navigateToleaderboard = () => navigate("/leaderboard");

  const isLevelUnlocked = (levelId) => {
    if (!userProgress) return levelId === "level1"; // Only level 1 is unlocked by default

    // Check if previous level is completed
    const levels = ["level1", "level2", "level3"];
    const currentIndex = levels.indexOf(levelId);

    if (currentIndex === 0) return true; // Level 1 is always unlocked

    // Check if previous level is completed
    const previousLevel = levels[currentIndex - 1];
    return userProgress.progress?.completedLevels?.[previousLevel] === true;
  };

  const handleLevelClick = (levelPath) => {
    if (isLevelUnlocked(levelPath.slice(1))) {
      // Remove the leading '/'
      navigate(levelPath, {
        state: {
          score: currentScore,
          remainingLives: remainingLives
        }
      });    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}

      <div className="brainbyte-logo">BrainByte</div>

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
        <p>
          Lives: {remainingLives}, Score: {currentScore}
        </p>
      </div>

      {user && (
        <h2 className="user-name">
          Hello, {user.displayName || "Player"}
          <span className="motto">
            ! Embark on an Epic Journey and Conquer The Islands.
          </span>
        </h2>
      )}

      <div className="levels-container">
        <div className="level-image-wrapper">
          <div
            className={`level ${
              isLevelUnlocked("level1") ? "unlocked" : "locked"
            }`}
            onClick={() =>
              handleLevelClick("/level1")
            }
          >
            <h3 className="island-name">The Cave of C++</h3>
            <div className="level-image-container">
              <img
                src="/assets/island01.webp"
                alt="Level 1"
                className="island-image"
              />
              {!isLevelUnlocked("level1") && (
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
          className={`level ${
            isLevelUnlocked("level2") ? "unlocked" : "locked"
          }`}
          onClick={() => handleLevelClick("/level2")}
        >
          <h3 className="island-name">The Pythonic Labyrinth </h3>
          <div className="level-image-container">
            <img
              src="/assets/island2.jpg"
              alt="Level 2"
              className="island-image"
            />
            {!isLevelUnlocked("level2") && (
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
          className={`level ${
            isLevelUnlocked("level3") ? "unlocked" : "locked"
          }`}
          onClick={() => handleLevelClick("/level3")}
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
            {!isLevelUnlocked("level3") && (
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

      <div className="logout-container">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
        {user && <p className="user-email">{user.email}</p>}
      </div>
    </div>
  );
}
*/