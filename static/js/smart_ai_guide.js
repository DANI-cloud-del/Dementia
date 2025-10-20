/**
 * ============================================
 * SMART AI GUIDE - Transparent Navigation Assistant
 * Matches website theme, intelligent page navigator
 * ============================================
 */

class SmartAIGuide {
    constructor() {
        this.isActive = false;
        this.isListening = false;
        this.isSpeaking = false;
        this.currentPage = null;
        this.currentActivity = null;
        this.currentSubActivity = null;
        this.recognition = null;
        this.conversationHistory = [];
        
        // Add auto-hide properties
        this.autoHideTimeout = null;
        this.autoHideDelay = 10000; // 10 seconds of inactivity
        
        // Site map for intelligent navigation
this.siteMap = {
    home: {
        name: 'Home',
        url: '/',
        description: 'Welcome page with an overview of Silent Guardian'
    },
    dashboard: {
        name: 'Dashboard',
        url: '/dashboard',
        description: 'Your personal dashboard with quick access to all features'
    },
    detection: {
        name: 'Cognitive Activities',
        url: '/detection',
        description: 'Memory games, storytelling, and cognitive exercises',
        activities: {
            games: {
                name: 'Memory Games',
                subActivities: ['Matching Cards', 'Pattern Sequence', 'Word Recall']
            },
            story: {
                name: 'Story Telling',
                description: 'Share your memories and stories'
            },
            conversation: {
                name: 'Guided Conversation',
                description: 'Have a natural chat'
            },
            image: {
                name: 'Picture Description',
                description: 'Describe and discuss images'
            },
            clock: {
                name: 'Drawing Activity',
                description: 'Creative drawing exercises'
            }
        }
    },
    companion: {
        name: 'AI Companion',
        url: '/companion',
        description: 'Voice conversation with your AI friend'
    },
    lifevault: {
        name: 'LifeVault',
        url: '/lifevault',
        description: 'Store and manage important documents'
    },
    emergency: {
        name: 'Emergency',
        url: '/emergency',
        description: 'Emergency contacts and quick help'
    },
    profile: {
        name: 'Profile',
        url: '/profile',
        description: 'Personal settings and information'
    }
};

        
        this.init();
    }

    init() {
        console.log('🤖 Initializing Smart AI Guide...');
        this.createUI();
        this.initSpeechRecognition();
        this.detectCurrentPage();
        this.analyzePageContext();
        this.greetUser();
    }

