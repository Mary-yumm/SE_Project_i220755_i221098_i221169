import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/firebaseService';
import '../styles/Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        // Convert to array and sort by score
        const sortedData = Object.entries(data)
          .map(([id, entry]) => ({
            id,
            ...entry
          }))
          .sort((a, b) => b.score - a.score);
        setLeaderboardData(sortedData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return 'var(--foreground)';
    }
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🏅';
    }
  };

  // Create a fixed array of 3 rows
  const emptyRows = Array(3).fill().map((_, index) => ({ 
    id: `empty-${index}`, 
    username: '-', 
    score: 0 
  }));

  // Merge actual data with empty rows, ensuring first 3 rows are always shown
  // and limiting to a maximum of 20 entries
  const displayData = leaderboardData.length > 0 
    ? [...leaderboardData, ...emptyRows].slice(0, Math.min(20, Math.max(3, leaderboardData.length)))
    : emptyRows;

  return (
    <div className="leaderboard-page">
      <button 
        className="back-button-top"
        onClick={() => navigate('/home')}
      >
        ← Back to Home
      </button>
      
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>🏆 Leaderboard</h1>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading leaderboard...</p>
          </div>
        ) : (
          <div className="leaderboard-content">
            <div className="leaderboard-table">
              <div className="table-header">
                <div className="rank">Rank</div>
                <div className="player">Player</div>
                <div className="score">Score</div>
              </div>
              {displayData.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={`table-row ${index < 3 ? 'top-three' : ''}`}
                  style={{
                    borderLeft: `4px solid ${getRankColor(index + 1)}`
                  }}
                >
                  <div className="rank">
                    <span className="rank-number">{index + 1}</span>
                    <span className="rank-emoji">{getRankEmoji(index + 1)}</span>
                  </div>
                  <div className="player">{entry.username || '-'}</div>
                  <div className="score">{entry.score ? entry.score.toLocaleString() : '-'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 