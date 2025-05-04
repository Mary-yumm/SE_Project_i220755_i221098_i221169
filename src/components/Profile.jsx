import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProgress, updatePremiumStatus, getUserRank, updateUserRank } from "../services/firebaseService";
import "../styles/ProfilePage.css";

import defaultAvatar from "../assets/avatar1.avif";

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
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

  const [userProgress, setUserProgress] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState("Beginner");
  const [isUpdatingRank, setIsUpdatingRank] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const [displayName, setDisplayName] = useState(user.displayName || "John Doe");
  const [bio, setBio] = useState("Aspiring Software Engineer");
  const [language, setLanguage] = useState("JavaScript");


  useEffect(() => {
    const storedAvatarUrl = localStorage.getItem("avatarUrl");
    if (storedAvatarUrl) {
      setAvatarUrl(storedAvatarUrl); // Set the avatar from localStorage
    }
  }, []);

  
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
    const existingPopup = document.getElementById("avatar-popup");
    if (existingPopup) existingPopup.remove();
  
    const predefinedAvatars = [
      "/assets/avatar1.avif",
      "/assets/avatar2.avif",
    ];
  
    const popup = document.createElement("div");
    popup.id = "avatar-popup";
    popup.classList.add("avatar-popup");
  
    const title = document.createElement("h3");
    title.textContent = "🎨 Choose an Avatar";
    popup.appendChild(title);
  
    const avatarContainer = document.createElement("div");
    avatarContainer.classList.add("avatar-container");
  
    predefinedAvatars.forEach((url) => {
      const avatarImg = document.createElement("img");
      avatarImg.src = url;
      avatarImg.alt = "Avatar";
      avatarImg.classList.add("avatar-image");
  
      avatarImg.onclick = () => {
        setAvatarUrl(url);
        localStorage.setItem("avatarUrl", url); // Save to localStorage
        popup.remove();
      };
  
      avatarContainer.appendChild(avatarImg);
    });
  
    // 🔼 Add Image Upload Section
    const uploadLabel = document.createElement("label");
    uploadLabel.classList.add("upload-avatar-label");
    uploadLabel.textContent = "Or upload your own:";
  
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.classList.add("avatar-upload-input");
  
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setAvatarUrl(imageUrl);
        localStorage.setItem("avatarUrl", imageUrl); // Save to localStorage
        popup.remove();
      }
    };
  
    popup.appendChild(avatarContainer);
    popup.appendChild(uploadLabel);
    popup.appendChild(fileInput);
  
    const closeBtn = document.createElement("button");
    closeBtn.id = "close-avatar-popup";
    closeBtn.textContent = "Close";
    closeBtn.classList.add("close-button");
    closeBtn.onclick = () => popup.remove();
  
    popup.appendChild(closeBtn);
  
    document.body.appendChild(popup);
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
      <img src={avatarUrl} alt="Profile" className="profile-pic" />
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

        <div className="stats-section">
          <div className="stats-header">
            <h2>Activity & Progress Tracking</h2>
            <button 
              className={`stats-toggle-btn ${showStats ? 'active' : ''}`}
              onClick={() => setShowStats(!showStats)}
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
          </div>
          
          {showStats && (
            <div className="stats-container">
              <div className="stats-category">
                <h3>Performance</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Questions:</span>
                    <span className="stat-value">{userProgress?.progress?.stats?.totalQuestions || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Correct Answers:</span>
                    <span className="stat-value">{userProgress?.progress?.stats?.correctAnswers || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Incorrect Answers:</span>
                    <span className="stat-value">{userProgress?.progress?.stats?.incorrectAnswers || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Accuracy Rate:</span>
                    <span className="stat-value">
                      {userProgress?.progress?.stats?.totalQuestions 
                        ? Math.round((userProgress.progress.stats.correctAnswers / userProgress.progress.stats.totalQuestions) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="stats-category">
                <h3>Progress</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Time Spent:</span>
                    <span className="stat-value">{Math.floor((userProgress?.progress?.stats?.timeSpent || 0) / 60)} minutes</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Perfect Levels:</span>
                    <span className="stat-value">{userProgress?.progress?.stats?.perfectLevels || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Points:</span>
                    <span className="stat-value">{userProgress?.progress?.stats?.totalPoints || 0}</span>
                  </div>
                </div>
              </div>

              <div className="stats-category">
                <h3>Challenges</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Memory Violations:</span>
                    <span className="stat-value">{userProgress?.progress?.stats?.memoryViolations || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Hints Used:</span>
                    <span className="stat-value">{userProgress?.progress?.stats?.hintsUsed || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="view-certificate-btn" onClick={handleCertificateView}>
          View Certificate
        </button>
      </div>
    </div>
  );
}