    detectCurrentPage() {
    const path = window.location.pathname;
    
    // Fix: Correctly detect home page
    if (path === '/' || path === '/home' || path === '/homepage') {
        this.currentPage = 'home';
    }
    else if (path.includes('detection')) this.currentPage = 'detection';
    else if (path.includes('companion')) this.currentPage = 'companion';
    else if (path.includes('dashboard')) this.currentPage = 'dashboard';
    else if (path.includes('lifevault') || path.includes('life-vault')) this.currentPage = 'lifevault';
    else if (path.includes('emergency')) this.currentPage = 'emergency';
    else if (path.includes('profile')) this.currentPage = 'profile';
    else this.currentPage = 'home'; // Default to home
    
    console.log('📍 Current page:', this.currentPage);
}
    createUI() {
        const guideHTML = `
            <!-- Minimal overlay (only slight dim, no blur) -->
            <div id="aiGuideOverlay" class="ai-guide-overlay-minimal"></div>

            <!-- Transparent Horizontal Guide Bar -->
            <div id="aiGuideContainer" class="ai-guide-container-transparent">
                
                <!-- AI Avatar with Status -->
                <div class="ai-avatar-compact">
                    <div class="avatar-circle" id="aiAvatarCircle">
                        <svg viewBox="0 0 40 40" class="avatar-svg">
                            <circle cx="20" cy="20" r="18" fill="url(#tealGradient)"/>
                            <circle cx="15" cy="16" r="2" fill="white" opacity="0.95"/>
                            <circle cx="25" cy="16" r="2" fill="white" opacity="0.95"/>
                            <path d="M 14 24 Q 20 27 26 24" stroke="white" stroke-width="2.5" 
                                  fill="none" stroke-linecap="round" opacity="0.95"/>
                            <defs>
                                <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#17a2b8;stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:#138496;stop-opacity:1" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div class="status-dot" id="statusDot"></div>
                    </div>
                    <span class="guide-label">Guide</span>
                </div>

                <!-- Message Display (Compact, Single Line) -->
                <div class="message-display-compact">
                    <div class="current-message" id="currentMessage">
                        Hello! I'm your guide. Ask me anything or tap the mic to speak.
                    </div>
                </div>

                <!-- Input Controls -->
                <div class="input-controls-compact">
                    <!-- Text Input -->
                    <input 
                        type="text" 
                        id="guideTextInput" 
                        class="guide-text-input-transparent"
                        placeholder="Type or ask..."
                        autocomplete="off"
                    />
                    
                    <!-- Voice Button (Prominent) -->
                    <button class="voice-btn-prominent" id="guideVoiceBtn" title="Voice Input">
                        <svg viewBox="0 0 24 24" class="mic-svg">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" fill="currentColor"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" fill="currentColor"/>
                        </svg>
                    </button>
                    
                    <!-- Send Button -->
                    <button class="send-btn-compact" id="guideSendBtn" title="Send">
                        <svg viewBox="0 0 24 24" class="send-svg">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>

                <!-- Minimize Button -->
                <button class="minimize-btn-compact" id="guideMinimizeBtn" title="Minimize">
                    <svg viewBox="0 0 24 24" class="minimize-svg">
                        <path d="M19 13H5v-2h14v2z" fill="currentColor"/>
                    </svg>
                </button>

            </div>

            <!-- Listening Indicator (Visible) -->
            <div class="listening-indicator-visible" id="listeningIndicator">
                <div class="listening-waves">
                    <span class="wave"></span>
                    <span class="wave"></span>
                    <span class="wave"></span>
                </div>
                <span class="listening-label">Listening...</span>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', guideHTML);

        // Add toggle button after main container
        const toggleButtonHTML = `
            <!-- Floating Toggle Button (when minimized) -->
            <button class="ai-guide-toggle-fab" id="aiGuideToggleFab" style="display: none;">
                <svg viewBox="0 0 24 24" class="toggle-icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
                </svg>
                <span class="toggle-text">Guide</span>
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', toggleButtonHTML);

        // Update elements object
        this.elements = {
            container: document.getElementById('aiGuideContainer'),
            overlay: document.getElementById('aiGuideOverlay'),
            avatar: document.getElementById('aiAvatarCircle'),
            statusDot: document.getElementById('statusDot'),
            currentMessage: document.getElementById('currentMessage'),
            textInput: document.getElementById('guideTextInput'),
            voiceBtn: document.getElementById('guideVoiceBtn'),
            sendBtn: document.getElementById('guideSendBtn'),
            minimizeBtn: document.getElementById('guideMinimizeBtn'),
            listeningIndicator: document.getElementById('listeningIndicator'),
            toggleFab: document.getElementById('aiGuideToggleFab')
        };

        this.attachEventListeners();
    }

