// ============================================
// MINI HELPER BOT - CONTINUOUS VOICE MODE
// Modern UX like ChatGPT/Google Assistant
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

// Initialize Speech Recognition for Helper Bot
function initHelperSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        helperRecognition = new SpeechRecognition();
        helperRecognition.continuous = true; // Keep listening
        helperRecognition.interimResults = true; // Show real-time results
        helperRecognition.lang = 'en-US';
        helperRecognition.maxAlternatives = 1;
        
        helperRecognition.onstart = () => {
            console.log('🎤 Helper voice input started');
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
                console.log('✅ Final:', final);
            }
            
            // Update live transcript display
            const displayText = (finalTranscript + interim).trim() || 'Start speaking...';
            liveTranscript.textContent = displayText;
            interimTranscript = interim;
        };
        
        helperRecognition.onerror = (event) => {
            console.error('❌ Helper voice error:', event.error);
            
            if (event.error === 'no-speech') {
                console.log('⏳ No speech detected, continuing to listen...');
                // Don't stop on no-speech in continuous mode
                return;
            }
            
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access in your browser settings.');
            }
            
            stopVoiceInput();
        };
        
        helperRecognition.onend = () => {
            console.log('⏹️ Recognition ended');
            // Auto-restart if still in listening mode (unless manually stopped)
            if (isHelperListening) {
                try {
                    helperRecognition.start();
                } catch (error) {
                    console.log('Could not restart recognition:', error);
                    stopVoiceInput();
                }
            }
        };
        
        return true;
    } else {
        console.warn('⚠️ Speech recognition not supported');
        if (helperVoiceBtn) {
            helperVoiceBtn.style.display = 'none';
        }
        return false;
    }
}

// Update UI for voice input state
function updateVoiceUI(listening) {
    const micIcon = helperVoiceBtn.querySelector('.mic-icon');
    const stopIcon = helperVoiceBtn.querySelector('.stop-icon');
    
    if (listening) {
        // Show listening state
        helperVoiceBtn.classList.add('listening');
        micIcon.style.display = 'none';
        stopIcon.style.display = 'block';
        voiceTranscriptOverlay.classList.add('active');
        helperStatus.textContent = '🎤 Listening...';
        liveTranscript.textContent = 'Start speaking...';
        
        // Hide messages while listening for better UX
        helperBotMessages.style.opacity = '0.3';
        helperBotMessages.style.pointerEvents = 'none';
    } else {
        // Show normal state
        helperVoiceBtn.classList.remove('listening');
        micIcon.style.display = 'block';
        stopIcon.style.display = 'none';
        voiceTranscriptOverlay.classList.remove('active');
        helperStatus.textContent = "I'm here to guide you";
        
        // Restore messages
        helperBotMessages.style.opacity = '1';
        helperBotMessages.style.pointerEvents = 'auto';
    }
}

// Start voice input
function startVoiceInput() {
    if (!helperRecognition) {
        if (!initHelperSpeechRecognition()) {
            alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
            return;
        }
    }
    
    // Reset transcripts
    finalTranscript = '';
    interimTranscript = '';
    liveTranscript.textContent = 'Start speaking...';
    
    try {
        helperRecognition.start();
        isHelperListening = true;
        console.log('🎙️ Started continuous listening');
    } catch (error) {
        console.error('Error starting voice recognition:', error);
        if (error.message.includes('already started')) {
            isHelperListening = true;
            updateVoiceUI(true);
        }
    }
}

// Stop voice input and send message
function stopVoiceInput() {
    if (helperRecognition) {
        helperRecognition.stop();
    }
    
    isHelperListening = false;
    updateVoiceUI(false);
    
    // Send the accumulated transcript
    const message = finalTranscript.trim();
    if (message) {
        console.log('📨 Sending voice message:', message);
        helperBotInput.value = message;
        sendHelperMessage();
    }
    
    // Reset transcripts
    finalTranscript = '';
    interimTranscript = '';
}

// Toggle helper bot
if (helperBotToggle) {
    helperBotToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        helperBotOpen = !helperBotOpen;
        helperBotPanel.classList.toggle('active');
        
        const helperIcon = helperBotToggle.querySelector('.helper-icon');
        const closeIcon = helperBotToggle.querySelector('.close-icon');
        
        if (helperBotOpen) {
            helperIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            setTimeout(() => helperBotInput.focus(), 300);
        } else {
            helperIcon.style.display = 'block';
            closeIcon.style.display = 'none';
            // Stop voice if panel closes
            if (isHelperListening) {
                stopVoiceInput();
            }
        }
    });
}

