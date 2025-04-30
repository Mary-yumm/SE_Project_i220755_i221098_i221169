import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/level1.css";
import questionsData from "../data/level1Data.json";
import { completeLevel, updateCurrentLevel, updateUserScore, logActivity } from '../services/firebaseService';
import { getAuth } from 'firebase/auth';
import Level1Tutorial from './Level1Tutorial';

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
  const [score, setScore] = useState(0);
  const [memoryViolations, setMemoryViolations] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const levelData = questionsData;
  const currentQuestion = levelData.puzzles.questions[currentPosition];
  const scoringData = levelData.scoring;

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

  const handleHintClick = async () => {
    if (!hintUsed) {
      setShowHint(true);
      setHintUsed(true);
      
      const newScore = score - scoringData.hintPenalty;
      setScore(newScore);
      await updateUserScore('level1', newScore);
      await logActivity('hint_used', {
        level: 'level1',
        questionId: currentQuestion.id,
        score: -scoringData.hintPenalty
      });
    }
  };

  const handleAnswerSubmit = async () => {
    const selectedOption = currentQuestion.options.find(opt => opt.id === userAnswer);
    if (selectedOption && selectedOption.correct) {
      setShowSuccess(true);
      setShowExplanation(true);
      
      const newScore = score + scoringData.questionPoints.correct;
      setScore(newScore);
      await updateUserScore('level1', newScore);
      await logActivity('correct_answer', {
        level: 'level1',
        questionId: currentQuestion.id,
        score: scoringData.questionPoints.correct
      });
    } else {
      setShowWrongAnswer(true);
      setUserAnswer("");
      
      const newScore = score + scoringData.questionPoints.incorrect;
      setScore(newScore);
      await updateUserScore('level1', newScore);
      await logActivity('incorrect_answer', {
        level: 'level1',
        questionId: currentQuestion.id,
        score: scoringData.questionPoints.incorrect
      });
    }
  };

  const handleNextPosition = async () => {
    setShowSuccess(false);
    setShowExplanation(false);
    setShowQuestion(false);
    setUserAnswer("");
    setShowHint(false);
    setHintUsed(false);
    
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
        const finalScore = score + scoringData.levelCompletion;
        setScore(finalScore);
        await updateUserScore('level1', finalScore);
        await completeLevel('level1');
        await logActivity('level_completed', {
          level: 'level1',
          score: finalScore
        });
        
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-popup';
        completionMessage.innerHTML = `
          <h2 className="completion-title">Level 1 Completed! 🎉</h2>
          <p>Congratulations! You've completed Level 1</p>
          <p className="score-display">Final Score: ${finalScore}</p>
          <button 
            onclick="this.parentElement.remove(); window.location.href='/home';"
            className="completion-button"
          >
            Continue to Home
          </button>
        `;
        document.body.appendChild(completionMessage);
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
          <button className="skip-button" onClick={skipDialogue}>
            Skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="level1-container">
      {showTutorial && <Level1Tutorial onComplete={() => setShowTutorial(false)} />}
      <div className="level1-header">
        <button className="back-button" onClick={() => navigate("/home")}>
          Back to Home
        </button>
        <div className="header-right">
          <div className="score-display">Score: {score}</div>
          <h1 className="level-title">{levelData.metadata.levelName}</h1>
        </div>
      </div>
      
      <div className="image-container">
        <img  className="background-level1" src="/assets/level1_map2.jpeg" alt="Tileset" />
        <img 
          src="/assets/character.png" 
          alt="Character" 
          className={`player-character ${isMoving ? 'moving' : ''}`}
          style={{ 
            top: isMoving ? nextCoord.top : currentCoord.top,
            left: isMoving ? nextCoord.left : currentCoord.left
          }}
          onClick={() => !isMoving && setShowQuestion(true)}
        />
        <div 
          className={`click-prompt ${isMoving ? 'moving' : ''}`}
          style={{ 
            top: `calc(${isMoving ? nextCoord.top : currentCoord.top} - 150px)`,
            left: isMoving ? nextCoord.left : currentCoord.left
          }}
        >
          <div className="click-text">Click Here</div>
          <div className="click-arrow">↓</div>
        </div>
      </div>

      {showQuestion && (
        <div className="question-popup">
          <div className="question-popup-close" onClick={() => setShowQuestion(false)}>
            ×
          </div>
          
          <div className="question-title">
            {currentQuestion.title}
          </div>

          <div className="question-narrative">
            {currentQuestion.narrative}
          </div>

          <div className="code-block">
            <pre>{currentQuestion.code}</pre>
          </div>

          <div className="question-text">
            {currentQuestion.question}
          </div>

          {!hintUsed && (
            <button className="hint-button" onClick={handleHintClick}>
              Need a Hint? (-5 points)
            </button>
          )}

          {showHint && (
            <div className="hint-display">
              <strong>Hint:</strong> {currentQuestion.hint}
            </div>
          )}

          <div className="options-grid">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                className={`option-button ${userAnswer === option.id ? 'selected' : ''}`}
                onClick={() => setUserAnswer(option.id)}
              >
                {option.text}
              </button>
            ))}
          </div>

          <button
            className="submit-button"
            onClick={handleAnswerSubmit}
            disabled={!userAnswer}
          >
            Submit Answer
          </button>

          {showSuccess && (
            <div className="feedback-success">
              {currentQuestion.feedback.success}
            </div>
          )}

          {showWrongAnswer && (
            <div className="feedback-failure">
              {currentQuestion.feedback.failure}
            </div>
          )}

          {showSuccess && (
            <button className="next-button" onClick={handleNextPosition}>
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}