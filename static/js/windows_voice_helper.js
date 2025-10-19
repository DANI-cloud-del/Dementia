/**
 * WINDOWS VOICE HELPER
 * Forces natural voice usage on Windows Edge/Chrome
 */

class WindowsVoiceHelper {
    constructor() {
        this.isWindows = navigator.platform.includes('Win');
        this.checkAndInstallVoices();
    }

    async checkAndInstallVoices() {
        if (!this.isWindows) {
            console.log('Not Windows, skipping voice check');
            return;
        }

        console.log('🪟 Detected Windows - checking for natural voices...');

        // Wait for voices to load
        await new Promise(resolve => setTimeout(resolve, 500));

        const voices = speechSynthesis.getVoices();
        const hasNaturalVoice = voices.some(v => 
            /Microsoft.*(Jenny|Aria|Michelle|Ava).*Online/i.test(v.name)
        );

        if (!hasNaturalVoice) {
            console.warn('⚠️ No natural voices found on Windows!');
            this.showInstallInstructions();
        } else {
            console.log('✅ Natural voices available on Windows');
        }
    }

    showInstallInstructions() {
        // Only show once per session
        if (sessionStorage.getItem('voice_warning_shown')) {
            return;
        }

        sessionStorage.setItem('voice_warning_shown', 'true');

        console.log(`
        🔊 TO GET BETTER VOICE QUALITY:
        
        1. Open Windows Settings
        2. Go to: Time & Language → Speech
        3. Click "Add voices"
        4. Download: "Microsoft Jenny Online" or "Microsoft Aria Online"
        
        OR enable internet connection for natural voices in Edge.
        `);
    }

    // Check if internet is available for online voices
    async checkInternetForVoices() {
        try {
            const response = await fetch('https://www.microsoft.com/favicon.ico', {
                mode: 'no-cors',
                cache: 'no-cache'
            });
            console.log('✅ Internet available - natural voices should work');
            return true;
        } catch (error) {
            console.warn('⚠️ No internet - natural voices may not work in Edge');
            return false;
        }
    }
}

// Initialize helper
window.windowsVoiceHelper = new WindowsVoiceHelper();
