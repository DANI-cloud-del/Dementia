// ============================================
// EMERGENCY SOS - AUTOMATIC ALERT SYSTEM
// ============================================

console.log('✅ Emergency.js loaded');

// Elements
const emergencySection = document.getElementById('emergencySection');
const emergencyInitial = document.getElementById('emergencyInitial');
const emergencyActive = document.getElementById('emergencyActive');
const emergencySent = document.getElementById('emergencySent');
const activateSOSBtn = document.getElementById('activateSOS');
const cancelSOSBtn = document.getElementById('cancelSOS');
const countdownNumber = document.getElementById('countdownNumber');
const countdownProgress = document.getElementById('countdownProgress');
const statusUpdates = document.getElementById('statusUpdates');
const currentLocation = document.getElementById('currentLocation');

// State
let countdownTimer = null;
let countdownSeconds = 15; // Changed from 30 to 15
let holdTimer = null;
let isHolding = false;
let userLocation = null;

// Get user location on page load
window.addEventListener('load', () => {
    getUserLocation();
});

// Get User Location
function getUserLocation() {
    if ('geolocation' in navigator) {
        console.log('📍 Getting user location...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                // Reverse geocode (in production, use Google Maps API or similar)
                const locationText = `Lat: ${userLocation.latitude.toFixed(4)}, Long: ${userLocation.longitude.toFixed(4)}`;
                if (currentLocation) {
                    currentLocation.textContent = locationText;
                }
                
                console.log('✅ Location obtained:', userLocation);
            },
            (error) => {
                console.error('❌ Location error:', error);
                if (currentLocation) {
                    currentLocation.textContent = 'Location unavailable';
                }
            }
        );
    } else {
        console.warn('⚠️ Geolocation not supported');
        if (currentLocation) {
            currentLocation.textContent = 'Location not supported';
        }
    }
}

// Activate SOS Button - Press and Hold
if (activateSOSBtn) {
    // Mouse events
    activateSOSBtn.addEventListener('mousedown', startHold);
    activateSOSBtn.addEventListener('mouseup', endHold);
    activateSOSBtn.addEventListener('mouseleave', endHold);
    
    // Touch events for mobile
    activateSOSBtn.addEventListener('touchstart', startHold);
    activateSOSBtn.addEventListener('touchend', endHold);
    activateSOSBtn.addEventListener('touchcancel', endHold);
}

function startHold(e) {
    e.preventDefault();
    isHolding = true;
    activateSOSBtn.classList.add('holding');
    
    console.log('🚨 SOS button pressed - starting hold timer');
    
    // Vibrate if available
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }
    
    // Start 2-second hold timer
    holdTimer = setTimeout(() => {
        if (isHolding) {
            activateEmergency();
        }
    }, 2000);
}

function endHold() {
    isHolding = false;
    activateSOSBtn.classList.remove('holding');
    clearTimeout(holdTimer);
}

// Activate Emergency
function activateEmergency() {
    console.log('🚨 EMERGENCY ACTIVATED');
    
    // Vibrate strongly
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Hide initial, show active
    emergencyInitial.style.display = 'none';
    emergencyActive.style.display = 'block';
    
    // Add red alert to background
    emergencySection.classList.add('alert-active');
    
    // Start countdown
    startCountdown();
    
    // Start status updates
    updateStatus();
}

// Start Countdown
function startCountdown() {
    countdownSeconds = 15; // Changed from 30 to 15
    const circumference = 2 * Math.PI * 90; // radius = 90
    
    countdownTimer = setInterval(() => {
        countdownSeconds--;
        countdownNumber.textContent = countdownSeconds;
        
        // Update progress circle
        const offset = circumference - (countdownSeconds / 15) * circumference; // Changed from 30 to 15
        countdownProgress.style.strokeDashoffset = offset;
        
        // Play sound every 5 seconds (changed from 10)
        if (countdownSeconds === 10 || countdownSeconds === 5) {
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        }
        
        if (countdownSeconds <= 0) {
            clearInterval(countdownTimer);
            sendEmergencyAlerts();
        }
    }, 1000);
    
    console.log('⏱️ Countdown started: 15 seconds'); // Updated log message
}

// Cancel Emergency
if (cancelSOSBtn) {
    cancelSOSBtn.addEventListener('click', () => {
        console.log('❌ Emergency cancelled by user');
        
        // Stop countdown
        clearInterval(countdownTimer);
        
        // Vibrate confirmation
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
        
        // Reset view
        emergencyActive.style.display = 'none';
        emergencyInitial.style.display = 'block';
        emergencySection.classList.remove('alert-active');
        
        // Reset countdown
        countdownSeconds = 15; // Changed from 30 to 15
        countdownNumber.textContent = '15'; // Changed from '30' to '15'
        countdownProgress.style.strokeDashoffset = 0;
        
        // Show notification
        showNotification('Emergency cancelled. Stay safe!', 'info');
    });
}

