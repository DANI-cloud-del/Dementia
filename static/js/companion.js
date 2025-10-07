// ============================================
// COMPANION PAGE - VOICE RECOGNITION & CHAT
// Enhanced with Visual Feedback
// ============================================

let isListening = false;
let recognition;
let conversationHistory = [];
let currentLanguage = 'en-US';
let interimTranscript = '';

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLanguage;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
            isListening = true;
            updateUIForListening(true);
        };
        
        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                
                if (event.results[i].isFinal) {
                    final += transcript;
                    console.log('✅ Final transcript:', final);
                    updateConfidenceBar(confidence * 100);
                } else {
                    interim += transcript;
                    console.log('⏳ Interim transcript:', interim);
                }
            }
            
            // Update transcription display with real-time feedback
            const transcriptionText = document.getElementById('transcriptionText');
            if (interim) {
                transcriptionText.textContent = interim;
                interimTranscript = interim;
                // Add pulsing effect to show it's working
                transcriptionText.style.opacity = '1';
            }
            
            if (final) {
                // Flash the text to show it's finalized
                transcriptionText.style.fontWeight = 'bold';
                setTimeout(() => {
                    transcriptionText.style.fontWeight = 'normal';
                }, 300);
                
                addMessage(final, 'user');
                sendToAI(final);
                
                // Reset after a brief moment
                setTimeout(() => {
                    transcriptionText.textContent = 'Start speaking...';
                    transcriptionText.style.opacity = '0.6';
                }, 1000);
                
                interimTranscript = '';
            }
        };
        
        recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
            updateUIForListening(false);
            
            let errorMessage = 'Sorry, I couldn\'t hear that clearly.';
            if (event.error === 'no-speech') {
                errorMessage = 'I didn\'t hear anything. Please try again.';
            } else if (event.error === 'audio-capture') {
                errorMessage = 'No microphone found. Please check your device settings.';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            }
            
            showNotification(errorMessage, 'error');
        };
        
        recognition.onend = () => {
            console.log('⏹️ Speech recognition ended');
            if (isListening) {
                // Restart if user didn't manually stop
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Error restarting recognition:', error);
                    isListening = false;
                    updateUIForListening(false);
                }
            }
        };
        
        return true;
    } else {
        showNotification('Voice recognition is not supported in your browser. Please use Chrome or Edge.', 'error');
        return false;
    }
}

// Voice Button Handler
const voiceButton = document.getElementById('voiceButton');
if (voiceButton) {
    voiceButton.addEventListener('click', () => {
        console.log('🔘 Voice button clicked. Current state:', isListening);
        
        if (!recognition) {
            console.log('🔧 Initializing speech recognition...');
            if (!initSpeechRecognition()) return;
        }
        
        if (isListening) {
            console.log('⏹️ Stopping listening...');
            stopListening();
        } else {
            console.log('🎤 Starting listening...');
            startListening();
        }
    });
}

function startListening() {
    try {
        recognition.start();
        isListening = true;
        console.log('✅ Recognition started successfully');
    } catch (error) {
        console.error('❌ Error starting recognition:', error);
        // If already started, just update UI
        if (error.message.includes('already started')) {
            isListening = true;
            updateUIForListening(true);
        }
    }
}

function stopListening() {
    if (recognition) {
        recognition.stop();
        isListening = false;
        updateUIForListening(false);
    }
}

function updateUIForListening(listening) {
    const voiceButton = document.getElementById('voiceButton');
    const transcriptionOverlay = document.getElementById('transcriptionOverlay');
    const statusText = document.getElementById('statusText');
    const chatAvatar = document.getElementById('chatAvatar');
    const micIcon = voiceButton.querySelector('.mic-icon');
    const stopIcon = voiceButton.querySelector('.stop-icon');
    const voiceButtonText = voiceButton.querySelector('.voice-button-text');
    
    if (listening) {
        console.log('🟢 UI: Listening mode ON');
        voiceButton.classList.add('listening');
        transcriptionOverlay.classList.add('active');
        statusText.textContent = '🎤 Listening...';
        chatAvatar.style.animation = 'pulse-listening 1.5s ease-in-out infinite';
        micIcon.style.display = 'none';
        stopIcon.style.display = 'block';
        voiceButtonText.textContent = 'Tap to Stop';
        
        // Add glowing animation to the button
        voiceButton.style.boxShadow = '0 8px 32px rgba(229, 125, 125, 0.6), 0 0 60px rgba(229, 125, 125, 0.4)';
    } else {
        console.log('🔴 UI: Listening mode OFF');
        voiceButton.classList.remove('listening');
        transcriptionOverlay.classList.remove('active');
        statusText.textContent = 'Ready to listen';
        chatAvatar.style.animation = 'gentle-pulse 3s ease-in-out infinite';
        micIcon.style.display = 'block';
        stopIcon.style.display = 'none';
        voiceButtonText.textContent = 'Tap to Speak';
        voiceButton.style.boxShadow = '0 8px 24px var(--shadow-hover)';
    }
}

