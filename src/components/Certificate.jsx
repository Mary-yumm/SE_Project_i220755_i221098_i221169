import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { auth } from "../utils/firebase"; // Firebase authentication
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUserProgress } from "../services/firebaseService";
import "../styles/Certificate.css"; // Import CSS file
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Download icons
const DownloadIcon = () => (
  <svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function Certificate() {
  const location = useLocation();
  const { username } = location.state || { username: "User" };
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const userProgress = await getUserProgress();
        setIsPremium(userProgress?.premium?.status || false);
      } catch (error) {
        console.error("Error checking premium status:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkPremiumStatus();
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

  const handleDownload = async (format) => {
    if (!isPremium) {
      alert("Premium feature! Upgrade to download your certificate.");
      return;
    }

    setDownloading(true);
    try {
      const certificate = document.querySelector('.certificate-body');
      const canvas = await html2canvas(certificate, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      if (format === 'png') {
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${username}_certificate.png`;
        link.href = pngUrl;
        link.click();
      } else if (format === 'pdf') {
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        pdf.save(`${username}_certificate.pdf`);
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Error generating certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const navigateToHome = () => {
    navigate("/Home");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
        {isPremium && (
          <div className="download-options">
            <button 
              onClick={() => handleDownload('png')}
              disabled={downloading}
              className="download-btn"
            >
              Download PNG
            </button>
            <button 
              onClick={() => handleDownload('pdf')}
              disabled={downloading}
              className="download-btn"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Certificate Content */}
      <div className={`certificate-body ${!isPremium ? 'blurred' : ''}`}>
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
          <p className="challenge-title">Escape Challenge</p>
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

      {/* Premium Overlay */}
      {!isPremium && (
        <div className="premium-overlay">
          <p>Upgrade to Premium to view and download your certificate</p>
          <button onClick={() => navigate("/Profile")}>Go Premium</button>
        </div>
      )}
    </div>
  );
}
