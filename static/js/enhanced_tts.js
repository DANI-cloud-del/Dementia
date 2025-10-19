/**
 * ENHANCED TTS SYSTEM - WINDOWS OPTIMIZED
 * - Prioritizes natural voices on all platforms
 * - WINDOWS SPECIAL: Prefers Google UK English Female over robotic voices
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
        this.isWindows = this.detectWindows();
        this.init();
    }

    detectWindows() {
        const platform = navigator.platform.toLowerCase();
        const userAgent = navigator.userAgent.toLowerCase();
        return platform.includes('win') || userAgent.includes('windows');
    }

    async init() {
        return new Promise((resolve) => {
            const loadVoices = () => {
                this.voices = speechSynthesis.getVoices();
                if (this.voices.length > 0) {
                    this.ready = true;
                    this.selectedVoice = this.selectBestVoice();
                    console.log('✅ TTS Ready');
                    console.log('🪟 Platform:', this.isWindows ? 'Windows' : 'Other');
                    console.log('🎵 Selected voice:', this.selectedVoice?.name || 'Default');
                    this.logAvailableVoices();
                    resolve();
                }
            };

            loadVoices();
            
            // Load voices again after delay (Windows fix)
            setTimeout(loadVoices, 100);
            
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = loadVoices;
            }
        });
    }

    /**
     * WINDOWS-OPTIMIZED voice selection
     * Priority:
     * 1. Microsoft Natural Online Voices (Edge - requires internet)
     * 2. Google UK English Female (Chrome Windows - BEST fallback)
     * 3. Other Google Female Voices
     * 4. macOS Samantha/Fiona
     * 5. Microsoft Zira (Windows fallback)
     * 6. Any female voice (avoid robotic male)
     */
    selectBestVoice(lang = 'en') {
        if (!this.ready || this.voices.length === 0) {
            return null;
        }

        console.log(`🔍 Searching for best voice from ${this.voices.length} voices`);

        // PRIORITY 1: Microsoft Natural Online Voices (Edge - neural voices)
        const microsoftNaturalPatterns = [
            /Microsoft.*Jenny.*Online/i,    // Natural female (best)
            /Microsoft.*Aria.*Online/i,     // Natural female
            /Microsoft.*Michelle.*Online/i, // Natural female
            /Microsoft.*Ava.*Online/i,      // Natural female
            /Microsoft.*Emma.*Online/i      // Natural female
        ];

        for (const pattern of microsoftNaturalPatterns) {
            const voice = this.voices.find(v => 
                pattern.test(v.name) && 
                v.lang.startsWith(lang)
            );
            if (voice) {
                console.log('✨ Found Microsoft Natural voice:', voice.name);
                return voice;
            }
        }

        // PRIORITY 2: Windows Special - Google UK English Female (better than robotic MS voices)
        if (this.isWindows) {
            const ukFemaleVoice = this.voices.find(v => 
                /Google.*UK.*English.*Female/i.test(v.name) && 
                v.lang.startsWith(lang)
            );
            if (ukFemaleVoice) {
                console.log('🇬🇧 Found Google UK English Female (Windows preferred):', ukFemaleVoice.name);
                return ukFemaleVoice;
            }
        }

        // PRIORITY 3: Other Google Female Voices (better quality than MS robotic)
        const googleFemalePatterns = [
            /Google.*UK.*English.*Female/i,  // UK Female (non-Windows also good)
            /Google.*US.*English/i,           // US English (usually good)
            /Google.*Female/i                 // Any Google female
        ];

        for (const pattern of googleFemalePatterns) {
            const voice = this.voices.find(v => 
                pattern.test(v.name) && 
                v.lang.startsWith(lang)
            );
            if (voice) {
                console.log('🌐 Found Google voice:', voice.name);
                return voice;
            }
        }

        // PRIORITY 4: macOS voices (high quality)
        const macVoice = this.voices.find(v => 
            /Samantha|Fiona|Victoria/i.test(v.name) && 
            v.lang.startsWith(lang)
        );
        if (macVoice) {
            console.log('🍎 Found macOS voice:', macVoice.name);
            return macVoice;
        }

        // PRIORITY 5: Microsoft Zira (Windows fallback - female, less robotic than David/Mark)
        const ziraVoice = this.voices.find(v => 
            /Zira/i.test(v.name) && 
            v.lang.startsWith(lang)
        );
        if (ziraVoice) {
            console.log('💙 Found Microsoft Zira (fallback):', ziraVoice.name);
            return ziraVoice;
        }

        // PRIORITY 6: Any female voice (avoid male robotic voices)
        const anyFemale = this.voices.find(v => 
            /female/i.test(v.name) && 
            v.lang.startsWith(lang)
        );
        if (anyFemale) {
            console.log('👤 Found female voice:', anyFemale.name);
            return anyFemale;
        }

        // FALLBACK: Explicitly avoid robotic male voices (David, Mark, etc.)
        const fallbackVoice = this.voices.find(v => 
            v.lang.startsWith(lang) && 
            !/David|Mark|James|George/i.test(v.name)
        );
        if (fallbackVoice) {
            console.log('⚠️ Using fallback voice:', fallbackVoice.name);
            return fallbackVoice;
        }

        // Last resort
        console.log('⚠️ Using default voice (may be robotic)');
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

            // Use selected voice or re-select best voice
            const voice = this.selectedVoice || this.selectBestVoice(options.lang || 'en');
            if (voice) {
                utterance.voice = voice;
                console.log('🎵 Using voice:', voice.name);
            }

            // Natural speech parameters (adjusted for better quality)
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

    showPlayerControls(text) {
        let player = document.getElementById('tts-player');
        if (!player) {
            player = document.createElement('div');
            player.id = 'tts-player';
            player.className = 'tts-player';
            document.body.appendChild(player);
        }

        const voiceName = this.selectedVoice?.name || 'Default Voice';
        const displayText = text.substring(0, 50) + (text.length > 50 ? '...' : '');

        player.innerHTML = `
            <div class="tts-player-content">
                <div class="tts-player-info">
                    <span class="tts-voice-badge">${voiceName}</span>
                    <span class="tts-text">${displayText}</span>
                </div>
                <div class="tts-player-controls">
                    <button onclick="window.enhancedTTS.pause()" class="tts-control-btn" id="pauseBtn">
                        ⏸ Pause
                    </button>
                    <button onclick="window.enhancedTTS.resume()" class="tts-control-btn" id="resumeBtn" style="display:none;">
                        ▶️ Resume
                    </button>
                    <button onclick="window.enhancedTTS.stop()" class="tts-control-btn">
                        ⏹ Stop
                    </button>
                </div>
            </div>
        `;

        player.style.display = 'flex';
    }

    updatePlayerControls() {
        const pauseBtn = document.getElementById('pauseBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        
        if (pauseBtn && resumeBtn) {
            if (this.isPaused) {
                pauseBtn.style.display = 'none';
                resumeBtn.style.display = 'inline-block';
            } else {
                pauseBtn.style.display = 'inline-block';
                resumeBtn.style.display = 'none';
            }
        }
    }

    hidePlayerControls() {
        const player = document.getElementById('tts-player');
        if (player) {
            player.style.display = 'none';
        }
    }

    logAvailableVoices() {
        console.log('📋 Available voices:');
        this.voices.forEach((voice, index) => {
            const isSelected = voice === this.selectedVoice ? '✅' : '  ';
            const isPriority = this.isWindows && /Google.*UK.*English.*Female/i.test(voice.name) ? '⭐' : '';
            console.log(`${isSelected}${isPriority} ${index}: ${voice.name} (${voice.lang})`);
        });
        
        if (this.isWindows) {
            const hasUKFemale = this.voices.some(v => /Google.*UK.*English.*Female/i.test(v.name));
            if (!hasUKFemale) {
                console.warn('⚠️ Google UK English Female not found - you may get robotic voice');
                console.log('💡 Try using Google Chrome for better voice quality on Windows');
            }
        }
    }

    // Force refresh voices (useful for Windows)
    async refreshVoices() {
        console.log('🔄 Refreshing voice list...');
        this.ready = false;
        await this.init();
    }

    // Get voice quality info
    getVoiceQuality() {
        if (!this.selectedVoice) return 'Unknown';
        
        const voiceName = this.selectedVoice.name;
        
        if (/Microsoft.*(Jenny|Aria|Michelle|Ava|Emma).*Online/i.test(voiceName)) {
            return 'Excellent (Natural)';
        }
        if (/Google.*UK.*English.*Female/i.test(voiceName)) {
            return 'Good (Google Female)';
        }
        if (/Samantha|Fiona/i.test(voiceName)) {
            return 'Excellent (macOS)';
        }
        if (/Google/i.test(voiceName)) {
            return 'Good (Google)';
        }
        if (/Zira/i.test(voiceName)) {
            return 'Fair (Basic Female)';
        }
        if (/David|Mark/i.test(voiceName)) {
            return 'Poor (Robotic Male)';
        }
        
        return 'Variable';
    }
}

// Initialize and expose globally
window.enhancedTTS = new EnhancedTTS();

// Force voice refresh after 1 second (Windows fix)
setTimeout(() => {
    if (window.enhancedTTS) {
        window.enhancedTTS.refreshVoices();
        console.log('🎤 Voice quality:', window.enhancedTTS.getVoiceQuality());
    }
}, 1000);
