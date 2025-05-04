// Level2.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/level2.css";
import questionsData from "../data/level2Data.json";
import {
  completeLevel,
  updateCurrentLevel,
  updateUserScore,
  logActivity,
} from "../services/firebaseService";
import {
  saveGameProgress,
  fetchGameProgress,
} from "../services/mongoDBService";
import { getAuth } from "firebase/auth";
// Define the coordinates for question positions
const COORDINATES = [
  { top: "52%", left: "22%" }, //1
  { top: "55%", left: "31%" }, //2
  { top: "70%", left: "37%" }, //3
  { top: "60%", left: "45%" }, //4
  { top: "71.5%", left: "50.5%" }, //5
  { top: "70%", left: "60%" }, //6
  { top: "63%", left: "70%" }, //7
  { top: "55%", left: "76%" }, //8
  { top: "39%", left: "75%" }, //9
  { top: "15%", left: "70%" }, //10
  { top: "13%", left: "48%" }, //11
  { top: "15%", left: "36.5%" }, //12
  { top: "25%", left: "30%" }, //13
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
  const location = useLocation();
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
  const [memoryViolations, setMemoryViolations] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  //gameover
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);

  //timer
  const [withTimer, setWithTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  //lives and score
  const [score, setScore] = useState(() => {
    if (location.state?.score !== undefined) return location.state.score;
    const saved = localStorage.getItem("level2_score");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [remainingLives, setRemainingLives] = useState(() => {
    if (location.state?.remainingLives !== undefined)
      return location.state.remainingLives;
    const saved = localStorage.getItem("level2_lives");
    return saved ? parseInt(saved, 10) : 3;
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
        // Only fetch from MongoDB if we don't have values from location state
        if (
          location.state === null ||
          (location.state.score === undefined &&
            location.state.remainingLives === undefined)
        ) {
          const progress = await fetchGameProgress(userId, "level2");
          if (progress) {
            if (location.state?.score === undefined)
              setScore(progress.score || 0);
            if (location.state?.remainingLives === undefined)
              setRemainingLives(progress.lives || 3);
          }
        }

        // Save the current state to MongoDB immediately
        await saveGameProgress(userId, "level2", {
          score: score,
          lives: remainingLives,
          lastLifeLost: remainingLives < 3 ? new Date() : null,
        });
      }
    };
    loadProgress();
  }, [userId, location.state]);

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
      // Only load from localStorage if we don't have lives from navigation state
      if (location.state?.remainingLives === undefined) {
        setRemainingLives(savedLives);
      }
    }
  }, [location.state]);
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

  useEffect(() => {
    const savedPosition = parseInt(localStorage.getItem("level2_currentPosition"), 10);
    if (!isNaN(savedPosition)) {
      setCurrentPosition(savedPosition);
      setCurrentCoord(COORDINATES[savedPosition]);
    }
  }, []);
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
      if (newScore >= 0) setScore(newScore);
      await updateUserScore("level2", newScore);
      await logActivity("hint_used", {
        level: "level2",
        questionId: currentQuestion.id,
        score: -scoringData.hintPenalty,
      });
    }
  };

  const handleAnswerSubmit = async () => {
    // Prevent submitting if already showing success
    if (showSuccess) return;

    const selectedOption = currentQuestion.options.find(
      (opt) => opt.id === userAnswer
    );
    let newScore;

    if (selectedOption?.correct) {
      setTimerActive(false);
      setShowSuccess(true);
      newScore = score + scoringData.questionPoints.correct;
      setScore(newScore);
      await updateUserScore("level2", newScore); // or "level3" for level3.jsx
      await logActivity("correct_answer", {
        level: "level2", // or "level3" for level3.jsx
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
      await updateUserScore("level2", newScore); // or "level3" for level3.jsx
      await logActivity("incorrect_answer", {
        level: "level2", // or "level3" for level3.jsx
        questionId: currentQuestion.id,
        score: scoringData.questionPoints.incorrect,
      });
    }

    await saveGameProgress(userId, "level2", {
      // or 'level3' for level3.jsx
      score: newScore,
      lives: remainingLives,
      lastLifeLost: remainingLives < 3 ? new Date() : null,
    });
  };
  


 const handleNextPosition = async () => {
    // Only proceed if the current question was answered successfully
    if (!showSuccess) return;

    let nextPosition = currentPosition;
    setTimerActive(false);
    setTimeLeft(60);
    setShowSuccess(false);
    setShowExplanation(false);
    setShowQuestion(false);
    setUserAnswer("");
    setShowHint(false);
    setHintUsed(false);

    if (currentPosition < levelData.puzzles.questions.length - 1) {
      nextPosition = currentPosition + 1;
      if (COORDINATES[nextPosition]) {
        setIsMoving(true);
        setNextCoord(COORDINATES[nextPosition]);
        setTimeout(() => {
          setCurrentPosition(nextPosition);
          setCurrentCoord(COORDINATES[nextPosition]);
          setNextCoord(null);
          setIsMoving(false);
        }, 2000);

        // Calculate final score after level completion
        const finalScore = score + scoringData.levelCompletion;

        // Save progress including score and lives
        await saveGameProgress(userId, "level2", {
          score: finalScore,
          lives: remainingLives,
          lastLifeLost: null, // Reset on completion
        });

        // Store in localStorage for persistence
        localStorage.setItem("level2_currentPosition", nextPosition);
        localStorage.setItem("level2_score", finalScore); // Store updated score
        localStorage.setItem("level2_lives", remainingLives); // Store remaining lives
      }
    } else {
      try {
        const finalScore = score + scoringData.levelCompletion;
        if (finalScore >= 0) setScore(finalScore);

        // Update user score and complete level
        await updateUserScore("level2", finalScore);
        await completeLevel("level2");
        await logActivity("level_completed", {
          level: "level2",
          score: finalScore,
        });

        // Clear current level position from localStorage (optional)
        localStorage.removeItem("level2_currentPosition");

        // Create a completion message and display it
        const completionMessage = document.createElement("div");
        completionMessage.className = "completion-popup";
        completionMessage.innerHTML = `
          <h2 className="completion-title">Level 2 Completed! 🎉</h2>
          <p>Congratulations! You've completed Level 2</p>
          <p className="score-display">Final Score: ${finalScore}</p>
          <button 
            className="completion-button"
          >
            Continue to Home
          </button>
        `;
        document.body.appendChild(completionMessage);

        // Handle home navigation when button is clicked
        completionMessage.querySelector("button").addEventListener("click", () => {
          document.body.removeChild(completionMessage); // Remove popup
          localStorage.setItem("level2_currentPosition", COORDINATES[0]); // Reset to the initial position

          navigate("/home", {
            state: {
              isLevelCompleted: true,
              score: finalScore,
              remainingLives: remainingLives,
              source: "level2",
            },
          });
        });
      } catch (error) {
        console.error("Error completing level:", error);
      }
    }

    // If there's a timer, re-enable it
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
        <button
          className="back-button"
          onClick={() =>
            navigate("/home", {
              state: {
                score: score,
                remainingLives: remainingLives,
              },
            })
          }
        >
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
            <button
              className="hint-button"
              onClick={handleHintClick}
              disabled={showSuccess}
            >
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
                onClick={() => !showSuccess && setUserAnswer(option.id)}
                disabled={showSuccess}
              >
                {option.text}
              </button>
            ))}
          </div>

          <button
            className="submit-button"
            onClick={handleAnswerSubmit}
            disabled={!userAnswer || showSuccess}
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
