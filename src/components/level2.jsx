// Level2.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/level2.css";
import questionsData from "../data/level2Data.json";
import {
  completeLevel,
  updateCurrentLevel,
  updateUserScore,
  logActivity,
} from "../services/firebaseService";
import { saveGameProgress, fetchGameProgress } from '../services/mongoDBService';
import { getAuth } from 'firebase/auth';
// Define the coordinates for question positions
const COORDINATES = [
  { top: "52%", left: "22%" },//1
  { top: "55%", left: "31%" },//2
  { top: "70%", left: "37%" },//3
  { top: "60%", left: "45%" },//4
  { top: "71.5%", left: "50.5%" },//5
  { top: "70%", left: "60%" },//6
  { top: "63%", left: "70%" },//7
  { top: "55%", left: "76%" },//8
  { top: "39%", left: "75%" },//9
  { top: "15%", left: "70%" },//10
  { top: "13%", left: "48%" },//11
  { top: "15%", left: "36.5%" },//12
  { top: "25%", left: "30%" },//13

];

const TimerSelection = ({ onSelect }) => {
  return (
    <div className="timer-selection-container">
      <div className="timer-selection-box">
        <h2>Select Game Mode</h2>
        <p>Would you like to play with a timer?</p>
        <div className="timer-options">
          <button onClick={() => onSelect(true)}>
            With Timer (60s per question)
          </button>
          <button onClick={() => onSelect(false)}>Without Timer</button>
        </div>
      </div>
    </div>
  );
};

