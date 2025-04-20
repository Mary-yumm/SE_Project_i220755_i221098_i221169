import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SettingPage.css";
import { useAudio } from '../context/AudioContext';
import { getUserProgress, updateEnvironmentPreferences } from '../services/firebaseService';
import { getAuth } from 'firebase/auth';

export default function SettingPage() {
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(14);
  const { isPlaying, togglePlay } = useAudio();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  // Font size options
  const fontSizes = [
    { value: 10, label: "Small" },
    { value: 14, label: "Medium" },
    { value: 20, label: "Large" }
  ];

  // Fetch user preferences on component mount
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        setLoading(true);
        const userProgress = await getUserProgress();
        
        if (userProgress && userProgress.preferences) {
          // Get the current theme from the document or use the stored preference
          const storedTheme = userProgress.preferences.environment.theme || "dark";
          const storedFontSize = userProgress.preferences.environment.fontSize || 14;
          
          // Set the theme and font size state
          setTheme(storedTheme);
          setFontSize(storedFontSize);
          
          // Apply theme to document
          document.documentElement.setAttribute('data-theme', storedTheme);
          
          // Apply font size to document
          document.documentElement.style.fontSize = `${storedFontSize}px`;
          
          console.log('Applied theme from database:', storedTheme);
          console.log('Applied font size from database:', storedFontSize);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, []);

  // Apply theme to document when theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    console.log('Theme changed to:', theme);
  }, [theme]);

  // Apply font size to document when fontSize state changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    console.log('Font size changed to:', fontSize);
  }, [fontSize]);

  const handleSave = async () => {
    try {
      setSaveStatus("Saving...");
      
      // Log the current theme and font size for debugging
      console.log('Saving settings - Theme:', theme, 'Font Size:', fontSize);
      
      // Update environment preferences in Firebase
      const updatedPreferences = await updateEnvironmentPreferences({
        theme: theme,
        fontSize: fontSize,
        layout: "default",
        colors: {
          background: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
          text: theme === "dark" ? "#FFFFFF" : "#000000",
          accent: "#4CAF50"
        }
      });
      
      // Log the updated preferences for debugging
      console.log('Updated preferences:', updatedPreferences?.preferences?.environment);
      
      setSaveStatus("Settings saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("Error saving settings. Please try again.");
    }
  };

  const navigateToHome = () => navigate("/Home");

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

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
          </select>
        </div>

        {/* Font Size */}
        <div className="setting-option">
          <label>Font Size:</label>
          <select 
            value={fontSize} 
            onChange={(e) => setFontSize(Number(e.target.value))}
          >
            {fontSizes.map(size => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Background Music */}
        <div className="setting-option">
          <label>Background Music:</label>
          <input
            type="checkbox"
            checked={isPlaying}
            onChange={togglePlay}
          />
        </div>

        {/* Save Status Message */}
        {saveStatus && (
          <div className={`save-status ${saveStatus.includes("Error") ? "error" : "success"}`}>
            {saveStatus}
          </div>
        )}

        {/* Save Button */}
        <button className="save-btn" onClick={handleSave}>Save</button>
      </div>
    </>
  );
}
