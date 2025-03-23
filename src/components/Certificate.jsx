import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { auth } from "../utils/firebase"; // Firebase authentication
import { onAuthStateChanged } from "firebase/auth";
import "../styles/Certificate.css"; // Create a separate CSS file for the profile page

export default function Certificate() {
    const location = useLocation();
    const { username } = location.state || { username: "User" };
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

  return (
    <div className="certificate-page-container">
      <div className="icon-bar">
        <img
          src="src/assets/home.png"
          alt="Profile"
          className="home_icon"
          onClick={navigateToHome}
        />
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="certificate-body">
        <div className="certificate-content">
          <p>
            <img src="src/assets/less-than.png"/>
            <img src="src/assets/greater-than.png"/>

            <span>Brain<span class="bold">Byte</span></span>
          </p>
          <p class="shadowed-text">Virtual Escape Room</p>
          <p class="bold-title">Certificate of Achievement</p>
          <hr class="horizontal-line"/>
          <p>
           <p class="greytext"> This certifies that <br /></p>
          <p class="username">{username}</p>
          </p>
          <p class = "shadowed-text">has successfully completed </p>
          <p class="challenge-title">Python Escape Challange</p>
          <p>Intermediate Level</p>
          <p class = "shadowed-text">with excellence</p>
      <div class="footer">
        <div>
        <hr class="horizontal-line"/>
            <p>Date</p>
        </div>
        <div>
        <img class="seal" src="/src/assets/seal.png"/>
        </div>
    </div>
        </div>
     
      </div>
     
    </div>
  );
}
