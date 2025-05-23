// Phaser.js 2D Maze Map for Level 2: The Labyrinth of Lost Addresses

import Phaser from 'phaser';
import level2Data from '../data/level2Data.json';
import { LevelManager } from '../utils/LevelManager';
import { updateUserScore, logActivity } from '../services/firebaseService';

export default class LabyrinthScene extends Phaser.Scene {
  constructor() {
    super('LabyrinthScene');
    this.currentStep = 0;
    this.gameState = level2Data.gameState.initialState;
    this.playerPath = [];
    this.score = 0;
    this.memoryViolations = 0;
    this.scoringData = level2Data.scoring;
  }

  preload() {
    // Load assets
    this.load.image('wall', 'src/assets/wall.png');
    this.load.image('player', 'src/assets/character.png');
    
    const graphics = this.make.graphics();
    const tileSize = level2Data.map.dimensions.tileSize;
    
    // Floor texture (dark blue with grid effect)
    graphics.lineStyle(1, level2Data.visualSettings.colors.grid);
    graphics.fillStyle(level2Data.visualSettings.colors.floor);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.strokeRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('floor', tileSize, tileSize);

    // Memory tile texture (glowing cyan)
    graphics.clear();
    graphics.fillStyle(level2Data.visualSettings.colors.primary);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.lineStyle(2, 0x40e0d0);
    graphics.strokeRect(1, 1, tileSize - 2, tileSize - 2);
    graphics.generateTexture('memory-tile', tileSize, tileSize);

    // Exit tile texture (glowing green)
    graphics.clear();
    graphics.fillStyle(level2Data.visualSettings.colors.success);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.lineStyle(2, 0x00aa00);
    graphics.strokeRect(1, 1, tileSize - 2, tileSize - 2);
    graphics.generateTexture('exit-tile', tileSize, tileSize);

    graphics.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor(level2Data.visualSettings.colors.background);

    // Add glitch effect to the scene
    this.glitchEffect = this.add.particles(0, 0, 'memory-tile', {
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.1, end: 0 },
      blendMode: 'ADD',
      lifespan: 300,
      quantity: 0,
      frequency: -1
    });

    // Use data from JSON
    this.puzzleSteps = level2Data.puzzles.questions;
    this.map = level2Data.map.layout;
    this.tileSize = level2Data.map.dimensions.tileSize;
    this.startX = (this.cameras.main.width - this.map[0].length * this.tileSize) / 2;
    this.startY = (this.cameras.main.height - this.map.length * this.tileSize) / 2;

    this.createMapTiles();
    this.setupPlayer();
    this.showIntroDialogue();

