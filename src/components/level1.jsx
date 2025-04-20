import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/level1.css";
import questionsData from "../data/level1Data.json";
import { completeLevel, updateCurrentLevel } from '../services/firebaseService';
import { logActivity } from '../services/firebaseService';

// Add keyframes for blinking animation
const blinkAnimation = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

// Define the coordinates for question positions
const COORDINATES = [
  { top: '45%', left: '31%' },
  { top: '40%', left: '39%' },
  { top: '25%', left: '57%' },
  { top: '65%', left: '79.5%' }
];

export default function Level1() {
  const navigate = useNavigate();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentCoord, setCurrentCoord] = useState(COORDINATES[0]);
  const [nextCoord, setNextCoord] = useState(null);
  const [showDialogue, setShowDialogue] = useState(true);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const levelData = questionsData;
  const currentQuestion = levelData.puzzles.questions[currentPosition];

  // Auto-advance dialogue
  useEffect(() => {
    if (showDialogue && autoAdvance) {
      const timer = setTimeout(() => {
        if (dialogueIndex < levelData.dialogue.intro.length - 1) {
          setDialogueIndex(dialogueIndex + 1);
        } else {
          setShowDialogue(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showDialogue, dialogueIndex, autoAdvance, levelData.dialogue.intro.length]);

  const handleAnswerSubmit = () => {
    const selectedOption = currentQuestion.options.find(opt => opt.id === userAnswer);
    if (selectedOption && selectedOption.correct) {
      setShowSuccess(true);
      setShowExplanation(true);
    } else {
      setShowWrongAnswer(true);
      setUserAnswer("");
    }
  };

  const handleNextPosition = async () => {
    setShowSuccess(false);
    setShowExplanation(false);
    setShowQuestion(false);
    setUserAnswer("");
    
    // Check if there are more questions
    if (currentPosition < levelData.puzzles.questions.length - 1) {
      const nextPosition = currentPosition + 1;
      if (COORDINATES[nextPosition]) {
        setIsMoving(true);
        setNextCoord(COORDINATES[nextPosition]);
        setTimeout(() => {
          setCurrentPosition(nextPosition);
          setCurrentCoord(COORDINATES[nextPosition]);
          setNextCoord(null);
          setIsMoving(false);
        }, 2000);
      }
    } else {
      console.log('Level completed, attempting to complete level and navigate...');
      try {
        await completeLevel('level1');
        console.log('Level completed in Firebase, navigating to home...');
        navigate('/home', { replace: true }); // Use replace to prevent going back
      } catch (error) {
        console.error('Error completing level:', error);
      }
    }
  };

  const handleDialogueClick = () => {
    if (dialogueIndex < levelData.dialogue.intro.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    } else {
      setShowDialogue(false);
      if (currentPosition === levelData.puzzles.questions.length - 1) {
        navigate('/home');
      }
    }
  };

  const skipDialogue = () => {
    setShowDialogue(false);
    if (currentPosition === levelData.puzzles.questions.length - 1) {
      navigate('/home');
    }
  };

  if (showDialogue) {
    return (
      <div className="dialogue-container" onClick={handleDialogueClick}>
        <div className="dialogue-box">
          <p>{levelData.dialogue.intro[dialogueIndex]}</p>
          <button 
            onClick={skipDialogue}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="level1-container" style={{ 
      position: 'relative',
      width: '100%',
      minWidth: '1800px',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--background)'
    }}>
      <style>{blinkAnimation}</style>
      <div className="level1-header" style={{ 
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
          className="back-button" 
          onClick={() => navigate("/home")}
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
          marginRight: '2rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          borderRadius: '5px'
        }}>
          {levelData.metadata.levelName}
        </h1>
      </div>
      
      <div className="image-container" style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img 
          src="/assets/level1_map2.jpeg" 
          alt="Tileset" 
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
        <img 
          src="/assets/character.png" 
          alt="Character" 
          style={{ 
            position: 'absolute',
            width: '60px',
            height: 'auto',
            top: isMoving ? nextCoord.top : currentCoord.top,
            left: isMoving ? nextCoord.left : currentCoord.left,
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            cursor: 'pointer',
            transition: 'all 2s ease-in-out',
            filter: isMoving ? 'drop-shadow(0 0 10px var(--primary))' : 'none',
            pointerEvents: isMoving ? 'none' : 'auto'
          }}
          onClick={() => !isMoving && setShowQuestion(true)}
        />
        {/* Click Here Prompt with Arrow */}
        <div 
          style={{ 
            position: 'absolute',
            top: `calc(${isMoving ? nextCoord.top : currentCoord.top} - 150px)`,
            left: isMoving ? nextCoord.left : currentCoord.left,
            transform: 'translateX(-50%)',
            zIndex: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'all 2s ease-in-out',
            opacity: isMoving ? 0 : 1,
            pointerEvents: isMoving ? 'none' : 'auto'
          }}
        >
          <div style={{ 
            color: '#FF0000',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            animation: 'blink 1.5s infinite',
            textShadow: '0 0 3px rgba(0,0,0,0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            backdropFilter: 'blur(2px)'
          }}>
            Click Here
          </div>
          <div style={{ 
            fontSize: '1.5rem',
            marginTop: '0.5rem',
            animation: 'blink 1.5s infinite',
            color: '#FF0000',
            textShadow: '0 0 3px rgba(0,0,0,0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0.2rem 0.5rem',
            borderRadius: '5px',
            backdropFilter: 'blur(2px)'
          }}>
            ↓
          </div>
        </div>
      </div>

      {/* Question Popup */}
      {showQuestion && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--card)',
          padding: '2.5rem',
          borderRadius: '10px',
          zIndex: 100,
          width: '800px',
          maxWidth: '90vw',
          textAlign: 'left',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: 'var(--primary-foreground)'
          }} onClick={() => setShowQuestion(false)}>
            ×
          </div>
          
          {/* Title */}
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: 'var(--primary)'
          }}>
            {currentQuestion.title}
          </div>

          {/* Narrative */}
          <div style={{ 
            marginBottom: '1.5rem',
            whiteSpace: 'pre-line',
            lineHeight: '1.6'
          }}>
            {currentQuestion.narrative}
          </div>

          {/* Code Block */}
          <div style={{
            backgroundColor: 'var(--input)',
            padding: '1rem',
            borderRadius: '5px',
            margin: '1rem 0',
            fontFamily: 'monospace',
            color: '#00ff00'
          }}>
            <pre>{currentQuestion.code}</pre>
          </div>

          {/* Question */}
          <div style={{
            marginBottom: '1.5rem',
            fontSize: '1.1rem'
          }}>
            {currentQuestion.question}
          </div>

          {/* Options */}
          <div style={{
            display: 'grid',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                style={{
                  padding: '1rem',
                  backgroundColor: userAnswer === option.id ? 'var(--primary)' : 'var(--input)',
                  color: userAnswer === option.id ? 'var(--primary-foreground)' : 'var(--foreground)',
                  border: '1px solid var(--border)',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setUserAnswer(option.id)}
              >
                {option.text}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            style={{
              padding: '0.8rem 1.5rem',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.3s ease'
            }}
            onClick={handleAnswerSubmit}
            disabled={!userAnswer}
          >
            Submit Answer
          </button>

          {/* Feedback */}
          {showSuccess && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(0, 255, 0, 0.1)',
              border: '1px solid #00ff00',
              borderRadius: '5px',
              color: '#00ff00'
            }}>
              {currentQuestion.feedback.success}
            </div>
          )}

          {showWrongAnswer && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid #ff0000',
              borderRadius: '5px',
              color: '#ff0000'
            }}>
              {currentQuestion.feedback.failure}
            </div>
          )}

          {/* Next Button */}
          {showSuccess && (
            <button
              style={{
                marginTop: '1.5rem',
                padding: '0.8rem 1.5rem',
                backgroundColor: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.3s ease'
              }}
              onClick={handleNextPosition}
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}