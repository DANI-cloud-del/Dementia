// ============================================
// MINI HELPER BOT - ENHANCED VERSION
// Features: Voice input, click outside to close, better UX
// ============================================

console.log('✅ Helper Bot loaded');

const helperBotToggle = document.getElementById('helperBotToggle');
const helperBotPanel = document.getElementById('helperBotPanel');
const helperBotMessages = document.getElementById('helperBotMessages');
const helperBotInput = document.getElementById('helperBotInput');
const helperBotSend = document.getElementById('helperBotSend');
const helperVoiceBtn = document.getElementById('helperVoiceBtn');

let helperBotOpen = false;
let helperRecognition;
let isHelperListening = false;

// Initialize Speech Recognition for Helper Bot
function initHelperSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        helperRecognition = new SpeechRecognition();
        helperRecognition.continuous = false;
        helperRecognition.interimResults = false;
        helperRecognition.lang = 'en-US';
        
        helperRecognition.onstart = () => {
            console.log('🎤 Helper voice input started');
            isHelperListening = true;
            helperVoiceBtn.classList.add('listening');
        };
        
        helperRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('📝 Helper heard:', transcript);
            helperBotInput.value = transcript;
            sendHelperMessage();
        };
        
        helperRecognition.onerror = (event) => {
            console.error('❌ Helper voice error:', event.error);
            isHelperListening = false;
            helperVoiceBtn.classList.remove('listening');
        };
        
        helperRecognition.onend = () => {
            console.log('⏹️ Helper voice input ended');
            isHelperListening = false;
            helperVoiceBtn.classList.remove('listening');
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

// Toggle helper bot
if (helperBotToggle) {
    helperBotToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent immediate closing
        helperBotOpen = !helperBotOpen;
        helperBotPanel.classList.toggle('active');
        
        // Swap icons
        const helperIcon = helperBotToggle.querySelector('.helper-icon');
        const closeIcon = helperBotToggle.querySelector('.close-icon');
        
        if (helperBotOpen) {
            helperIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            // Focus input when opened
            setTimeout(() => helperBotInput.focus(), 300);
        } else {
            helperIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    });
}

// Close helper bot when clicking outside
document.addEventListener('click', (e) => {
    if (helperBotOpen && helperBotPanel && helperBotToggle) {
        // Check if click is outside both the panel and toggle button
        if (!helperBotPanel.contains(e.target) && !helperBotToggle.contains(e.target)) {
            console.log('👆 Clicked outside - closing helper bot');
            closeHelperBot();
        }
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helperBotOpen) {
        console.log('⌨️ Escape pressed - closing helper bot');
        closeHelperBot();
    }
});

// Function to close helper bot
function closeHelperBot() {
    helperBotOpen = false;
    helperBotPanel.classList.remove('active');
    
    const helperIcon = helperBotToggle.querySelector('.helper-icon');
    const closeIcon = helperBotToggle.querySelector('.close-icon');
    
    helperIcon.style.display = 'block';
    closeIcon.style.display = 'none';
}

// Voice Input Button
if (helperVoiceBtn) {
    helperVoiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (!helperRecognition) {
            if (!initHelperSpeechRecognition()) {
                alert('Voice input is not supported in your browser. Please use Chrome or Edge.');
                return;
            }
        }
        
        if (isHelperListening) {
            helperRecognition.stop();
        } else {
            try {
                helperRecognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
            }
        }
    });
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
    
    // Prevent panel from closing when clicking input
    helperBotInput.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function sendHelperMessage() {
    const message = helperBotInput.value.trim();
    if (!message) return;
    
    console.log('💬 Sending helper message:', message);
    
    // Add user message
    addHelperMessage(message, 'user');
    helperBotInput.value = '';
    
    // Show typing indicator
    showHelperTyping();
    
    // Simulate AI response
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
        'how-to-start': 'To start, simply click on any activity card above. Each activity is designed to be simple and fun! You can use voice input or type your responses.',
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
        return 'The memory games help improve your recall. Words will appear for 30 seconds, then you\'ll be asked to remember them! You can speak or type your answers.';
    } else if (lowerMessage.includes('image') || lowerMessage.includes('picture')) {
        return 'For the picture description, look at the image carefully and describe everything you see. Take your time and speak naturally!';
    } else if (lowerMessage.includes('story')) {
        return 'Story telling is a great way to share your memories. Just speak naturally about any memory that\'s special to you. I\'ll listen carefully!';
    } else if (lowerMessage.includes('conversation') || lowerMessage.includes('chat')) {
        return 'The guided conversation asks you simple questions. Just respond naturally as if you\'re talking to a friend!';
    } else if (lowerMessage.includes('voice') || lowerMessage.includes('speak')) {
        return 'To use voice input, click the microphone icon and speak clearly. Your browser will convert your speech to text!';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        return 'I can help you understand any activity! Just ask me about games, pictures, stories, or conversations. You can also click the quick help buttons below.';
    } else {
        return 'I\'m here to guide you through the activities. Feel free to ask me about any specific activity or how to get started!';
    }
}

// Text-to-Speech for helper responses
function speakHelperResponse(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8; // Slightly quieter for helper bot
        utterance.lang = 'en-US';
        
        window.speechSynthesis.speak(utterance);
    }
}

// Prevent panel clicks from closing the bot
if (helperBotPanel) {
    helperBotPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Helper Bot initialized');
    initHelperSpeechRecognition();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (helperRecognition) {
        helperRecognition.stop();
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
});

console.log('✅ Helper Bot fully loaded with voice support');