function updateConfidenceBar(confidence) {
    const confidenceFill = document.getElementById('confidenceFill');
    if (confidenceFill) {
        confidenceFill.style.width = confidence + '%';
        console.log(`📊 Confidence: ${confidence.toFixed(0)}%`);
    }
}

// Text Input Handler
const sendBtn = document.getElementById('sendBtn');
const textInput = document.getElementById('textInput');

if (sendBtn) {
    sendBtn.addEventListener('click', () => {
        const message = textInput.value.trim();
        
        if (message) {
            console.log('💬 Sending text message:', message);
            addMessage(message, 'user');
            sendToAI(message);
            textInput.value = '';
        }
    });
}

// Enter key to send
if (textInput) {
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
}

// Suggestion Chips
document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const suggestion = chip.getAttribute('data-suggestion');
        console.log('💡 Suggestion clicked:', suggestion);
        addMessage(suggestion, 'user');
        sendToAI(suggestion);
    });
});

// Add Message to Conversation
function addMessage(text, sender) {
    const conversationDisplay = document.getElementById('conversationDisplay');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let avatarSVG = '';
    if (sender === 'ai') {
        avatarSVG = `
            <div class="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-width="2" stroke-linecap="round"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9" stroke-width="2" stroke-linecap="round"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9" stroke-width="2" stroke-linecap="round"></line>
                </svg>
            </div>
        `;
    } else {
        avatarSVG = `
            <div class="message-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2"></path>
                    <circle cx="12" cy="7" r="4" stroke-width="2"></circle>
                </svg>
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        ${avatarSVG}
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">${currentTime}</span>
        </div>
    `;
    
    conversationDisplay.appendChild(messageDiv);
    conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
    
    conversationHistory.push({ sender, text, timestamp: new Date() });
    console.log('📝 Message added to conversation');
}

// Send to AI Backend
async function sendToAI(message) {
    console.log('🚀 Sending message to AI:', message);
    
    // Show typing indicator
    const conversationDisplay = document.getElementById('conversationDisplay');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-width="2" stroke-linecap="round"></path>
            </svg>
        </div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    conversationDisplay.appendChild(typingDiv);
    conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                language: currentLanguage,
                history: conversationHistory.slice(-10)
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ AI response received:', data);
        
        // Remove typing indicator
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Add AI response
        addMessage(data.message, 'ai');
        speak(data.message);
        
    } catch (error) {
        console.error('❌ Error sending message:', error);
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        addMessage('I\'m having trouble connecting right now. Please try again in a moment.', 'ai');
    }
}

// Text-to-Speech
function speak(text) {
    if ('speechSynthesis' in window) {
        console.log('🔊 Speaking:', text);
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = currentLanguage;
        
        window.speechSynthesis.speak(utterance);
    }
}

// Language Selection
document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.lang-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update language
        currentLanguage = btn.getAttribute('data-lang');
        const displayName = btn.getAttribute('data-display');
        document.getElementById('currentLang').textContent = displayName;
        
        // Update recognition language
        if (recognition) {
            recognition.lang = currentLanguage;
            console.log('🌐 Language changed to:', currentLanguage);
        }
        
        // Close modal
        document.getElementById('languageModal').style.display = 'none';
        
        showNotification(`Language changed to ${displayName}`, 'success');
    });
});

// Notification System
function showNotification(message, type = 'info') {
    console.log(`📢 Notification (${type}):`, message);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px var(--shadow);
        z-index: 3000;
        animation: slide-in-right 0.3s ease;
        border-left: 4px solid var(--primary);
        font-size: 16px;
        max-width: 300px;
    `;
    
    if (type === 'error') {
        notification.style.borderLeftColor = 'var(--error)';
    } else if (type === 'success') {
        notification.style.borderLeftColor = 'var(--success)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slide-out-right 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Companion page loaded. Initializing...');
    
    // Check for microphone permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
                console.log('✅ Microphone access granted');
                showNotification('Microphone ready!', 'success');
            })
            .catch((error) => {
                console.error('❌ Microphone access denied:', error);
                showNotification('Please allow microphone access to use voice features', 'error');
            });
    }
    
    initSpeechRecognition();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    console.log('🔄 Page unloading. Cleaning up...');
    if (recognition) {
        recognition.stop();
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});

console.log('✅ Companion.js loaded successfully!');
