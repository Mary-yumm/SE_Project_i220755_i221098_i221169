import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase"; // Firebase authentication
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../styles/ProfilePage.css"; // Create a separate CSS file for the profile page

export default function ProfilePage() {
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
      navigate("/SignIn"); // Redirect to sign-in page
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const navigateToHome = () => {
    try {
      navigate("/Home");
    } catch (error) {
      // Navigate back to home page
      console.error("Logout Error:", error);
    }
  };

  const handleCertificateView = () => {
    try {
      navigate("/CertificatePage", {state: { username: user.displayName || "User" } });
    } catch (error) {
      // Navigate back to home page
      console.error("Logout Error:", error);
      print(error);
    }
  };
  return (
    <div className="profile-container">
      <div className="profile-icon-bar">
        <img
          src="src/assets/profile_icon.png"
          alt="Profile"
          className="home_icon"
          onClick={navigateToHome}
        />
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="profile-body">
        <h1>User Profile</h1>

        {user && (
          <div className="profile-content">
            <div className="profile-details">
              <h2>Account Information</h2>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>User ID:</strong> {user.uid}
              </p>
              {user.displayName && (
                <p>
                  <strong>Name:</strong> {user.displayName}
                </p>
              )}
              <p>
                <strong>Account created:</strong> {user.metadata.creationTime}
              </p>
              <p>
                <strong>Last sign in:</strong> {user.metadata.lastSignInTime}
              </p>
              <button
                className="view-certificate-btn"
                onClick={handleCertificateView}
              >
                View Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
