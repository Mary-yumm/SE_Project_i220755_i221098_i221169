import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

export default function RootLayout({ children }) {
  useEffect(() => {
    document.title = "BrainByte - Coding Escape Room";
  }, []);

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap"
      />
      {children}
    </div>
  );
}
