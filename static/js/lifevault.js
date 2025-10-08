// ============================================
// QR LIFE-VAULT - EMERGENCY MEDICAL INFO
// ============================================

console.log('✅ LifeVault.js loaded');

// Elements
const saveVaultBtn = document.getElementById('saveVaultBtn');
const generateQrBtn = document.getElementById('generateQrBtn');
const videoInput = document.getElementById('videoInput');
const videoUploadArea = document.getElementById('videoUploadArea');
const videoList = document.getElementById('videoList');
const qrCodeDisplay = document.getElementById('qrCodeDisplay');

// Video storage
let uploadedVideos = [];

// Save Vault Data
if (saveVaultBtn) {
    saveVaultBtn.addEventListener('click', () => {
        console.log('💾 Saving Life-Vault data');
        
        // Collect all form data
        const vaultData = {
            personalInfo: {
                fullName: document.getElementById('fullName').value,
                age: document.getElementById('age').value,
                bloodGroup: document.getElementById('bloodGroup').value,
                address: document.getElementById('address').value,
                phone: document.getElementById('phone').value,
                language: document.getElementById('language').value
            },
            emergencyContacts: collectEmergencyContacts(),
            medicalInfo: {
                conditions: document.getElementById('conditions').value,
                allergies: document.getElementById('allergies').value,
                medications: collectMedications(),
                doctor: document.getElementById('doctor').value,
                doctorPhone: document.getElementById('doctorPhone').value,
                hospital: document.getElementById('hospital').value
            },
            notes: document.getElementById('notes').value,
            videos: uploadedVideos,
            lastUpdated: new Date().toISOString()
        };
        
        // Save to localStorage (in production, save to backend)
        localStorage.setItem('lifeVaultData', JSON.stringify(vaultData));
        
        // Visual feedback
        const originalText = saveVaultBtn.innerHTML;
        saveVaultBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" stroke-width="2"></polyline>
            </svg>
            <span>Saved!</span>
        `;
        saveVaultBtn.style.background = 'linear-gradient(135deg, var(--success), #4FA89D)';
        
        setTimeout(() => {
            saveVaultBtn.innerHTML = originalText;
            saveVaultBtn.style.background = '';
        }, 2000);
        
        console.log('✅ Life-Vault data saved successfully');
    });
}

// Generate QR Code
if (generateQrBtn) {
    generateQrBtn.addEventListener('click', () => {
        console.log('📱 Generating QR code');
        
        // Get vault data
        const vaultData = {
            name: document.getElementById('fullName').value,
            age: document.getElementById('age').value,
            bloodGroup: document.getElementById('bloodGroup').value,
            emergencyContact: getFirstContact(),
            medicalConditions: document.getElementById('conditions').value,
            allergies: document.getElementById('allergies').value,
            medications: collectMedications().join(', '),
            viewUrl: `https://silentguardian.ai/vault/${generateRandomId()}`
        };
        
        // In production, use a QR library like qrcode.js
        // For demo, show success message
        const originalText = generateQrBtn.innerHTML;
        generateQrBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
            </svg>
            <span>Generating...</span>
        `;
        generateQrBtn.disabled = true;
        
        setTimeout(() => {
            // Display QR code (simulated)
            displayQRCode(vaultData);
            
            generateQrBtn.innerHTML = originalText;
            generateQrBtn.disabled = false;
            
            showNotification('QR Code generated successfully!');
            console.log('✅ QR code generated');
        }, 1500);
    });
}

// Display QR Code
function displayQRCode(data) {
    // In production, use QRCode.js or similar library
    // For demo, create a placeholder
    qrCodeDisplay.innerHTML = `
        <div style="width: 240px; height: 240px; background: white; border: 4px solid var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" style="width: 120px; height: 120px;">
                <rect x="3" y="3" width="7" height="7" stroke-width="2"></rect>
                <rect x="14" y="3" width="7" height="7" stroke-width="2"></rect>
                <rect x="14" y="14" width="7" height="7" stroke-width="2"></rect>
                <rect x="3" y="14" width="7" height="7" stroke-width="2"></rect>
            </svg>
            <p style="margin-top: 12px; font-size: 14px; color: var(--text-primary); font-weight: 600;">Life-Vault QR Code</p>
            <p style="font-size: 12px; color: var(--text-secondary); text-align: center; margin-top: 4px;">${data.name}</p>
        </div>
    `;
    
    // In production:
    // new QRCode(qrCodeDisplay, {
    //     text: data.viewUrl,
    //     width: 240,
    //     height: 240
    // });
}

// Video Upload Handling
if (videoInput) {
    videoInput.addEventListener('change', handleVideoUpload);
}

if (videoUploadArea) {
    // Drag and drop
    videoUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        videoUploadArea.style.borderColor = 'var(--primary)';
        videoUploadArea.style.background = 'rgba(74, 159, 199, 0.1)';
    });
    
    videoUploadArea.addEventListener('dragleave', () => {
        videoUploadArea.style.borderColor = '';
        videoUploadArea.style.background = '';
    });
    
    videoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        videoUploadArea.style.borderColor = '';
        videoUploadArea.style.background = '';
        
        const files = e.dataTransfer.files;
        handleVideoFiles(files);
    });
    
    // Click to upload
    videoUploadArea.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            videoInput.click();
        }
    });
}

function handleVideoUpload(e) {
    const files = e.target.files;
    handleVideoFiles(files);
}

function handleVideoFiles(files) {
    if (uploadedVideos.length >= 3) {
        alert('Maximum 3 videos allowed');
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        if (uploadedVideos.length >= 3) return;
        
        // Validate file type
        if (!file.type.startsWith('video/')) {
            alert(`${file.name} is not a video file`);
            return;
        }
        
        // Validate file size (max 100MB for demo)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            alert(`${file.name} is too large. Maximum size is 100MB`);
            return;
        }
        
        // Create video object
        const videoObj = {
            id: Date.now() + index,
            name: file.name,
            size: formatFileSize(file.size),
            file: file,
            url: URL.createObjectURL(file)
        };
        
        uploadedVideos.push(videoObj);
        addVideoToList(videoObj);
        
        console.log(`✅ Video added: ${file.name}`);
    });
    
    // Reset input
    videoInput.value = '';
}

function addVideoToList(video) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
        <div class="video-preview">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" stroke-width="2"></polygon>
            </svg>
        </div>
        <div class="video-info">
            <h4>${video.name}</h4>
            <p>Size: ${video.size}</p>
        </div>
        <div class="video-actions">
            <button class="video-action-btn" onclick="playVideo(${video.id})" title="Play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" stroke-width="2"></polygon>
                </svg>
            </button>
            <button class="video-action-btn delete" onclick="deleteVideo(${video.id})" title="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6" stroke-width="2"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"></path>
                </svg>
            </button>
        </div>
    `;
    
    videoList.appendChild(videoItem);
}

// Play Video
window.playVideo = function(videoId) {
    const video = uploadedVideos.find(v => v.id === videoId);
    if (!video) return;
    
    console.log(`▶️ Playing video: ${video.name}`);
    
    // Create modal to play video
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.background = 'rgba(0, 0, 0, 0.9)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    
    modal.innerHTML = `
        <div style="position: relative; max-width: 800px; width: 100%;">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: -40px; right: 0; background: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px;">×</button>
            <video controls autoplay style="width: 100%; border-radius: 12px;">
                <source src="${video.url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Delete Video
window.deleteVideo = function(videoId) {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    const index = uploadedVideos.findIndex(v => v.id === videoId);
    if (index === -1) return;
    
    const video = uploadedVideos[index];
    URL.revokeObjectURL(video.url);
    uploadedVideos.splice(index, 1);
    
    // Remove from DOM
    const videoItems = videoList.querySelectorAll('.video-item');
    if (videoItems[index]) {
        videoItems[index].remove();
    }
    
    console.log(`🗑️ Video deleted: ${video.name}`);
    showNotification('Video deleted', 'info');
};

// Add Contact
const addContactBtn = document.querySelector('.add-contact-btn');
if (addContactBtn) {
    addContactBtn.addEventListener('click', () => {
        const contactsContainer = addContactBtn.parentElement;
        const contactCount = contactsContainer.querySelectorAll('.contact-item').length;
        
        const newContact = document.createElement('div');
        newContact.className = 'contact-item';
        newContact.innerHTML = `
            <div class="contact-header">
                <span class="contact-type">Contact ${contactCount + 1}</span>
                <button class="remove-contact-btn" style="background: var(--error); color: white; border: none; padding: 4px 12px; border-radius: 8px; cursor: pointer; font-size: 12px;" onclick="this.closest('.contact-item').remove()">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" placeholder="Contact name">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" placeholder="Phone number">
                </div>
            </div>
        `;
        
        contactsContainer.insertBefore(newContact, addContactBtn);
        console.log('➕ Contact added');
    });
}

// Add Medication
const addMedicationBtn = document.querySelector('.add-medication-btn');
if (addMedicationBtn) {
    addMedicationBtn.addEventListener('click', () => {
        const medicationList = document.querySelector('.medication-list');
        
        const newMed = document.createElement('div');
        newMed.className = 'medication-item';
        newMed.innerHTML = `
            <input type="text" placeholder="Medication name and dosage">
            <button class="remove-med-btn" onclick="this.closest('.medication-item').remove()">×</button>
        `;
        
        medicationList.appendChild(newMed);
        console.log('💊 Medication added');
    });
}

// Remove Medication Buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-med-btn')) {
        e.target.closest('.medication-item').remove();
        console.log('🗑️ Medication removed');
    }
});

// QR Code Actions
const qrActionBtns = document.querySelectorAll('.qr-action-btn');
qrActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.textContent.trim();
        
        if (action.includes('Download')) {
            console.log('📥 Downloading QR code');
            // In production, use canvas.toDataURL() to download
            showNotification('QR Code downloaded!');
        } else if (action.includes('Print')) {
            console.log('🖨️ Printing QR code');
            window.print();
        }
    });
});

// Helper Functions
function collectEmergencyContacts() {
    const contacts = [];
    document.querySelectorAll('.contact-item').forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs.length >= 2) {
            contacts.push({
                name: inputs[0].value,
                phone: inputs[1].value
            });
        }
    });
    return contacts;
}

function getFirstContact() {
    const firstContact = document.querySelector('.contact-item input');
    return firstContact ? firstContact.value : 'Not provided';
}

function collectMedications() {
    const medications = [];
    document.querySelectorAll('.medication-item input').forEach(input => {
        if (input.value.trim()) {
            medications.push(input.value.trim());
        }
    });
    return medications;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function generateRandomId() {
    return Math.random().toString(36).substring(2, 15);
}

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
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load saved data on page load
window.addEventListener('load', () => {
    const savedData = localStorage.getItem('lifeVaultData');
    if (savedData) {
        console.log('📂 Loading saved Life-Vault data');
        // You can populate fields with saved data here if needed
    }
});

// Auto-save on input change (optional)
const autoSaveTimeout = null;
document.querySelectorAll('input, textarea, select').forEach(element => {
    element.addEventListener('input', () => {
        clearTimeout(autoSaveTimeout);
        // Uncomment to enable auto-save
        // autoSaveTimeout = setTimeout(() => {
        //     console.log('💾 Auto-saving...');
        //     saveVaultBtn.click();
        // }, 2000);
    });
});

console.log('✅ LifeVault initialization complete');
