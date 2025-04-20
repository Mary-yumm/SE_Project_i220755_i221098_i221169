import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProgress, updatePremiumStatus, getUserRank, updateUserRank } from "../services/firebaseService";
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
  const [userProgress, setUserProgress] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState("Beginner");
  const [isUpdatingRank, setIsUpdatingRank] = useState(false);
  
  const [displayName, setDisplayName] = useState(user.displayName || "John Doe");
  const [bio, setBio] = useState("Aspiring Software Engineer");
  const [language, setLanguage] = useState("JavaScript");
  const [streak, setStreak] = useState(5);
  const [challengesCompleted, setChallengesCompleted] = useState(120);
  const [accuracyRate, setAccuracyRate] = useState(85);
  const [leaderboardPosition, setLeaderboardPosition] = useState(10);
  const [currencyBalance, setCurrencyBalance] = useState(500);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const progress = await getUserProgress();
        setUserProgress(progress);
        setIsPremium(progress?.premium?.status || false);
        
        // Fetch user rank
        const rank = await getUserRank();
        setUserRank(rank);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePremiumToggle = async () => {
    try {
      const newStatus = !isPremium;
      await updatePremiumStatus(newStatus);
      setIsPremium(newStatus);
      // Show success message
      alert(`Premium status ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error("Error updating premium status:", error);
      alert("Failed to update premium status. Please try again.");
    }
  };

  const handleRankChange = async (newRank) => {
    try {
      setIsUpdatingRank(true);
      await updateUserRank(newRank);
      setUserRank(newRank);
      alert(`Proficiency level updated to ${newRank} successfully!`);
    } catch (error) {
      console.error("Error updating proficiency level:", error);
      alert("Failed to update proficiency level. Please try again.");
    } finally {
      setIsUpdatingRank(false);
    }
  };

  const changeAvatar = () => {
    alert("Feature coming soon! 🎨");
  };

  const handleCertificateView = () => {
    navigate("/Certificate", { state: { username: user.displayName || "User" } });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
        <select 
          value={userRank} 
          onChange={(e) => handleRankChange(e.target.value)}
          disabled={isUpdatingRank}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        {isUpdatingRank && <span className="updating-indicator">Updating...</span>}

        <h2>Premium Status</h2>
        <div className="premium-toggle">
          <span>Premium Account: {isPremium ? 'Active' : 'Inactive'}</span>
          <button 
            className={`premium-toggle-btn ${isPremium ? 'premium-active' : ''}`}
            onClick={handlePremiumToggle}
          >
            {isPremium ? 'Deactivate Premium' : 'Activate Premium'}
          </button>
        </div>

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
