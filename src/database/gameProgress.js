// models/GameProgress.js
import mongoose from 'mongoose';

const GameProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Matches Firebase UID
  level1: {
    score: { type: Number, default: 0 },
    lives: { type: Number, default: 3 },
    lastLifeLost: { type: Date },
  },
  // Add other levels as needed (level2, level3)
}, { timestamps: true });

export default mongoose.model('GameProgress', GameProgressSchema);