// Voice Input Button - Toggle between start and stop
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

// Stop button in overlay
if (stopListeningBtn) {
    stopListeningBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        stopVoiceInput();
    });
}

// Close helper bot when clicking outside
document.addEventListener('click', (e) => {
    if (helperBotOpen && helperBotPanel && helperBotToggle) {
        if (!helperBotPanel.contains(e.target) && !helperBotToggle.contains(e.target)) {
            console.log('👆 Clicked outside - closing helper bot');
            closeHelperBot();
        }
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (isHelperListening) {
            stopVoiceInput();
        } else if (helperBotOpen) {
            closeHelperBot();
        }
    }
});

function closeHelperBot() {
    helperBotOpen = false;
    helperBotPanel.classList.remove('active');
    
    const helperIcon = helperBotToggle.querySelector('.helper-icon');
    const closeIcon = helperBotToggle.querySelector('.close-icon');
    
    helperIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    
    // Stop voice if active
    if (isHelperListening) {
        stopVoiceInput();
    }
}

// Quick help chips
document.querySelectorAll('.help-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const helpType = chip.getAttribute('data-help');
        handleQuickHelp(helpType);
    });
});

// Send helper message
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

function sendHelperMessage() {
    const message = helperBotInput.value.trim();
    if (!message) return;
    
    console.log('💬 Sending helper message:', message);
    
    addHelperMessage(message, 'user');
    helperBotInput.value = '';
    
    showHelperTyping();
    
    setTimeout(() => {
        hideHelperTyping();
        const response = generateHelperResponse(message);
        addHelperMessage(response, 'helper');
        speakHelperResponse(response);
    }, 800);
}

function addHelperMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'helper-message user-helper-message' : 'helper-message';
    messageDiv.innerHTML = `<p>${text}</p>`;
    
    helperBotMessages.appendChild(messageDiv);
    helperBotMessages.scrollTop = helperBotMessages.scrollHeight;
}

function showHelperTyping() {
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
    const typingDiv = document.getElementById('helperTyping');
    if (typingDiv) {
        typingDiv.remove();
    }
}

function handleQuickHelp(type) {
    const responses = {
        'how-to-start': 'To start, simply click on any activity card above. You can use voice input or type your responses!',
        'what-is-this': 'This page offers cognitive activities to help keep your mind sharp. Choose from memory games, image descriptions, storytelling, or guided conversations!',
        'need-help': 'I\'m here to help! You can ask me anything about the activities, or click the orange emergency button if you need immediate assistance.'
    };
    
    const response = responses[type] || 'How can I help you today?';
    addHelperMessage(response, 'helper');
    speakHelperResponse(response);
}

function generateHelperResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('game') || lowerMessage.includes('memory')) {
        return 'The memory games help improve your recall. Words will appear for 30 seconds, then you\'ll be asked to remember them!';
    } else if (lowerMessage.includes('image') || lowerMessage.includes('picture')) {
        return 'For the picture description, look at the image carefully and describe everything you see. Take your time!';
    } else if (lowerMessage.includes('story')) {
        return 'Story telling is a great way to share your memories. Just speak naturally about any memory that\'s special to you!';
    } else if (lowerMessage.includes('conversation') || lowerMessage.includes('chat')) {
        return 'The guided conversation asks you simple questions. Just respond naturally!';
    } else if (lowerMessage.includes('voice') || lowerMessage.includes('speak')) {
        return 'To use voice input, click the microphone icon. It will stay on until you click stop or the stop button!';
    } else {
        return 'I\'m here to guide you through the activities. Feel free to ask me anything!';
    }
}

function speakHelperResponse(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        utterance.lang = 'en-US';
        
        window.speechSynthesis.speak(utterance);
    }
}

if (helperBotPanel) {
    helperBotPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Helper Bot initialized');
    initHelperSpeechRecognition();
});

window.addEventListener('beforeunload', () => {
    if (helperRecognition) {
        helperRecognition.stop();
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});

console.log('✅ Helper Bot fully loaded with continuous voice mode');
