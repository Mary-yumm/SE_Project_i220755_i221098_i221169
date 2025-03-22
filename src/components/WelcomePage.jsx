import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

export default function LandingPage() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">
          Welcome to <span className="highlight">BrainByte</span>
        </h1>
        <p className="home-description">
          The ultimate coding escape room experience. Solve puzzles, break the locks, and debug your way out.
        </p>
        <div className="home-buttons">
          <Link to="/SignIn" className="home-button signin-button">
            Sign In
          </Link>
          <Link to="/SignUp" className="home-button signup-button">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
