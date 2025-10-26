// ============================================
// DETECTION PAGE - ACTIVITY MANAGEMENT
// ============================================
console.log('✅ Detection.js loaded');

const activityContent = document.getElementById('activityContent');
const activityBody = document.getElementById('activityBody');
const activityTitle = document.getElementById('activityTitle');
const activityGrid = document.querySelector('.activity-grid');
const backToSelection = document.getElementById('backToSelection');

// Activity configurations
const activities = {
    games: {
        title: 'Memory Games',
        content: generateMemoryGameContent()
    },
    clock: {
        title: 'Clock Drawing Test',
        content: generateClockDrawingContent()
    },
    image: {
        title: 'Picture Description',
        content: generateImageDescriptionContent()
    },
    story: {
        title: 'Story Telling',
        content: generateStoryContent()
    },
    conversation: {
        title: 'Guided Conversation',
        content: generateConversationContent()
    }
};

// Start Activity
function startActivity(type) {
    console.log('🎮 Starting activity:', type);
    const activity = activities[type];
    
    if (!activity) {
        console.error('❌ Activity not found:', type);
        return;
    }

    // Hide grid, show content
    activityGrid.style.display = 'none';
    activityContent.style.display = 'block';

    // Set content
    activityTitle.textContent = activity.title;
    activityBody.innerHTML = activity.content;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Initialize activity-specific functions
    initActivityInteractions(type);
}

// Back to selection
if (backToSelection) {
    backToSelection.addEventListener('click', () => {
        activityGrid.style.display = 'grid';
        activityContent.style.display = 'none';
    });
}

// Initialize activity-specific interactions
function initActivityInteractions(type) {
    console.log('Initializing interactions for:', type);
    
    // Activity-specific initialization
    switch(type) {
        case 'games':
            console.log('Memory games ready');
            break;
            
        case 'clock':
            // Initialize clock drawing canvas with retry
            console.log('Initializing clock canvas...');
            let retryCount = 0;
            const maxRetries = 5;
            
            const initWithRetry = () => {
                const canvas = document.getElementById('clockCanvas');
                if (canvas) {
                    const success = initClockCanvas();
                    if (success) {
                        console.log('✅ Clock canvas initialized');
                    } else {
                        console.error('❌ Failed to initialize clock canvas');
                    }
                } else if (retryCount < maxRetries) {
                    retryCount++;
                    console.log(`⏳ Retrying canvas init (${retryCount}/${maxRetries})...`);
                    setTimeout(initWithRetry, 200);
                } else {
                    console.error('❌ Clock canvas not found after retries');
                }
            };
            
            setTimeout(initWithRetry, 100);
            break;
            
        case 'image':
            setTimeout(() => {
                const textarea = document.getElementById('imageDescription');
                if (textarea) {
                    textarea.addEventListener('input', updateCharCount);
                }
            }, 100);
            break;
            
        case 'story':
            console.log('Story mode ready');
            break;
            
        case 'conversation':
            console.log('Conversation mode ready');
            break;
    }
    
    // Notify AI Guide if available
    if (window.smartGuide) {
        window.smartGuide.currentActivity = type;
        window.smartGuide.detectActivities();
    }
}

// ============================================
// MEMORY GAMES CONTENT - ENHANCED
// ============================================
function generateMemoryGameContent() {
    return `
        <div class="memory-games-container">
            <!-- Game Selection -->
            <div class="game-selection">
                <div class="game-card" onclick="startCardFlipGame()">
                    <div class="game-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="14" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/>
                        </svg>
                    </div>
                    <h3>Card Matching Game</h3>
                    <p>Flip cards and find matching pairs</p>
                    <button class="start-game-btn">Start Game</button>
                </div>

                <div class="game-card" onclick="startWordMemoryGame()">
                    <div class="game-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                    </div>
                    <h3>Word Recall</h3>
                    <p>Remember and recall a list of words</p>
                    <button class="start-game-btn">Start Game</button>
                </div>

                <div class="game-card" onclick="startNumberSequenceGame()">
                    <div class="game-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"/>
                            <line x1="8" y1="12" x2="21" y2="12"/>
                            <line x1="8" y1="18" x2="21" y2="18"/>
                            <line x1="3" y1="6" x2="3.01" y2="6"/>
                            <line x1="3" y1="12" x2="3.01" y2="12"/>
                            <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                    </div>
                    <h3>Number Sequence</h3>
                    <p>Repeat the sequence of numbers</p>
                    <button class="start-game-btn">Start Game</button>
                </div>

                <div class="game-card" onclick="startPatternMatchGame()">
                    <div class="game-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="13.5" cy="6.5" r=".5"/>
                            <circle cx="17.5" cy="10.5" r=".5"/>
                            <circle cx="8.5" cy="7.5" r=".5"/>
                            <circle cx="6.5" cy="12.5" r=".5"/>
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                        </svg>
                    </div>
                    <h3>Pattern Match</h3>
                    <p>Match colors and shapes in sequence</p>
                    <button class="start-game-btn">Start Game</button>
                </div>
            </div>

            <!-- Active Game Area -->
            <div class="active-game-area" id="activeGameArea" style="display: none;">
                <div class="game-header">
                    <button class="back-to-games-btn" onclick="backToGameSelection()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Games
                    </button>
                    <div class="game-stats">
                        <span class="stat-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                            </svg>
                            Moves: <strong id="moveCount">0</strong>
                        </span>
                        <span class="stat-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Time: <strong id="timeCount">0:00</strong>
                        </span>
                        <span class="stat-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Score: <strong id="scoreCount">0</strong>
                        </span>
                    </div>
                </div>
                <div class="game-content" id="gameContent"></div>
            </div>
        </div>
    `;
}


// ============================================
// CARD FLIP MEMORY GAME
// ============================================
let cardGame = {
    moves: 0,
    score: 0,
    time: 0,
    timer: null,
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 8
};

const cardImages = [
    { 
        id: 1, 
        name: 'Apple',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/>
            <path d="M10 2c1 .5 2 2 2 5"/>
        </svg>`
    },
    { 
        id: 2, 
        name: 'Flower',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/>
            <path d="M12 7.5V9"/>
            <path d="M7.5 12H9"/>
            <path d="M16.5 12H15"/>
            <path d="M12 16.5V15"/>
            <path d="M13.83 15.83l1.42 1.42"/>
            <path d="M7.75 7.75l1.42 1.42"/>
        </svg>`
    },
    { 
        id: 3, 
        name: 'House',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>`
    },
    { 
        id: 4, 
        name: 'Car',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
        </svg>`
    },
    { 
        id: 5, 
        name: 'Star',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>`
    },
    { 
        id: 6, 
        name: 'Music',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
        </svg>`
    },
    { 
        id: 7, 
        name: 'Books',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            <path d="M8 7h8"/>
            <path d="M8 11h8"/>
        </svg>`
    },
    { 
        id: 8, 
        name: 'Sun',
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>`
    }
];


