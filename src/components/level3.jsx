import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/level3.css";
import { getUserProgress } from "../services/firebaseService";

export default function Level3() {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumAccess = async () => {
      try {
        const userProgress = await getUserProgress();
        if (!userProgress?.premium?.status) {
          // Redirect to premium upgrade page or home if not premium
          navigate("/home", { 
            state: { 
              message: "Level 3 requires premium access. Upgrade to continue!",
              showPremiumPrompt: true 
            } 
          });
        } else {
          setIsPremium(true);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    checkPremiumAccess();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isPremium) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="level3-container">
      <div className="level3-header">
        <button 
          className="back-button" 
          onClick={() => navigate("/home")}
        >
          Back to Home
        </button>
        <h1>Level 3: The Memory Nexus</h1>
      </div>
      
      <div className="level3-content">
        <div className="premium-badge">Premium Level</div>
        <p className="level-description">
          Welcome to the Memory Nexus! This advanced level challenges your understanding of memory management and pointers.
        </p>
        {/* Add your level 3 content here */}
      </div>
    </div>
  );
} 