    // Add score display
    this.scoreText = this.add.text(20, 20, `Score: ${this.score}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
  }

  setupPlayer() {
    const playerX = this.startX + this.tileSize + this.tileSize / 2;
    const playerY = this.startY + this.tileSize + this.tileSize / 2;
    this.player = this.physics.add.sprite(playerX, playerY, 'player');
    const scale = (this.tileSize * level2Data.visualSettings.playerScale) / 317;
    this.player.setScale(scale);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.stepCooldown = 0;
  }

  createMapTiles() {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const tileX = this.startX + x * this.tileSize;
        const tileY = this.startY + y * this.tileSize;

        // Add floor everywhere except walls
        if (this.map[y][x] !== level2Data.map.tileTypes.wall) {
          this.add.image(tileX, tileY, 'floor')
            .setOrigin(0)
            .setDisplaySize(this.tileSize, this.tileSize);
        }

        // Add walls
        if (this.map[y][x] === level2Data.map.tileTypes.wall) {
          this.add.image(tileX, tileY, 'wall')
            .setOrigin(0)
            .setDisplaySize(this.tileSize, this.tileSize);
        }

        // Add question tiles
        if (this.map[y][x] === level2Data.map.tileTypes.question) {
          const tile = this.add.image(tileX, tileY, 'memory-tile')
            .setOrigin(0)
            .setDisplaySize(this.tileSize, this.tileSize)
            .setAlpha(0.7);
          
          // Add code text for the question tile
          const questionIndex = this.getQuestionIndexForPosition(x, y);
          if (questionIndex !== -1 && this.puzzleSteps[questionIndex]) {
            this.add.text(tileX + this.tileSize/2, tileY + this.tileSize/2, 
              this.puzzleSteps[questionIndex].code,
              { fontSize: '14px', fill: '#fff', align: 'center', wordWrap: { width: this.tileSize - 10 } })
              .setOrigin(0.5);
          }
        }

        // Add exit tile
        if (this.map[y][x] === level2Data.map.tileTypes.exit) {
          const exitTile = this.add.image(tileX, tileY, 'exit-tile')
            .setOrigin(0)
            .setDisplaySize(this.tileSize, this.tileSize)
            .setAlpha(0.8);
          
          // Add "EXIT" text
          this.add.text(tileX + this.tileSize/2, tileY + this.tileSize/2, 
            'EXIT',
            { fontSize: '16px', fill: '#fff', fontStyle: 'bold' })
            .setOrigin(0.5);
        }
      }
    }
  }

  getQuestionIndexForPosition(x, y) {
    return level2Data.puzzles.questions.findIndex(q => 
      q.position.x === x && q.position.y === y
    );
  }

  showIntroDialogue() {
    const text = level2Data.dialogue.intro.join('\n\n');

    const style = {
      fontSize: '24px',
      fill: '#fff',
      align: 'center',
      backgroundColor: '#000a',
      padding: { x: 20, y: 10 }
    };
    
    const dialogue = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      text,
      style
    ).setOrigin(0.5);

    // Add glowing effect
    dialogue.setStroke(level2Data.visualSettings.colors.primary, 2);
    dialogue.setShadow(2, 2, '#000000', 2, true, true);

    // Fade out after 5 seconds
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: dialogue,
        alpha: 0,
        duration: level2Data.visualSettings.animations.transitionDuration,
        onComplete: () => dialogue.destroy()
      });
    });
  }

  showPuzzlePrompt() {
    if (this.currentStep >= this.puzzleSteps.length) return true;
    
    const step = this.puzzleSteps[this.currentStep];
    
    // Create a styled popup container
    const popup = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY);
    
    // Semi-transparent dark overlay for the entire screen
    const overlay = this.add.rectangle(
      -this.cameras.main.centerX, 
      -this.cameras.main.centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    popup.add(overlay);

    // Popup background with cyan border
    const bg = this.add.rectangle(0, 0, 600, 400, 0x1a1a2e, 1)
      .setStrokeStyle(4, 0x00ffff);
    popup.add(bg);

    // Title/Code text
    const codeText = this.add.text(0, -150, step.code, {
      fontSize: '24px',
      fontFamily: 'monospace',
      fill: '#00ffff',
      align: 'center'
    }).setOrigin(0.5);
    popup.add(codeText);

    // Question text
    const questionText = this.add.text(0, -50, step.question, {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center',
      wordWrap: { width: 550 }
    }).setOrigin(0.5);
    popup.add(questionText);

    // Create styled option buttons
    const createButton = (x, y, text, isOptionA) => {
      const buttonWidth = 250;
      const buttonHeight = 60;
      const padding = 10;

      // Button background
      const buttonBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x203050)
        .setStrokeStyle(2, 0x40e0d0)
        .setInteractive({ useHandCursor: true });

      // Button text
      const buttonText = this.add.text(x, y, text, {
        fontSize: '18px',
        fontFamily: 'monospace',
        fill: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);

      // Option label (A or B)
      const optionLabel = this.add.text(x - buttonWidth/2 + padding, y, 
        isOptionA ? 'A:' : 'B:', {
        fontSize: '18px',
        fontFamily: 'monospace',
        fill: '#00ffff'
      }).setOrigin(0, 0.5);

      // Hover effects
      buttonBg.on('pointerover', () => {
        buttonBg.setFillStyle(0x304060);
      });
      buttonBg.on('pointerout', () => {
        buttonBg.setFillStyle(0x203050);
      });

      return { bg: buttonBg, text: buttonText, label: optionLabel };
    };

    // Create option buttons
    const buttonA = createButton(-150, 50, step.options[0].code, true);
    const buttonB = createButton(150, 50, step.options[1].code, false);
    
    popup.add([buttonA.bg, buttonA.text, buttonA.label, 
               buttonB.bg, buttonB.text, buttonB.label]);

    return new Promise(resolve => {
      // Handle button clicks
      buttonA.bg.on('pointerdown', () => {
        this.handleAnswer(0, popup, resolve);
      });

      buttonB.bg.on('pointerdown', () => {
        this.handleAnswer(1, popup, resolve);
      });
    });
  }

  async handleAnswer(choice, popup, resolve) {
    const step = this.puzzleSteps[this.currentStep];
    const isCorrect = choice === 'a' ? 
      step.options[0].correct : 
      step.options[1].correct;
    
    // Update score based on correct/incorrect answer
    const scoreChange = isCorrect ? 
      this.scoringData.questionPoints.correct : 
      this.scoringData.questionPoints.incorrect;
    
    this.score += scoreChange;
    
    // Update score in Firebase immediately
    await updateUserScore('level2', this.score);
    
    // Log activity
    await logActivity(isCorrect ? 'correct_answer' : 'incorrect_answer', {
      level: 'level2',
      questionId: step.id,
      score: scoreChange
    });
    
    // Show feedback
    const feedbackText = isCorrect ? step.feedback.success : step.feedback.failure;
    
    // Create feedback text
    const feedback = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 100,
      feedbackText,
      {
        fontSize: '18px',
        fill: isCorrect ? '#00ff00' : '#ff0000',
        align: 'center',
        wordWrap: { width: 550 }
      }
    ).setOrigin(0.5);
    
    // Add to popup container
    popup.add(feedback);
    
    // Fade out popup after delay
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: popup,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          popup.destroy();
          resolve();
        }
      });
    });
    
    // Move to next step if correct
    if (isCorrect) {
      this.currentStep++;
    } else {
      // Apply memory violation penalty
      const penalty = level2Data.penalty.stepsBack;
      if (this.playerPath.length > penalty) {
        const newPosition = this.playerPath[this.playerPath.length - penalty - 1];
        this.player.x = newPosition.x;
        this.player.y = newPosition.y;
        this.playerPath = this.playerPath.slice(0, this.playerPath.length - penalty);
      }
      
      // Show glitch effect
      this.glitchEffect.setQuantity(level2Data.penalty.effect.particles.quantity);
      this.glitchEffect.setSpeed(
        level2Data.penalty.effect.particles.speed.min,
        level2Data.penalty.effect.particles.speed.max
      );
      this.glitchEffect.setAngle(
        level2Data.penalty.effect.particles.angle.min,
        level2Data.penalty.effect.particles.angle.max
      );
      this.glitchEffect.setLifespan(level2Data.penalty.effect.particles.lifespan);
      this.glitchEffect.setScale(
        level2Data.penalty.effect.particles.scale.start,
        level2Data.penalty.effect.particles.scale.end
      );
      
      // Show penalty message
      const penaltyText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 100,
        level2Data.penalty.message,
        {
          fontSize: '24px',
          fill: '#ff0000',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      
      this.time.delayedCall(2000, () => {
        penaltyText.destroy();
      });
    }
  }

  async handleLevelComplete() {
    // Add level completion points
    const finalScore = this.score + this.scoringData.levelCompletion;
    this.score = finalScore;
    
    // Update score in Firebase
    await updateUserScore('level2', finalScore);
    
    // Log activity
    await logActivity('level_completed', {
      level: 'level2',
      score: finalScore
    });
    
    // Show completion dialogue
    const text = level2Data.dialogue.completion.join('\n\n');
    
    const style = {
      fontSize: '24px',
      fill: '#fff',
      align: 'center',
      backgroundColor: '#000a',
      padding: { x: 20, y: 10 }
    };
    
    const dialogue = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      text,
      style
    ).setOrigin(0.5);
    
    // Add glowing effect
    dialogue.setStroke(level2Data.visualSettings.colors.success, 2);
    dialogue.setShadow(2, 2, '#000000', 2, true, true);
    
    // Fade out after 5 seconds and navigate to home
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: dialogue,
        alpha: 0,
        duration: level2Data.visualSettings.animations.transitionDuration,
        onComplete: () => {
          dialogue.destroy();
          // Navigate to home page
          window.location.href = '/home';
        }
      });
    });
  }

  update(time) {
    if (time > this.stepCooldown) {
      let moveX = 0;
      let moveY = 0;

      if (this.cursors.left.isDown) moveX = -1;
      else if (this.cursors.right.isDown) moveX = 1;
      else if (this.cursors.up.isDown) moveY = -1;
      else if (this.cursors.down.isDown) moveY = 1;

      if (moveX !== 0 || moveY !== 0) {
        const gridX = Math.floor((this.player.x - this.startX) / this.tileSize);
        const gridY = Math.floor((this.player.y - this.startY) / this.tileSize);
        const newX = gridX + moveX;
        const newY = gridY + moveY;

        if (this.map[newY]?.[newX] !== undefined && 
            this.map[newY][newX] !== level2Data.map.tileTypes.wall) {
          if (this.map[newY][newX] === level2Data.map.tileTypes.question) {
            // Store current position before showing puzzle
            this.playerPath.push({ x: this.player.x, y: this.player.y });
            
            // Show puzzle prompt and wait for response
            this.showPuzzlePrompt().then(success => {
              if (success) {
                this.player.x += moveX * this.tileSize;
                this.player.y += moveY * this.tileSize;
                this.playerPath.push({ x: this.player.x, y: this.player.y });
              }
            });
          } else {
            this.player.x += moveX * this.tileSize;
            this.player.y += moveY * this.tileSize;
            this.playerPath.push({ x: this.player.x, y: this.player.y });

            if (this.map[newY][newX] === level2Data.map.tileTypes.exit) {
              this.handleLevelComplete();
            }
          }
        }
        
        this.stepCooldown = time + 200;
      }
    }

    // Update score display
    if (this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Dispatch score update event for React component
      window.dispatchEvent(new CustomEvent('scoreUpdate', {
        detail: { score: this.score }
      }));
    }
  }
}
