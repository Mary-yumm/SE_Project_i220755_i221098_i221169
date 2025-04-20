import { useEffect, useRef } from 'react';

export default function AudioManager() {
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/music.mp3');
    audioRef.current.loop = true;
    
    // Start playing immediately
    audioRef.current.play().catch(error => {
      console.error("Error playing audio:", error);
    });
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
} 