// ============================================
// NILA - PERSISTENT ACROSS PAGES
// Remembers state, conversation, and mic settings
// ============================================

class NilaAI {
    constructor() {
        console.log('💙 Nila AI Initializing...');
        
        // Load saved state from localStorage
        const savedState = this.loadState();
        
        // Core state (restored from localStorage)
        this.isActive = savedState.isActive || false;
        this.isListening = false;
        this.isSpeaking = false;
        this.micEnabled = savedState.micEnabled !== undefined ? savedState.micEnabled : true;
        this.typingMode = false;
        
        // Memory and context
        this.conversationMemory = this.loadMemory();
        this.currentPage = this.detectCurrentPage();
        this.screenContext = {};
        
        // Speech recognition
        this.recognition = null;
        this.wakeWordRecognition = null;
        
        // TTS
        this.tts = null;
        
        // Rotating messages
        this.rotatingMessages = [
            "Say Hi Nila",
            "Your AI Assistant",
            "I'm here to help",
            "Ask me anything"
        ];
        this.currentMessageIndex = 0;
        this.messageInterval = null;
        
        this.init();
    }

    // Add new state persistence methods
    loadState() {
        const stored = localStorage.getItem('nila_state');
        return stored ? JSON.parse(stored) : {};
    }

    saveState() {
        const state = {
            isActive: this.isActive,
            micEnabled: this.micEnabled,
            timestamp: Date.now()
        };
        localStorage.setItem('nila_state', JSON.stringify(state));
    }

    init() {
        this.createNilaUI();
        this.initSpeechRecognition();
        this.initWakeWordDetection();
        this.initTTS();
        this.captureScreenContext();
        this.setupEventListeners();
        
        // Restore active state if it was active before navigation
        if (this.isActive) {
            console.log('📍 Restoring Nila state from previous page');
            this.restoreActiveState();
        } else {
            this.startMessageRotation();
        }
        
        console.log('✅ Nila AI Ready on', this.currentPage);
    }

