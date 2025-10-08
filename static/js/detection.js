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

// Generate Memory Game Content
function generateMemoryGameContent() {
    return `
        <div class="memory-game-container">
            <div class="game-instructions">
                <h3>Word Recall Game</h3>
                <p>Remember the following words. They will disappear after 30 seconds.</p>
            </div>
            
            <div class="word-display" id="wordDisplay">
                <div class="word-grid">
                    <div class="word-card">Apple</div>
                    <div class="word-card">Mountain</div>
                    <div class="word-card">Ocean</div>
                    <div class="word-card">Sunshine</div>
                    <div class="word-card">Garden</div>
                    <div class="word-card">River</div>
                </div>
                <div class="timer" id="gameTimer">Time remaining: 30s</div>
            </div>
            
            <div class="recall-section" id="recallSection" style="display: none;">
                <h3>Now, speak or type the words you remember:</h3>
                <div class="recall-input-group">
                    <button class="voice-recall-btn" id="voiceRecallBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke-width="2"></path>
                            <line x1="12" y1="19" x2="12" y2="23" stroke-width="2"></line>
                            <line x1="8" y1="23" x2="16" y2="23" stroke-width="2"></line>
                        </svg>
                        <span>Speak Words</span>
                    </button>
                    <input type="text" id="recallInput" placeholder="Or type words separated by commas..." />
                    <button class="submit-recall-btn" id="submitRecallBtn">Submit</button>
                </div>
                <div class="recall-feedback" id="recallFeedback"></div>
            </div>
        </div>
    `;
}

// Generate Image Description Content
function generateImageDescriptionContent() {
    return `
        <div class="image-description-container">
            <div class="description-instructions">
                <h3>Describe What You See</h3>
                <p>Look at the image below and describe everything you notice. Take your time.</p>
            </div>
            
            <div class="test-image">
                <img src="${getTestImageUrl()}" alt="Test image" />
            </div>
            
            <div class="description-controls">
                <button class="voice-describe-btn" id="voiceDescribeBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke-width="2"></path>
                        <line x1="12" y1="19" x2="12" y2="23" stroke-width="2"></line>
                        <line x1="8" y1="23" x2="16" y2="23" stroke-width="2"></line>
                    </svg>
                    <span>Start Describing</span>
                </button>
                
                <div class="description-text-area">
                    <textarea id="descriptionInput" placeholder="Or type your description here..." rows="6"></textarea>
                    <button class="submit-description-btn" id="submitDescriptionBtn">Submit Description</button>
                </div>
            </div>
            
            <div class="description-feedback" id="descriptionFeedback"></div>
        </div>
    `;
}

// Generate Story Content
function generateStoryContent() {
    return `
        <div class="story-container">
            <div class="story-instructions">
                <h3>Share Your Story</h3>
                <p>Tell us about a memorable moment from your life. It could be from your childhood, a recent event, or anything special to you.</p>
            </div>
            
            <div class="story-prompts">
                <p>Need inspiration? Try one of these:</p>
                <div class="prompt-chips">
                    <button class="prompt-chip" data-prompt="Tell me about your favorite childhood memory">Childhood Memory</button>
                    <button class="prompt-chip" data-prompt="Describe a special family gathering">Family Gathering</button>
                    <button class="prompt-chip" data-prompt="Share a story about your first job">First Job</button>
                    <button class="prompt-chip" data-prompt="Talk about a place you love">Favorite Place</button>
                </div>
            </div>
            
            <div class="story-input-area">
                <button class="voice-story-btn" id="voiceStoryBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke-width="2"></path>
                        <line x1="12" y1="19" x2="12" y2="23" stroke-width="2"></line>
                        <line x1="8" y1="23" x2="16" y2="23" stroke-width="2"></line>
                    </svg>
                    <span>Tell Your Story</span>
                </button>
                
                <div class="story-transcript" id="storyTranscript"></div>
            </div>
        </div>
    `;
}

// Generate Conversation Content
function generateConversationContent() {
    return `
        <div class="conversation-container">
            <div class="conversation-instructions">
                <h3>Let's Have a Chat</h3>
                <p>I'll ask you some questions. Take your time to respond naturally.</p>
            </div>
            
            <div class="conversation-display" id="conversationDisplay">
                <div class="conversation-message ai-message">
                    <p>Hello! Let's start with something simple. Can you tell me what you had for breakfast today?</p>
                </div>
            </div>
            
            <div class="conversation-input">
                <button class="voice-respond-btn" id="voiceRespondBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke-width="2"></path>
                        <line x1="12" y1="19" x2="12" y2="23" stroke-width="2"></line>
                        <line x1="8" y1="23" x2="16" y2="23" stroke-width="2"></line>
                    </svg>
                    <span>Tap to Respond</span>
                </button>
                
                <div class="text-response-area">
                    <input type="text" id="conversationInput" placeholder="Or type your response..." />
                    <button id="sendConversationBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="22" y1="2" x2="11" y2="13" stroke-width="2"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2" stroke-width="2"></polygon>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Initialize activity-specific interactions
function initActivityInteractions(type) {
    switch(type) {
        case 'games':
            initMemoryGame();
            break;
        case 'image':
            initImageDescription();
            break;
        case 'story':
            initStoryTelling();
            break;
        case 'conversation':
            initConversation();
            break;
    }
}

// Memory Game Logic
function initMemoryGame() {
    let timeLeft = 30;
    const timer = document.getElementById('gameTimer');
    const wordDisplay = document.getElementById('wordDisplay');
    const recallSection = document.getElementById('recallSection');
    
    const countdown = setInterval(() => {
        timeLeft--;
        timer.textContent = `Time remaining: ${timeLeft}s`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            wordDisplay.style.display = 'none';
            recallSection.style.display = 'block';
        }
    }, 1000);
}

// Helper function to get test image URL
function getTestImageUrl() {
    // Cookie theft picture or similar standard cognitive test image
    return 'https://via.placeholder.com/600x400?text=Cookie+Theft+Picture';
}

console.log('✅ Detection activities initialized');