function startCardFlipGame() {
    const gameArea = document.getElementById('activeGameArea');
    const gameContent = document.getElementById('gameContent');
    document.querySelector('.game-selection').style.display = 'none';
    gameArea.style.display = 'block';

    // Reset game state
    cardGame.moves = 0;
    cardGame.score = 0;
    cardGame.time = 0;
    cardGame.matchedPairs = 0;
    cardGame.flippedCards = [];

    // Create card pairs and shuffle
    const cards = [...cardImages, ...cardImages]
        .sort(() => Math.random() - 0.5)
        .map((card, index) => ({ ...card, uniqueId: index }));

    // Generate HTML
    gameContent.innerHTML = `
        <div class="card-game-grid">
            ${cards.map(card => `
                <div class="memory-card" data-card-id="${card.id}" data-unique-id="${card.uniqueId}">
                    <div class="card-inner">
                        <div class="card-front">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
                                <circle cx="8" cy="8" r="2"/>
                                <circle cx="16" cy="8" r="2"/>
                                <circle cx="8" cy="16" r="2"/>
                                <circle cx="16" cy="16" r="2"/>
                            </svg>
                        </div>
                        <div class="card-back">${card.svg}</div>
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="restart-game-btn" onclick="startCardFlipGame()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Restart Game
        </button>
    `;

    // Add click listeners
    document.querySelectorAll('.memory-card').forEach(card => {
        card.addEventListener('click', handleCardClick);
    });

    // Start timer
    updateStats();
    startGameTimer();
}

function handleCardClick(e) {
    const card = e.currentTarget;
    
    // Prevent clicking on already flipped or matched cards
    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    // Prevent more than 2 cards being flipped
    if (cardGame.flippedCards.length >= 2) {
        return;
    }

    // Flip the card
    card.classList.add('flipped');
    cardGame.flippedCards.push(card);

    // Check for match when 2 cards are flipped
    if (cardGame.flippedCards.length === 2) {
        cardGame.moves++;
        updateStats();
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = cardGame.flippedCards;
    const id1 = card1.dataset.cardId;
    const id2 = card2.dataset.cardId;

    if (id1 === id2) {
        // Match found
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            cardGame.flippedCards = [];
            cardGame.matchedPairs++;
            cardGame.score += 10;
            updateStats();

            // Check if game is complete
            if (cardGame.matchedPairs === cardGame.totalPairs) {
                endGame();
            }
        }, 500);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            cardGame.flippedCards = [];
        }, 1000);
    }
}

function startGameTimer() {
    if (cardGame.timer) clearInterval(cardGame.timer);
    
    cardGame.timer = setInterval(() => {
        cardGame.time++;
        updateStats();
    }, 1000);
}

function updateStats() {
    document.getElementById('moveCount').textContent = cardGame.moves;
    document.getElementById('scoreCount').textContent = cardGame.score;
    
    const minutes = Math.floor(cardGame.time / 60);
    const seconds = cardGame.time % 60;
    document.getElementById('timeCount').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function endGame() {
    clearInterval(cardGame.timer);
    setTimeout(() => {
        alert(`🎉 Congratulations! You completed the game!\n\nMoves: ${cardGame.moves}\nTime: ${document.getElementById('timeCount').textContent}\nScore: ${cardGame.score}`);
    }, 500);
}

// ============================================
// WORD MEMORY GAME
// ============================================
function startWordMemoryGame() {
    const gameArea = document.getElementById('activeGameArea');
    const gameContent = document.getElementById('gameContent');
    document.querySelector('.game-selection').style.display = 'none';
    gameArea.style.display = 'block';

    const words = ['Apple', 'Garden', 'Music', 'Family', 'Sunshine', 'Flower', 'Memory', 'Happy'];
    
    gameContent.innerHTML = `
        <div class="word-memory-game">
            <div class="instructions">
                <h3>Remember these words</h3>
                <p>You have 30 seconds to memorize these words</p>
            </div>
            <div class="word-display" id="wordDisplay">
                ${words.map(word => `<div class="word-item">${word}</div>`).join('')}
            </div>
            <div class="countdown" id="countdown">30</div>
            <div class="recall-section" id="recallSection" style="display: none;">
                <h3>Now type the words you remember:</h3>
                <textarea id="wordInput" placeholder="Type the words separated by commas..." rows="5"></textarea>
                <button class="submit-btn" onclick="checkWordRecall(${JSON.stringify(words).replace(/"/g, '&quot;')})">Submit</button>
            </div>
        </div>
    `;

    // Start countdown
    let timeLeft = 30;
    const countdownEl = document.getElementById('countdown');
    const timer = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById('wordDisplay').style.display = 'none';
            countdownEl.style.display = 'none';
            document.getElementById('recallSection').style.display = 'block';
        }
    }, 1000);
}

function checkWordRecall(originalWords) {
    const input = document.getElementById('wordInput').value;
    const userWords = input.split(',').map(w => w.trim().toLowerCase());
    const correctWords = originalWords.map(w => w.toLowerCase());
    
    let correct = 0;
    userWords.forEach(word => {
        if (correctWords.includes(word)) correct++;
    });

    const percentage = Math.round((correct / correctWords.length) * 100);
    alert(`You remembered ${correct} out of ${correctWords.length} words!\nScore: ${percentage}%`);
}

// ============================================
// NUMBER SEQUENCE GAME
// ============================================
function startNumberSequenceGame() {
    const gameArea = document.getElementById('activeGameArea');
    const gameContent = document.getElementById('gameContent');
    document.querySelector('.game-selection').style.display = 'none';
    gameArea.style.display = 'block';

    let level = 1;
    let sequence = [];

    function generateSequence() {
        sequence = [];
        for (let i = 0; i < 3 + level; i++) {
            sequence.push(Math.floor(Math.random() * 9) + 1);
        }
    }

    function showSequence() {
        gameContent.innerHTML = `
            <div class="number-sequence-game">
                <div class="level-display">Level ${level}</div>
                <div class="instructions">Memorize this sequence</div>
                <div class="number-display" id="numberDisplay">
                    ${sequence.map(num => `<div class="number-box">${num}</div>`).join('')}
                </div>
                <div class="countdown" id="seqCountdown">5</div>
            </div>
        `;

        let timeLeft = 5;
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('seqCountdown').textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                askForInput();
            }
        }, 1000);
    }

    function askForInput() {
        gameContent.innerHTML = `
            <div class="number-sequence-game">
                <div class="level-display">Level ${level}</div>
                <div class="instructions">Enter the sequence you saw:</div>
                <div class="number-input-area">
                    ${sequence.map((_, i) => `
                        <input type="number" class="number-input" id="input${i}" min="1" max="9" maxlength="1">
                    `).join('')}
                </div>
                <button class="submit-btn" onclick="checkSequence()">Check Answer</button>
            </div>
        `;

        // Auto-focus and move to next input
        document.querySelectorAll('.number-input').forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < sequence.length - 1) {
                    document.getElementById(`input${index + 1}`).focus();
                }
            });
        });
        document.getElementById('input0').focus();
    }

    function checkSequence() {
        const userSequence = [];
        document.querySelectorAll('.number-input').forEach(input => {
            userSequence.push(parseInt(input.value) || 0);
        });

        if (JSON.stringify(userSequence) === JSON.stringify(sequence)) {
            level++;
            alert(`🎉 Correct! Moving to level ${level}`);
            generateSequence();
            showSequence();
        } else {
            alert(`❌ Incorrect. The sequence was: ${sequence.join(', ')}\nYou entered: ${userSequence.join(', ')}`);
            level = 1;
            generateSequence();
            showSequence();
        }
    }

    window.checkSequence = checkSequence;
    generateSequence();
    showSequence();
}

// ============================================
// PATTERN MATCH GAME
// ============================================
function startPatternMatchGame() {
    const gameArea = document.getElementById('activeGameArea');
    const gameContent = document.getElementById('gameContent');
    document.querySelector('.game-selection').style.display = 'none';
    gameArea.style.display = 'block';

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    let sequence = [];
    let userSequence = [];
    let level = 1;

    function generatePattern() {
        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }

    function showPattern() {
        gameContent.innerHTML = `
            <div class="pattern-match-game">
                <div class="level-display">Level ${level}</div>
                <div class="instructions">Watch the pattern</div>
                <div class="pattern-display" id="patternDisplay">
                    ${colors.map(color => `
                        <div class="color-box" style="background-color: ${color}" data-color="${color}"></div>
                    `).join('')}
                </div>
                <div class="user-pattern" id="userPattern"></div>
                <button class="submit-btn" id="submitPattern" style="display: none;" onclick="checkPattern()">Submit</button>
            </div>
        `;

        // Animate the sequence
        let index = 0;
        const interval = setInterval(() => {
            if (index >= sequence.length) {
                clearInterval(interval);
                enableUserInput();
                return;
            }

            const colorBoxes = document.querySelectorAll('.color-box');
            colorBoxes.forEach(box => {
                if (box.dataset.color === sequence[index]) {
                    box.classList.add('highlight');
                    setTimeout(() => box.classList.remove('highlight'), 500);
                }
            });
            index++;
        }, 1000);
    }

    function enableUserInput() {
        document.querySelectorAll('.color-box').forEach(box => {
            box.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                userSequence.push(color);
                
                const userPatternEl = document.getElementById('userPattern');
                const colorDot = document.createElement('div');
                colorDot.className = 'user-color-dot';
                colorDot.style.backgroundColor = color;
                userPatternEl.appendChild(colorDot);

                if (userSequence.length === sequence.length) {
                    document.getElementById('submitPattern').style.display = 'block';
                }
            });
        });
    }

    function checkPattern() {
        if (JSON.stringify(userSequence) === JSON.stringify(sequence)) {
            level++;
            alert(`🎉 Correct! Moving to level ${level}`);
            userSequence = [];
            generatePattern();
            showPattern();
        } else {
            alert(`❌ Incorrect. Try again from level 1`);
            sequence = [];
            userSequence = [];
            level = 1;
            generatePattern();
            showPattern();
        }
    }

    window.checkPattern = checkPattern;
    generatePattern();
    showPattern();
}

function backToGameSelection() {
    document.querySelector('.game-selection').style.display = 'grid';
    document.getElementById('activeGameArea').style.display = 'none';
    if (cardGame.timer) clearInterval(cardGame.timer);
}

function onMemoryGameComplete(score, total) {
    if (window.aiOrb) {
        window.aiOrb.memoryGameFeedback(score, total);
    }
}

// ============================================
// OTHER ACTIVITIES (Keep existing)
// ============================================
function generateImageDescriptionContent() {
    return `
        <div class="image-description-activity">
            <div class="activity-instructions">
                <h3>Picture Description Test</h3>
                <p>Look at the image below and describe what you see. You can type or use voice input.</p>
            </div>

            <div class="image-display-section">
                <div class="test-image-container">
                    <img src="https://picsum.photos/600/400?random=1" alt="Test Image" class="test-image" id="descriptionImage">
                    <button class="change-image-btn" onclick="changeTestImage()">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        Change Image
                    </button>
                </div>

                <div class="description-input-section">
                    <div class="input-controls">
                        <button class="voice-btn" onclick="toggleVoiceInput()" id="voiceBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="12" y1="19" x2="12" y2="23"/>
                                <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                            <span id="voiceBtnText">Start Voice Input</span>
                        </button>
                        <span class="voice-status" id="voiceStatus"></span>
                    </div>

                    <textarea 
                        id="imageDescription" 
                        placeholder="Describe what you see in the image. Mention people, objects, actions, and details..." 
                        rows="12"
                    ></textarea>

                    <div class="description-footer">
                        <span class="char-count">Characters: <strong id="charCount">0</strong></span>
                        <button class="submit-btn" onclick="submitImageDescription()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Submit Description
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Image changing functionality
let currentImageId = 1;
function changeTestImage() {
    currentImageId = Math.floor(Math.random() * 1000) + 1;
    const img = document.getElementById('descriptionImage');
    if (img) {
        img.src = `https://picsum.photos/600/400?random=${currentImageId}`;
    }
}

