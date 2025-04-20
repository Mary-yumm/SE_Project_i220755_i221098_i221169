import React from 'react';
import '../styles/AudioPlayer.css';
import { useAudio } from '../context/AudioContext';

const AudioPlayer = () => {
  const { isPlaying, volume, togglePlay, setVolumeLevel } = useAudio();

  const handleVolumeChange = (e) => {
    setVolumeLevel(e.target.value);
  };

  return (
    <div className="audio-player">
      <button 
        className={`audio-control ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? '🔊' : '🔈'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
        className="volume-slider"
        aria-label="Volume control"
      />
    </div>
  );
};

export default AudioPlayer; 