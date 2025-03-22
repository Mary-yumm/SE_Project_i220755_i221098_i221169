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
      navigate("/SignIn"); // Redirect to sign-in page
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

const navigate_to_profile = async ()=>{
  try {
    navigate("/Profile"); // Redirect to profile page
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

  return (
    
    <div className="home-container">
       <div className="icon_bar">

          <img
            src="src/assets/profile_icon.png"
            alt="Profile"
            className="profile_icon"
            onClick={navigate_to_profile}
          />
       <button className="logout-btn" onClick={handleLogout}>Logout</button>

        </div>

      <h1>Welcome to BrainByte! 🚀</h1>
      <div className="user_email">
      {user && <p>Logged in as: <strong>{user.email}</strong></p>}
      </div>
      
     
    </div>
  );
}
