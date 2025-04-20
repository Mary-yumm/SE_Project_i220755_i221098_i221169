import React, { createContext, useContext, useState, useEffect } from 'react';

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = React.useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Try to play immediately
    const playAudio = async () => {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Error playing audio:", error);
        // If autoplay fails, we'll keep isPlaying true but the audio won't play
        // until user interaction
      }
    };
    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle play/pause state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playAudio = async () => {
          try {
            await audioRef.current.play();
          } catch (error) {
            console.error("Error playing audio:", error);
          }
        };
        playAudio();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const setVolumeLevel = (newVolume) => {
    setVolume(newVolume);
  };

  return (
    <AudioContext.Provider value={{ isPlaying, volume, togglePlay, setVolumeLevel }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
} 