    restoreActiveState() {
        this.stopMessageRotation();
        
        // Restore UI state
        document.getElementById('nila-pill').classList.add('active');
        document.getElementById('nila-controls').classList.add('show');
        
        this.updateMessage('I\'m still here!');
        
        // Restore mic if it was enabled
        if (this.micEnabled) {
            setTimeout(() => {
                try {
                    this.recognition.start();
                } catch (e) {
                    console.error('Start failed:', e);
                }
            }, 1000);
        }
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        if (path === '/' || path === '/home') return 'home';
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('detection')) return 'detection';
        if (path.includes('companion')) return 'companion';
        if (path.includes('emergency')) return 'emergency';
        if (path.includes('profile')) return 'profile';
        if (path.includes('lifevault')) return 'lifevault';
        return 'home';
    }

    // ============================================
    // UI CREATION
    // ============================================
    createNilaUI() {
        const nilaContainer = document.createElement('div');
        nilaContainer.id = 'nila-container';
        nilaContainer.className = 'nila-clean-container';
        nilaContainer.innerHTML = `
            <!-- Bottom Pill Indicator -->
            <div id="nila-pill" class="nila-pill">
                <div class="nila-pill-content">
                    <div class="nila-indicator-dot"></div>
                    <span id="nila-message" class="nila-message">Say Hi Nila</span>
                </div>
            </div>

            <!-- Bottom Control Bar -->
            <div id="nila-controls" class="nila-controls">
                <button id="nila-close-btn" class="nila-btn nila-btn-close" title="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18" stroke-width="2"></line>
                        <line x1="6" y1="6" x2="18" y2="18" stroke-width="2"></line>
                    </svg>
                </button>
                
                <button id="nila-mic-btn" class="nila-btn nila-btn-mic" title="Toggle Voice">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="mic-icon">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke-width="2"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke-width="2"></path>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="mic-off-icon" style="display: none;">
                        <line x1="1" y1="1" x2="23" y2="23" stroke-width="2"></line>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke-width="2"></path>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" stroke-width="2"></path>
                    </svg>
                </button>
                
                <button id="nila-keyboard-btn" class="nila-btn nila-btn-keyboard" title="Type Instead">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="2" y="6" width="20" height="12" rx="2" stroke-width="2"></rect>
                        <line x1="7" y1="10" x2="7.01" y2="10" stroke-width="2" stroke-linecap="round"></line>
                        <line x1="12" y1="10" x2="12.01" y2="10" stroke-width="2" stroke-linecap="round"></line>
                        <line x1="17" y1="10" x2="17.01" y2="10" stroke-width="2" stroke-linecap="round"></line>
                        <line x1="7" y1="14" x2="17" y2="14" stroke-width="2" stroke-linecap="round"></line>
                    </svg>
                </button>
            </div>

            <!-- Compact Typing Input -->
            <div id="nila-typing-input" class="nila-typing-input">
                <input 
                    type="text" 
                    id="nila-text-input" 
                    placeholder="Type your message..."
                    autocomplete="off"
                />
                <button id="nila-send-btn" class="nila-send-btn" title="Send">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="22" y1="2" x2="11" y2="13" stroke-width="2"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2" stroke-width="2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        
        document.body.appendChild(nilaContainer);
    }

    // ============================================
    // ROTATING MESSAGES
    // ============================================
    startMessageRotation() {
        this.messageInterval = setInterval(() => {
            if (!this.isActive && !this.isListening && !this.isSpeaking) {
                this.currentMessageIndex = (this.currentMessageIndex + 1) % this.rotatingMessages.length;
                this.updateMessage(this.rotatingMessages[this.currentMessageIndex]);
            }
        }, 3000);
    }

    stopMessageRotation() {
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
        }
    }

    updateMessage(text) {
        const messageEl = document.getElementById('nila-message');
        if (messageEl) {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.textContent = text;
                messageEl.style.opacity = '1';
            }, 200);
        }
    }

    // ============================================
    // SPEECH RECOGNITION
    // ============================================
    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.error('❌ Speech recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            console.log('🎤 Listening started');
            this.isListening = true;
            this.stopMessageRotation();
            this.updateMessage('Listening...');
            this.updateUI();
        };

        this.recognition.onresult = (event) => {
            if (this.isSpeaking || !this.micEnabled) {
                console.log('🔇 Blocked - AI speaking or mic disabled');
                return;
            }
            
            let final = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                }
            }
            
            if (final) {
                console.log('✅ User said:', final);
                this.handleUserMessage(final.trim());
            }
        };

        this.recognition.onerror = (event) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.error('❌ Recognition error:', event.error);
            }
        };

        this.recognition.onend = () => {
            console.log('⏹️ Recognition ended');
            this.isListening = false;
            
            if (this.isActive && this.micEnabled) {
                setTimeout(() => {
                    if (this.isActive && this.micEnabled && !this.isSpeaking) {
                        try {
                            this.recognition.start();
                        } catch (e) {
                            console.error('Restart failed:', e);
                        }
                    }
                }, 300);
            } else {
                this.startMessageRotation();
                this.updateUI();
            }
        };
    }

    // ============================================
    // WAKE WORD DETECTION
    // ============================================
    initWakeWordDetection() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.wakeWordRecognition = new SpeechRecognition();
    this.wakeWordRecognition.continuous = true;
    this.wakeWordRecognition.interimResults = true;
    this.wakeWordRecognition.lang = 'en-US';

    this.wakeWordRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.toLowerCase().trim();
            
            // Wake word detection
            const wakeWords = ['hi', 'hey', 'nila', 'hi nila', 'hey nila', 'hello nila'];
            const detected = wakeWords.some(word => {
                return transcript === word || 
                       transcript.startsWith(word + ' ') || 
                       transcript.endsWith(' ' + word) ||
                       transcript.includes(' ' + word + ' ');
            });
            
            if (detected && !this.isActive) {
                console.log('👋 Wake word detected:', transcript);
                
                // ADDED: Show "Opening Nila..." message
                this.stopMessageRotation();
                this.updateMessage('Opening Nila...');
                
                // Small delay for visual feedback
                setTimeout(() => {
                    this.activateNila();
                }, 500);
                break;
            }
        }
    };

    this.wakeWordRecognition.onerror = (error) => {
        if (error.error !== 'no-speech' && error.error !== 'aborted') {
            console.error('❌ Wake word error:', error);
        }
    };

    this.wakeWordRecognition.onend = () => {
        if (!this.isActive) {
            setTimeout(() => {
                try {
                    this.wakeWordRecognition.start();
                } catch (e) {
                    // Ignore
                }
            }, 100);
        }
    };

    try {
        this.wakeWordRecognition.start();
        console.log('👂 Wake word detection active');
    } catch (error) {
        console.error('Wake word start error:', error);
    }
}

    // ============================================
    // TTS
    // ============================================
    initTTS() {
        if (typeof EnhancedTTS !== 'undefined') {
            this.tts = new EnhancedTTS();
        }
    }

    async speak(text) {
        const cleanText = text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/😊|😁|👋|🌊|💙|🔍|📖|📄|📌|🔘/g, '')
            .trim();
        
        console.log('🔊 Speaking:', cleanText);
        
        if (this.isListening) {
            this.recognition.stop();
        }
        
        this.isSpeaking = true;
        this.updateMessage('Speaking...');
        this.updateUI();
        
        try {
            if (this.tts) {
                await this.tts.speak(cleanText);
            } else {
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                
                window.speechSynthesis.speak(utterance);
                
                await new Promise((resolve) => {
                    utterance.onend = resolve;
                    utterance.onerror = resolve;
                });
            }
        } catch (error) {
            console.error('❌ TTS error:', error);
        } finally {
            this.isSpeaking = false;
            this.updateUI();
            
            if (this.isActive && this.micEnabled) {
                setTimeout(() => {
                    if (!this.isSpeaking && this.micEnabled) {
                        this.recognition.start();
                    }
                }, 500);
            }
        }
    }

    // ============================================
    // SCREEN CONTEXT
    // ============================================
    captureScreenContext() {
        const mainContent = document.querySelector('main') || 
                          document.querySelector('.content') || 
                          document.body;
        
        this.screenContext = {
            page: this.currentPage,
            title: document.title,
            url: window.location.href,
            headings: Array.from(mainContent.querySelectorAll('h1, h2, h3'))
                .map(h => h.textContent.trim()).slice(0, 8),
            paragraphs: Array.from(mainContent.querySelectorAll('p'))
                .map(p => p.textContent.trim()).slice(0, 5),
            buttons: Array.from(mainContent.querySelectorAll('button'))
                .map(b => b.textContent.trim()).slice(0, 10),
            links: Array.from(mainContent.querySelectorAll('a'))
                .map(a => a.textContent.trim()).slice(0, 8)
        };
        
        console.log('📸 Screen context captured');
    }

    // ============================================
    // MESSAGE HANDLING - FIXED EMERGENCY LOGIC
    // ============================================
    async handleUserMessage(message) {
    console.log('💬 Processing:', message);
    
    this.saveToMemory('user', message);
    this.updateMessage('Thinking...');
    
    // ADDED: Frontend Life-Vault detection (catches voice recognition issues)
    const lowerMessage = message.toLowerCase();
    const lifevaultPatterns = ['life vault', 'lifevault', 'life bold', 'life bolt', 'live vault', 'qr code'];
    const navigationTriggers = ['take me', 'go to', 'navigate', 'open', 'show', 'bring me'];
    
    if (lifevaultPatterns.some(p => lowerMessage.includes(p)) && 
        navigationTriggers.some(t => lowerMessage.includes(t))) {
        console.log('🧭 Frontend detected Life-Vault navigation');
        this.updateMessage('Opening Life-Vault...');
        this.speak("Sure! Opening Life-Vault now.");
        setTimeout(() => {
            window.location.href = '/lifevault';
        }, 1000);
        return;
    }
    
    // FIXED: Only detect emergency on VERY explicit keywords
    if (this.isEmergencyCommand(message)) {
        console.log('🚨 Emergency command detected');
        this.handleEmergency();
        return;
    }
    
    try {
        this.captureScreenContext();
        
        const response = await fetch('/api/nila/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                history: this.conversationMemory,
                screen_context: this.screenContext,
                current_page: this.currentPage
            })
        });
        
        if (!response.ok) throw new Error('Backend failed');
        
        const data = await response.json();
        this.saveToMemory('assistant', data.message);
        
        // Handle navigation actions from backend
        if (data.action) {
            this.handleAction(data.action);
        }
        
        if (data.speak !== false) {
            this.speak(data.message);
        }
    } catch (error) {
        console.error('❌ Backend error:', error);
        this.speak("I'm having trouble connecting. Please try again.");
    }
}


    // FIXED: Much stricter emergency detection
    // FIXED: Much stricter emergency detection
isEmergencyCommand(message) {
    const lowerMessage = message.toLowerCase();
    
    // VERY strict - only explicit emergency phrases
    const emergencyPhrases = [
        'emergency',
        'i need help',
        'help me please',
        'call for help',
        'sos',
        'urgent help',
        'need doctor',
        'need hospital',
        'call ambulance',
        'medical emergency',
        'heart attack',
        'cant breathe',
        "can't breathe",
        'im falling',
        'help now'
    ];
    
    // Must match EXACTLY or as part of longer emergency phrase
    return emergencyPhrases.some(phrase => {
        // Check if phrase exists as a complete phrase (not just substring)
        const regex = new RegExp(`\\b${phrase}\\b`, 'i');
        return regex.test(lowerMessage);
    });
}


    handleEmergency() {
        this.updateMessage('🚨 Emergency - Getting help!');
        this.speak("I'm activating emergency assistance right away. Don't worry, help is coming.");
        
        // Navigate to emergency page after brief delay
        setTimeout(() => {
            window.location.href = '/emergency';
        }, 2000);
    }

    handleAction(action) {
    const routes = {
        'navigate_home': '/',
        'navigate_dashboard': '/dashboard',
        'navigate_detection': '/detection',
        'navigate_companion': '/companion',
        'navigate_emergency': '/emergency',
        'navigate_profile': '/profile',
        'navigate_lifevault': '/lifevault',  // ADDED
        'navigate_life_vault': '/lifevault'  // ADDED (alternative)
    };
    
    if (routes[action]) {
        console.log('🧭 Navigating to:', action);
        setTimeout(() => {
            window.location.href = routes[action];
        }, 1000);
    }
}

    // ============================================
    // UI CONTROL
    // ============================================
    activateNila() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.saveState(); // Add state persistence
        
        this.stopMessageRotation();
        
        document.getElementById('nila-pill').classList.add('active');
        document.getElementById('nila-controls').classList.add('show');
        
        // Greet user
        const greeting = "Hi! I am Nila, your personal assistant. How can I help you today?";
        this.updateMessage('Hi! I\'m Nila');
        this.speak(greeting);
        
        // Start listening if mic enabled
        if (this.micEnabled) {
            setTimeout(() => {
                try {
                    this.recognition.start();
                } catch (e) {
                    console.error('Start failed:', e);
                }
            }, 2000);
        }
    }

    deactivateNila() {
        this.isActive = false;
        this.saveState(); // Add state persistence
        
        if (this.recognition) {
            this.recognition.stop();
        }
        
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        this.isListening = false;
        
        document.getElementById('nila-pill').classList.remove('active');
        document.getElementById('nila-controls').classList.remove('show');
        
        this.hideTypingInput();
        
        this.startMessageRotation();
        this.updateMessage('Say Hi Nila');
    }

    toggleMic() {
        this.micEnabled = !this.micEnabled;
        this.saveState(); // Add state persistence
        
        const micIcon = document.querySelector('.mic-icon');
        const micOffIcon = document.querySelector('.mic-off-icon');
        
        if (this.micEnabled) {
            console.log('🎤 Mic enabled');
            micIcon.style.display = 'block';
            micOffIcon.style.display = 'none';
            if (this.isActive && !this.isSpeaking) {
                this.recognition.start();
            }
        } else {
            console.log('🔇 Mic disabled');
            micIcon.style.display = 'none';
            micOffIcon.style.display = 'block';
            this.recognition.stop();
            this.updateMessage('Mic off - Type or click mic to enable');
        }
    }

    toggleTypingMode() {
        this.typingMode = !this.typingMode;
        
        const typingInput = document.getElementById('nila-typing-input');
        const keyboardBtn = document.getElementById('nila-keyboard-btn');
        
        if (this.typingMode) {
            console.log('⌨️ Typing mode enabled');
            typingInput.classList.add('show');
            keyboardBtn.classList.add('active');
            
            setTimeout(() => {
                document.getElementById('nila-text-input').focus();
            }, 100);
        } else {
            console.log('🎤 Voice mode enabled');
            this.hideTypingInput();
            keyboardBtn.classList.remove('active');
        }
    }

    hideTypingInput() {
        document.getElementById('nila-typing-input').classList.remove('show');
        this.typingMode = false;
    }

    updateUI() {
        const pill = document.getElementById('nila-pill');
        const dot = pill.querySelector('.nila-indicator-dot');
        
        if (this.isSpeaking) {
            dot.className = 'nila-indicator-dot speaking';
        } else if (this.isListening && this.micEnabled) {
            dot.className = 'nila-indicator-dot listening';
        } else {
            dot.className = 'nila-indicator-dot';
        }
    }

    // ============================================
    // MEMORY
    // ============================================
    loadMemory() {
        const stored = localStorage.getItem('nila_memory');
        return stored ? JSON.parse(stored) : [];
    }

    saveToMemory(role, content) {
        this.conversationMemory.push({ role, content });
        if (this.conversationMemory.length > 20) {
            this.conversationMemory = this.conversationMemory.slice(-20);
        }
        localStorage.setItem('nila_memory', JSON.stringify(this.conversationMemory));
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        document.getElementById('nila-pill')?.addEventListener('click', () => {
            if (!this.isActive) {
                this.activateNila();
            }
        });

        document.getElementById('nila-close-btn')?.addEventListener('click', () => {
            this.deactivateNila();
        });

        document.getElementById('nila-mic-btn')?.addEventListener('click', () => {
            this.toggleMic();
        });

        document.getElementById('nila-keyboard-btn')?.addEventListener('click', () => {
            this.toggleTypingMode();
        });

        document.getElementById('nila-send-btn')?.addEventListener('click', () => {
            const input = document.getElementById('nila-text-input');
            if (input.value.trim()) {
                this.handleUserMessage(input.value.trim());
                input.value = '';
            }
        });

        document.getElementById('nila-text-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = document.getElementById('nila-text-input');
                if (input.value.trim()) {
                    this.handleUserMessage(input.value.trim());
                    input.value = '';
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.deactivateNila();
            }
        });
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.nila = new NilaAI();
});
