// Visual Novel Module
// Handles story segments between levels

// Private module variables
let state;
let currentLevel = 0;
let visualNovelActive = false;
let currentScene = 0;
let container;

// Story content - a love triangle between paddles and ball-chan
const story = [
    // Level 1 story
    [
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'determined',
            text: "I've been practicing my moves for years. Today's the tournament where I'll finally confess my feelings to Ball-chan!",
            choices: null
        },
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'surprised',
            text: "Wait, who's that paddle on the other side? I've never seen them before...",
            choices: null
        },
        {
            background: 'linear-gradient(to left, #00ffff, #0a0a0a)',
            character: 'right-paddle',
            emotion: 'confident',
            text: "The name's Blue. I'm the new champion from the east server. I'm here for the trophy... and maybe something more.",
            choices: null
        },
        {
            background: 'radial-gradient(circle, #FFCBA4, #0a0a0a)',
            character: 'ball-chan',
            emotion: 'cheerful',
            text: "It's so exciting to have two skilled paddles in today's match! May the best paddle win~",
            choices: null
        },
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'determined',
            text: "I won't lose to you, Blue. Not in the game, and not for Ball-chan's heart!",
            choices: null
        },
        {
            background: 'linear-gradient(to left, #00ffff, #0a0a0a)',
            character: 'right-paddle',
            emotion: 'smirk',
            text: "Game on, Pink. Let's see who's worthy of Ball-chan's affection.",
            choices: null
        }
    ],

    // Level 2 story
    [
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'tired',
            text: "That was an intense first round. I need to step up my game.",
            choices: null
        },
        {
            background: 'radial-gradient(circle, #FFCBA4, #0a0a0a)',
            character: 'ball-chan',
            emotion: 'impressed',
            text: "Wow, you both played so well! Pink-sama, your reflexes are amazing!",
            choices: null
        },
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'happy',
            text: "Th-thank you, Ball-chan! I've been practicing just for you!",
            choices: null
        },
        {
            background: 'linear-gradient(to left, #00ffff, #0a0a0a)',
            character: 'right-paddle',
            emotion: 'jealous',
            text: "Ball-chan, did you notice how I kept you safe from going out of bounds?",
            choices: null
        },
        {
            background: 'radial-gradient(circle, #FFCBA4, #0a0a0a)',
            character: 'ball-chan',
            emotion: 'thoughtful',
            text: "You're both so attentive... It's hard to choose which technique I like better.",
            choices: null
        },
        {
            background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
            character: null,
            emotion: null,
            text: "As the rivalry intensifies, both paddles become even more determined to win Ball-chan's heart!",
            choices: null
        }
    ],

    // Level 3 story
    [
        {
            background: 'linear-gradient(to left, #00ffff, #0a0a0a)',
            character: 'right-paddle',
            emotion: 'serious',
            text: "I've been watching your technique, Pink. You're not bad... but I have something to confess.",
            choices: null
        },
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'suspicious',
            text: "What is it, Blue? Trying to distract me before the final match?",
            choices: null
        },
        {
            background: 'linear-gradient(to left, #00ffff, #0a0a0a)',
            character: 'right-paddle',
            emotion: 'vulnerable',
            text: "The truth is... I only entered this tournament because I saw you playing last season. Your passion inspired me.",
            choices: null
        },
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'shocked',
            text: "Wait... what? You're my... fan?",
            choices: null
        },
        {
            background: 'radial-gradient(circle, #FFCBA4, #0a0a0a)',
            character: 'ball-chan',
            emotion: 'excited',
            text: "This is getting interesting! The tension between you two is making my pixels flutter!",
            choices: [
                "Focus on winning the game",
                "Ask Blue about their feelings"
            ]
        },
        {
            background: 'linear-gradient(to right, #ff00ff, #0a0a0a)',
            character: 'left-paddle',
            emotion: 'determined',
            text: "Let's settle this in the game. The winner gets to take Ball-chan to the victory celebration!",
            choices: null
        },
        {
            background: 'linear-gradient(to left, #00ffff, #0a0a0a)',
            character: 'right-paddle',
            emotion: 'competitive',
            text: "You're on! But don't be too disappointed when you lose!",
            choices: null
        },
        {
            background: 'radial-gradient(circle, #FFCBA4, #0a0a0a)',
            character: 'ball-chan',
            emotion: 'heart-eyes',
            text: "May the best paddle win my heart! <3",
            choices: null
        }
    ]
];

// Initialize the visual novel module
export function initVisualNovel(gameState, gameContainer) {
    state = gameState;
    container = gameContainer;
    createVisualNovelElements();
}

