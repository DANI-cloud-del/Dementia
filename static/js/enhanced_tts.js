/**
 * ENHANCED TTS SYSTEM
 * - Prefers natural voices (Ava, Jenny, Samantha)
 * - Falls back to Microsoft Zira (female, better than David)
 * - Includes playback controls
 */

class EnhancedTTS {
    constructor() {
        this.voices = [];
        this.ready = false;
        this.currentUtterance = null;
        this.selectedVoice = null;
        this.isSpeaking = false;
        this.isPaused = false;
        this.init();
    }

    async init() {
        return new Promise((resolve) => {
            const loadVoices = () => {
                this.voices = speechSynthesis.getVoices();
                
                if (this.voices.length > 0) {
                    this.ready = true;
                    this.selectedVoice = this.selectBestVoice();
                    console.log('✅ TTS Ready');
                    console.log('🎵 Selected voice:', this.selectedVoice?.name || 'Default');
                    this.logAvailableVoices();
                    resolve();
                }
            };

            loadVoices();

            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices;
            }
        });
    }

    /**
     * Smart voice selection with Zira fallback
     * Priority:
     * 1. Microsoft Ava/Jenny/Emma Online (Edge)
     * 2. Samantha/Fiona (macOS)
     * 3. Google Female voices
     * 4. Microsoft Zira (Windows fallback - BETTER than David)
     * 5. Any female voice
     */
    selectBestVoice(lang = 'en') {
        if (!this.ready || this.voices.length === 0) {
            return null;
        }

        // Priority 1: Microsoft Online voices (Edge)
        const naturalVoices = [
            /Microsoft.*Ava.*Online/i,
            /Microsoft.*Jenny.*Online/i,
            /Microsoft.*Emma.*Online/i,
            /Microsoft.*Aria.*Online/i
        ];

        for (const pattern of naturalVoices) {
            const voice = this.voices.find(v => 
                pattern.test(v.name) && v.lang.startsWith(lang)
            );
            if (voice) {
                console.log('✨ Found natural voice:', voice.name);
                return voice;
            }
        }

        // Priority 2: macOS voices
        const macVoice = this.voices.find(v => 
            (/Samantha|Fiona/i.test(v.name)) && v.lang.startsWith(lang)
        );
        if (macVoice) {
            console.log('🍎 Found macOS voice:', macVoice.name);
            return macVoice;
        }

        // Priority 3: Google Female voices
        const googleFemale = this.voices.find(v => 
            /Google.*Female|Google.*UK.*Female/i.test(v.name) && v.lang.startsWith(lang)
        );
        if (googleFemale) {
            console.log('🌐 Found Google female voice:', googleFemale.name);
            return googleFemale;
        }

        // Priority 4: Microsoft Zira (Windows Chrome fallback - FEMALE)
        const ziraVoice = this.voices.find(v => 
            /Zira/i.test(v.name) && v.lang.startsWith(lang)
        );
        if (ziraVoice) {
            console.log('💙 Found Microsoft Zira (Windows female):', ziraVoice.name);
            return ziraVoice;
        }

        // Priority 5: Any female voice
        const anyFemale = this.voices.find(v => 
            /female/i.test(v.name) && v.lang.startsWith(lang)
        );
        if (anyFemale) {
            console.log('👤 Found female voice:', anyFemale.name);
            return anyFemale;
        }

        // Final fallback: first available voice
        console.log('⚠️ Using default voice');
        return this.voices.find(v => v.lang.startsWith(lang)) || this.voices[0];
    }

    async speak(text, options = {}) {
        if (!this.ready) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            if (!text) {
                reject(new Error('No text provided'));
                return;
            }

            this.stop();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Use selected voice
            const voice = this.selectedVoice || this.selectBestVoice(options.lang || 'en');
            if (voice) {
                utterance.voice = voice;
            }

            // Natural speech parameters
            utterance.rate = options.rate || 0.9;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;
            utterance.lang = options.lang || 'en-US';

            utterance.onstart = () => {
                console.log('🗣️ TTS Started');
                this.isSpeaking = true;
                this.isPaused = false;
                this.showPlayerControls(text);
            };

            utterance.onend = () => {
                console.log('✅ TTS Completed');
                this.isSpeaking = false;
                this.isPaused = false;
                this.currentUtterance = null;
                this.hidePlayerControls();
                resolve();
            };

            utterance.onerror = (error) => {
                console.error('❌ TTS Error:', error);
                this.isSpeaking = false;
                this.isPaused = false;
                this.currentUtterance = null;
                this.hidePlayerControls();
                reject(error);
            };

            this.currentUtterance = utterance;
            speechSynthesis.speak(utterance);
            console.log('🎵 Speaking with', voice?.name || 'default voice');
        });
    }

    stop() {
        speechSynthesis.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.hidePlayerControls();
    }

    pause() {
        if (this.isSpeaking && !this.isPaused) {
            speechSynthesis.pause();
            this.isPaused = true;
            this.updatePlayerControls();
            console.log('⏸️ TTS Paused');
        }
    }

    resume() {
        if (this.isSpeaking && this.isPaused) {
            speechSynthesis.resume();
            this.isPaused = false;
            this.updatePlayerControls();
            console.log('▶️ TTS Resumed');
        }
    }

    /**
     * Show music player-style controls
     */
    showPlayerControls(text) {
        let player = document.getElementById('tts-player');
        
        if (!player) {
            player = document.createElement('div');
            player.id = 'tts-player';
            player.className = 'tts-player';
            player.innerHTML = `
                <div class="tts-player-content">
                    <div class="tts-player-info">
                        <div class="tts-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>
                        <div class="tts-text">
                            <span class="tts-label">AI is speaking...</span>
                            <span class="tts-content">${this.truncateText(text, 50)}</span>
                        </div>
                    </div>
                    <div class="tts-controls">
                        <button class="tts-btn tts-pause" onclick="window.enhancedTTS.pause()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16"></rect>
                                <rect x="14" y="4" width="4" height="16"></rect>
                            </svg>
                        </button>
                        <button class="tts-btn tts-resume" style="display: none;" onclick="window.enhancedTTS.resume()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                        <button class="tts-btn tts-stop" onclick="window.enhancedTTS.stop()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="5" y="5" width="14" height="14"></rect>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="tts-progress">
                    <div class="tts-progress-bar"></div>
                </div>
            `;
            document.body.appendChild(player);
        } else {
            const textEl = player.querySelector('.tts-content');
            if (textEl) textEl.textContent = this.truncateText(text, 50);
        }

        // Show with animation
        setTimeout(() => player.classList.add('active'), 10);
    }

    hidePlayerControls() {
        const player = document.getElementById('tts-player');
        if (player) {
            player.classList.remove('active');
            setTimeout(() => player.remove(), 300);
        }
    }

    updatePlayerControls() {
        const pauseBtn = document.querySelector('.tts-pause');
        const resumeBtn = document.querySelector('.tts-resume');
        
        if (this.isPaused) {
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (resumeBtn) resumeBtn.style.display = 'flex';
        } else {
            if (pauseBtn) pauseBtn.style.display = 'flex';
            if (resumeBtn) resumeBtn.style.display = 'none';
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    logAvailableVoices() {
        console.group('🎤 Available Voices:');
        const naturalVoices = this.voices.filter(v => /Ava|Jenny|Emma|Samantha|Fiona/i.test(v.name));
        const ziraVoice = this.voices.filter(v => /Zira/i.test(v.name));
        const googleVoices = this.voices.filter(v => v.name.includes('Google'));
        
        if (naturalVoices.length > 0) {
            console.log('✨ Natural Voices:', naturalVoices.map(v => v.name));
        }
        if (ziraVoice.length > 0) {
            console.log('💙 Microsoft Zira:', ziraVoice.map(v => v.name));
        }
        if (googleVoices.length > 0) {
            console.log('🌐 Google Voices:', googleVoices.map(v => v.name));
        }
        console.groupEnd();
    }
}

// Global instance
window.enhancedTTS = new EnhancedTTS();
