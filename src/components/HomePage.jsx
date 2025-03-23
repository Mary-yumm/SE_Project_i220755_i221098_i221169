import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase"; // Firebase authentication
import { signOut, onAuthStateChanged } from "firebase/auth";
import "../styles/HomePage.css"; // Import styling

export default function HomePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/SignIn"); // Redirect to SignIn if not logged in
      }
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, [navigate]);

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

  return (
    <div className="home-container">
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
          🏆 leaderboard
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
        <div className="level" onClick={() => navigate("/level1")}>
          <h3 className="island-name">Questoria</h3>
          <img
            src="src/assets/island01.webp"
            alt="Level 1"
            className="island-image"
          />
          <p className="level-description">
            Level 1 <br /> Begin your adventure here🌿
          </p>
        </div>

        <div className="level" onClick={() => navigate("/level2")}>
          <h3 className="island-name">Frosthaven</h3>
          <img
            src="src/assets/island2.jpg"
            alt="Level 2"
            className="island-image"
          />
          <p className="level-description">
            Level 2 <br /> Survive the frozen lands❄️
          </p>
        </div>

        <div className="level" onClick={() => navigate("/level3")}>
          <h3 className="island-name">Embervale</h3>
          <img
            src="src/assets/island03.png"
            alt="Level 3"
            className="island-image"
          />
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
