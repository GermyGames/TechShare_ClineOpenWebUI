// Renderer Module
// Handles all drawing and visual effects

// Private module variables
let canvas;
let ctx;
let state;
let colors;
let powerUps;
let activePowerUps;
let comboCount;
let comboMultiplier;
let comboDisplayTimer;
let playerLevel;
let experiencePoints;
let experienceToNextLevel;

// Particle systems
let particles = [];
let trailParticles = [];

// Initialize the renderer with required references
export function initRenderer(gameCanvas, gameState, gameColors) {
    canvas = gameCanvas;
    ctx = canvas.getContext('2d');
    state = gameState;
    colors = gameColors;
}

// Set references to game state needed for rendering
export function setGameReferences(gamePowerUps, gameActivePowerUps, gameComboCount,
                            gameComboMultiplier, gameComboDisplayTimer,
                            gamePlayerLevel, gameExpPoints, gameExpToNextLevel) {
    powerUps = gamePowerUps;
    activePowerUps = gameActivePowerUps;
    comboCount = gameComboCount;
    comboMultiplier = gameComboMultiplier;
    comboDisplayTimer = gameComboDisplayTimer;
    playerLevel = gamePlayerLevel;
    experiencePoints = gameExpPoints;
    experienceToNextLevel = gameExpToNextLevel;
}

// Create particles for visual effects
export function createParticles(x, y, count, color = null) {
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
export function createTrailParticle(ball) {
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
export function updateParticles() {
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
    if (state.gameRunning && Math.random() > 0.5) {
        state.balls.forEach(ball => {
            if (ball.active) {
                createTrailParticle(ball);
            }
        });
    }
}

// Draw particles
export function drawParticles() {
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

// Draw power-ups
export function drawPowerUps() {
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

// Draw active power-up indicators
export function drawPowerUpIndicators() {
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
        const timerWidth = iconSize * (data.duration / data.maxDuration);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(offsetX, 10 + iconSize, timerWidth, 3);
        
        // Move to next icon position
        offsetX += iconSize + spacing;
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Draw combo counter
export function drawComboCounter() {
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
export function drawLevelInfo() {
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

// Apply screen shake effect
export function applyScreenShake() {
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

// Main draw function
export function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply screen shake
    ctx.save();
    applyScreenShake();
    
    // Draw particles (underneath everything)
    drawParticles();
    
    // Draw power-ups
    drawPowerUps();
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    // Player paddle with glow
    ctx.shadowColor = colors.player;
    ctx.shadowBlur = 15;
    ctx.fillStyle = colors.player;
    ctx.fillRect(30, state.playerY, state.paddleWidth, state.paddleHeight);
    
    // AI paddle with glow
    ctx.shadowColor = colors.ai;
    ctx.fillStyle = colors.ai;
    ctx.fillRect(canvas.width - 30 - state.paddleWidth, state.aiY, state.paddleWidth, state.paddleHeight);
    
    // Draw all active balls with glow
    ctx.shadowColor = colors.ball;
    ctx.fillStyle = colors.ball;
    
    state.balls.forEach(ball => {
        if (ball.active) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, state.ballSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Reset shadow for performance
    ctx.shadowBlur = 0;
    
    // Draw power-up indicators
    drawPowerUpIndicators();
    
    // Draw combo counter
    drawComboCounter();
    
    // Draw level info
    drawLevelInfo();
    
    // Restore context after screen shake
    ctx.restore();
}

// Show level up message
export function showLevelUpMessage(level) {
    // Create a level-up DOM element
    const levelUpMsg = document.createElement('div');
    levelUpMsg.className = 'level-up-message';
    levelUpMsg.textContent = `LEVEL ${level}!`;
    document.querySelector('.container').appendChild(levelUpMsg);
    
    // Add animation class
    setTimeout(() => levelUpMsg.classList.add('show'), 10);
    
    // Remove after animation
    setTimeout(() => {
        levelUpMsg.classList.remove('show');
        setTimeout(() => levelUpMsg.remove(), 500);
    }, 2000);
}