// Create all needed elements for the visual novel
function createVisualNovelElements() {
    const vnContainer = document.createElement('div');
    vnContainer.className = 'visual-novel-container';
    
    const vnBackground = document.createElement('div');
    vnBackground.className = 'vn-background';
    
    const vnCharacter = document.createElement('div');
    vnCharacter.className = 'vn-character';
    
    const vnDialogBox = document.createElement('div');
    vnDialogBox.className = 'vn-dialog-box';
    
    const vnCharName = document.createElement('div');
    vnCharName.className = 'vn-char-name';
    
    const vnText = document.createElement('div');
    vnText.className = 'vn-text';
    
    const vnChoices = document.createElement('div');
    vnChoices.className = 'vn-choices';
    
    const vnContinue = document.createElement('div');
    vnContinue.className = 'vn-continue';
    vnContinue.innerHTML = 'Click to continue <span class="vn-arrow">▼</span>';
    
    // Add event listener for continuing
    vnContainer.addEventListener('click', advanceStory);
    
    // Assemble the structure
    vnDialogBox.appendChild(vnCharName);
    vnDialogBox.appendChild(vnText);
    vnDialogBox.appendChild(vnChoices);
    vnDialogBox.appendChild(vnContinue);
    
    vnContainer.appendChild(vnBackground);
    vnContainer.appendChild(vnCharacter);
    vnContainer.appendChild(vnDialogBox);
    
    // Initially hide the container
    vnContainer.style.display = 'none';
    
    // Add to DOM
    container.appendChild(vnContainer);
}

// Show the visual novel segment for current level
export function showVisualNovel(level) {
    // Only show visual novel for first 3 levels
    if (level > 3) return false;
    
    // Don't show if already seen for this level
    if (level <= currentLevel) return false;
    
    currentLevel = level;
    currentScene = 0;
    visualNovelActive = true;
    
    // Get references to elements
    const vnContainer = document.querySelector('.visual-novel-container');
    
    // Make sure VN starts with game paused
    state.gameRunning = false;
    
    // Show the visual novel
    vnContainer.style.display = 'flex';
    
    // Display first scene
    displayScene(story[level-1][0]);
    
    return true;
}

// Display a scene
function displayScene(scene) {
    // Get references to elements
    const vnBackground = document.querySelector('.vn-background');
    const vnCharacter = document.querySelector('.vn-character');
    const vnCharName = document.querySelector('.vn-char-name');
    const vnText = document.querySelector('.vn-text');
    const vnChoices = document.querySelector('.vn-choices');
    const vnContinue = document.querySelector('.vn-continue');
    
    // Set background
    vnBackground.style.background = scene.background;
    
    // Set character
    if (scene.character) {
        vnCharacter.style.display = 'block';
        vnCharacter.className = 'vn-character';
        vnCharacter.classList.add(`char-${scene.character}`);
        
        // Add image based on character
        let imagePath = '';
        switch(scene.character) {
            case 'left-paddle': imagePath = 'vn_Player.png'; break;
            case 'right-paddle': imagePath = 'vn_Rival.png'; break;
            case 'ball-chan': imagePath = 'vn_ballChan.png'; break;
        }
        
        // Set background image
        vnCharacter.style.backgroundImage = `url('${imagePath}')`;
        vnCharacter.style.backgroundSize = 'contain';
        vnCharacter.style.backgroundPosition = 'center';
        vnCharacter.style.backgroundRepeat = 'no-repeat';
        
        if (scene.emotion) {
            vnCharacter.classList.add(`emotion-${scene.emotion}`);
        }
        
        // Set character name
        let charDisplayName = "";
        switch(scene.character) {
            case 'left-paddle': charDisplayName = "Pink"; break;
            case 'right-paddle': charDisplayName = "Blue"; break;
            case 'ball-chan': charDisplayName = "Ball-chan"; break;
        }
        vnCharName.textContent = charDisplayName;
        vnCharName.style.display = 'block';
    } else {
        vnCharacter.style.display = 'none';
        vnCharName.style.display = 'none';
    }
    
    // Set text with typing effect
    typeText(vnText, scene.text);
    
    // Handle choices
    if (scene.choices) {
        vnChoices.innerHTML = '';
        vnContinue.style.display = 'none';
        
        scene.choices.forEach((choice, index) => {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = 'vn-choice-btn';
            choiceBtn.textContent = choice;
            choiceBtn.dataset.choiceIndex = index;
            
            choiceBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the container click
                handleChoice(parseInt(e.target.dataset.choiceIndex));
            });
            
            vnChoices.appendChild(choiceBtn);
        });
        
        vnChoices.style.display = 'flex';
    } else {
        vnChoices.style.display = 'none';
        vnContinue.style.display = 'block';
    }
}

// Type text with animation
function typeText(element, text, speed = 30) {
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Handle choice selection
function handleChoice(choiceIndex) {
    // In this simple version, choices don't affect the story much
    // But in a more complex VN, this would affect story branching
    advanceStory();
}

// Advance to next scene
function advanceStory() {
    const currentLevelStory = story[currentLevel-1];
    currentScene++;
    
    if (currentScene >= currentLevelStory.length) {
        // End of scenes for this level
        endVisualNovel();
    } else {
        // Show next scene
        displayScene(currentLevelStory[currentScene]);
    }
}

// End the visual novel and return to game
function endVisualNovel() {
    visualNovelActive = false;
    const vnContainer = document.querySelector('.visual-novel-container');
    vnContainer.style.display = 'none';
    
    // Resume game
    state.gameRunning = true;
}

// Check if visual novel is currently active
export function isVisualNovelActive() {
    return visualNovelActive;
}
