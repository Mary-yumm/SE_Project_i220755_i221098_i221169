import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { auth } from "../utils/firebase"; // Firebase authentication
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../styles/Certificate.css"; // Import CSS file

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
    navigate("/Home"); // Navigate back to home page
  };

  return (
    <div className="certificate-page-container">
      {/* Home Button in Top Left */}
      <div className="top-left-container">
      <button className="home-btn" onClick={navigateToHome}>
        Home
      </button>
      </div>

      {/* Logout Button in Top Right */}
      <div className="icon-bar">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Certificate Content */}
      <div className="certificate-body">
        <div className="certificate-content">
          <p>
            <img src="src/assets/less-than.png" alt="Less than" />
            <img src="src/assets/greater-than.png" alt="Greater than" />
            <span>
              Brain<span className="bold">Byte</span>
            </span>
          </p>
          <p className="shadowed-text">Virtual Escape Room</p>
          <p className="bold-title">Certificate of Achievement</p>
          <hr className="horizontal-line" />
          <p className="greytext">This certifies that</p>
          <p className="username">{username}</p>
          <p className="shadowed-text">has successfully completed</p>
          <p className="challenge-title">Python Escape Challenge</p>
          <p>Intermediate Level</p>
          <p className="shadowed-text">with excellence</p>

          {/* Footer Section */}
          <div className="footer">
            <div>
              <hr className="horizontal-line" />
              <p>Date</p>
            </div>
            <div>
              <img className="seal" src="/src/assets/seal.png" alt="Seal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