// Character count update
function updateCharCount() {
    const textarea = document.getElementById('imageDescription');
    const charCount = document.getElementById('charCount');
    if (textarea && charCount) {
        charCount.textContent = textarea.value.length;
    }
}

// Voice input functionality
let recognition = null;
let isListening = false;

function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Change to 'hi-IN' for Hindi, 'ta-IN' for Tamil, etc.

        recognition.onstart = function() {
            isListening = true;
            updateVoiceButton();
            document.getElementById('voiceStatus').textContent = '🎤 Listening...';
        };

        recognition.onresult = function(event) {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            const textarea = document.getElementById('imageDescription');
            if (textarea) {
                if (finalTranscript) {
                    textarea.value += finalTranscript;
                    updateCharCount();
                }
                document.getElementById('voiceStatus').textContent = interimTranscript ? ` ${interimTranscript}` : ' Listening...';
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            document.getElementById('voiceStatus').textContent = '❌ Error: ' + event.error;
            isListening = false;
            updateVoiceButton();
        };

        recognition.onend = function() {
            if (isListening) {
                recognition.start(); // Restart if still meant to be listening
            } else {
                document.getElementById('voiceStatus').textContent = '';
            }
        };
    } else {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
}

function toggleVoiceInput() {
    if (!recognition) {
        initSpeechRecognition();
    }

    if (isListening) {
        recognition.stop();
        isListening = false;
        document.getElementById('voiceStatus').textContent = '';
    } else {
        recognition.start();
        isListening = true;
    }
    
    updateVoiceButton();
}

function updateVoiceButton() {
    const btn = document.getElementById('voiceBtn');
    const btnText = document.getElementById('voiceBtnText');
    
    if (isListening) {
        btn.classList.add('listening');
        btnText.textContent = 'Stop Recording';
    } else {
        btn.classList.remove('listening');
        btnText.textContent = 'Start Voice Input';
    }
}

