# BrainByte - Educational Coding Game Platform

## Overview
BrainByte is an interactive educational platform that teaches coding concepts through gamified experiences across multiple levels. The application features a React frontend with various game levels, user authentication, and progress tracking.

## System Requirements
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Modern web browser (Chrome, Firefox, Edge, or Safari)

## Installation Instructions

1. Clone the repository:

git clone https://github.com/your-username/SE_Project_i220755_i221098_i221169.git 
cd SE_Project_i220755_i221098_i221169


2. Install dependencies:
npm install


This will install all required packages including:
- React and React Router
- Vite (development server)
- HTML2Canvas and jsPDF (for certificate generation)
- Other dependencies

3. Run the development server:
npm run dev


4. Access the application:
Open your web browser and navigate to http://localhost:5173

## Authentication
The application uses a simplified authentication system that stores user data in localStorage:
- Any email/password combination will work for sign-in
- No actual authentication server is required for development

## Game Levels
- Level 1: The Cave of C++ - Basic programming concepts
- Level 2: The Pythonic Labyrinth - Interactive maze challenges
- Level 3: The Trial of Lost Semicolons - Advanced programming puzzles

## Troubleshooting

1. "Module not found" errors:
Run `npm install` to ensure all dependencies are properly installed.

2. Images not loading:
Ensure assets are in the correct folder. Check the public/assets directory.

3. Page not loading:
Make sure you're accessing via the correct URL (http://localhost:5173).

4. "Command not found: npm":
Install Node.js from https://nodejs.org/ which includes npm.

5. Browser display issues:
Try a different browser or reset your browser's zoom level (Ctrl+0).

## Development Notes
- The project uses Vite as the build tool and development server
- React components are in the src/components folder
- Styles are in the src/styles folder
- Game assets are stored in the public/assets directory
