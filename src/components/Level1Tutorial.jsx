import { useState, useEffect, useRef } from 'react';
import '../styles/Tutorial.css';

export default function Level1Tutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  // Tutorial steps specific to Level 1
  const tutorialSteps = [
    {
      title: "Welcome to The Cave of C++",
      content: "Welcome to Level 1! You'll explore these magical caves to learn essential C++ concepts.",
      target: "level1-header",
      position: "bottom",
      highlightTarget: true
    },
    {
      title: "Your Character",
      content: "This is your character. Click on it to interact with each cave's challenge.",
      target: "player-character",
      position: "right",
      highlightTarget: true,
      highlightOnly: "player-character"
    },
    {
      title: "First Cave: Templates",
      content: "Start here at the leftmost cave. This is the Template Cave where you'll learn about C++ templates.",
      target: "player-character",
      position: "right",
      offset: { x: -50, y: 0 },
      highlightTarget: false
    },
    {
      title: "Second Cave: Pointers",
      content: "Next, you'll move to the Pointer Cave to master memory addresses and references.",
      target: "player-character",
      position: "top",
      offset: { x: 100, y: -50 },
      highlightTarget: false
    },
    {
      title: "Third Cave: Memory Management",
      content: "The Memory Cave will test your understanding of dynamic memory allocation.",
      target: "player-character",
      position: "right",
      offset: { x: 300, y: -30 },
      highlightTarget: false
    },
    {
      title: "Final Cave: Polymorphism",
      content: "Your final challenge in the Polymorphism Cave will cover class inheritance and virtual functions.",
      target: "player-character",
      position: "right",
      offset: { x: 450, y: 0 },
      highlightTarget: false
    },
    {
      title: "Volume Control",
      content: "Adjust the game's volume using this slider in the bottom right corner.",
      target: "volume-control",
      position: "left",
      offset: { x: -20, y: -30 },
      highlightTarget: true
    },
    {
      title: "Score Display",
      content: "Your score appears in the top right. Earn points by solving challenges correctly!",
      target: "level1-header",
      position: "bottom",
      offset: { x: 350, y: 0 },
      highlightTarget: true
    },
    {
      title: "Ready to Begin!",
      content: "Click your character to start the first challenge. Good luck on your C++ journey!",
      target: "player-character",
      position: "center",
      highlightTarget: true,
      highlightOnly: "player-character"
    }
  ];

  useEffect(() => {
    const positionTooltip = () => {
      const currentStepData = tutorialSteps[currentStep];
      if (!currentStepData.target) return;

      // Remove any existing highlights first
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });

      let targetElement;
      // Special handling for volume and score elements
      if (currentStepData.target === 'volume-control') {
        targetElement = document.querySelector('.volume-control') || 
                       document.querySelector('[style*="volume-slider"]') ||
                       document.querySelector('input[type="range"]');
      } else if (currentStepData.target === 'level1-header' && currentStepData.title === "Score Display") {
        targetElement = document.querySelector('[style*="Score:"]') ||
                       document.querySelector('.level1-header div:first-child');
      } else {
        targetElement = document.querySelector(`.${currentStepData.target}`);
      }

      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Get offsets from the current step
      const offset = currentStepData.offset || { x: 0, y: 0 };

      let top = 0;
      let left = 0;

      // Special positioning for volume control and score
      if (currentStepData.target === 'volume-control') {
        top = windowHeight - tooltipRect.height - 40;
        left = windowWidth - tooltipRect.width - 200;
      } else if (currentStepData.target === 'level1-header' && currentStepData.title === "Score Display") {
        top = 80;
        left = windowWidth - tooltipRect.width - 100;
      } else {
        switch (currentStepData.position) {
          case 'top':
            top = Math.max(20, targetRect.top - tooltipRect.height - 20 + offset.y);
            left = Math.min(
              windowWidth - tooltipRect.width - 20,
              Math.max(20, targetRect.left + (targetRect.width - tooltipRect.width) / 2 + offset.x)
            );
            break;
          case 'bottom':
            top = Math.min(
              windowHeight - tooltipRect.height - 20,
              targetRect.bottom + 20 + offset.y
            );
            left = Math.min(
              windowWidth - tooltipRect.width - 20,
              Math.max(20, targetRect.left + (targetRect.width - tooltipRect.width) / 2 + offset.x)
            );
            break;
          case 'left':
            top = Math.min(
              windowHeight - tooltipRect.height - 20,
              Math.max(20, targetRect.top + (targetRect.height - tooltipRect.height) / 2 + offset.y)
            );
            left = Math.max(20, targetRect.left - tooltipRect.width - 20 + offset.x);
            break;
          case 'right':
            top = Math.min(
              windowHeight - tooltipRect.height - 20,
              Math.max(20, targetRect.top + (targetRect.height - tooltipRect.height) / 2 + offset.y)
            );
            left = Math.min(windowWidth - tooltipRect.width - 20, targetRect.right + 20 + offset.x);
            break;
          default:
            top = Math.min(
              windowHeight - tooltipRect.height - 20,
              Math.max(20, windowHeight / 2 - tooltipRect.height / 2 + offset.y)
            );
            left = Math.min(
              windowWidth - tooltipRect.width - 20,
              Math.max(20, windowWidth / 2 - tooltipRect.width / 2 + offset.x)
            );
        }
      }

      // Ensure tooltips stay within viewport
      top = Math.max(20, Math.min(windowHeight - tooltipRect.height - 20, top));
      left = Math.max(20, Math.min(windowWidth - tooltipRect.width - 20, left));

      // Add highlight based on conditions
      if (currentStepData.highlightTarget) {
        if (currentStepData.highlightOnly) {
          // Only highlight specific element
          const elementToHighlight = document.querySelector(`.${currentStepData.highlightOnly}`);
          if (elementToHighlight) {
            elementToHighlight.classList.add('tutorial-highlight');
          }
        } else {
          // Highlight the target element
          targetElement.classList.add('tutorial-highlight');
        }
      }

      setTooltipPosition({ top, left });
    };

    positionTooltip();

    window.addEventListener('resize', positionTooltip);
    return () => {
      window.removeEventListener('resize', positionTooltip);
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTutorial();
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    if (onComplete) {
      onComplete();
    }
  };

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
                  Start Level
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