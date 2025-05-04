// services/mongoDBService.js (frontend-only)
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/game-progress';

export const saveGameProgress = async (userId, level, data) => {
  try {
    await axios.post(`${API_URL}/save`, { 
      userId, 
      level,
      ...data 
    });
    console.log('Game progress saved successfully!');
    console.log('Data:', data);
  } catch (error) {
    console.error('MongoDB Save Error:', error);
  }
};

export const fetchGameProgress = async (userId, level) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}/${level}`);
    return response.data;
  } catch (error) {
    console.error('MongoDB Fetch Error:', error);
    return { score: 0, lives: 3 }; // Fallback data
  }
};