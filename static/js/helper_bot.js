// ============================================
// MINI HELPER BOT - COMPLETE & CLEAN
// Removes emojis and markdown from responses
// ============================================

console.log('✅ Helper Bot loaded');

const helperBotToggle = document.getElementById('helperBotToggle');
const helperBotPanel = document.getElementById('helperBotPanel');
const helperBotMessages = document.getElementById('helperBotMessages');
const helperBotInput = document.getElementById('helperBotInput');
const helperBotSend = document.getElementById('helperBotSend');
const helperVoiceBtn = document.getElementById('helperVoiceBtn');
const voiceTranscriptOverlay = document.getElementById('voiceTranscriptOverlay');
const liveTranscript = document.getElementById('liveTranscript');
const stopListeningBtn = document.getElementById('stopListeningBtn');
const helperStatus = document.getElementById('helperStatus');

let helperBotOpen = false;
let helperRecognition;
let isHelperListening = false;
let interimTranscript = '';
let finalTranscript = '';

// ============================================
// ✅ TEXT CLEANING FUNCTIONS
// ============================================

function removeEmojis(text) {
    // Remove all emojis using regex
    return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F190}-\u{1F1FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '');
}

function removeMarkdown(text) {
    // Remove asterisks and other markdown formatting
    return text
        .replace(/\*\*/g, '')  // Remove bold **
        .replace(/\*/g, '')    // Remove italic *
        .replace(/_{2}/g, '')  // Remove bold __
        .replace(/_/g, '')     // Remove italic _
        .replace(/#{1,6}\s/g, '') // Remove headers #
        .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks
        .replace(/`/g, '')     // Remove inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links [text](url)
}

function cleanTextForDisplay(text) {
    // Clean text for visual display (keep emojis, remove markdown)
    return removeMarkdown(text).trim();
}

function cleanTextForSpeech(text) {
    // Clean text for TTS (remove emojis AND markdown)
    let cleaned = removeMarkdown(text);
    cleaned = removeEmojis(cleaned);
    return cleaned.trim();
}

// ============================================
// CONTEXT-AWARE SUGGESTIONS
// ============================================

function getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('/companion') || path.includes('companion.html')) {
        return 'companion';
    } else if (path.includes('/detection') || path.includes('detection.html')) {
        return 'detection';
    } else if (path.includes('/lifevault') || path.includes('lifevault.html')) {
        return 'lifevault';
    } else if (path.includes('/dashboard') || path.includes('dashboard.html')) {
        return 'dashboard';
    } else if (path.includes('/emergency') || path.includes('emergency.html')) {
        return 'emergency';
    } else if (path.includes('/profile') || path.includes('profile.html')) {
        return 'profile';
    } else {
        return 'home';
    }
}

function getContextualSuggestions() {
    const page = getCurrentPage();
    
    const suggestions = {
        'home': [
            { text: 'How do I start?', help: 'start' },
            { text: 'What is this app?', help: 'explain' },
            { text: 'I need help', help: 'general' }
        ],
        'companion': [
            { text: 'How does this work?', help: 'companion' },
            { text: 'Start a conversation', help: 'chat' },
            { text: 'What can you do?', help: 'features' }
        ],
        'detection': [
            { text: 'How to play games?', help: 'games' },
            { text: 'What are these tests?', help: 'detection' },
            { text: 'Start a memory game', help: 'memory' }
        ],
        'lifevault': [
            { text: 'What is Life-Vault?', help: 'lifevault' },
            { text: 'How do I use QR code?', help: 'qr' },
            { text: 'Edit my info', help: 'edit' }
        ],
        'dashboard': [
            { text: 'Explain dashboard', help: 'dashboard' },
            { text: 'View activity', help: 'activity' },
            { text: 'Check health stats', help: 'stats' }
        ],
        'emergency': [
            { text: 'How to call for help?', help: 'emergency' },
            { text: 'Add emergency contact', help: 'contact' },
            { text: 'What is SOS button?', help: 'sos' }
        ],
        'profile': [
            { text: 'Update my profile', help: 'profile' },
            { text: 'Change settings', help: 'settings' },
            { text: 'How to logout?', help: 'logout' }
        ]
    };
    
    return suggestions[page] || suggestions['home'];
}

function updateSuggestionChips() {
    setTimeout(() => {
        const chips = helperBotPanel ? helperBotPanel.querySelectorAll('.suggestion-chip') : document.querySelectorAll('.suggestion-chip');
        
        if (!chips || chips.length === 0) {
            console.warn('⚠️ No suggestion chips found');
            return;
        }
        
        const suggestions = getContextualSuggestions();
        console.log(`🔄 Updating ${chips.length} chips for page: ${getCurrentPage()}`);
        
        chips.forEach((chip, index) => {
            if (suggestions[index]) {
                chip.textContent = suggestions[index].text;
                chip.setAttribute('data-help', suggestions[index].help);
                
                const newChip = chip.cloneNode(true);
                chip.parentNode.replaceChild(newChip, chip);
                
                newChip.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const helpType = this.getAttribute('data-help');
                    console.log(`🖱️ Chip clicked: ${helpType}`);
                    handleQuickHelp(helpType);
                });
            }
        });
    }, 200);
}

// ============================================
// SPEECH RECOGNITION
// ============================================

function initHelperSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        helperRecognition = new SpeechRecognition();
        
        helperRecognition.continuous = true;
        helperRecognition.interimResults = true;
        helperRecognition.lang = 'en-US';
        helperRecognition.maxAlternatives = 1;
        
        helperRecognition.onstart = () => {
            isHelperListening = true;
            updateVoiceUI(true);
        };
        
        helperRecognition.onresult = (event) => {
            let interim = '';
            let final = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    final += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            
            if (final) {
                finalTranscript += final;
            }
            
            const displayText = (finalTranscript + interim).trim() || 'Start speaking...';
            if (liveTranscript) liveTranscript.textContent = displayText;
            interimTranscript = interim;
        };
        
        helperRecognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                return;
            }
            
            if (event.error === 'not-allowed') {
                alert('Microphone access denied.');
            }
            
            stopVoiceInput();
        };
        
        helperRecognition.onend = () => {
            if (isHelperListening) {
                try {
                    helperRecognition.start();
                } catch (error) {
                    stopVoiceInput();
                }
            }
        };
        
        return true;
    } else {
        if (helperVoiceBtn) {
            helperVoiceBtn.style.display = 'none';
        }
        return false;
    }
}

function updateVoiceUI(listening) {
    if (!helperVoiceBtn) return;
    
    const micIcon = helperVoiceBtn.querySelector('.mic-icon');
    const stopIcon = helperVoiceBtn.querySelector('.stop-icon');
    
    if (listening) {
        helperVoiceBtn.classList.add('listening');
        if (micIcon) micIcon.style.display = 'none';
        if (stopIcon) stopIcon.style.display = 'block';
        if (voiceTranscriptOverlay) voiceTranscriptOverlay.classList.add('active');
        if (helperStatus) helperStatus.textContent = 'Listening...';
        if (liveTranscript) liveTranscript.textContent = 'Start speaking...';
        if (helperBotMessages) {
            helperBotMessages.style.opacity = '0.3';
            helperBotMessages.style.pointerEvents = 'none';
        }
    } else {
        helperVoiceBtn.classList.remove('listening');
        if (micIcon) micIcon.style.display = 'block';
        if (stopIcon) stopIcon.style.display = 'none';
        if (voiceTranscriptOverlay) voiceTranscriptOverlay.classList.remove('active');
        if (helperStatus) helperStatus.textContent = "I'm here to guide you";
        if (helperBotMessages) {
            helperBotMessages.style.opacity = '1';
            helperBotMessages.style.pointerEvents = 'auto';
        }
    }
}

function startVoiceInput() {
    if (!helperRecognition) {
        if (!initHelperSpeechRecognition()) {
            alert('Voice input not supported in your browser.');
            return;
        }
    }
    
    finalTranscript = '';
    interimTranscript = '';
    if (liveTranscript) liveTranscript.textContent = 'Start speaking...';
    
    try {
        helperRecognition.start();
        isHelperListening = true;
    } catch (error) {
        if (error.message.includes('already started')) {
            isHelperListening = true;
            updateVoiceUI(true);
        }
    }
}

function stopVoiceInput() {
    if (helperRecognition) {
        helperRecognition.stop();
    }
    
    isHelperListening = false;
    updateVoiceUI(false);
    
    const message = finalTranscript.trim();
    if (message && helperBotInput) {
        helperBotInput.value = message;
        sendHelperMessage();
    }
    
    finalTranscript = '';
    interimTranscript = '';
}

// ============================================
// EVENT LISTENERS
// ============================================

if (helperBotToggle) {
    helperBotToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        helperBotOpen = !helperBotOpen;
        
        if (helperBotPanel) {
            helperBotPanel.classList.toggle('active');
        }
        
        const helperIcon = helperBotToggle.querySelector('.helper-icon');
        const closeIcon = helperBotToggle.querySelector('.close-icon');
        
        if (helperBotOpen) {
            if (helperIcon) helperIcon.style.display = 'none';
            if (closeIcon) closeIcon.style.display = 'block';
            
            updateSuggestionChips();
            
            setTimeout(() => {
                if (helperBotInput) helperBotInput.focus();
            }, 300);
        } else {
            if (helperIcon) helperIcon.style.display = 'block';
            if (closeIcon) closeIcon.style.display = 'none';
            
            if (isHelperListening) {
                stopVoiceInput();
            }
        }
    });
}

if (helperVoiceBtn) {
    helperVoiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (isHelperListening) {
            stopVoiceInput();
        } else {
            startVoiceInput();
        }
    });
}

if (stopListeningBtn) {
    stopListeningBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopVoiceInput();
    });
}

document.addEventListener('click', (e) => {
    if (helperBotOpen && helperBotPanel && helperBotToggle) {
        if (!helperBotPanel.contains(e.target) && !helperBotToggle.contains(e.target)) {
            helperBotOpen = false;
            helperBotPanel.classList.remove('active');
            
            const helperIcon = helperBotToggle.querySelector('.helper-icon');
            const closeIcon = helperBotToggle.querySelector('.close-icon');
            
            if (helperIcon) helperIcon.style.display = 'block';
            if (closeIcon) closeIcon.style.display = 'none';
            
            if (isHelperListening) {
                stopVoiceInput();
            }
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (isHelperListening) {
            stopVoiceInput();
        } else if (helperBotOpen) {
            helperBotOpen = false;
            if (helperBotPanel) helperBotPanel.classList.remove('active');
            
            const helperIcon = helperBotToggle.querySelector('.helper-icon');
            const closeIcon = helperBotToggle.querySelector('.close-icon');
            
            if (helperIcon) helperIcon.style.display = 'block';
            if (closeIcon) closeIcon.style.display = 'none';
        }
    }
});

// ============================================
// MESSAGING
// ============================================

if (helperBotSend) {
    helperBotSend.addEventListener('click', (e) => {
        e.stopPropagation();
        sendHelperMessage();
    });
}

if (helperBotInput) {
    helperBotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendHelperMessage();
        }
    });
    
    helperBotInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

async function sendHelperMessage() {
    if (!helperBotInput) return;
    
    const message = helperBotInput.value.trim();
    if (!message) return;
    
    addHelperMessage(message, 'user');
    helperBotInput.value = '';
    
    showHelperTyping();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: []
            })
        });
        
        const data = await response.json();
        
        hideHelperTyping();
        
        if (data.success && data.response) {
            // ✅ Clean the response before displaying and speaking
            const cleanedForDisplay = cleanTextForDisplay(data.response);
            const cleanedForSpeech = cleanTextForSpeech(data.response);
            
            addHelperMessage(cleanedForDisplay, 'helper');
            speakHelperResponse(cleanedForSpeech);
        } else {
            throw new Error('Invalid response');
        }
        
    } catch (error) {
        console.error('Helper bot error:', error);
        hideHelperTyping();
        addHelperMessage("I'm here to help! Try asking me about app features or navigation.", 'helper');
    }
}

function addHelperMessage(text, sender) {
    if (!helperBotMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'helper-message user-helper-message' : 'helper-message';
    
    messageDiv.innerHTML = `
        <div class="helper-message-content">${text}</div>
    `;
    
    helperBotMessages.appendChild(messageDiv);
    helperBotMessages.scrollTop = helperBotMessages.scrollHeight;
}

function showHelperTyping() {
    if (!helperBotMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'helper-message typing-indicator';
    typingDiv.id = 'helperTyping';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;
    
    helperBotMessages.appendChild(typingDiv);
    helperBotMessages.scrollTop = helperBotMessages.scrollHeight;
}

function hideHelperTyping() {
    const typing = document.getElementById('helperTyping');
    if (typing) typing.remove();
}

async function speakHelperResponse(text) {
    if (!text || text.trim().length === 0) {
        console.warn('⚠️ No text to speak');
        return;
    }
    
    console.log('🔊 Helper Bot Speaking:', text);
    
    try {
        // Use Enhanced TTS System (should already be loaded)
        if (window.enhancedTTS && window.enhancedTTS.ready) {
            console.log('✨ Using Enhanced TTS for helper bot');
            await window.enhancedTTS.speak(text, {
                rate: 0.9,
                pitch: 1.0,
                volume: 0.8,
                lang: 'en-US'
            });
        } 
        // Fallback to basic speechSynthesis
        else if ('speechSynthesis' in window) {
            console.log('⚠️ Enhanced TTS not ready, using basic TTS');
            
            // Wait a bit for voices to load
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) {
                // Wait for voices to load
                await new Promise(resolve => {
                    if (speechSynthesis.onvoiceschanged !== undefined) {
                        speechSynthesis.onvoiceschanged = () => resolve();
                    }
                    setTimeout(resolve, 500);
                });
            }
            
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            utterance.lang = 'en-US';
            
            // Try to use a good voice
            const availableVoices = speechSynthesis.getVoices();
            const goodVoice = availableVoices.find(v => 
                /Google.*UK.*English.*Female|Microsoft.*Jenny|Samantha/i.test(v.name)
            );
            if (goodVoice) {
                utterance.voice = goodVoice;
                console.log('🎤 Using voice:', goodVoice.name);
            }
            
            window.speechSynthesis.speak(utterance);
            
            // Wait for speech to complete
            await new Promise((resolve) => {
                utterance.onend = resolve;
                utterance.onerror = resolve;
                // Timeout after 30 seconds
                setTimeout(resolve, 30000);
            });
        } else {
            console.error('❌ No TTS available');
        }
    } catch (error) {
        console.error('❌ Helper Bot TTS Error:', error);
    }
}

// ✅ Handle quick help chips
function handleQuickHelp(helpType) {
    const helpMessages = {
        'start': 'How do I start using this app?',
        'explain': 'What is this app?',
        'general': 'I need help navigating',
        'companion': 'How does the AI companion work?',
        'chat': "Let's start a conversation!",
        'features': 'What features does this have?',
        'games': 'How do I play the memory games?',
        'detection': 'What are these cognitive tests?',
        'memory': 'Start a memory game for me',
        'lifevault': 'What is Life-Vault?',
        'qr': 'How do I use the QR code?',
        'edit': 'How do I edit my information?',
        'dashboard': 'Explain the dashboard to me',
        'activity': 'Show me my activity',
        'stats': 'What are these health stats?',
        'emergency': 'How do I call for help?',
        'contact': 'How do I add emergency contacts?',
        'sos': 'What does the SOS button do?',
        'profile': 'How do I update my profile?',
        'settings': 'Where are the settings?',
        'logout': 'How do I logout?'
    };
    
    const message = helpMessages[helpType] || helpMessages['general'];
    
    if (helperBotInput) {
        helperBotInput.value = message;
        sendHelperMessage();
    }
}

console.log('✅ Clean helper bot ready!');