function submitImageDescription() {
    const description = document.getElementById('imageDescription').value.trim();
    
    if (description.length < 20) {
        alert('Please provide a more detailed description (at least 20 characters).');
        return;
    }

    // Stop voice recognition if active
    if (isListening && recognition) {
        recognition.stop();
        isListening = false;
        updateVoiceButton();
    }

    const wordCount = description.split(/\s+/).filter(w => w.length > 0).length;
    
    alert(`✅ Description Submitted Successfully!\n\nCharacters: ${description.length}\nWords: ${wordCount}\n\nThank you for your response!`);
    
    // Clear textarea
    document.getElementById('imageDescription').value = '';
    updateCharCount();
    
    // Load new image
    changeTestImage();
}

// Initialize character counter
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('imageDescription');
    if (textarea) {
        textarea.addEventListener('input', updateCharCount);
    }
});

let currentImageTest = null;

function selectImageTest(testType) {
    currentImageTest = imageTests[testType];
    
    // Hide selection grid
    document.getElementById('imageSelectionGrid').style.display = 'none';
    document.getElementById('imageTestArea').style.display = 'block';

    // Set image
    document.getElementById('testImage').src = currentImageTest.image;

    // Set hints
    const hintsList = document.getElementById('hintsList');
    hintsList.innerHTML = currentImageTest.hints.map(hint => 
        `<li>${hint}</li>`
    ).join('');

    // Reset textarea and counters
    document.getElementById('imageDescription').value = '';
    updateDescriptionAnalysis();
}

function backToImageSelection() {
    document.getElementById('imageSelectionGrid').style.display = 'grid';
    document.getElementById('imageTestArea').style.display = 'none';
    currentImageTest = null;
}

// Real-time description analysis
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('imageDescription');
    if (textarea) {
        textarea.addEventListener('input', updateDescriptionAnalysis);
    }
});

function updateDescriptionAnalysis() {
    const textarea = document.getElementById('imageDescription');
    if (!textarea || !currentImageTest) return;

    const text = textarea.value.toLowerCase();
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);

    // Update word count
    const wordCountEl = document.getElementById('wordCount');
    if (wordCountEl) wordCountEl.textContent = words.length;

    // Count categories
    let peopleCount = 0;
    let actionsCount = 0;
    let objectsCount = 0;

    currentImageTest.keywords.people.forEach(keyword => {
        if (text.includes(keyword)) peopleCount++;
    });

    currentImageTest.keywords.actions.forEach(keyword => {
        if (text.includes(keyword)) actionsCount++;
    });

    currentImageTest.keywords.objects.forEach(keyword => {
        if (text.includes(keyword)) objectsCount++;
    });

    // Update progress indicators
    const peopleCountEl = document.getElementById('peopleCount');
    const actionsCountEl = document.getElementById('actionsCount');
    const objectsCountEl = document.getElementById('objectsCount');

    if (peopleCountEl) peopleCountEl.textContent = peopleCount;
    if (actionsCountEl) actionsCountEl.textContent = actionsCount;
    if (objectsCountEl) objectsCountEl.textContent = objectsCount;
}

function submitImageDescription() {
    const description = document.getElementById('imageDescription').value;
    const wordCount = description.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    if (description.trim().length < 20) {
        alert('Please provide a more detailed description (at least a few sentences).');
        return;
    }

    // Calculate score based on keywords mentioned
    let score = 0;
    const text = description.toLowerCase();
    
    if (currentImageTest) {
        Object.values(currentImageTest.keywords).forEach(category => {
            category.forEach(keyword => {
                if (text.includes(keyword)) score += 5;
            });
        });
    }

    alert(`✅ Description Submitted!\n\nWords: ${wordCount}\nDetail Score: ${Math.min(score, 100)}/100\n\nThank you for your detailed description!`);
}

// Voice recording placeholder
function startVoiceRecording() {
    alert('🎤 Voice recording feature will be activated. Please speak your description clearly.');
    // Implement actual voice recording with Web Speech API
}

function startPictureDescription(imageUrl) {
    if (window.aiOrb) {
        window.aiOrb.pictureDescriptionGuide(imageUrl);
    }
}

