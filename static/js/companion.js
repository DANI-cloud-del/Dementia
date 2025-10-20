(function() {
    'use strict';
    
    // ============================================
    // COMPANION PAGE - VOICE RECOGNITION & CHAT
    // ============================================

    let isListening = false;
    let recognition;
    let conversationHistory = [];
    let currentLanguage = 'en-US';
    let interimTranscript = '';
    let isSpeaking = false;
    let shouldRestartAfterSpeaking = false;

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
                if (isSpeaking) {
                    console.log('🔇 [BLOCKED] Ignoring recognition - AI is speaking');
                    return;
                }
                
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
                
                const transcriptionText = document.getElementById('transcriptionText');
                
                if (interim) {
                    transcriptionText.textContent = interim;
                    interimTranscript = interim;
                    transcriptionText.style.opacity = '1';
                }
                
                if (final) {
                    transcriptionText.style.fontWeight = 'bold';
                    setTimeout(() => {
                        transcriptionText.style.fontWeight = 'normal';
                    }, 300);
                    
                    addMessage(final, 'user');
                    sendToAI(final);
                    
                    setTimeout(() => {
                        transcriptionText.textContent = 'Start speaking...';
                        transcriptionText.style.opacity = '0.6';
                    }, 1000);
                    
                    interimTranscript = '';
                }
            };
            
            recognition.onerror = (event) => {
                console.error('❌ Speech recognition error:', event.error);
                
                if (event.error === 'aborted' || event.error === 'no-speech') {
                    return;
                }
                
                updateUIForListening(false);
                
                let errorMessage = 'Sorry, I couldn\'t hear that clearly.';
                
                if (event.error === 'audio-capture') {
                    errorMessage = 'No microphone found. Please check your device settings.';
                } else if (event.error === 'not-allowed') {
                    errorMessage = 'Microphone access denied. Please allow microphone access.';
                }
                
                showNotification(errorMessage, 'error');
            };
            
            recognition.onend = () => {
                console.log('⏹️ Speech recognition ended');
                isListening = false;
                
                if (shouldRestartAfterSpeaking && !isSpeaking) {
                    console.log('🔄 Restarting recognition (was requested)');
                    try {
                        recognition.start();
                        shouldRestartAfterSpeaking = false;
                    } catch (error) {
                        console.error('Error restarting recognition:', error);
                        updateUIForListening(false);
                    }
                } else {
                    updateUIForListening(false);
                }
            };
            
            return true;
        } else {
            showNotification('Voice recognition is not supported in your browser.', 'error');
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
                shouldRestartAfterSpeaking = false;
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
            shouldRestartAfterSpeaking = true;
            console.log('✅ Recognition started successfully');
        } catch (error) {
            console.error('❌ Error starting recognition:', error);
            if (error.message.includes('already started')) {
                isListening = true;
                shouldRestartAfterSpeaking = true;
                updateUIForListening(true);
            }
        }
    }

    function stopListening() {
        if (recognition) {
            try {
                recognition.stop();
                isListening = false;
                shouldRestartAfterSpeaking = false;
                updateUIForListening(false);
                console.log('✅ Recognition stopped');
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
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
    
    // NULL CHECK - prevent error
    if (!conversationDisplay) {
        console.error('❌ conversationDisplay element not found!');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    let avatarSVG = '';
    if (sender === 'ai') {
        avatarSVG = `<svg class="message-avatar" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
            <path d="M9 15c1 1 2.5 1.5 3 1.5s2-0.5 3-1.5"/>
        </svg>`;
    } else {
        avatarSVG = `<svg class="message-avatar" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 20c0-4 3-6 8-6s8 2 8 6"/>
        </svg>`;
    }
    
    messageDiv.innerHTML = `
        ${avatarSVG}
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${currentTime}</div>
        </div>
    `;
    
    conversationDisplay.appendChild(messageDiv);
    conversationDisplay.scrollTop = conversationDisplay.scrollHeight;
    
    conversationHistory.push({
        sender,
        text,
        timestamp: new Date()
    });
    
    console.log('📝 Message added to conversation');
}

    // Send to AI Backend
    async function sendToAI(message) {
        console.log('🚀 Sending message to AI:', message);
        
        const conversationDisplay = document.getElementById('conversationDisplay');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <svg class="message-avatar" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;
        
        conversationDisplay.appendChild(typingDiv);
        conversationDisplay.scrollTop = conversationDisplay.scrollHeight;

        try {
            const historyForBackend = conversationHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: historyForBackend.slice(-10)
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ AI response received:', data);

            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }

            if (data.success && data.response) {
                const aiResponse = data.response;
                addMessage(aiResponse, 'ai');
                speak(aiResponse);
                console.log(`✅ Response from: ${data.provider}`);
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('❌ Error sending message:', error);
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            addMessage('I\'m having trouble connecting right now. Try again in a moment.', 'ai');
        }
    }

    // TTS with Smart Voice Selection
    async function speak(text) {
        // Preserve existing emoji cleaning
        const cleanText = text
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
            .replace(/[\u{2600}-\u{26FF}]/gu, '')
            .replace(/[\u{2700}-\u{27BF}]/gu, '')
            .replace(/[\u{FE00}-\u{FE0F}]/gu, '')
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '')
            .replace(/😊|😁|😃|😄|🙂|👍|❤️|💙|🌟|✨|🎮|🆔|🚨|🧭|📖/g, '')
            .trim();
        
        console.log('🔊 Speaking (cleaned):', cleanText);
        
        const wasListening = isListening;
        if (wasListening) {
            console.log('🛑 STOPPING microphone before TTS');
            recognition.stop();
            shouldRestartAfterSpeaking = true;
        }
        
        isSpeaking = true;
        
        try {
            // Try Enhanced TTS first
            if (window.enhancedTTS) {
                console.log('✨ Using Enhanced TTS with player controls');
                await window.enhancedTTS.speak(cleanText, {
                    rate: 0.9,
                    pitch: 1.0,
                    volume: 1.0
                });
            } 
            // Then try Smart TTS
            else if (window.smartTTS && window.smartTTS.ready) {
                console.log('✨ Using Smart TTS with natural voice');
                await window.smartTTS.speak(cleanText, {
                    lang: currentLanguage,
                    rate: 0.9,
                    pitch: 1.0,
                    volume: 1.0
                });
            } 
            // Finally fallback to basic TTS
            else {
                console.log('⚠️ Using fallback TTS');
                window.speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.lang = currentLanguage;
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                
                const chatAvatar = document.getElementById('chatAvatar');
                
                utterance.onstart = () => {
                    if (chatAvatar) {
                        chatAvatar.style.animation = 'speak-pulse 0.5s ease-in-out infinite';
                    }
                };
                
                utterance.onend = () => {
                    if (chatAvatar) {
                        chatAvatar.style.animation = 'gentle-pulse 3s ease-in-out infinite';
                    }
                };
                
                window.speechSynthesis.speak(utterance);
                
                await new Promise((resolve) => {
                    utterance.onend = resolve;
                    utterance.onerror = resolve;
                });
            }
        } catch (error) {
            console.error('❌ TTS error:', error);
        } finally {
            isSpeaking = false;
            
            if (shouldRestartAfterSpeaking) {
                console.log('⏳ Waiting 500ms before restarting mic...');
                setTimeout(() => {
                    if (shouldRestartAfterSpeaking && !isListening) {
                        console.log('🎤 RESTARTING microphone after TTS');
                        try {
                            recognition.start();
                        } catch (error) {
                            console.error('Error restarting:', error);
                            shouldRestartAfterSpeaking = false;
                        }
                    }
                }, 500);
            }
        }
    }

    // Show Notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Companion page loaded');
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                const voices = window.speechSynthesis.getVoices();
                console.log('🎵 Available voices:', voices.map(v => v.name));
            };
        }
        
        setTimeout(() => {
            const greeting = "Hello! I'm your Silent Guardian. I'm here to listen to you. How are you feeling today?";
            addMessage(greeting, 'ai');
            speak(greeting);
        }, 1000);
    });

    console.log('✅ Companion script loaded');
})();
