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
    let particles = [];
    let trailParticles = [];
    
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
    
    // Power-up variables
    let powerUps = [];
    let activePowerUps = {};
    let powerUpTimer = 0;
    const powerUpDuration = 300; // 5 seconds at 60fps
    
    // Combo system variables
    let comboCount = 0;
    let comboMultiplier = 1;
    let comboTimer = 0;
    const comboTimerMax = 180; // 3 seconds at 60fps
    let comboDisplayTimer = 0;
    
    // Progression system variables
    let playerLevel = 1;
    let totalScore = 0;
    let experiencePoints = 0;
    let experienceToNextLevel = 1000;
    let unlockedSkins = ['default'];
    let currentSkin = 'default';
    let highScores = [];
    
    // Game state
    const state = {
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
    
    // Define available power-up types
    const powerUpTypes = ['paddleSize', 'slowBall', 'multiBall', 'speedBoost', 'shield'];
    
    // Define power-up effects
    const powerUpEffects = {
        paddleSize: () => {
            state.paddleHeight = 150; // Increase paddle size
            return () => { state.paddleHeight = 100; }; // Reset function
        },
        slowBall: () => {
            state.balls.forEach(ball => {
                ball.speed *= 0.7; // Slow down ball speed
                ball.dx *= 0.7;
                ball.dy *= 0.7;
            });
            return () => {
                state.balls.forEach(ball => {
                    ball.speed /= 0.7; // Reset ball speed
                    ball.dx /= 0.7;
                    ball.dy /= 0.7;
                });
            };
        },
        multiBall: () => {
            // Add two additional balls
            for (let i = 0; i < 2; i++) {
                createNewBall();
            }
            playSound('multiball');
            return () => {
                // Remove extra balls on deactivation
                if (state.balls.length > 1) {
                    state.balls = [state.balls[0]];
                }
            };
        },
        speedBoost: () => {
            state.playerSpeed = 1.5; // Increase player paddle speed
            return () => { state.playerSpeed = 1.0; }; // Reset function
        },
        shield: () => {
            // No immediate effect, shield will block one score
            return () => { /* No reset needed */ };
        }
    };
    
    // Set up difficulty selection
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            difficultyButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set ball speed based on data attribute
            ballSpeed = parseInt(btn.dataset.speed);
            
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
    
    // Load high scores from local storage
    function loadHighScores() {
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
    }
    
    // Save high scores to local storage
    function saveHighScores() {
        localStorage.setItem('pongHighScores', JSON.stringify(highScores));
    }
    
    // Add a new high score
    function addHighScore(score) {
        const name = prompt('You got a high score! Enter your name (3 characters):');
        const validName = name ? name.substring(0, 3).toUpperCase() : 'AAA';
        
        highScores.push({ name: validName, score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 5); // Keep only top 5
        
        saveHighScores();
    }
    
    // Check if score is a high score
    function isHighScore(score) {
        return highScores.length < 5 || score > highScores[highScores.length - 1].score;
    }
    
    // Function to start the game
    function startGame() {
        menu.style.display = 'none';
        gameRunning = true;
        
        // Initialize sounds
        initSounds();
        
        // Load high scores
        loadHighScores();
        
        // Reset scores
        state.playerScore = 0;
        state.aiScore = 0;
        updateScoreDisplay();
        
        // Reset game stats
        comboCount = 0;
        comboMultiplier = 1;
        comboTimer = 0;
        totalScore = 0;
        experiencePoints = 0;
        playerLevel = 1;
        experienceToNextLevel = 1000;
        
        // Reset power-ups
        powerUps = [];
        activePowerUps = {};
        powerUpTimer = 0;
        
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
        const ball = state.balls[ballIndex] || createNewBall();
        
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
    
    // Create a new ball (for multi-ball power-up)
    function createNewBall() {
        const newBall = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: 0,
            dy: 0,
            speed: ballSpeed,
            active: true
        };
        state.balls.push(newBall);
        return newBall;
    }
    
    // Update score display
    function updateScoreDisplay() {
        playerScoreElement.textContent = state.playerScore;
        aiScoreElement.textContent = state.aiScore;
        
        // Update total score and check for level up
        updateProgression();
    }
    
    // Update player progression
    function updateProgression() {
        // Calculate total score based on player score and combo multiplier
        const scoreWithCombo = state.playerScore * 100 * comboMultiplier;
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
            createParticles(canvas.width / 2, canvas.height / 2, 30);
            playSound('levelUp');
            
            // Show level up message
            showLevelUpMessage();
        }
    }
    
    // Show level up message
    function showLevelUpMessage() {
        // Create a level-up DOM element
        const levelUpMsg = document.createElement('div');
        levelUpMsg.className = 'level-up-message';
        levelUpMsg.textContent = `LEVEL ${playerLevel}!`;
        document.querySelector('.container').appendChild(levelUpMsg);
        
        // Add animation class
        setTimeout(() => levelUpMsg.classList.add('show'), 10);
        
        // Remove after animation
        setTimeout(() => {
            levelUpMsg.classList.remove('show');
            setTimeout(() => levelUpMsg.remove(), 500);
        }, 2000);
    }
    
    // AI movement
    function updateAI() {
        // Only update target position periodically to reduce jitter
        state.aiDecisionTimer++;
        
        // Ball is moving right (towards AI)
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
                createParticles(ball.x, ball.y, 5);
                playSound('wall');
                
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
                createParticles(ball.x, ball.y, 10, colors.player);
                playSound('paddle');
                
                // Increment combo
                incrementCombo();
                
                // Ensure ball is beyond paddle to prevent multiple collisions
                ball.x = 30 + state.paddleWidth + 1;
                
                // Apply screen shake based on combo
                if (comboCount >= 3) {
                    state.screenShake = Math.min(comboCount / 2, 10);
                }
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
                
                createParticles(ball.x, ball.y, 10, colors.ai);
                playSound('paddle');
                
                ball.x = canvas.width - 30 - state.paddleWidth - 1;
            }
            
            // Check for power-up collisions
            for (let i = powerUps.length - 1; i >= 0; i--) {
                const powerUp = powerUps[i];
                const dx = ball.x - powerUp.x;
                const dy = ball.y - powerUp.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < state.ballSize / 2 + powerUp.size / 2) {
                    // Activate power-up
                    activatePowerUp(powerUp.type);
                    
                    // Create particles and play sound
                    createParticles(powerUp.x, powerUp.y, 15, colors.powerUps[powerUp.type]);
                    playSound('powerup');
                    
                    // Remove power-up
                    powerUps.splice(i, 1);
                }
            }
            
            // Left and right collision (scoring)
            if (ball.x < 0) {
                // AI scores
                // If shield power-up is active, block the score
                if (activePowerUps.shield) {
                    deactivatePowerUp('shield');
                    resetBall(b);
                    createParticles(0, ball.y, 15, colors.powerUps.shield);
                } else {
                    state.aiScore++;
                    updateScoreDisplay();
                    createParticles(ball.x, ball.y, 20, colors.ai);
                    playSound('score');
                    
                    // Reset combo
                    resetCombo();
                    
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
                createParticles(ball.x, ball.y, 20, colors.player);
                playSound('score');
                
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
    
    // Create particles for visual effects
    function createParticles(x, y, count, color = null) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            const size = Math.random() * 4 + 2;
            const life = Math.random() * 30 + 20;
            
            // Use provided color or random from trail colors
            const particleColor = color || colors.trail[Math.floor(Math.random() * colors.trail.length)];
            
            particles.push({
                x,
                y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size,
                color: particleColor,
                life,
                alpha: 1
            });
        }
    }
    
    // Create ball trail particles
    function createTrailParticle(ball) {
        trailParticles.push({
            x: ball.x,
            y: ball.y,
            size: state.ballSize * (0.5 + Math.random() * 0.3),
            color: colors.trail[Math.floor(Math.random() * colors.trail.length)],
            life: 20,
            alpha: 0.7
        });
    }
    
    // Update particles
    function updateParticles() {
        // Update explosion particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.dx;
            p.y += p.dy;
            p.life--;
            p.alpha = p.life / 50;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // Update trail particles
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const p = trailParticles[i];
            p.life--;
            p.alpha = p.life / 20;
            p.size *= 0.95;
            
            if (p.life <= 0) {
                trailParticles.splice(i, 1);
            }
        }
        
        // Create new trail particles for each active ball
        if (gameRunning && Math.random() > 0.5) {
            state.balls.forEach(ball => {
                if (ball.active) {
                    createTrailParticle(ball);
                }
            });
        }
    }
    
    // Update power-ups
    function updatePowerUps(deltaTime) {
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
    function activatePowerUp(type) {
        // If already active, extend duration
        if (activePowerUps[type]) {
            activePowerUps[type].duration = powerUpDuration;
            return;
        }
        
        // Call the effect function and store the reset function
        const resetFunction = powerUpEffects[type]();
        
        // Store power-up data
        activePowerUps[type] = {
            duration: powerUpDuration,
            resetFunction
        };
    }
    
    // Deactivate a power-up
    function deactivatePowerUp(type) {
        if (activePowerUps[type]) {
            // Call the reset function
            if (activePowerUps[type].resetFunction) {
                activePowerUps[type].resetFunction();
            }
            
            // Remove from active power-ups
            delete activePowerUps[type];
        }
    }
    
    // Increment combo counter
    function incrementCombo() {
        comboCount++;
        comboTimer = comboTimerMax;
        comboDisplayTimer = 60; // Show combo for 1 second
        
        // Update combo multiplier: 1x, 1.5x, 2x, 3x, 5x
        if (comboCount >= 15) {
            comboMultiplier = 5;
        } else if (comboCount >= 10) {
            comboMultiplier = 3;
        } else if (comboCount >= 5) {
            comboMultiplier = 2;
        } else if (comboCount >= 3) {
            comboMultiplier = 1.5;
        } else {
            comboMultiplier = 1;
        }
        
        // Play combo sound at certain thresholds
        if (comboCount === 3 || comboCount === 5 || comboCount === 10 || comboCount === 15) {
            playSound('combo');
        }
    }
    
    // Reset combo counter
    function resetCombo() {
        comboCount = 0;
        comboMultiplier = 1;
        comboTimer = 0;
    }
    
    // Update combo timer
    function updateCombo() {
        if (comboTimer > 0) {
            comboTimer--;
            if (comboTimer <= 0) {
                resetCombo();
            }
        }
        
        if (comboDisplayTimer > 0) {
            comboDisplayTimer--;
        }
    }
    
    // Draw particles
    function drawParticles() {
        // Draw trail particles first (under everything)
        trailParticles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset alpha for other drawings
        ctx.globalAlpha = 1;
        
        // Draw explosion particles
        particles.forEach(p => {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset alpha for other drawings
        ctx.globalAlpha = 1;
    }
    
    // Draw power-ups
    function drawPowerUps() {
        powerUps.forEach(powerUp => {
            // Save context for rotation
            ctx.save();
            
            // Translate to power-up center, apply float offset
            ctx.translate(powerUp.x, powerUp.y + powerUp.floatOffset);
            
            // Rotate
            ctx.rotate(powerUp.rotation);
            
            // Draw power-up
            ctx.fillStyle = colors.powerUps[powerUp.type];
            ctx.shadowColor = colors.powerUps[powerUp.type];
            ctx.shadowBlur = 15;
            
            // Different shapes for different power-ups
            switch(powerUp.type) {
                case 'paddleSize':
                    // Rectangle for paddle size
                    ctx.fillRect(-powerUp.size/2, -powerUp.size/2, powerUp.size, powerUp.size);
                    break;
                case 'slowBall':
                    // Hexagon for slow ball
                    drawPolygon(ctx, 0, 0, powerUp.size/2, 6);
                    break;
                case 'multiBall':
                    // Triangle for multi-ball
                    drawPolygon(ctx, 0, 0, powerUp.size/2, 3);
                    break;
                case 'speedBoost':
                    // Pentagon for speed boost
                    drawPolygon(ctx, 0, 0, powerUp.size/2, 5);
                    break;
                case 'shield':
                    // Circle for shield
                    ctx.beginPath();
                    ctx.arc(0, 0, powerUp.size/2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
            
            // Restore context
            ctx.restore();
        });
        
        // Reset shadow for performance
        ctx.shadowBlur = 0;
    }
    
    // Helper function to draw regular polygons
    function drawPolygon(ctx, x, y, radius, sides) {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = i * 2 * Math.PI / sides;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw active power-up indicators
    function drawPowerUpIndicators() {
        const iconSize = 30;
        const spacing = 10;
        let offsetX = 10;
        
        for (const [type, data] of Object.entries(activePowerUps)) {
            // Draw icon background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(offsetX, 10, iconSize, iconSize);
            
            // Draw icon
            ctx.fillStyle = colors.powerUps[type];
            ctx.shadowColor = colors.powerUps[type];
            ctx.shadowBlur = 10;
            
            // Center of icon
            const centerX = offsetX + iconSize / 2;
            const centerY = 10 + iconSize / 2;
            
            // Draw different shapes for different power-ups
            switch(type) {
                case 'paddleSize':
                    ctx.fillRect(centerX - iconSize/4, centerY - iconSize/4, iconSize/2, iconSize/2);
                    break;
                case 'slowBall':
                    drawPolygon(ctx, centerX, centerY, iconSize/4, 6);
                    break;
                case 'multiBall':
                    drawPolygon(ctx, centerX, centerY, iconSize/4, 3);
                    break;
                case 'speedBoost':
                    drawPolygon(ctx, centerX, centerY, iconSize/4, 5);
                    break;
                case 'shield':
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, iconSize/4, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
            
            // Draw timer bar
            const timerWidth = iconSize * (data.duration / powerUpDuration);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(offsetX, 10 + iconSize, timerWidth, 3);
            
            // Move to next icon position
            offsetX += iconSize + spacing;
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
    
    // Draw combo counter
    function drawComboCounter() {
        if (comboCount >= 2 && comboDisplayTimer > 0) {
            const comboText = `${comboCount}x COMBO!`;
            const multiplierText = `${comboMultiplier}x SCORE`;
            
            // Determine color based on combo count
            let colorIndex = 0;
            if (comboCount >= 15) colorIndex = 4;
            else if (comboCount >= 10) colorIndex = 3;
            else if (comboCount >= 5) colorIndex = 2;
            else if (comboCount >= 3) colorIndex = 1;
            
            const comboColor = colors.combo[colorIndex];
            
            // Calculate size and position
            const size = Math.min(40 + comboCount * 2, 80);
            const y = canvas.height / 2;
            
            // Draw text with glow effect
            ctx.font = `bold ${size}px 'Orbitron', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = comboColor;
            ctx.shadowColor = comboColor;
            ctx.shadowBlur = 15;
            ctx.fillText(comboText, canvas.width / 2, y);
            
            // Draw multiplier text
            ctx.font = `bold ${size/2}px 'Orbitron', sans-serif`;
            ctx.fillText(multiplierText, canvas.width / 2, y + size/2 + 10);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        }
    }
    
    // Draw level and experience bar
    function drawLevelInfo() {
        // Draw level
        ctx.font = `bold 16px 'Orbitron', sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`LEVEL ${playerLevel}`, 10, canvas.height - 20);
        
        // Draw XP bar
        const barWidth = 150;
        const barHeight = 6;
        const filledWidth = barWidth * (experiencePoints / experienceToNextLevel);
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(10, canvas.height - 15, barWidth, barHeight);
        
        // Progress
        ctx.fillStyle = colors.combo[1]; // Green
        ctx.fillRect(10, canvas.height - 15, filledWidth, barHeight);
    }
    
    // Simple sound system
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
    
    // Apply screen shake effect
    function applyScreenShake() {
        if (state.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * state.screenShake * 2;
            const shakeY = (Math.random() - 0.5) * state.screenShake * 2;
            
            ctx.translate(shakeX, shakeY);
            state.screenShake *= 0.9; // Decay the shake effect
            
            if (state.screenShake < 0.5) {
                state.screenShake = 0;
            }
        }
    }
    
    // Game loop
    function gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Update game state
        update(deltaTime);
        
        // Draw game
        draw();
        
        // Request next frame
        requestAnimationFrame(gameLoop);
    }
    
    // Initial draw
    draw();
});
