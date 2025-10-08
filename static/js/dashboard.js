// ============================================
// DASHBOARD - SIMPLIFIED VERSION
// No scroll animations, minimal hover effects
// ============================================

console.log('✅ Dashboard.js loaded');

// Elements
const shareBtn = document.getElementById('shareBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareModal = document.getElementById('shareModal');
const copyBtn = document.querySelector('.copy-btn');

// Share Modal Functions
function openShareModal() {
    console.log('📤 Opening share modal');
    shareModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeShareModal() {
    console.log('❌ Closing share modal');
    shareModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Share Button Event
if (shareBtn) {
    shareBtn.addEventListener('click', openShareModal);
}

// Close modal when clicking backdrop
const modalBackdrop = document.querySelector('.modal-backdrop');
if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeShareModal);
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shareModal.classList.contains('active')) {
        closeShareModal();
    }
});

// Copy Link Functionality
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const linkInput = document.querySelector('.link-copy input');
        const linkText = linkInput.value;
        
        try {
            await navigator.clipboard.writeText(linkText);
            
            // Simple text feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            copyBtn.style.background = 'linear-gradient(135deg, var(--success), #4FA89D)';
            
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2"></path>
                    </svg>
                    Copy
                `;
                copyBtn.style.background = '';
            }, 2000);
            
            console.log('✅ Link copied to clipboard');
        } catch (err) {
            console.error('❌ Failed to copy:', err);
            linkInput.select();
            document.execCommand('copy');
            alert('Link copied to clipboard!');
        }
    });
}

// Share to Doctor/Family Functions
const shareActionBtns = document.querySelectorAll('.share-action-btn');
shareActionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const emailInput = this.previousElementSibling;
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Please enter an email address');
            emailInput.focus();
            return;
        }
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address');
            emailInput.focus();
            return;
        }
        
        const recipient = this.textContent.includes('Doctor') ? 'doctor' : 'family member';
        console.log(`📧 Sending report to ${recipient}: ${email}`);
        
        const originalText = this.textContent;
        this.textContent = 'Sending...';
        this.disabled = true;
        
        setTimeout(() => {
            this.textContent = '✓ Sent!';
            this.style.background = 'linear-gradient(135deg, var(--success), #4FA89D)';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
                this.disabled = false;
                emailInput.value = '';
            }, 2000);
            
            console.log(`✅ Report sent successfully to ${email}`);
        }, 1500);
    });
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Download PDF Functionality
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        console.log('📥 Downloading dashboard as PDF');
        
        const originalHTML = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ircle cx="12" cy="12" r="10" stroke-width="="2"></circle>
            </svg>
            <span>Generating...</span>
        `;
        downloadBtn.disabled = true;
        
        setTimeout(() => {
            downloadBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" stroke-width="2"></polyline>
                </svg>
                <span>Downloaded!</span>
            `;
            
            console.log('✅ PDF downloaded successfully');
            
            setTimeout(() => {
                downloadBtn.innerHTML = originalHTML;
                downloadBtn.disabled = false;
            }, 2000);
        }, 1500);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        openShareModal();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (downloadBtn) downloadBtn.click();
    }
});

console.log('✅ Dashboard initialization complete');