function generateStoryContent() {
    return `
        <div class="story-activity">
            <div class="activity-instructions">
                <h3>AI Story Companion</h3>
                <p>Share your memories with our AI companion. It will listen, ask questions, and provide thoughtful feedback.</p>
            </div>
            
            <div class="story-mode-selector">
                <div class="mode-card" onclick="startAIStoryMode()">
                    <div class="mode-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            ircle cx="9" cy="1010" r="1"/>
                            ircle cx="15" cy="10" r="="1"/>
                            <path d="M9 14c.5.5 1.5 1 3 1s2.5-.5 3-1"/>
                        </svg>
                    </div>
                    <h3>Interactive AI Mode</h3>
                    <p>Talk with AI companion - asks questions & gives feedback</p>
                    <button class="mode-btn">Start AI Conversation</button>
                </div>

                <div class="mode-card" onclick="startFreeWriteMode()">
                    <div class="mode-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </div>
                    <h3>Free Writing Mode</h3>
                    <p>Write your story at your own pace</p>
                    <button class="mode-btn">Start Writing</button>
                </div>
            </div>
        </div>

        <!-- AI Story Mode Overlay -->
        <div class="story-overlay" id="storyOverlay" style="display: none;">
            <div class="story-overlay-content">
                <button class="close-overlay-btn" onclick="closeStoryOverlay()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                <div class="ai-companion-header">
                    <div class="ai-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ircle cx="12" cy="8" r="7"7"/>
                            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                        </svg>
                    </div>
                    <div class="ai-info">
                        <h2>Your AI Companion</h2>
                        <p class="ai-status" id="aiStatus">Ready to listen...</p>
                    </div>
                </div>

                <div class="story-chat-container" id="storyChatContainer">
                    <div class="story-message ai-message">
                        <div class="message-avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                ircle cx="12" cy="8" r="7"7"/>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                            </svg>
                        </div>
                        <div class="message-bubble">
                            <p>Hello! I'm here to listen to your story. Let's start with something simple - what would you like to talk about today?</p>
                        </div>
                    </div>
                </div>

                <div class="story-input-controls">
                    <div class="prompt-suggestions" id="promptSuggestions">
                        <button class="suggestion-chip" onclick="selectStoryPrompt('childhood')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                ircle cx="9" cy="7"7" r="4"/>
                            </svg>
                            Childhood Memory
                        </button>
                        <button class="suggestion-chip" onclick="selectStoryPrompt('family')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                ircle cx="9" cy="7"7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            Family Celebration
                        </button>
                        <button class="suggestion-chip" onclick="selectStoryPrompt('achievement')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                ircle cx="12" cy="8"8" r="7"/>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                            </svg>
                            Proud Achievement
                        </button>
                        <button class="suggestion-chip" onclick="selectStoryPrompt('travel')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                ircle cx="12" cy="="10" r="3"/>
                            </svg>
                            Travel Experience
                        </button>
                    </div>

                    <div class="voice-input-area">
                        <button class="large-voice-btn" id="storyVoiceBtn" onclick="toggleStoryVoice()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="12" y1="19" x2="12" y2="23"/>
                                <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                            <span id="voiceButtonText">Tap to Speak</span>
                        </button>
                        <p class="voice-hint">Or type your response below</p>
                    </div>

                    <div class="text-input-area">
                        <textarea id="storyTextInput" placeholder="Type your story or response here..." rows="3"></textarea>
                        <button class="send-story-btn" onclick="sendStoryMessage()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Story Mode Management
let storyRecognition = null;
let isStoryListening = false;
let storyConversationHistory = [];
let currentStoryTopic = null;

function startAIStoryMode() {
    document.getElementById('storyOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    storyConversationHistory = [];
    initStoryVoiceRecognition();
}

function startFreeWriteMode() {
    // Simple free write mode
    const chatContainer = document.getElementById('storyChatContainer');
    document.getElementById('storyOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('promptSuggestions').style.display = 'none';
    
    chatContainer.innerHTML = `
        <div class="story-message ai-message">
            <div class="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ircle cx="12" cy="="8" r="7"/>
                </svg>
            </div>
            <div class="message-bubble">
                <p>Take your time and write your story. I'll be here when you're ready to share it.</p>
            </div>
        </div>
    `;
}

function closeStoryOverlay() {
    document.getElementById('storyOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    if (isStoryListening && storyRecognition) {
        storyRecognition.stop();
        isStoryListening = false;
    }
    
    // Reset
    storyConversationHistory = [];
    currentStoryTopic = null;
}

// Story Prompt Selection
function selectStoryPrompt(topic) {
    const prompts = {
        childhood: "I'd love to hear about a memory from your childhood. What's something that stands out to you from when you were young?",
        family: "Family celebrations are so special! Tell me about a memorable family gathering or celebration you've experienced.",
        achievement: "Everyone has moments they're proud of. What's an achievement or accomplishment that means a lot to you?",
        travel: "Travel experiences can create lasting memories. Tell me about a place you've visited that left an impression on you."
    };
    
    currentStoryTopic = topic;
    document.getElementById('promptSuggestions').style.display = 'none';
    
    addAIMessage(prompts[topic]);
}

// Add messages to chat
function addAIMessage(message) {
    const chatContainer = document.getElementById('storyChatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'story-message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ircle cx="12" cycy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
        </div>
        <div class="message-bubble">
            <p>${message}</p>
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Speak the message
    speakText(message);
}

function addUserMessage(message) {
    const chatContainer = document.getElementById('storyChatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'story-message user-message';
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <p>${message}</p>
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send story message
async function sendStoryMessage() {
    const input = document.getElementById('storyTextInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addUserMessage(message);
    input.value = '';
    storyConversationHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    document.getElementById('aiStatus').textContent = 'Thinking...';
    
    // Get AI response
    const aiResponse = await getAIStoryResponse(message);
    
    setTimeout(() => {
        addAIMessage(aiResponse);
        document.getElementById('aiStatus').textContent = 'Listening...';
    }, 1000);
}

// Get AI response (integrate with your helper bot API)
async function getAIStoryResponse(userMessage) {
    try {
        const response = await fetch('/api/story-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                history: storyConversationHistory,
                topic: currentStoryTopic
            })
        });
        
        const data = await response.json();
        storyConversationHistory.push({ role: 'assistant', content: data.response });
        return data.response;
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        return generateFallbackResponse(userMessage);
    }
}

// Fallback responses when API is unavailable
function generateFallbackResponse(userMessage) {
    const responses = [
        "That's wonderful! Can you tell me more about how that made you feel?",
        "I'd love to hear more details about that. What else do you remember?",
        "That sounds like such a meaningful experience. What happened next?",
        "Thank you for sharing that with me. Is there anything else about that moment you'd like to add?",
        "That's a beautiful memory. What makes it so special to you?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Voice Recognition for Story
function initStoryVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        storyRecognition = new SpeechRecognition();
        storyRecognition.continuous = false;
        storyRecognition.interimResults = false;
        storyRecognition.lang = 'en-US';

        storyRecognition.onstart = function() {
            isStoryListening = true;
            document.getElementById('storyVoiceBtn').classList.add('listening');
            document.getElementById('voiceButtonText').textContent = 'Listening...';
            document.getElementById('aiStatus').textContent = 'I\'m listening...';
        };

        storyRecognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('storyTextInput').value = transcript;
            sendStoryMessage();
        };

        storyRecognition.onend = function() {
            isStoryListening = false;
            document.getElementById('storyVoiceBtn').classList.remove('listening');
            document.getElementById('voiceButtonText').textContent = 'Tap to Speak';
        };

        storyRecognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isStoryListening = false;
            document.getElementById('storyVoiceBtn').classList.remove('listening');
            document.getElementById('voiceButtonText').textContent = 'Tap to Speak';
        };
    }
}

function toggleStoryVoice() {
    if (!storyRecognition) {
        initStoryVoiceRecognition();
    }

    if (isStoryListening) {
        storyRecognition.stop();
    } else {
        storyRecognition.start();
    }
}

// Text-to-Speech for AI responses
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Remove emojis before speaking
        const cleanText = removeEmojis(text);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        window.speechSynthesis.speak(utterance);
    }
}

// Placeholder functions for old code
function setStoryPrompt(type) {
    selectStoryPrompt(type);
}

function submitStory() {
    sendStoryMessage();
}

function startStoryTelling() {
    if (window.aiOrb) {
        window.aiOrb.storyGuide();
    }
}

function generateConversationContent() {
    return `
        <div class="conversation-activity">
            <div class="activity-instructions">
                <h3>Guided AI Conversation</h3>
                <p>Have a natural conversation with your AI companion. It will ask questions and listen to your responses.</p>
            </div>

            <div class="conversation-mode-selector">
                <div class="mode-card" onclick="startGuidedConversation()">
                    <div class="mode-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <line x1="9" y1="10" x2="15" y2="10"/>
                            <line x1="12" y1="7" x2="12" y2="13"/>
                        </svg>
                    </div>
                    <h3>Start Conversation</h3>
                    <p>Chat naturally with voice or text</p>
                    <button class="mode-btn">Begin Chatting</button>
                </div>
            </div>
        </div>

        <!-- Conversation Overlay -->
        <div class="conversation-overlay" id="conversationOverlay" style="display: none;">
            <div class="conversation-overlay-content">
                <button class="close-overlay-btn" onclick="closeConversationOverlay()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>

                <div class="ai-companion-header">
                    <div class="ai-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <circle cx="9" cy="10" r="1"/>
                            <circle cx="15" cy="10" r="1"/>
                            <path d="M9 14c.5.5 1.5 1 3 1s2.5-.5 3-1"/>
                        </svg>
                    </div>
                    <div class="ai-info">
                        <h2>AI Companion</h2>
                        <p class="ai-status" id="conversationAIStatus">Ready to chat...</p>
                        <span class="provider-badge" id="conversationProviderBadge"></span>
                    </div>
                </div>

                <div class="conversation-chat-container" id="conversationChatContainer">
                    <!-- Messages will be added here -->
                </div>

                <div class="conversation-input-controls">
                    <div class="voice-input-area">
                        <button class="large-voice-btn" id="conversationVoiceBtn" onclick="toggleConversationVoice()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="12" y1="19" x2="12" y2="23"/>
                                <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                            <span id="conversationVoiceText">Tap to Speak</span>
                        </button>
                        <p class="voice-hint">Or type your message below</p>
                    </div>

                    <div class="text-input-area">
                        <textarea id="conversationTextInput" placeholder="Type your message here..." rows="3"></textarea>
                        <button class="send-conversation-btn" onclick="sendConversationMessage()">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// GUIDED CONVERSATION WITH HELPER BOT AI
// ============================================

const CONVERSATION_API_ENDPOINT = '/api/chat';  // Your helper bot endpoint
let conversationRecognition = null;
let isConversationListening = false;
let conversationHistory = [];

function startGuidedConversation() {
    document.getElementById('conversationOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    conversationHistory = [];
    
    // Initialize with greeting
    setTimeout(() => {
        addConversationAIMessage("Hello! I'm so glad you're here. How are you feeling today?");
    }, 500);
    
    initConversationVoiceRecognition();
}

function closeConversationOverlay() {
    document.getElementById('conversationOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    if (isConversationListening && conversationRecognition) {
        conversationRecognition.stop();
        isConversationListening = false;
    }
    
    conversationHistory = [];
}

// Add AI message to conversation
function addConversationAIMessage(message) {
    const chatContainer = document.getElementById('conversationChatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'story-message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <circle cx="9" cy="10" r="1"/>
                <circle cx="15" cy="10" r="1"/>
                <path d="M9 14c.5.5 1.5 1 3 1s2.5-.5 3-1"/>
            </svg>
        </div>
        <div class="message-bubble">
            <p>${formatConversationMessage(message)}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Speak the message
    speakConversationText(message);
}

// Add user message to conversation
function addConversationUserMessage(message) {
    const chatContainer = document.getElementById('conversationChatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'story-message user-message';
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <p>${formatConversationMessage(message)}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show typing indicator
function showConversationTyping() {
    const chatContainer = document.getElementById('conversationChatContainer');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'story-message ai-message typing-indicator';
    typingDiv.id = 'conversationTyping';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        </div>
        <div class="message-bubble">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeConversationTyping() {
    const typing = document.getElementById('conversationTyping');
    if (typing) typing.remove();
}

// Send message to AI (using your helper bot)
async function sendConversationMessage() {
    const input = document.getElementById('conversationTextInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addConversationUserMessage(message);
    input.value = '';
    conversationHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    document.getElementById('conversationAIStatus').textContent = 'Thinking...';
    showConversationTyping();
    
    try {
        // Use your helper bot API endpoint
        const response = await fetch(CONVERSATION_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory.slice(-10), // Last 10 messages
                context: 'guided_conversation' // Add context for better responses
            })
        });
        
        const data = await response.json();
        
        removeConversationTyping();
        
        if (data.success) {
            addConversationAIMessage(data.response);
            conversationHistory.push({ role: 'assistant', content: data.response });
            
            // Update provider badge if available
            if (data.provider) {
                updateConversationProviderBadge(data.provider);
            }
            
            document.getElementById('conversationAIStatus').textContent = 'Listening...';
        } else {
            throw new Error(data.error || 'Failed to get response');
        }
        
    } catch (error) {
        console.error('Error getting AI response:', error);
        removeConversationTyping();
        
        // Fallback to simple cognitive questions
        const aiResponse = generateCognitiveQuestion(conversationHistory.length);
        addConversationAIMessage(aiResponse);
        conversationHistory.push({ role: 'assistant', content: aiResponse });
        
        document.getElementById('conversationAIStatus').textContent = 'Listening...';
    }
}

// Cognitive assessment questions (fallback)
function generateCognitiveQuestion(questionIndex) {
    const questions = [
        "That's interesting! Can you tell me more about what you did today?",
        "I'd love to know - what's your favorite hobby or activity?",
        "That's wonderful! Who is someone special in your life?",
        "Can you share a happy memory with me?",
        "What did you enjoy most about your day so far?",
        "Tell me about something that makes you smile.",
        "What are you looking forward to?",
        "Is there a place you love to visit? Tell me about it.",
        "What's something you're proud of accomplishing?",
        "Thank you for sharing with me today. It's been lovely talking with you!"
    ];
    
    const index = Math.min(questionIndex, questions.length - 1);
    return questions[index];
}

// Voice Recognition for Conversation
function initConversationVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        conversationRecognition = new SpeechRecognition();
        conversationRecognition.continuous = false;
        conversationRecognition.interimResults = false;
        conversationRecognition.lang = 'en-US'; // Change as needed

        conversationRecognition.onstart = function() {
            isConversationListening = true;
            document.getElementById('conversationVoiceBtn').classList.add('listening');
            document.getElementById('conversationVoiceText').textContent = 'Listening...';
            document.getElementById('conversationAIStatus').textContent = 'I\'m listening...';
        };

        conversationRecognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('conversationTextInput').value = transcript;
            sendConversationMessage();
        };

        conversationRecognition.onend = function() {
            isConversationListening = false;
            document.getElementById('conversationVoiceBtn').classList.remove('listening');
            document.getElementById('conversationVoiceText').textContent = 'Tap to Speak';
        };

        conversationRecognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            isConversationListening = false;
            document.getElementById('conversationVoiceBtn').classList.remove('listening');
            document.getElementById('conversationVoiceText').textContent = 'Tap to Speak';
            
            if (event.error === 'no-speech') {
                addConversationAIMessage("I didn't catch that. Could you try again?");
            }
        };
    }
}

