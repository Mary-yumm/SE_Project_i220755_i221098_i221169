import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Tutorial.css';

export default function Tutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  const navigate = useNavigate();

  // Tutorial steps with content and target elements
  const tutorialSteps = [
    {
      title: "Welcome to BrainByte",
      content: "BrainByte is an interactive learning platform designed to help you master programming concepts through engaging challenges.",
      target: "brainbyte-logo",
      position: "right"
    },
    {
      title: "Your Profile",
      content: "Access your profile to view your progress, achievements, and customize your experience.",
      target: "profile-btn",
      position: "bottom"
    },
    {
      title: "Settings",
      content: "Customize your experience with theme preferences, font size, and sound settings.",
      target: "settings-btn",
      position: "bottom"
    },
    {
      title: "Leaderboard",
      content: "Compete with other learners and track your ranking on the global leaderboard.",
      target: "leaderboard-btn",
      position: "bottom"
    },
    {
      title: "Levels Overview",
      content: "Progress through increasingly challenging levels to master different programming concepts.",
      target: "levels-container",
      position: "top"
    },
    {
      title: "Level 1: Memory Management",
      content: "Learn about memory management in C++ through interactive challenges.",
      target: "level1",
      position: "right"
    },
    {
      title: "Level 2: Object-Oriented Programming",
      content: "Master OOP concepts with hands-on exercises and real-world examples.",
      target: "level2",
      position: "right"
    },
    {
      title: "Level 3: Data Structures",
      content: "Explore advanced data structures and algorithms to solve complex problems.",
      target: "level3",
      position: "right"
    },
    {
      title: "Sign Out",
      content: "Click here to sign out of your account when you're done. Your progress will be saved automatically.",
      target: "logout-btn",
      position: "top"
    },
    {
      title: "Background Music",
      content: "Control the background music volume or toggle it on/off using this slider.",
      target: "audio-player",
      position: "top"
    },
    {
      title: "Ready to Start!",
      content: "You're all set to begin your learning journey with BrainByte. Good luck!",
      target: null,
      position: "center"
    }
  ];

  useEffect(() => {
    const positionTooltip = () => {
      const currentStepData = tutorialSteps[currentStep];
      if (!currentStepData.target) return;

      const targetElement = document.querySelector(`.${currentStepData.target}`);
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (currentStepData.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 20;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 20;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 20;
          break;
        default:
          top = window.innerHeight / 2 - tooltipRect.height / 2;
          left = window.innerWidth / 2 - tooltipRect.width / 2;
      }

      // Add highlight to target element
      targetElement.classList.add('tutorial-highlight');

      setTooltipPosition({ top, left });

      // Cleanup highlight when step changes
      return () => {
        targetElement.classList.remove('tutorial-highlight');
      };
    };

    positionTooltip();

    // Reposition on window resize
    window.addEventListener('resize', positionTooltip);
    return () => {
      window.removeEventListener('resize', positionTooltip);
      // Remove highlight from all elements when tutorial ends
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [currentStep]);

  // Handle next step
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip tutorial
  const handleSkip = () => {
    completeTutorial();
  };

  // Complete tutorial
  const completeTutorial = () => {
    setShowTutorial(false);
    if (onComplete) {
      onComplete();
    }
  };

  // If tutorial is not shown, don't render anything
  if (!showTutorial) {
    return null;
  }

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="tutorial-overlay">
      <div 
        ref={tooltipRef}
        className={`tutorial-tooltip ${currentStepData.position}`}
        style={{
          position: 'fixed',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: 'none'
        }}
      >
        <div className="tutorial-content">
          <h3>{currentStepData.title}</h3>
          <p>{currentStepData.content}</p>
          
          <div className="tutorial-navigation">
            <div className="tutorial-progress">
              {tutorialSteps.map((_, index) => (
                <span 
                  key={index} 
                  className={`progress-dot ${index === currentStep ? 'active' : ''}`}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>
            
            <div className="tutorial-buttons">
              {currentStep > 0 && (
                <button className="tutorial-btn prev-btn" onClick={handlePrevious}>
                  Previous
                </button>
              )}
              
              {!isLastStep ? (
                <button className="tutorial-btn next-btn" onClick={handleNext}>
                  Next
                </button>
              ) : (
                <button className="tutorial-btn complete-btn" onClick={completeTutorial}>
                  Get Started
                </button>
              )}
              
              <button className="tutorial-btn skip-btn" onClick={handleSkip}>
                Skip Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 