// ============================================
// AI HELPER - INTELLIGENT CHATBOT
// Connects to backend AI with app knowledge
// ============================================

console.log('🤖 AI Helper loaded');

// Configuration
const API_ENDPOINT = '/api/chat';
const HEALTH_ENDPOINT = '/api/health';

// Conversation history
let conversationHistory = [];
let aiProvider = 'unknown';

// Suggested quick actions
const QUICK_ACTIONS = [
    { text: "Explain this app", icon: "ℹ️" },
    { text: "Play a memory game", icon: "🎮" },
    { text: "Emergency help", icon: "🚨" },
    { text: "How are you?", icon: "💭" }
];

// ============================================
// INITIALIZE HELPER
// ============================================

function initializeAIHelper() {
    console.log('🚀 Initializing AI Helper...');
    
    // Check AI health status
    checkAIHealth();
    
    // Add quick action buttons
    addQuickActions();
    
    // Show welcome message
    setTimeout(() => {
        addAIMessage("Hello! 👋 I'm your AI companion. I can help you understand this app, chat with you, or guide you to different features. What would you like to know?");
    }, 500);
}

// ============================================
// SEND MESSAGE TO AI
// ============================================

async function sendMessageToAI(userMessage) {
    try {
        // Add user message to chat
        addUserMessage(userMessage);
        
        // Add to conversation history
        conversationHistory.push({
            role: "user",
            content: userMessage
        });
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to backend
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                history: conversationHistory.slice(-10) // Last 10 messages
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (data.success) {
            // Add AI response
            addAIMessage(data.response);
            
            // Update provider badge
            aiProvider = data.provider;
            updateProviderBadge(data.provider);
            
            // Add to conversation history
            conversationHistory.push({
                role: "assistant",
                content: data.response
            });
            
            // Show suggested actions if available
            if (data.suggested_actions && data.suggested_actions.length > 0) {
                addSuggestedActions(data.suggested_actions);
            }
            
            console.log(`✅ AI response received from: ${data.provider}`);
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Error sending message:', error);
        removeTypingIndicator();
        addAIMessage("I'm having trouble connecting right now. But I'm still here! Try asking me something else or check your internet connection.");
    }
}

// ============================================
// UI FUNCTIONS
// ============================================

function addUserMessage(message) {
    const chatContainer = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHTML(message)}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
        <div class="message-avatar">👤</div>
    `;
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addAIMessage(message) {
    const chatContainer = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>${formatMarkdown(escapeHTML(message))}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const chatContainer = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function addSuggestedActions(actions) {
    const chatContainer = document.getElementById('chatMessages');
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'suggested-actions';
    actionsDiv.innerHTML = '<p class="suggested-label">You can:</p>';
    
    actions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'suggested-action-btn';
        button.textContent = action;
        button.onclick = () => sendMessageToAI(action);
        actionsDiv.appendChild(button);
    });
    
    chatContainer.appendChild(actionsDiv);
    scrollToBottom();
}

function addQuickActions() {
    const quickActionsContainer = document.getElementById('quickActions');
    if (!quickActionsContainer) return;
    
    quickActionsContainer.innerHTML = '';
    
    QUICK_ACTIONS.forEach(action => {
        const button = document.createElement('button');
        button.className = 'quick-action-btn';
        button.innerHTML = `${action.icon} ${action.text}`;
        button.onclick = () => sendMessageToAI(action.text);
        quickActionsContainer.appendChild(button);
    });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function scrollToBottom() {
    const chatContainer = document.getElementById('chatMessages');
    if (chatContainer) {
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMarkdown(text) {
    // Simple markdown formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/\n/g, '<br>'); // Line breaks
}

function updateProviderBadge(provider) {
    const badge = document.getElementById('providerBadge');
    if (!badge) return;
    
    const providerEmojis = {
        'groq': '⚡ Groq AI',
        'huggingface': '🤗 HuggingFace',
        'local': '💻 Local AI',
        'feature_guide': '📖 Guide',
        'emergency': '🆘 Emergency'
    };
    
    badge.textContent = providerEmojis[provider] || '🤖 AI';
    badge.className = `provider-badge ${provider}`;
}

async function checkAIHealth() {
    try {
        const response = await fetch(HEALTH_ENDPOINT);
        const status = await response.json();
        
        console.log('🏥 AI Health Status:', status);
        
        // Update UI with health status
        const healthBadge = document.getElementById('healthStatus');
        if (healthBadge) {
            const available = Object.values(status).filter(s => s === 'available').length;
            healthBadge.textContent = `${available}/3 AI services active`;
            healthBadge.className = available > 0 ? 'health-good' : 'health-bad';
        }
    } catch (error) {
        console.warn('⚠️ Could not check AI health:', error);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Send message on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const message = messageInput.value.trim();
                if (message) {
                    sendMessageToAI(message);
                    messageInput.value = '';
                }
            }
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', () => {
            const message = messageInput.value.trim();
            if (message) {
                sendMessageToAI(message);
                messageInput.value = '';
            }
        });
    }
    
    // Initialize on page load
    initializeAIHelper();
});

// Export functions for global access
window.sendMessageToAI = sendMessageToAI;
window.checkAIHealth = checkAIHealth;

console.log('✅ AI Helper ready!');
