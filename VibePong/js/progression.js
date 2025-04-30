// Progression Module
// Handles levels, experience, high scores, and unlockables

import * as Renderer from './renderer.js';
import * as VisualNovel from './visualnovel.js';

// Private module variables
let state;
let sounds;
let canvas;

// Progression system variables
let playerLevel = 1;
let totalScore = 0;
let experiencePoints = 0;
let experienceToNextLevel = 1000;
let unlockedSkins = ['default'];
let currentSkin = 'default';
let highScores = [];

// Initialize the progression module
export function initProgression(gameState, gameSounds, gameCanvas) {
    state = gameState;
    sounds = gameSounds;
    canvas = gameCanvas;
    loadHighScores();
    
    // Initialize the visual novel module
    const container = document.querySelector('.container');
    VisualNovel.initVisualNovel(gameState, container);
}

// Update player progression
export function updateProgression(playerScore, comboMultiplier) {
    // Calculate total score based on player score and combo multiplier
    const scoreWithCombo = playerScore * 100 * comboMultiplier;
    totalScore = scoreWithCombo;
    
    // Add experience points
    experiencePoints += scoreWithCombo;
    
    // Check for level up
    if (experiencePoints >= experienceToNextLevel) {
        playerLevel++;
        experiencePoints -= experienceToNextLevel;
        experienceToNextLevel = Math.floor(experienceToNextLevel * 1.5); // Increase XP needed for next level
        
        // Unlock new skin at certain levels
        if (playerLevel % 5 === 0 && !unlockedSkins.includes(`level${playerLevel}`)) {
            unlockedSkins.push(`level${playerLevel}`);
        }
        
        // Visual and audio feedback for level up
        Renderer.createParticles(canvas.width / 2, canvas.height / 2, 30);
        playSound('levelUp');
        
        // Show level up message
        Renderer.showLevelUpMessage(playerLevel);
        
        // Start visual novel segment for the first 3 levels
        if (playerLevel <= 3) {
            VisualNovel.showVisualNovel(playerLevel);
        }
    }
}

// Reset progression (for new game)
export function resetProgression() {
    totalScore = 0;
    experiencePoints = 0;
    playerLevel = 1;
    experienceToNextLevel = 1000;
}

// Load high scores from local storage
export function loadHighScores() {
    const storedScores = localStorage.getItem('pongHighScores');
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    } else {
        // Default high scores
        highScores = [
            { name: 'VBE', score: 10000 },
            { name: 'CHK', score: 8000 },
            { name: 'PNG', score: 5000 }
        ];
        saveHighScores();
    }
    updateHighScoresDisplay();
}

// Save high scores to local storage
function saveHighScores() {
    localStorage.setItem('pongHighScores', JSON.stringify(highScores));
}

// Add a new high score
export function addHighScore(score) {
    const name = prompt('You got a high score! Enter your name (3 characters):');
    const validName = name ? name.substring(0, 3).toUpperCase() : 'AAA';
    
    highScores.push({ name: validName, score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5); // Keep only top 5
    
    saveHighScores();
    updateHighScoresDisplay();
}

// Check if score is a high score
export function isHighScore(score) {
    return highScores.length < 5 || score > highScores[highScores.length - 1].score;
}

// Update high scores display
export function updateHighScoresDisplay() {
    const highScoresList = document.getElementById('high-scores-list');
    if (highScoresList) {
        highScoresList.innerHTML = '';
        
        highScores.forEach(score => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${score.name}</span><span>${score.score}</span>`;
            highScoresList.appendChild(li);
        });
    }
}

// Show high scores
export function showHighScores() {
    const highScoresElement = document.getElementById('high-scores');
    if (highScoresElement) {
        updateHighScoresDisplay();
        highScoresElement.classList.add('show');
        
        setTimeout(() => {
            highScoresElement.classList.remove('show');
        }, 5000);
    }
}

// Get player level
export function getPlayerLevel() {
    return playerLevel;
}

// Get experience points
export function getExperiencePoints() {
    return experiencePoints;
}

// Get experience needed for next level
export function getExperienceToNextLevel() {
    return experienceToNextLevel;
}

// Play a sound
function playSound(type) {
    if (sounds[type]) {
        // Clone the audio to allow overlapping sounds
        const sound = sounds[type].cloneNode();
        sound.volume = 0.3;
        sound.play().catch(e => {
            // Handle autoplay restrictions
            console.log('Sound playback prevented:', e);
        });
    }
}