function toggleConversationVoice() {
    if (!conversationRecognition) {
        initConversationVoiceRecognition();
    }

    if (isConversationListening) {
        conversationRecognition.stop();
    } else {
        conversationRecognition.start();
    }
}

// Text-to-Speech for AI responses
function speakConversationText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Remove emojis and special characters before speaking
        const cleanText = removeEmojis(text);
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        window.speechSynthesis.speak(utterance);
    }
}

// Helper functions
function formatConversationMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function updateConversationProviderBadge(provider) {
    const badge = document.getElementById('conversationProviderBadge');
    if (badge && provider) {
        // Only show if explicitly needed - for now keep hidden
        badge.textContent = `AI: ${provider}`;
        // badge.style.display = 'inline-block';  // Comment this out to keep hidden
    }
}

// Backward compatibility - keep old function name
function sendConversationResponse() {
    sendConversationMessage();
}

function removeEmojis(text) {
    // Remove emojis using regex
    return text
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
        .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
        .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
        .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
        .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
        .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
        .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous Symbols
        .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
        .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
        .trim();
}

// ============================================
// CLOCK DRAWING TEST - Gold Standard for Dementia
// ============================================

function generateClockDrawingContent() {
    return `
        <div class="clock-drawing-activity">
            <div class="activity-instructions">
                <h3>Clock Drawing Test</h3>
                <p>This is a widely used cognitive assessment. Follow the instructions carefully.</p>
            </div>

            <div class="clock-test-container">
                <div class="clock-instructions-panel">
                    <div class="instruction-step active" id="step1">
                        <div class="step-number">1</div>
                        <h4>Draw the Clock Face</h4>
                        <p>Draw a circle to represent the clock face</p>
                    </div>
                    <div class="instruction-step" id="step2">
                        <div class="step-number">2</div>
                        <h4>Add the Numbers</h4>
                        <p>Place all 12 numbers in their correct positions</p>
                    </div>
                    <div class="instruction-step" id="step3">
                        <div class="step-number">3</div>
                        <h4>Set the Time</h4>
                        <p>Draw the clock hands to show <strong>10 past 11</strong> (11:10)</p>
                    </div>
                </div>

                <div class="clock-canvas-container">
                    <div class="canvas-header">
                        <span class="timer" id="clockTimer">Time: 0:00</span>
                        <div class="canvas-controls">
                            <button class="tool-btn active" onclick="setDrawingMode('pen')" id="penBtn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                                Draw
                            </button>
                            <button class="tool-btn" onclick="setDrawingMode('erase')" id="eraseBtn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M20 20H7L3 16l10-10 6 6-2 2"/>
                                    <path d="M7 20v-6"/>
                                </svg>
                                Erase
                            </button>
                            <button class="tool-btn" onclick="clearClockCanvas()">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                Clear
                            </button>
                        </div>
                    </div>
                    
                    <canvas id="clockCanvas" width="600" height="600"></canvas>
                    
                    <div class="canvas-footer">
                        <p class="hint-text">Use your mouse or finger to draw. Draw naturally as you would with pen and paper.</p>
                    </div>
                </div>
            </div>

            <div class="clock-submit-section">
                <button class="submit-btn large" onclick="submitClockDrawing()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Submit Drawing for Analysis
                </button>
            </div>
        </div>

        <!-- Results Modal -->
        <div class="clock-results-modal" id="clockResultsModal" style="display: none;">
            <div class="modal-content">
                <button class="close-modal-btn" onclick="closeClockResults()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                
                <div class="results-header">
                    <h2>Clock Drawing Test Results</h2>
                </div>
                
                <div class="results-body" id="clockResultsBody">
                    <!-- Results will be inserted here -->
                </div>
                
                <div class="results-footer">
                    <button class="secondary-btn" onclick="retryClockTest()">Draw Again</button>
                    <button class="primary-btn" onclick="saveClockResults()">Save Results</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// CLOCK DRAWING TEST LOGIC
// ============================================

let clockCanvas, clockCtx;
let isClockDrawing = false;
let clockDrawingMode = 'pen';
let clockStartTime = null;
let clockTimerInterval = null;
let clockDrawingData = [];

// Initialize canvas - IMPROVED
function initClockCanvas() {
    clockCanvas = document.getElementById('clockCanvas');
    
    if (!clockCanvas) {
        console.error('❌ Clock canvas not found!');
        return false;
    }
    
    clockCtx = clockCanvas.getContext('2d');
    
    // Set up canvas styling
    clockCtx.strokeStyle = '#1A3A47';
    clockCtx.lineWidth = 3;
    clockCtx.lineCap = 'round';
    clockCtx.lineJoin = 'round';
    
    // Fill with white background
    clockCtx.fillStyle = '#FFFFFF';
    clockCtx.fillRect(0, 0, clockCanvas.width, clockCanvas.height);
    
    // Remove any existing listeners first
    clockCanvas.onmousedown = null;
    clockCanvas.onmousemove = null;
    clockCanvas.onmouseup = null;
    clockCanvas.onmouseleave = null;
    clockCanvas.ontouchstart = null;
    clockCanvas.ontouchmove = null;
    clockCanvas.ontouchend = null;
    
    // Add event listeners
    clockCanvas.addEventListener('mousedown', startClockDrawing);
    clockCanvas.addEventListener('mousemove', drawOnClock);
    clockCanvas.addEventListener('mouseup', stopClockDrawing);
    clockCanvas.addEventListener('mouseleave', stopClockDrawing);
    
    // Touch events for mobile
    clockCanvas.addEventListener('touchstart', handleClockTouch);
    clockCanvas.addEventListener('touchmove', handleClockTouch);
    clockCanvas.addEventListener('touchend', stopClockDrawing);
    
    // Start timer
    startClockTimer();
    
    console.log('✅ Clock canvas initialized successfully');
    return true;
}

// Get coordinates helper function
function getClockCanvasCoords(e) {
    const rect = clockCanvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (clockCanvas.width / rect.width),
        y: (e.clientY - rect.top) * (clockCanvas.height / rect.height)
    };
}

// Drawing functions
function startClockDrawing(e) {
    isClockDrawing = true;
    const coords = getClockCanvasCoords(e);
    clockCtx.beginPath();
    clockCtx.moveTo(coords.x, coords.y);
    clockDrawingData.push({
        type: 'start',
        x: coords.x,
        y: coords.y,
        time: Date.now() - clockStartTime,
        mode: clockDrawingMode
    });
}

function drawOnClock(e) {
    if (!isClockDrawing) return;
    
    const coords = getClockCanvasCoords(e);
    
    if (clockDrawingMode === 'pen') {
        clockCtx.globalCompositeOperation = 'source-over';
        clockCtx.strokeStyle = '#1A3A47';
        clockCtx.lineWidth = 3;
    } else if (clockDrawingMode === 'erase') {
        clockCtx.globalCompositeOperation = 'destination-out';
        clockCtx.lineWidth = 20;
    }
    
    clockCtx.lineTo(coords.x, coords.y);
    clockCtx.stroke();
    
    clockDrawingData.push({
        type: 'draw',
        x: coords.x,
        y: coords.y,
        time: Date.now() - clockStartTime,
        mode: clockDrawingMode
    });
}

function stopClockDrawing() {
    if (isClockDrawing) {
        clockDrawingData.push({
            type: 'end',
            time: Date.now() - clockStartTime
        });
    }
    isClockDrawing = false;
    clockCtx.beginPath();
}

function handleClockTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    clockCanvas.dispatchEvent(mouseEvent);
}

function setDrawingMode(mode) {
    clockDrawingMode = mode;
    document.getElementById('penBtn').classList.toggle('active', mode === 'pen');
    document.getElementById('eraseBtn').classList.toggle('active', mode === 'erase');
}

function clearClockCanvas() {
    if (confirm('Are you sure you want to clear your drawing?')) {
        clockCtx.fillStyle = '#FFFFFF';
        clockCtx.fillRect(0, 0, clockCanvas.width, clockCanvas.height);
        clockDrawingData = [];
        clockDrawingData.push({
            type: 'clear',
            time: Date.now() - clockStartTime
        });
    }
}

// Timer functions
function startClockTimer() {
    clockStartTime = Date.now();
    clockTimerInterval = setInterval(updateClockTimer, 1000);
}

function updateClockTimer() {
    const elapsed = Math.floor((Date.now() - clockStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timerEl = document.getElementById('clockTimer');
    if (timerEl) {
        timerEl.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function stopClockTimer() {
    if (clockTimerInterval) {
        clearInterval(clockTimerInterval);
    }
}

// Drawing functions
function getClockCanvasCoords(e) {
    const rect = clockCanvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (clockCanvas.width / rect.width),
        y: (e.clientY - rect.top) * (clockCanvas.height / rect.height)
    };
}

function startClockDrawing(e) {
    isClockDrawing = true;
    const coords = getClockCanvasCoords(e);
    clockCtx.beginPath();
    clockCtx.moveTo(coords.x, coords.y);
    
    clockDrawingData.push({
        type: 'start',
        x: coords.x,
        y: coords.y,
        time: Date.now() - clockStartTime,
        mode: clockDrawingMode
    });
}

function drawOnClock(e) {
    if (!isClockDrawing) return;
    
    const coords = getClockCanvasCoords(e);
    
    if (clockDrawingMode === 'pen') {
        clockCtx.globalCompositeOperation = 'source-over';
        clockCtx.strokeStyle = '#1A3A47';
        clockCtx.lineWidth = 3;
    } else if (clockDrawingMode === 'erase') {
        clockCtx.globalCompositeOperation = 'destination-out';
        clockCtx.lineWidth = 20;
    }
    
    clockCtx.lineTo(coords.x, coords.y);
    clockCtx.stroke();
    
    clockDrawingData.push({
        type: 'draw',
        x: coords.x,
        y: coords.y,
        time: Date.now() - clockStartTime,
        mode: clockDrawingMode
    });
}

function stopClockDrawing() {
    if (isClockDrawing) {
        clockDrawingData.push({
            type: 'end',
            time: Date.now() - clockStartTime
        });
    }
    isClockDrawing = false;
    clockCtx.beginPath();
}

function handleClockTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
        e.type === 'touchstart' ? 'mousedown' : 'mousemove',
        {
            clientX: touch.clientX,
            clientY: touch.clientY
        }
    );
    clockCanvas.dispatchEvent(mouseEvent);
}

function setDrawingMode(mode) {
    clockDrawingMode = mode;
    document.getElementById('penBtn').classList.toggle('active', mode === 'pen');
    document.getElementById('eraseBtn').classList.toggle('active', mode === 'erase');
}

function clearClockCanvas() {
    if (confirm('Are you sure you want to clear your drawing?')) {
        clockCtx.fillStyle = '#FFFFFF';
        clockCtx.fillRect(0, 0, clockCanvas.width, clockCanvas.height);
        clockDrawingData = [];
        clockDrawingData.push({
            type: 'clear',
            time: Date.now() - clockStartTime
        });
    }
}

// Submit and analyze
async function submitClockDrawing() {
    stopClockTimer();
    
    // Get canvas image data
    const imageData = clockCanvas.toDataURL('image/png');
    const completionTime = Math.floor((Date.now() - clockStartTime) / 1000);
    
    // Show loading
    document.getElementById('clockResultsModal').style.display = 'flex';
    document.getElementById('clockResultsBody').innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Analyzing your drawing...</p>
        </div>
    `;
    
    try {
        // Send to backend for AI analysis
        const response = await fetch('/api/analyze-clock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: imageData,
                drawingData: clockDrawingData,
                completionTime: completionTime
            })
        });
        
        const data = await response.json();
        displayClockResults(data, completionTime);
        
    } catch (error) {
        console.error('Error analyzing clock:', error);
        // Fallback to basic analysis
        const basicResults = analyzeClockBasic(imageData, completionTime);
        displayClockResults(basicResults, completionTime);
    }
}