// Update Status During Countdown
function updateStatus() {
    const statuses = [
        { delay: 1000, icon: 'success', text: 'Location captured: ' + (userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : 'Unavailable') },
        { delay: 3000, icon: 'success', text: 'Preparing emergency contacts...' },
        { delay: 5000, icon: 'success', text: 'Nearest hospital identified: AIIMS New Delhi (2.3 km)' },
        { delay: 7000, icon: 'success', text: 'Medical information compiled' }
    ];
    
    statuses.forEach(status => {
        setTimeout(() => {
            addStatusUpdate(status.text, status.icon);
        }, status.delay);
    });
}

function addStatusUpdate(text, icon = 'success') {
    const statusItem = document.createElement('div');
    statusItem.className = 'status-item';
    statusItem.innerHTML = `
        <div class="status-icon ${icon}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ${icon === 'success' 
                    ? '<polyline points="20 6 9 17 4 12" stroke-width="2"></polyline>'
                    : '<circle cx="12" cy="12" r="10" stroke-width="2"></circle>'
                }
            </svg>
        </div>
        <span>${text}</span>
    `;
    statusUpdates.appendChild(statusItem);
    
    // Scroll to bottom
    statusUpdates.scrollTop = statusUpdates.scrollHeight;
}

// Send Emergency Alerts
function sendEmergencyAlerts() {
    console.log('📤 Sending emergency alerts...');
    
    // Vibrate strongly
    if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
    }
    
    // In production, make actual API calls here
    simulateSendingAlerts();
}

function simulateSendingAlerts() {
    // Hide countdown, show sent confirmation
    emergencyActive.style.display = 'none';
    emergencySent.style.display = 'block';
    emergencySection.classList.remove('alert-active');
    
    // Update location in sent state
    const sharedLocation = document.getElementById('sharedLocation');
    if (sharedLocation && userLocation) {
        sharedLocation.textContent = `Lat: ${userLocation.latitude.toFixed(4)}, Long: ${userLocation.longitude.toFixed(4)}`;
    }
    
    // Simulate API calls with delays
    setTimeout(() => {
        console.log('✅ Hospital notified: AIIMS New Delhi');
        playSuccessSound();
    }, 500);
    
    setTimeout(() => {
        console.log('✅ Emergency contacts notified');
    }, 1000);
    
    setTimeout(() => {
        console.log('✅ Medical information shared');
    }, 1500);
    
    setTimeout(() => {
        console.log('✅ Location shared with all emergency services');
    }, 2000);
}

// Call Emergency Services
window.callEmergency = function() {
    console.log('📞 Calling emergency services: 102');
    
    // In production, this would trigger a phone call
    if (confirm('This will call 102 (Emergency Services). Continue?')) {
        // Use tel: protocol to initiate call
        window.location.href = 'tel:102';
    }
};

// Open Map
window.openMap = function() {
    console.log('🗺️ Opening map with user location');
    
    if (userLocation) {
        // Open Google Maps with user's location
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${userLocation.latitude},${userLocation.longitude}`;
        window.open(mapsUrl, '_blank');
    } else {
        alert('Location not available');
    }
};

// Reset Emergency
window.resetEmergency = function() {
    console.log('🔄 Resetting emergency state');
    
    emergencySent.style.display = 'none';
    emergencyInitial.style.display = 'block';
    emergencySection.classList.remove('alert-active');
    
    // Reset status updates
    statusUpdates.innerHTML = `
        <div class="status-item">
            <div class="status-icon pending">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                </svg>
            </div>
            <span>Capturing your location...</span>
        </div>
    `;
    
    showNotification('Emergency cleared. You are safe now.', 'success');
};

// Play Success Sound
function playSuccessSound() {
    // Create audio context for beep sound
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '24px';
    notification.style.padding = '16px 24px';
    notification.style.borderRadius = '12px';
    notification.style.color = 'white';
    notification.style.fontWeight = '600';
    notification.style.zIndex = '10000';
    notification.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    notification.style.animation = 'slideInRight 0.3s ease';
    notification.textContent = message;
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, var(--success), #4FA89D)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, var(--error), #E59090)';
    } else {
        notification.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'E' for emergency
    if (e.key === 'e' || e.key === 'E') {
        if (emergencyInitial.style.display !== 'none') {
            console.log('⌨️ Emergency activated via keyboard');
            activateEmergency();
        }
    }
    
    // Press 'Escape' to cancel
    if (e.key === 'Escape') {
        if (emergencyActive.style.display !== 'none') {
            cancelSOSBtn.click();
        }
    }
});

// Prevent accidental navigation during emergency
window.addEventListener('beforeunload', (e) => {
    if (emergencyActive.style.display !== 'none') {
        e.preventDefault();
        e.returnValue = 'Emergency alert is active. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Log keyboard shortcuts
console.log('⌨️ Keyboard shortcuts:');
console.log('   E: Activate emergency');
console.log('   Escape: Cancel emergency');

console.log('✅ Emergency SOS initialization complete');
