import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/level3.css";
import questionsData from "../data/level3Data.json";
import {
  completeLevel,
  updateUserScore,
  logActivity,
} from "../services/firebaseService";
import { saveGameProgress, fetchGameProgress } from '../services/mongoDBService';
import { getAuth } from 'firebase/auth';
import { getUserProgress } from "../services/firebaseService";

// Define coordinates for question positions
const COORDINATES = [
  { top: "25%", left: "36.5%" },//1
  { top: "34%", left: "46%" },//2
  { top: "41%", left: "65.5%" },//3
  { top: "48%", left: "57%" },//4
  { top: "45%", left: "83%" },//5
  { top: "68%", left: "69.5%" },//6
  { top: "78%", left: "27%" },//7
  { top: "57%", left: "19%" },//8
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

export default function Level3() {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWrongAnswer, setShowWrongAnswer] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentCoord, setCurrentCoord] = useState(COORDINATES[0]);
  const [nextCoord, setNextCoord] = useState(null);
  const [showDialogue, setShowDialogue] = useState(true);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [withTimer, setWithTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [remainingLives, setRemainingLives] = useState(() => {
    const savedLives = parseInt(localStorage.getItem("remainingLives"), 10);
    return isNaN(savedLives) ? 3 : savedLives;
  });

  const levelData = questionsData;
  const currentQuestion = levelData.puzzles.questions[currentPosition];
  const scoringData = levelData.scoring;
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const checkPremiumAccess = async () => {
      try {
        const userProgress = await getUserProgress();
        if (!userProgress?.premium?.status) {
          navigate("/home", { 
            state: { 
              message: "Level 3 requires premium access. Upgrade to continue!",
              showPremiumPrompt: true 
            } 
          });
        } else {
          setIsPremium(true);
          const progress = await fetchGameProgress(userId, 'level3');
          setScore(progress.score);
          setRemainingLives(progress.lives);
        }
      } catch (error) {
        console.error("Error checking premium status:", error);
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };

    checkPremiumAccess();
  }, [navigate, userId]);

  // Auto-advance dialogue
  useEffect(() => {
    if (showDialogue && autoAdvance && isPremium) {
      const timer = setTimeout(() => {
        if (dialogueIndex < levelData.dialogue.intro.length - 1) {
          setDialogueIndex(dialogueIndex + 1);
        } else {
          setShowDialogue(false);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showDialogue, dialogueIndex, autoAdvance, levelData.dialogue?.intro?.length, isPremium]);

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

  // Life regeneration logic
  useEffect(() => {
    const interval = setInterval(() => {
      const savedLives = parseInt(localStorage.getItem("remainingLives"), 10);
      const lastLost = parseInt(localStorage.getItem("lastLifeLost"), 10);

      if (!isNaN(savedLives)) {
        if (savedLives < 3 && !isNaN(lastLost)) {
          const now = Date.now();
          if (now - lastLost >= 60000) {
            const updatedLives = savedLives + 1;
            setRemainingLives(updatedLives);
            localStorage.setItem("remainingLives", updatedLives);
            if (updatedLives < 3) {
              localStorage.setItem("lastLifeLost", now);
            } else {
              localStorage.removeItem("lastLifeLost");
            }
          }
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remainingLives <= 0) {
      setTimerActive(false);
      setShowWrongAnswer(true);
      setShowGameOverPopup(true);
      setShowQuestion(false);
      setTimeout(() => {
        setShowGameOverPopup(false);
        navigate("/level3");
      }, 1000);
    }
  }, [remainingLives, navigate]);

  const handleTimeUp = async () => {
    setTimerActive(false);
    setShowWrongAnswer(true);
    const newScore = score + scoringData.questionPoints.incorrect;
    if (newScore >= 0) setScore(newScore);
    await updateUserScore("level3", newScore);
    await logActivity("time_up", {
      level: "level3",
      questionId: currentQuestion.id,
      score: scoringData.questionPoints.incorrect,
    });
  };

  const handleHintClick = async () => {
    if (!hintUsed) {
      setShowHint(true);
      setHintUsed(true);
      const newScore = score - scoringData.hintPenalty;
      if (newScore >= 0) setScore(newScore);
      await updateUserScore("level3", newScore);
      await logActivity("hint_used", {
        level: "level3",
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
    
    if (selectedOption?.correct) {
      setTimerActive(false);
      setShowSuccess(true);
      newScore = score + scoringData.questionPoints.correct;
      setScore(newScore);
      await updateUserScore("level3", newScore);
      await logActivity("correct_answer", {
        level: "level3",
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
      await updateUserScore("level3", newScore);
      await logActivity("incorrect_answer", {
        level: "level3",
        questionId: currentQuestion.id,
        score: scoringData.questionPoints.incorrect,
      });
    }
    await saveGameProgress(userId, 'level3', {
      score: newScore,
      lives: remainingLives,
      lastLifeLost: remainingLives < 3 ? new Date() : null
    });
  };

  const handleNextPosition = async () => {
    if (!showSuccess) return;

    setTimerActive(false);
    setTimeLeft(60);
    setShowSuccess(false);
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
        await saveGameProgress(userId, 'level3', {
          score: finalScore,
          lives: remainingLives,
          lastLifeLost: null
        });
      }
    } else {
      try {
        const finalScore = score + scoringData.levelCompletion;
        setScore(finalScore);
        await updateUserScore("level3", finalScore);
        await completeLevel("level3");
        await logActivity("level_completed", {
          level: "level3",
          score: finalScore,
        });

        const completionMessage = document.createElement("div");
        completionMessage.className = "completion-popup";
        completionMessage.innerHTML = `
          <h2 className="completion-title">Level 3 Completed! 🎉</h2>
          <p>Congratulations! You've mastered this premium level!</p>
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isPremium) {
    return null;
  }

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
    <div className="level3-container">
      <div className="level3-header">
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
          className="background-level3"
          src="/assets/level3map.jpg"
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
              setShowQuestion(true);
              if (withTimer) {
                setTimeLeft(60);
                setTimerActive(true);
              }
            } else if (remainingLives <= 0) {
              setShowGameOverPopup(true);
              setTimeout(() => {
                setShowGameOverPopup(false);
                navigate("/level3");
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
              Need a Hint? (-{scoringData.hintPenalty} points)
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