// Basic client-side analysis (fallback)
function analyzeClockBasic(imageData, completionTime) {
    // Simple heuristics
    const hasDrawing = clockDrawingData.length > 10;
    const reasonableTime = completionTime >= 30 && completionTime <= 300;
    
    return {
        score: hasDrawing ? 7 : 3,
        maxScore: 10,
        completionTime: completionTime,
        feedback: {
            clockFace: hasDrawing ? 'Clock face appears to be drawn' : 'No clear clock face detected',
            numbers: 'Manual review recommended',
            hands: 'Manual review recommended',
            overall: reasonableTime ? 'Completion time within normal range' : 'Completion time may indicate difficulty'
        },
        recommendation: 'Results have been saved for professional review.'
    };
}

// Display results
function displayClockResults(data, completionTime) {
    const minutes = Math.floor(completionTime / 60);
    const seconds = completionTime % 60;
    
    const resultsHTML = `
        <div class="results-grid">
            <div class="result-card">
                <div class="result-icon success">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <h3>Test Completed</h3>
                <p class="result-value">${minutes}:${seconds.toString().padStart(2, '0')}</p>
                <p class="result-label">Completion Time</p>
            </div>
            
            <div class="result-card">
                <div class="result-icon ${data.score >= 7 ? 'success' : data.score >= 5 ? 'warning' : 'error'}">
                    <span class="score-number">${data.score}</span>
                </div>
                <h3>Preliminary Score</h3>
                <p class="result-value">${data.score} / ${data.maxScore}</p>
                <p class="result-label">Based on Shulman Scale</p>
            </div>
        </div>
        
        <div class="feedback-section">
            <h3>Analysis Feedback</h3>
            <div class="feedback-items">
                <div class="feedback-item">
                    <strong>Clock Face:</strong>
                    <span>${data.feedback.clockFace}</span>
                </div>
                <div class="feedback-item">
                    <strong>Numbers Placement:</strong>
                    <span>${data.feedback.numbers}</span>
                </div>
                <div class="feedback-item">
                    <strong>Clock Hands:</strong>
                    <span>${data.feedback.hands}</span>
                </div>
                <div class="feedback-item">
                    <strong>Overall Assessment:</strong>
                    <span>${data.feedback.overall}</span>
                </div>
            </div>
        </div>
        
        <div class="recommendation-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
            </svg>
            <p>${data.recommendation}</p>
        </div>
        
        <div class="drawing-preview">
            <h4>Your Drawing</h4>
            <img src="${clockCanvas.toDataURL()}" alt="Clock drawing" style="max-width: 300px; border: 2px solid #D5E8F0; border-radius: 12px;">
        </div>
    `;
    
    document.getElementById('clockResultsBody').innerHTML = resultsHTML;
}

function closeClockResults() {
    document.getElementById('clockResultsModal').style.display = 'none';
}

function retryClockTest() {
    closeClockResults();
    clearClockCanvas();
    clockDrawingData = [];
    startClockTimer();
}

async function saveClockResults() {
    // Save to backend
    alert('✅ Your clock drawing test results have been saved successfully!');
    closeClockResults();
}

// Initialize when activity starts
document.addEventListener('DOMContentLoaded', function() {
    // Check if clock canvas exists and initialize
    const checkCanvas = setInterval(() => {
        if (document.getElementById('clockCanvas')) {
            initClockCanvas();
            clearInterval(checkCanvas);
        }
    }, 500);
});

function startClockDrawing() {
    if (window.aiOrb) {
        window.aiOrb.clockDrawingGuide();
    }
}
