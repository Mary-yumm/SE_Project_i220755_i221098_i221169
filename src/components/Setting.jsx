import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import "../styles/SettingPage.css";

export default function SettingPage() {
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(16);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const navigate = useNavigate(); // ✅ Define navigate function

  const handleSave = () => {
    alert("Settings Saved!");
    // You can store settings in localStorage or a database
  };

  const navigateToHome = () => navigate("/Home"); // ✅ Ensure correct route

  return (
    <>
      {/* Home Button */}
      <button className="home-btn" onClick={navigateToHome}>
       Home
      </button>

      <div className="settings-container">
        <h2>⚙️ Settings</h2>

        {/* Theme Selection */}
        <div className="setting-option">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System Default</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="setting-option">
          <label>Font Size:</label>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <span>{fontSize}px</span>
        </div>

        {/* Sound & Notifications */}
        <div className="setting-option">
          <label>Sound:</label>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => setSoundEnabled(!soundEnabled)}
          />
        </div>

        {/* Save Button */}
        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>
    </>
  );
}
