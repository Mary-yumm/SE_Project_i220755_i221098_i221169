import { getUserProgress, completeLevel } from '../services/firebaseService';

export class LevelManager {
    static COMPLETED_LEVELS_KEY = 'completedLevels';

    static init() {
        if (!localStorage.getItem(this.COMPLETED_LEVELS_KEY)) {
            localStorage.setItem(this.COMPLETED_LEVELS_KEY, JSON.stringify(['level1']));
        }
    }

    static async isLevelUnlocked(levelId) {
        try {
            const userProgress = await getUserProgress();
            if (!userProgress) return levelId === 'level1'; // Only level 1 is unlocked by default
            
            const levels = ['level1', 'level2', 'level3'];
            const currentIndex = levels.indexOf(levelId);
            
            if (currentIndex === 0) return true; // Level 1 is always unlocked
            
            // Check if previous level is completed
            const previousLevel = levels[currentIndex - 1];
            const previousLevelCompleted = userProgress.progress?.completedLevels?.[previousLevel] === true;
            
            // For level 3, also check premium status
            if (levelId === 'level3') {
                return previousLevelCompleted && userProgress.premium?.status === true;
            }
            
            return previousLevelCompleted;
        } catch (error) {
            console.error('Error checking level unlock status:', error);
            return false;
        }
    }

    static async completeLevel(levelId) {
        try {
            await completeLevel(levelId);
        } catch (error) {
            console.error('Error completing level:', error);
            throw error;
        }
    }

    static async getNextUnlockedLevel() {
        try {
            const userProgress = await getUserProgress();
            if (!userProgress) return 'level1';
            
            const levels = ['level1', 'level2', 'level3'];
            const completedLevels = userProgress.progress?.completedLevels || {};
            const isPremium = userProgress.premium?.status === true;
            
            return levels.find(level => {
                const levelIndex = levels.indexOf(level);
                if (levelIndex === 0) return true; // level1 is always unlocked
                
                const previousLevel = levels[levelIndex - 1];
                const previousLevelCompleted = completedLevels[previousLevel] === true;
                
                // For level 3, require premium access
                if (level === 'level3') {
                    return previousLevelCompleted && isPremium;
                }
                
                return previousLevelCompleted;
            }) || 'level1';
        } catch (error) {
            console.error('Error getting next unlocked level:', error);
            return 'level1';
        }
    }
} 