export default function level2() {
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

  //gameover
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);

  //timer
  const [withTimer, setWithTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  //lives

  const [remainingLives, setRemainingLives] = useState(() => {
    const savedLives = parseInt(localStorage.getItem("remainingLives"), 10);
    return isNaN(savedLives) ? 3 : savedLives;
  });
  const levelData = questionsData;
  const currentQuestion = levelData.puzzles.questions[currentPosition];
  const scoringData = levelData.scoring;

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Initialize state from MongoDB on load
  useEffect(() => {
    const loadProgress = async () => {
      if (userId) {
        const progress = await fetchGameProgress(userId, 'level2');
        setScore(progress.score);
        setRemainingLives(progress.lives);
      }
    };
    loadProgress();
  }, [userId]);

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
  }, [
    showDialogue,
    dialogueIndex,
    autoAdvance,
    levelData.dialogue.intro.length,
  ]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      const savedLives = parseInt(localStorage.getItem("remainingLives"), 10);
      const lastLost = parseInt(localStorage.getItem("lastLifeLost"), 10);

      if (!isNaN(savedLives) && savedLives < 3 && !isNaN(lastLost)) {
        const now = Date.now();
        if (now - lastLost >= 60000) {
          // 1 minute
          const updatedLives = savedLives + 1;
          if (updatedLives <= 3) setRemainingLives(updatedLives);
          localStorage.setItem("remainingLives", updatedLives);

          if (updatedLives < 3) {
            localStorage.setItem("lastLifeLost", now); // reset timer for next life
          } else {
            localStorage.removeItem("lastLifeLost"); // clear if full
          }
        }
      }
    }, 10000); // check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedLives = parseInt(localStorage.getItem("remainingLives"), 10);
    if (!isNaN(savedLives)) {
      setRemainingLives(savedLives);
    }
  }, []);
  useEffect(() => {
    if (remainingLives <= 0) {
      setTimerActive(false);
      setShowWrongAnswer(true);
      setShowGameOverPopup(true);
      setShowQuestion(false);
      setTimeout(() => {
        setShowGameOverPopup(false);
        navigate("/level2");
      }, 1000);
    }
  }, [remainingLives, navigate]);

  const handleTimeUp = async () => {
    setTimerActive(false);
    setShowWrongAnswer(true);

    const newScore = score + scoringData.questionPoints.incorrect;
    if (newScore >= 0) setScore(newScore);
    await updateUserScore("level2", newScore);
    await logActivity("time_up", {
      level: "level2",
      questionId: currentQuestion.id,
      score: scoringData.questionPoints.incorrect,
    });
  };

  const handleHintClick = async () => {
    if (!hintUsed) {
      setShowHint(true);
      setHintUsed(true);

      const newScore = score - scoringData.hintPenalty;
      if(newScore>=0)
      setScore(newScore);
      await updateUserScore("level2", newScore);
      await logActivity("hint_used", {
        level: "level2",
        questionId: currentQuestion.id,
        score: -scoringData.hintPenalty,
      });
    }
  };

  const handleAnswerSubmit = async () => {
    const selectedOption = currentQuestion.options.find(
      (opt) => opt.id === userAnswer
    );
    let newScore;
    if (selectedOption && selectedOption.correct) {
      setTimerActive(false);
      setShowSuccess(true);
      setShowExplanation(true);

       newScore = score + scoringData.questionPoints.correct;
      setScore(newScore);
      await updateUserScore("level2", newScore);
      await logActivity("correct_answer", {
        level: "level2",
        questionId: currentQuestion.id,
        score: scoringData.questionPoints.correct,
      });
      
    } else {
      setShowWrongAnswer(true);
      const lives = remainingLives - 1;
      setRemainingLives(lives);
      localStorage.setItem("remainingLives", lives);
      if (lives < 3) {
        localStorage.setItem("lastLifeLost", Date.now());
      }

      setUserAnswer("");

       newScore = score + scoringData.questionPoints.incorrect;
      if (newScore >= 0) setScore(newScore);
      await updateUserScore("level2", newScore);
      await logActivity("incorrect_answer", {
        level: "level2",
        questionId: currentQuestion.id,
        score: scoringData.questionPoints.incorrect,
      });
    }
    await saveGameProgress(userId, 'level2', {
      score: newScore,
      lives: remainingLives,
      lastLifeLost: remainingLives < 3 ? new Date() : null
    });
  };

  const handleNextPosition = async () => {
    // Only proceed if the current question was answered successfully
    if (!showSuccess) return;

    setTimerActive(false);
    setTimeLeft(60);
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
        const finalScore = score + scoringData.levelCompletion;
        await saveGameProgress(userId, 'level2', {
          score: finalScore,
          lives: remainingLives,
          lastLifeLost: null // Reset on completion
        });
      }
    } else {
      try {
        const finalScore = score + scoringData.levelCompletion;
    
        setScore(finalScore);
        await updateUserScore("level2", finalScore);
        await completeLevel("level2");
        await logActivity("level_completed", {
          level: "level2",
          score: finalScore,
        });

        const completionMessage = document.createElement("div");
        completionMessage.className = "completion-popup";
        completionMessage.innerHTML = `
          <h2 className="completion-title">level 2 Completed! 🎉</h2>
          <p>Congratulations! You've completed level 2</p>
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
        console.error("Error completing level:", error);
      }
    }
    if (withTimer) {
      setTimerActive(true);
    }
  };

  const handleDialogueClick = () => {
    if (dialogueIndex < levelData.dialogue.intro.length - 1) {
      setDialogueIndex(dialogueIndex + 1);
    } else {
      setShowDialogue(false);
    }
  };

  const skipDialogue = () => {
    setShowDialogue(false);
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

  if (withTimer === null) {
    return (
      <TimerSelection
        onSelect={(choice) => {
          setWithTimer(choice);
          if (choice) {
            setTimeLeft(60);
            setTimerActive(true);
          }
        }}
      />
    );
  }

  return (
    <div className="level2-container">
      <div className="level2-header">
        <button className="back-button" onClick={() => navigate("/home")}>
          Back to Home
        </button>
        <div className="header-right">
          <div className="score-display">
            <img src="/assets/dollar.png" className="coin-image" />
            {score}
          </div>
          <div className="lives-display">
            <div className="heart-container">
              <img src="/assets/heart-full.png" className="heart-image" />
              <p className="lives-count">{remainingLives}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="image-container">
        <img
          className="background-level2"
          src="/assets/level2map.png"
          alt="Tileset"
        />
        <img
          src="/assets/character.png"
          alt="Character"
          className={`player-character ${isMoving ? "moving" : ""}`}
          style={{
            top: isMoving ? nextCoord.top : currentCoord.top,
            left: isMoving ? nextCoord.left : currentCoord.left,
          }}
          onClick={() => {
            if (remainingLives > 0 && !isMoving) {
              // Add the check for remaining lives
              setShowQuestion(true);
              if (withTimer) {
                setTimeLeft(60);
                setTimerActive(true);
              }
            } else if (remainingLives <= 0) {
              setShowGameOverPopup(true);

              setTimeout(() => {
                setShowGameOverPopup(false);
                navigate("/level2");
              }, 1000);
            }
          }}
        />
        <div
          className={`click-prompt ${isMoving ? "moving" : ""}`}
          style={{
            top: `calc(${isMoving ? nextCoord.top : currentCoord.top} - 150px)`,
            left: isMoving ? nextCoord.left : currentCoord.left,
          }}
        >
          <div className="click-text">Click Here</div>
          <div className="click-arrow">↓</div>
        </div>
      </div>

      {showQuestion && (
        <div className="question-popup">
          <div
            className="question-popup-close"
            onClick={() => {
              setShowQuestion(false);
              setTimerActive(false);
            }}
          >
            ×
          </div>

          <div className="question-title">{currentQuestion.title}</div>
          {withTimer && timerActive && (
            <div className="question-timer">Time left: {timeLeft}s</div>
          )}
          <div className="question-narrative">{currentQuestion.narrative}</div>

          <div className="code-block">
            <pre>{currentQuestion.code}</pre>
          </div>

          <div className="question-text">{currentQuestion.question}</div>

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
                className={`option-button ${
                  userAnswer === option.id ? "selected" : ""
                }`}
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

      {showGameOverPopup && (
        <div className="game-over-popup">
          <p>Game Over! You have no lives left.</p>
        </div>
      )}
    </div>
  );
}




/*import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import LabyrinthScene from '../game/LabyrinthScene';
import level2Data from '../data/level2Data.json';

const Level2 = () => {
  const gameContainer = useRef(null);
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const [score, setScore] = useState(0);

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
      
      // Listen for score updates from the game
      window.addEventListener('scoreUpdate', (event) => {
        setScore(event.detail.score);
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      window.removeEventListener('scoreUpdate', () => {});
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            Score: {score}
          </div>
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
*/