    attachEventListeners() {
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.elements.textInput.value.trim()) {
                this.handleUserInput(this.elements.textInput.value.trim());
                this.elements.textInput.value = '';
            }
        });

        this.elements.sendBtn.addEventListener('click', () => {
            if (this.elements.textInput.value.trim()) {
                this.handleUserInput(this.elements.textInput.value.trim());
                this.elements.textInput.value = '';
            }
        });

        this.elements.voiceBtn.addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        this.elements.minimizeBtn.addEventListener('click', () => {
            this.toggleMinimize();
        });

        this.elements.overlay.addEventListener('click', () => {
            this.deactivateFocus();
        });

        // Add toggle button listener
        this.elements.toggleFab.addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Add transition listener for toggle button visibility
        this.elements.container.addEventListener('transitionend', () => {
            if (this.elements.container.classList.contains('minimized')) {
                this.elements.toggleFab.style.display = 'flex';
            } else {
                this.elements.toggleFab.style.display = 'none';
            }
        });
    }

    enableAutoHide() {
        // Clear existing timeout
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
        
        // Set new timeout to minimize guide
        this.autoHideTimeout = setTimeout(() => {
            if (!this.isSpeaking && !this.isListening && !this.isActive) {
                this.toggleMinimize();
                console.log('Auto-hiding AI guide');
            }
        }, this.autoHideDelay);
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.handleUserInput(transcript);
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateStatus('idle');
                this.elements.listeningIndicator.style.display = 'none';
                this.elements.voiceBtn.classList.remove('listening-active');
            };

            this.recognition.onerror = (error) => {
                console.error('Speech error:', error);
                this.isListening = false;
                this.updateStatus('idle');
            };
        }
    }

    analyzePageContext() {
        const pageInfo = this.siteMap[this.currentPage] || {};
        console.log('📊 Page Context:', pageInfo);
        
        // Detect activities if on detection page
        if (this.currentPage === 'detection') {
            this.detectActivities();
        }
    }

    detectActivities() {
        // Check if activity is open
        const activityContent = document.getElementById('activityContent');
        const activityTitle = document.getElementById('activityTitle');
        
        if (activityContent && activityContent.style.display !== 'none') {
            if (activityTitle) {
                const title = activityTitle.textContent.toLowerCase();
                
                if (title.includes('memory')) this.currentActivity = 'games';
                else if (title.includes('story')) this.currentActivity = 'story';
                else if (title.includes('clock') || title.includes('draw')) this.currentActivity = 'clock';
                else if (title.includes('picture') || title.includes('image')) this.currentActivity = 'image';
                else if (title.includes('conversation')) this.currentActivity = 'conversation';
                
                console.log('🎮 Current activity:', this.currentActivity);
            }
        }
    }

    removeEmojis(text) {
        return text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
            .replace(/[\uFE00-\uFE0F]/gu, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    showMessage(text, sender = 'ai') {
        const cleanText = this.removeEmojis(text);
        this.elements.currentMessage.textContent = cleanText;
        
        if (sender === 'user') {
            this.elements.currentMessage.classList.add('user-speaking');
            setTimeout(() => {
                this.elements.currentMessage.classList.remove('user-speaking');
            }, 2000);
        }
        
        this.conversationHistory.push({
            sender,
            text: cleanText,
            timestamp: Date.now()
        });
    }

    async speak(text) {
        const cleanText = this.removeEmojis(text);
        this.showMessage(cleanText, 'ai');
        this.updateStatus('speaking');
        this.activateFocus(true);
        this.isSpeaking = true;
        
        // Reset auto-hide timer
        this.enableAutoHide();

        try {
            if (window.enhancedTTS && window.enhancedTTS.ready) {
                await window.enhancedTTS.speak(cleanText, {
                    rate: 0.9,
                    pitch: 1.0,
                    volume: 1.0
                });
            } else {
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.rate = 0.9;
                speechSynthesis.speak(utterance);
                
                await new Promise(resolve => {
                    utterance.onend = resolve;
                    setTimeout(resolve, 5000);
                });
            }
        } catch (error) {
            console.error('TTS Error:', error);
        }

        this.isSpeaking = false;
        this.updateStatus('idle');
        this.deactivateFocus();
        
        // Start auto-hide countdown after speaking
        this.enableAutoHide();
    }

    async handleUserInput(text) {
        console.log('User input:', text);
        
        // Reset auto-hide timer
        this.enableAutoHide();
        
        this.showMessage(text, 'user');
        this.updateStatus('thinking');
        
        try {
            const response = await fetch('/api/smart-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    currentPage: this.currentPage,
                    currentActivity: this.currentActivity,
                    siteMap: this.siteMap,
                    conversationHistory: this.conversationHistory.slice(-5)
                })
            });

            const data = await response.json();
            
            if (data.response) {
                await this.speak(data.response);
            }

            if (data.action) {
                this.executeAction(data.action);
            }
            
        } catch (error) {
            console.error('AI Error:', error);
            await this.speak("I'm having trouble. Could you rephrase that?");
        }
    }

    executeAction(action) {
    console.log('Executing action:', action);
    
    try {
        switch (action.type) {
            case 'navigate':
                window.location.href = action.url;
                break;
                
            case 'start_activity':
                // Check if we're on detection page
                if (this.currentPage === 'detection') {
                    // Use global startActivity function
                    if (typeof window.startActivity === 'function') {
                        window.startActivity(action.activity);
                        this.currentActivity = action.activity;
                    } else {
                        console.error('startActivity function not found');
                        this.speak("I'm having trouble starting that activity. Please try clicking on it directly.");
                    }
                } else {
                    // Navigate to detection page first
                    window.location.href = '/detection';
                }
                break;
                
            case 'start_sub_activity':
                if (window.startSubActivity) {
                    window.startSubActivity(action.activity, action.subActivity);
                    this.currentSubActivity = action.subActivity;
                }
                break;
                
            case 'provide_hint':
                this.showHint(action.hint);
                break;
                
            case 'show_feedback':
                this.showFeedback(action.message, action.type);
                break;
        }
    } catch (error) {
        console.error('Action execution error:', error);
        this.speak("I encountered an issue. Let me try that again.");
    }
}


    updateStatus(status) {
        this.elements.avatar.className = 'avatar-circle ' + status;
        this.elements.statusDot.className = 'status-dot ' + status;
    }

    activateFocus(subtle = false) {
        this.isActive = true;
        if (subtle) {
            this.elements.overlay.classList.add('subtle-active');
        } else {
            this.elements.overlay.classList.add('active');
        }
    }

    deactivateFocus() {
        if (this.isSpeaking) return;
        
        this.isActive = false;
        this.elements.overlay.classList.remove('active', 'subtle-active');
    }

    toggleVoiceInput() {
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!this.recognition) {
            this.speak("Voice input is not available on your device.");
            return;
        }

        this.isListening = true;
        this.updateStatus('listening');
        this.elements.voiceBtn.classList.add('listening-active');
        this.elements.listeningIndicator.style.display = 'flex';
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Recognition error:', error);
        }
    }

    stopVoiceInput() {
        this.isListening = false;
        this.updateStatus('idle');
        this.elements.voiceBtn.classList.remove('listening-active');
        this.elements.listeningIndicator.style.display = 'none';
        
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    toggleMinimize() {
        this.elements.container.classList.toggle('minimized');
        const icon = this.elements.minimizeBtn.querySelector('.minimize-svg path');
        if (this.elements.container.classList.contains('minimized')) {
            icon.setAttribute('d', 'M19 13H5v-2h14v2z M12 8l-6 6h12z');
        } else {
            icon.setAttribute('d', 'M19 13H5v-2h14v2z');
        }
    }

    async greetUser() {
    const pageInfo = this.siteMap[this.currentPage];
    let greeting = "Hi! I'm your guide. How can I help?";
    
    if (pageInfo) {
        // Simple, non-repetitive greetings
        switch (this.currentPage) {
            case 'home':
                greeting = "Welcome! I'm here to help you navigate.";
                break;
            case 'dashboard':
                greeting = "This is your dashboard. What would you like to do?";
                break;
            case 'detection':
                greeting = "Ready for an activity? Just ask!";
                break;
            case 'companion':
                greeting = "Let's have a conversation!";
                break;
            case 'lifevault':
                greeting = "Your documents are safe here.";
                break;
            case 'emergency':
                greeting = "Emergency help is available.";
                break;
            case 'profile':
                greeting = "This is your profile.";
                break;
            default:
                greeting = "Hi! How can I help?";
        }
    }
    
    setTimeout(() => {
        this.showMessage(greeting, 'ai');
    }, 1500);
}
}
// Initialize
window.smartGuide = new SmartAIGuide();
