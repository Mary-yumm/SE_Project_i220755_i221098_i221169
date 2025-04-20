import { getDatabase, ref, set, get, update, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Initialize Firebase Database
const db = getDatabase();

// User Progress Structure
const userProgressStructure = {
  profile: {
    email: '',
    username: '',
    joinedDate: '',
    lastActive: '',
    preferredLanguage: 'en',
    rank: 'Beginner',
    totalPoints: 0
  },
  preferences: {
    environment: {
      theme: 'dark',
      fontSize: 14,
      layout: 'default',
      colors: {
        background: '#1E1E1E',
        text: '#FFFFFF',
        accent: '#4CAF50'
      }
    },
    sound: {
      enabled: true,
      volume: 0.8,
      music: true,
      sfx: true
    },
    language: 'en',
    difficulty: 'normal',
    hints: {
      enabled: true,
      usedCount: 0
    }
  },
  premium: {
    status: false,
    expiryDate: null,
    features: {
      advancedLessons: false,
      customThemes: false,
      noAds: false,
      prioritySupport: false
    }
  },
  progress: {
    currentLevel: 'level1',
    completedLevels: {},
    stats: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeSpent: 0,
      memoryViolations: 0,
      hintsUsed: 0,
      perfectLevels: 0,
      totalPoints: 0
    }
  },
  currentState: {
    level1: {
      currentQuestion: 0,
      completedQuestions: [],
      dialogueSeen: false,
      lastPosition: { x: 0, y: 0 },
      hintsUsed: [],
      attempts: 0,
      score: 0
    },
    level2: {
      currentQuestion: 0,
      completedQuestions: [],
      dialogueSeen: false,
      lastPosition: { x: 0, y: 0 },
      hintsUsed: [],
      attempts: 0,
      score: 0
    },
    level3: {
      currentQuestion: 0,
      completedQuestions: [],
      dialogueSeen: false,
      lastPosition: { x: 0, y: 0 },
      hintsUsed: [],
      attempts: 0,
      score: 0
    }
  }
};

// Get user reference
const getUserRef = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return ref(db, `users/${user.uid}`);
};

// Initialize user progress
export const initializeUserProgress = async () => {
  try {
    const userRef = getUserRef();
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      const auth = getAuth();
      const user = auth.currentUser;
      const initialStructure = {
        ...userProgressStructure,
        profile: {
          ...userProgressStructure.profile,
          email: user.email,
          username: user.displayName || 'Player',
          joinedDate: new Date().toISOString()
        }
      };
      await set(userRef, initialStructure);
    }
  } catch (error) {
    console.error('Error initializing user progress:', error);
    throw error;
  }
};

// Get user progress
export const getUserProgress = async () => {
  try {
    const userRef = getUserRef();
    const snapshot = await get(userRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
};

// Update current level
export const updateCurrentLevel = async (levelId) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      'progress/currentLevel': levelId
    });
  } catch (error) {
    console.error('Error updating current level:', error);
    throw error;
  }
};

// Update question progress
export const updateQuestionProgress = async (levelId, questionId, isCorrect) => {
  try {
    const userRef = getUserRef();
    const updates = {
      [`currentState/${levelId}/completedQuestions/${questionId}`]: true,
      'progress/stats/totalQuestions': increment(1),
      [`progress/stats/${isCorrect ? 'correctAnswers' : 'incorrectAnswers'}`]: increment(1)
    };
    await update(userRef, updates);
  } catch (error) {
    console.error('Error updating question progress:', error);
    throw error;
  }
};

// Update current position
export const updateCurrentPosition = async (levelId, position) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      [`currentState/${levelId}/lastPosition`]: position
    });
  } catch (error) {
    console.error('Error updating current position:', error);
    throw error;
  }
};

// Update dialogue status
export const updateDialogueStatus = async (levelId, seen) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      [`currentState/${levelId}/dialogueSeen`]: seen
    });
  } catch (error) {
    console.error('Error updating dialogue status:', error);
    throw error;
  }
};

// Update memory violations
export const updateMemoryViolations = async (count) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      'progress/stats/memoryViolations': count
    });
  } catch (error) {
    console.error('Error updating memory violations:', error);
    throw error;
  }
};

// Update time spent
export const updateTimeSpent = async (timeInSeconds) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      'progress/stats/timeSpent': increment(timeInSeconds)
    });
  } catch (error) {
    console.error('Error updating time spent:', error);
    throw error;
  }
};

// Mark level as completed
export const completeLevel = async (levelId) => {
  try {
    const userRef = getUserRef();
    const nextLevel = getNextLevel(levelId);
    const updates = {
      [`progress/completedLevels/${levelId}`]: true,
      'progress/currentLevel': nextLevel
    };
    await update(userRef, updates);
  } catch (error) {
    console.error('Error completing level:', error);
    throw error;
  }
};

// Helper function to get next level
const getNextLevel = (currentLevel) => {
  const levels = ['level1', 'level2', 'level3', 'level4'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
};

// Update environment preferences
export const updateEnvironmentPreferences = async (preferences) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      'preferences/environment': preferences
    });
  } catch (error) {
    console.error('Error updating environment preferences:', error);
    throw error;
  }
};

// Update sound settings
export const updateSoundSettings = async (settings) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      'preferences/sound': settings
    });
  } catch (error) {
    console.error('Error updating sound settings:', error);
    throw error;
  }
};

// Update language preference
export const updateLanguage = async (language) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      'preferences/language': language
    });
  } catch (error) {
    console.error('Error updating language:', error);
    throw error;
  }
};

// Log activity
export const logActivity = async (activityType, details) => {
  try {
    const userRef = getUserRef();
    const timestamp = new Date().toISOString();
    await update(userRef, {
      [`activityLog/${activityType}/${timestamp}`]: details
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Update tutorial progress
export const updateTutorialProgress = async (tutorialId, progress) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      [`tutorials/completed/${tutorialId}`]: progress
    });
  } catch (error) {
    console.error('Error updating tutorial progress:', error);
    throw error;
  }
};

// Use hint
export const useHint = async (levelId, questionId) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      [`currentState/${levelId}/hintsUsed/${questionId}`]: true,
      'progress/stats/hintsUsed': increment(1)
    });
  } catch (error) {
    console.error('Error using hint:', error);
    throw error;
  }
};

// Update difficulty level
export const updateDifficulty = async (level) => {
  try {
    const userRef = getUserRef();
    await update(userRef, {
      'preferences/difficulty': level
    });
  } catch (error) {
    console.error('Error updating difficulty:', error);
    throw error;
  }
};

// Get leaderboard data
export const getLeaderboard = async () => {
  try {
    const leaderboardRef = ref(db, 'leaderboard');
    const snapshot = await get(leaderboardRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

// Update leaderboard
export const updateLeaderboard = async (score) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    const leaderboardRef = ref(db, `leaderboard/${user.uid}`);
    await set(leaderboardRef, {
      username: user.displayName || 'Player',
      score,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
};

// Update premium status
export const updatePremiumStatus = async (status) => {
  try {
    const userRef = getUserRef();
    const expiryDate = status ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null; // 30 days from now if premium
    
    await update(userRef, {
      'premium/status': status,
      'premium/expiryDate': expiryDate,
      'premium/features': {
        advancedLessons: status,
        customThemes: status,
        noAds: status,
        prioritySupport: status
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating premium status:', error);
    throw error;
  }
};

// Helper function for incrementing values
const increment = (delta) => {
  return {
    '.sv': {
      'increment': delta
    }
  };
}; 