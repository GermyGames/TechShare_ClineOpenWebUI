// Power-ups Module
// Handles power-up creation, activation, and effects

import * as Renderer from './renderer.js';

// Private module variables
let state;
let colors;
let sounds;
let canvas;
let powerUpTypes = ['paddleSize', 'slowBall', 'multiBall', 'speedBoost', 'shield'];
let powerUps = [];
let activePowerUps = {};
let powerUpTimer = 0;
const powerUpDuration = 300; // 5 seconds at 60fps

// Initialize the power-ups module with required references
export function initPowerUps(gameState, gameColors, gameSounds) {
    state = gameState;
    colors = gameColors;
    sounds = gameSounds;
    canvas = document.getElementById('game');
}

// Define power-up effects
const powerUpEffects = {
    paddleSize: () => {
        state.paddleHeight = 150; // Increase paddle size
        return {
            resetFunction: () => { state.paddleHeight = 100; },
            maxDuration: powerUpDuration
        };
    },
    slowBall: () => {
        state.balls.forEach(ball => {
            ball.speed *= 0.7; // Slow down ball speed
            ball.dx *= 0.7;
            ball.dy *= 0.7;
        });
        return {
            resetFunction: () => {
                state.balls.forEach(ball => {
                    ball.speed /= 0.7; // Reset ball speed
                    ball.dx /= 0.7;
                    ball.dy /= 0.7;
                });
            },
            maxDuration: powerUpDuration
        };
    },
    multiBall: () => {
        // Add two additional balls
        for (let i = 0; i < 2; i++) {
            createNewBall();
        }
        playSound('multiball');
        return {
            resetFunction: () => {
                // Remove extra balls on deactivation
                if (state.balls.length > 1) {
                    state.balls = [state.balls[0]];
                }
            },
            maxDuration: powerUpDuration
        };
    },
    speedBoost: () => {
        state.playerSpeed = 1.5; // Increase player paddle speed
        return {
            resetFunction: () => { state.playerSpeed = 1.0; },
            maxDuration: powerUpDuration
        };
    },
    shield: () => {
        // No immediate effect, shield will block one score
        return {
            resetFunction: () => { /* No reset needed */ },
            maxDuration: powerUpDuration
        };
    }
};

// Create a new ball (for multi-ball power-up)
function createNewBall() {
    const newBall = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: 0,
        dy: 0,
        speed: state.ballSpeed,
        active: true
    };
    
    // Random direction
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() * Math.PI / 2 - Math.PI / 4);
    newBall.dx = Math.cos(angle) * newBall.speed * direction;
    newBall.dy = Math.sin(angle) * newBall.speed;
    
    state.balls.push(newBall);
    return newBall;
}

// Update power-ups
export function updatePowerUps(deltaTime) {
    // Spawn new power-ups randomly
    powerUpTimer++;
    
    // Every 5-10 seconds, spawn a new power-up if fewer than 2 are active
    if (powerUpTimer > 300 + Math.random() * 300 && powerUps.length < 2) {
        spawnPowerUp();
        powerUpTimer = 0;
    }
    
    // Update power-up positions and animations
    powerUps.forEach(powerUp => {
        powerUp.rotation += 0.02; // Rotate the power-up
        
        // Make the power-up float up and down slightly
        powerUp.floatOffset = Math.sin(Date.now() / 500) * 5;
    });
    
    // Update active power-up timers
    for (const [type, data] of Object.entries(activePowerUps)) {
        data.duration--;
        
        // Deactivate power-up when timer expires
        if (data.duration <= 0) {
            deactivatePowerUp(type);
        }
    }
}

// Spawn a new power-up
function spawnPowerUp() {
    // Random position (not too close to edges)
    const x = 100 + Math.random() * (canvas.width - 200);
    const y = 50 + Math.random() * (canvas.height - 100);
    
    // Random power-up type
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    powerUps.push({
        x,
        y,
        type,
        size: 20,
        rotation: 0,
        floatOffset: 0
    });
}

// Activate a power-up
export function activatePowerUp(type) {
    // If already active, extend duration
    if (activePowerUps[type]) {
        activePowerUps[type].duration = activePowerUps[type].maxDuration;
        return;
    }
    
    // Call the effect function and store the effect data
    const effectData = powerUpEffects[type]();
    
    // Store power-up data
    activePowerUps[type] = {
        duration: effectData.maxDuration,
        maxDuration: effectData.maxDuration,
        resetFunction: effectData.resetFunction
    };
}

// Deactivate a power-up
export function deactivatePowerUp(type) {
    if (activePowerUps[type]) {
        // Call the reset function
        if (activePowerUps[type].resetFunction) {
            activePowerUps[type].resetFunction();
        }
        
        // Remove from active power-ups
        delete activePowerUps[type];
    }
}

// Check for power-up collisions with a ball
export function checkPowerUpCollisions(ball) {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        const dx = ball.x - powerUp.x;
        const dy = ball.y - powerUp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < state.ballSize / 2 + powerUp.size / 2) {
            // Activate power-up
            activatePowerUp(powerUp.type);
            
            // Create particles and play sound
            Renderer.createParticles(powerUp.x, powerUp.y, 15, colors.powerUps[powerUp.type]);
            playSound('powerup');
            
            // Remove power-up
            powerUps.splice(i, 1);
            return true;
        }
    }
    return false;
}

// Reset power-ups (for game restart)
export function resetPowerUps() {
    // Clear all active power-ups
    for (const type in activePowerUps) {
        deactivatePowerUp(type);
    }
    
    // Clear power-up array
    powerUps = [];
    powerUpTimer = 0;
}

// Play a sound
export function playSound(type) {
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

// Get active power-ups
export function getActivePowerUps() {
    return activePowerUps;
}

// Get power-ups
export function getPowerUps() {
    return powerUps;
}