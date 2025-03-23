import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/ProfilePage.css";

import avatar from "../assets/avatar1.avif";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login"); // Redirect to login if not authenticated
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const navigateToHome = () => navigate("/Home");

  return (
    <>
      {/* Home Button Outside Profile Container */}
      <button className="home-btn" onClick={navigateToHome}>
        Home
      </button>

      {user ? <Profile user={user} /> : <p>Loading...</p>}
    </>
  );
}

function Profile({ user }) {
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(user.displayName || "John Doe");
  const [bio, setBio] = useState("Aspiring Software Engineer");
  const [language, setLanguage] = useState("JavaScript");
  const [level, setLevel] = useState("Intermediate");
  const [streak, setStreak] = useState(5);
  const [challengesCompleted, setChallengesCompleted] = useState(120);
  const [accuracyRate, setAccuracyRate] = useState(85);
  const [leaderboardPosition, setLeaderboardPosition] = useState(10);
  const [currencyBalance, setCurrencyBalance] = useState(500);

  const changeAvatar = () => {
    alert("Feature coming soon! 🎨");
  };

  const handleCertificateView = () => {
    navigate("/CertificatePage", { state: { username: user.displayName || "User" } });
  };

  return (
    <div className="profile-container">
      <div className="profile-left">
        <img src={avatar} alt="Profile" className="profile-pic" />
        <button className="change-avatar-btn" onClick={changeAvatar}>
          Change Avatar
        </button>
      </div>

      <div className="profile-right">
        <h2>Personal Information</h2>
        <label>Display Name:</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

        <label>Bio:</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} />

        <label>Preferred Programming Language:</label>
        <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} />

        <label>Coding Proficiency Level:</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Expert</option>
        </select>

        <h2>Activity & Progress Tracking</h2>
        <p>Streak: {streak} days</p>
        <p>Challenges Completed: {challengesCompleted}</p>
        <p>Accuracy Rate: {accuracyRate}%</p>
        <p>Leaderboard Position: #{leaderboardPosition}</p>
        <p>In-Game Currency Balance: {currencyBalance} coins</p>

        <button className="view-certificate-btn" onClick={handleCertificateView}>
          View Certificate
        </button>
      </div>
    </div>
  );
}
