// Combo System Module
// Handles combo tracking, multipliers, and related effects

// Private module variables
let state;
let sounds;

// Combo system variables
let comboCount = 0;
let comboMultiplier = 1;
let comboTimer = 0;
let comboDisplayTimer = 0;
const comboTimerMax = 180; // 3 seconds at 60fps

// Initialize the combo module
export function initCombo(gameState, gameSounds) {
    state = gameState;
    sounds = gameSounds;
}

// Increment combo counter
export function incrementCombo() {
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
    
    // Apply screen shake based on combo
    if (comboCount >= 3) {
        state.screenShake = Math.min(comboCount / 2, 10);
    }
}

// Reset combo counter
export function resetCombo() {
    comboCount = 0;
    comboMultiplier = 1;
    comboTimer = 0;
}

// Update combo timer
export function updateCombo() {
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

// Get current combo count
export function getComboCount() {
    return comboCount;
}

// Get current combo multiplier
export function getComboMultiplier() {
    return comboMultiplier;
}

// Get combo display timer
export function getComboDisplayTimer() {
    return comboDisplayTimer;
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