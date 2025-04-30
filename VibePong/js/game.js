// Main Game Module
// Coordinates all game components and handles core game logic

import * as Renderer from './renderer.js';
import * as PowerUps from './powerups.js';
import * as ComboSystem from './combo.js';
import * as Progression from './progression.js';
import * as VisualNovel from './visualnovel.js';

document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('play-btn');
    const menu = document.getElementById('menu');
    const playerScoreElement = document.getElementById('player-score');
    const aiScoreElement = document.getElementById('ai-score');
    const difficultyButtons = document.querySelectorAll('.diff-btn');
    
    // Game variables
    let gameRunning = false;
    let ballSpeed = 5; // Default difficulty
    let difficulty = 'easy'; // Default difficulty level
    let lastTime = 0;
    
    // Audio elements
    const sounds = {
        paddle: new Audio(),
        wall: new Audio(),
        score: new Audio(),
        powerup: new Audio(),
        combo: new Audio(),
        levelUp: new Audio(),
        multiball: new Audio()
    };
    
    // Game state
    const state = {
        gameRunning: false,
        ballSpeed: ballSpeed,
        paddleWidth: 15,
        paddleHeight: 100,
        ballSize: 15,
        playerScore: 0,
        aiScore: 0,
        playerY: 0,
        aiY: 0,
        playerSpeed: 1.0, // Modifier for player paddle speed
        aiVelocity: 0, // Added for paddle physics
        aiTargetY: 0,  // Target position for smooth movement
        aiErrorMargin: 0, // Consistent error margin over time
        aiDecisionTimer: 0, // Timer for AI decision making
        screenShake: 0, // For screen shake effect
        ai: {
            reactionDelay: 0,    // Frames of delay before AI reacts to ball movement
            maxSpeed: 0,         // Maximum AI paddle speed
            errorFactor: 0,      // Error factor for difficulty levels
            predictionAccuracy: 0 // How well AI predicts ball trajectory
        },
        balls: [
            {
                x: canvas.width / 2,
                y: canvas.height / 2,
                dx: 0,
                dy: 0,
                speed: ballSpeed,
                active: true
            }
        ]
    };
    
    // Initialize paddle positions
    state.playerY = canvas.height / 2 - state.paddleHeight / 2;
    state.aiY = canvas.height / 2 - state.paddleHeight / 2;
    
    // Colors
    const colors = {
        player: '#ff00ff', // Neon pink
        ai: '#00ffff',     // Neon blue
        ball: '#39ff14',   // Neon green
        trail: ['#ff00ff', '#00ffff', '#9d00ff', '#39ff14'],
        powerUps: {
            paddleSize: '#ff00ff', // Pink
            slowBall: '#00ffff',   // Cyan
            multiBall: '#9d00ff',  // Purple
            speedBoost: '#39ff14', // Green
            shield: '#ffff00'      // Yellow
        },
        combo: [
            '#ffffff', // White (no combo)
            '#39ff14', // Green (low combo)
            '#00ffff', // Cyan (medium combo)
            '#9d00ff', // Purple (high combo)
            '#ff00ff'  // Pink (insane combo)
        ]
    };
    
    // Initialize modules
    // Renderer
    Renderer.initRenderer(canvas, state, colors);
    
    // PowerUps
    PowerUps.initPowerUps(state, colors, sounds);
    
    // Combo System
    ComboSystem.initCombo(state, sounds);
    
    // Progression
    Progression.initProgression(state, sounds, canvas);
    
    // Set up difficulty selection
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            difficultyButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set ball speed based on data attribute
            ballSpeed = parseInt(btn.dataset.speed);
            state.ballSpeed = ballSpeed;
            
            // Set difficulty level based on speed
            if (ballSpeed <= 5) {
                difficulty = 'easy';
            } else if (ballSpeed <= 8) {
                difficulty = 'medium';
            } else {
                difficulty = 'hard';
            }
            
            // Update AI parameters based on difficulty
            updateAIDifficulty();
        });
    });
    
    // Function to update AI difficulty parameters
    function updateAIDifficulty() {
        switch(difficulty) {
            case 'easy':
                state.ai.reactionDelay = 20;       // Slower reaction time
                state.ai.maxSpeed = 4;             // Slower max speed
                state.ai.errorFactor = 2.0;        // Larger errors
                state.ai.predictionAccuracy = 0.3; // Poor prediction
                break;
            case 'medium':
                state.ai.reactionDelay = 12;       // Moderate reaction time
                state.ai.maxSpeed = 5;             // Moderate speed
                state.ai.errorFactor = 1.2;        // Moderate errors
                state.ai.predictionAccuracy = 0.6; // Better prediction
                break;
            case 'hard':
                state.ai.reactionDelay = 6;        // Quick reaction time
                state.ai.maxSpeed = 6;             // Faster, but still beatable
                state.ai.errorFactor = 0.8;        // Smaller errors
                state.ai.predictionAccuracy = 0.8; // Good prediction
                break;
        }
        
        // Reset AI error margin to force recalculation
        state.aiErrorMargin = 0;
        state.aiDecisionTimer = 0;
    }
    
    // Sound initialization
    function initSounds() {
        // Set sound sources - using base64 for simplicity
        sounds.paddle.src = 'data:audio/wav;base64,UklGRl9vAAAXDUlTVHQQAAAEKTBTT05HSE9MRBMAAAAyMDIzLTExLTE2VDExOjI3OjU3TEFCRUYAAAAKAAAKU0ZUSA==';
        sounds.wall.src = 'data:audio/wav;base64,UklGRl9vAAAXDUlTVHQQAAAEKTBTT05HSE9MRBMAAAAyMDIzLTExLTE2VDExOjI3OjU3TEFCRUYAAAAKAAAKU0ZUSA==';
        sounds.score.src = 'data:audio/wav;base64,UklGRl9vAAAXDUlTVHQQAAAEKTBTT05HSE9MRBMAAAAyMDIzLTExLTE2VDExOjI3OjU3TEFCRUYAAAAKAAAKU0ZUSA==';
        sounds.powerup.src = 'data:audio/wav;base64,UklGRl9vAAAXDUlTVHQQAAAEKTBTT05HSE9MRBMAAAAyMDIzLTExLTE2VDExOjI3OjU3TEFCRUYAAAAKAAAKU0ZUSA==';
        sounds.combo.src = 'data:audio/wav;base64,UklGRl9vAAAXDUlTVHQQAAAEKTBTT05HSE9MRBMAAAAyMDIzLTExLTE2VDExOjI3OjU3TEFCRUYAAAAKAAAKU0ZUSA==';
        sounds.levelUp.src = 'data:audio/wav;base64,UklGRl9vAAAXDUlTVHQQAAAEKTBTT05HSE9MRBMAAAAyMDIzLTExLTE2VDExOjI3OjU3TEFCRUYAAAAKAAAKU0ZUSA==';
        sounds.multiball.src = 'data:audio/wav;base64,UklGRl9vAAAXDUlTVHQQAAAEKTBTT05HSE9MRBMAAAAyMDIzLTExLTE2VDExOjI3OjU3TEFCRUYAAAAKAAAKU0ZUSA==';
        
        // Set volume
        Object.values(sounds).forEach(sound => {
            sound.volume = 0.3;
        });
    }
    
    // Play button click event
    playBtn.addEventListener('click', () => {
        startGame();
    });
    
    // Mouse movement for paddle control
    canvas.addEventListener('mousemove', (e) => {
        if (gameRunning) {
            const canvasRect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - canvasRect.top;
            
            // Update paddle position with smoothing and speed modifier
            const targetY = mouseY - (state.paddleHeight / 2);
            const distance = targetY - state.playerY;
            state.playerY += distance * 0.3 * state.playerSpeed;
            
            // Keep paddle within canvas bounds
            if (state.playerY < 0) {
                state.playerY = 0;
            } else if (state.playerY > canvas.height - state.paddleHeight) {
                state.playerY = canvas.height - state.paddleHeight;
            }
        }
    });
    
    // Touch movement for mobile
    canvas.addEventListener('touchmove', (e) => {
        if (gameRunning) {
            e.preventDefault();
            const canvasRect = canvas.getBoundingClientRect();
            const touchY = e.touches[0].clientY - canvasRect.top;
            
            // Update with speed modifier
            const targetY = touchY - (state.paddleHeight / 2);
            const distance = targetY - state.playerY;
            state.playerY += distance * 0.3 * state.playerSpeed;
            
            if (state.playerY < 0) {
                state.playerY = 0;
            } else if (state.playerY > canvas.height - state.paddleHeight) {
                state.playerY = canvas.height - state.paddleHeight;
            }
        }
    }, { passive: false });
    
    // Function to start the game
    function startGame() {
        menu.style.display = 'none';
        gameRunning = true;
        state.gameRunning = true;
        
        // Initialize sounds
        initSounds();
        
        // Reset scores
        state.playerScore = 0;
        state.aiScore = 0;
        updateScoreDisplay();
        
        // Reset game components
        ComboSystem.resetCombo();
        PowerUps.resetPowerUps();
        Progression.resetProgression();
        
        // Update AI difficulty based on selected level
        updateAIDifficulty();
        
        // Reset ball position
        state.balls = [{ 
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: 0,
            dy: 0,
            speed: ballSpeed,
            active: true
        }];
        resetBall(0);
        
        // Reset AI position
        state.aiY = canvas.height / 2 - state.paddleHeight / 2;
        state.aiTargetY = state.aiY;
        state.aiVelocity = 0;
        
        // Start game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Reset ball to center with random direction
    function resetBall(ballIndex = 0) {
        const ball = state.balls[ballIndex];
        if (!ball) return null;
        
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        
        // Randomly set initial direction (left or right)
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        // Set random angle (between -π/4 and π/4)
        const angle = (Math.random() * Math.PI / 2 - Math.PI / 4);
        
        ball.speed = ballSpeed;
        ball.dx = Math.cos(angle) * ball.speed * direction;
        ball.dy = Math.sin(angle) * ball.speed;
        ball.active = true;
        
        return ball;
    }
    
    // Update score display
    function updateScoreDisplay() {
        playerScoreElement.textContent = state.playerScore;
        aiScoreElement.textContent = state.aiScore;
        
        // Update progression with current score and combo multiplier
        Progression.updateProgression(
            state.playerScore, 
            ComboSystem.getComboMultiplier()
        );
    }
    
    // AI movement
    function updateAI() {
        // Only update target position periodically to reduce jitter
        state.aiDecisionTimer++;
        
        // Find the active ball that is closest to scoring on AI
        let targetBall = null;
        let minDistance = Infinity;
        
        for (const ball of state.balls) {
            if (!ball.active) continue;
            
            if (ball.dx > 0) { // Ball moving towards AI
                const timeToReach = (canvas.width - ball.x) / ball.dx;
                if (timeToReach < minDistance) {
                    minDistance = timeToReach;
                    targetBall = ball;
                }
            }
        }
        
        const ballMovingTowardsAI = targetBall !== null;
        
        // Different decision rate based on if ball is coming towards AI
        const decisionRate = ballMovingTowardsAI ?
                            5 : // Update more often when ball is coming towards AI
                            10; // Update less frequently when ball is moving away
        
        // Update target position periodically
        if (state.aiDecisionTimer >= decisionRate) {
            state.aiDecisionTimer = 0;
            
            // Default to center if no ball is moving towards AI
            let targetY = canvas.height / 2;
            
            if (targetBall) {
                // Target position (center of AI paddle to ball y position)
                targetY = targetBall.y;
                
                // Use prediction for better AI at higher difficulties
                if (state.ai.predictionAccuracy > 0) {
                    // Simple prediction of where ball will be when it reaches the AI side
                    const distanceToAI = canvas.width - 30 - state.paddleWidth - targetBall.x;
                    const timeToReach = distanceToAI / Math.abs(targetBall.dx);
                    const predictedY = targetBall.y + targetBall.dy * timeToReach * state.ai.predictionAccuracy;
                    
                    // Blend current position with prediction based on difficulty
                    targetY = (targetY * (1 - state.ai.predictionAccuracy)) +
                            (predictedY * state.ai.predictionAccuracy);
                }
            }
            
            // Only update error margin occasionally for consistent behavior
            if (Math.random() < 0.2) {
                // Scale error margin based on difficulty
                const baseError = 30 * state.ai.errorFactor;
                state.aiErrorMargin = (Math.random() * baseError - baseError/2);
            }
            
            // Apply error to target position
            targetY += state.aiErrorMargin;
            
            // Set AI target (with reaction delay based on difficulty)
            state.aiTargetY = targetY - state.paddleHeight / 2;
        }
        
        // Get current center of paddle
        const paddleCenter = state.aiY + state.paddleHeight / 2;
        
        // Distance to target
        const targetPaddleCenter = state.aiTargetY + state.paddleHeight / 2;
        const diff = targetPaddleCenter - paddleCenter;
        
        // Apply physics-based movement with momentum
        // Calculate target velocity
        const targetVelocity = Math.sign(diff) * Math.min(Math.abs(diff) * 0.2, state.ai.maxSpeed);
        
        // Smooth acceleration towards target velocity (momentum)
        state.aiVelocity = state.aiVelocity * 0.8 + targetVelocity * 0.2;
        
        // Apply velocity to position
        state.aiY += state.aiVelocity;
        
        // Keep paddle within canvas bounds
        if (state.aiY < 0) {
            state.aiY = 0;
            state.aiVelocity = 0; // Stop momentum when hitting boundary
        } else if (state.aiY > canvas.height - state.paddleHeight) {
            state.aiY = canvas.height - state.paddleHeight;
            state.aiVelocity = 0; // Stop momentum when hitting boundary
        }
    }
    
    // Check collisions
    function checkCollisions() {
        // Process each active ball
        for (let b = 0; b < state.balls.length; b++) {
            const ball = state.balls[b];
            if (!ball.active) continue;
            
            // Top and bottom collision
            if (ball.y < state.ballSize / 2 || ball.y > canvas.height - state.ballSize / 2) {
                ball.dy = -ball.dy;
                Renderer.createParticles(ball.x, ball.y, 5);
                PowerUps.playSound('wall');
                
                // Ensure ball stays within bounds
                if (ball.y < state.ballSize / 2) {
                    ball.y = state.ballSize / 2;
                } else if (ball.y > canvas.height - state.ballSize / 2) {
                    ball.y = canvas.height - state.ballSize / 2;
                }
            }
            
            // Player paddle collision
            if (ball.dx < 0 && ball.x < 30 + state.paddleWidth && 
                ball.y > state.playerY && ball.y < state.playerY + state.paddleHeight) {
                
                // Calculate hit position relative to paddle center (gives -0.5 to 0.5)
                const hitPos = (ball.y - (state.playerY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
                
                // Calculate new angle based on hit position
                const angle = hitPos * (Math.PI / 3); // Max ±60 degrees
                
                // Increase ball speed slightly with each hit
                ball.speed = Math.min(ball.speed + 0.2, 15);
                
                // Set new velocity
                ball.dx = Math.cos(angle) * ball.speed;
                ball.dy = Math.sin(angle) * ball.speed;
                
                // Create particles for visual feedback
                Renderer.createParticles(ball.x, ball.y, 10, colors.player);
                PowerUps.playSound('paddle');
                
                // Increment combo
                ComboSystem.incrementCombo();
                
                // Ensure ball is beyond paddle to prevent multiple collisions
                ball.x = 30 + state.paddleWidth + 1;
            }
            
            // AI paddle collision
            if (ball.dx > 0 && ball.x > canvas.width - 30 - state.paddleWidth && 
                ball.y > state.aiY && ball.y < state.aiY + state.paddleHeight) {
                
                // Similar mechanics as player paddle
                const hitPos = (ball.y - (state.aiY + state.paddleHeight / 2)) / (state.paddleHeight / 2);
                const angle = hitPos * (Math.PI / 3);
                
                ball.speed = Math.min(ball.speed + 0.2, 15);
                ball.dx = -Math.cos(angle) * ball.speed;
                ball.dy = Math.sin(angle) * ball.speed;
                
                Renderer.createParticles(ball.x, ball.y, 10, colors.ai);
                PowerUps.playSound('paddle');
                
                ball.x = canvas.width - 30 - state.paddleWidth - 1;
            }
            
            // Check for power-up collisions
            PowerUps.checkPowerUpCollisions(ball);
            
            // Left and right collision (scoring)
            if (ball.x < 0) {
                // AI scores
                // If shield power-up is active, block the score
                const powerUps = PowerUps.getActivePowerUps();
                if (powerUps.shield) {
                    PowerUps.deactivatePowerUp('shield');
                    resetBall(b);
                    Renderer.createParticles(0, ball.y, 15, colors.powerUps.shield);
                } else {
                    state.aiScore++;
                    updateScoreDisplay();
                    Renderer.createParticles(ball.x, ball.y, 20, colors.ai);
                    PowerUps.playSound('score');
                    
                    // Reset combo
                    ComboSystem.resetCombo();
                    
                    // If last ball, reset game
                    if (state.balls.filter(b => b.active).length <= 1) {
                        resetBall(b);
                    } else {
                        // Just deactivate this ball
                        ball.active = false;
                    }
                }
            } else if (ball.x > canvas.width) {
                // Player scores
                state.playerScore++;
                updateScoreDisplay();
                Renderer.createParticles(ball.x, ball.y, 20, colors.player);
                PowerUps.playSound('score');
                
                // If last ball, reset game
                if (state.balls.filter(b => b.active).length <= 1) {
                    resetBall(b);
                } else {
                    // Just deactivate this ball
                    ball.active = false;
                }
            }
        }
        
        // Clean up inactive balls, but always keep at least one
        if (state.balls.every(b => !b.active)) {
            resetBall(0);
        }
    }
    
    // Update game state
    function update(deltaTime) {
        if (!gameRunning) return;
        
        // Skip game updates if visual novel is active
        if (VisualNovel.isVisualNovelActive()) return;
        
        // Update each active ball
        state.balls.forEach(ball => {
            if (ball.active) {
                // Update ball position
                ball.x += ball.dx;
                ball.y += ball.dy;
            }
        });
        
        // Check for collisions
        checkCollisions();
        
        // Update AI paddle
        updateAI();
        
        // Update particles
        Renderer.updateParticles();
        
        // Update power-ups
        PowerUps.updatePowerUps(deltaTime);
        
        // Update combo
        ComboSystem.updateCombo();
        
        // Update renderer references (for combo/power-up display)
        Renderer.setGameReferences(
            PowerUps.getPowerUps(),
            PowerUps.getActivePowerUps(),
            ComboSystem.getComboCount(),
            ComboSystem.getComboMultiplier(),
            ComboSystem.getComboDisplayTimer(),
            Progression.getPlayerLevel(),
            Progression.getExperiencePoints(),
            Progression.getExperienceToNextLevel()
        );
    }
    
    // Game loop
    function gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Update game state
        update(deltaTime);
        
        // Draw game
        Renderer.draw();
        
        // Request next frame
        requestAnimationFrame(gameLoop);
    }
    
    // Initial draw
    Renderer.draw();
    
    // Update AI parameters based on default difficulty
    updateAIDifficulty();
});
