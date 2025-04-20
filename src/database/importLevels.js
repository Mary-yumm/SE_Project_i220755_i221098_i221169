const mongoose = require('mongoose');
const connectDB = require('./db');
const { Level } = require('./gameSchema');
const level2Data = require('../data/level2Data.json');

const importLevels = async () => {
    try {
        await connectDB();
        
        // Transform the JSON data to match our schema
        const levelData = {
            levelId: 'level2',
            levelName: level2Data.metadata.levelName,
            description: level2Data.metadata.description,
            difficulty: level2Data.metadata.difficulty,
            estimatedTime: level2Data.metadata.estimatedTime,
            topics: level2Data.metadata.topics,
            map: {
                layout: level2Data.map.layout,
                dimensions: level2Data.map.dimensions
            },
            puzzles: level2Data.puzzles.map(puzzle => ({
                puzzleId: puzzle.id,
                position: puzzle.position,
                code: puzzle.code,
                question: puzzle.question,
                options: puzzle.options,
                correctAnswer: puzzle.correctAnswer,
                feedback: puzzle.feedback
            })),
            dialogue: {
                intro: level2Data.dialogue.intro,
                completion: level2Data.dialogue.completion
            },
            visualSettings: level2Data.visualSettings
        };

        // Insert or update the level
        await Level.findOneAndUpdate(
            { levelId: 'level2' },
            levelData,
            { upsert: true, new: true }
        );

        console.log('Level data imported successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error importing level data:', error);
        process.exit(1);
    }
};

importLevels(); 