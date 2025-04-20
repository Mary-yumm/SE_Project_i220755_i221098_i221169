// Level2.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import LabyrinthScene from '../game/LabyrinthScene';

const Level2 = () => {
  const gameContainer = useRef(null);
  const navigate = useNavigate();
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameContainer.current && !gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        parent: gameContainer.current,
        width: 1280,
        height: 720,
        backgroundColor: '#2d2d2d',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: LabyrinthScene
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--background)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        width: '100%',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <button 
          onClick={() => navigate("/Home")}
          style={{
            padding: '0.5rem 1rem',
            marginLeft: '2rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
        >
          Back to Home
        </button>
        <h1 style={{
          margin: '0 auto',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          borderRadius: '5px'
        }}>
          🧠 Level 2: The Labyrinth of Lost Addresses
        </h1>
      </div>
      <div 
        ref={gameContainer}
        style={{
          width: '1280px',
          height: '720px',
          border: '2px solid var(--primary)',
          marginTop: '80px'
        }}
      />
    </div>
  );
};

export default Level2;
