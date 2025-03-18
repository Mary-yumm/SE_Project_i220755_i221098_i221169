import React from "react"
import ReactDOM from "react-dom/client"
import "./styles/SignIn.css"
import App from "./App.jsx"

const root = document.getElementById("root");

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  root.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>Failed to load application</h2>
      <p>Check the console for more details.</p>
      <pre>${error.message}</pre>
    </div>
  `;
}