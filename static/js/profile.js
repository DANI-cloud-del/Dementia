// ============================================
// PROFILE PAGE - USER SETTINGS & PREFERENCES
// ============================================

console.log('✅ Profile.js loaded');

// Elements
const avatarEditBtn = document.getElementById('avatarEditBtn');
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');

// Avatar Upload
if (avatarEditBtn && avatarInput) {
    avatarEditBtn.addEventListener('click', () => {
        avatarInput.click();
    });
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarImg.src = e.target.result;
                    console.log('✅ Avatar updated');
                    showNotification('Profile picture updated!', 'success');
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file');
            }
        }
    });
}

// Edit Section
window.editSection = function(section) {
    console.log(`✏️ Editing ${section} section`);
    
    // In production, this would open an edit modal
    // For demo, we'll just show a notification
    showNotification(`Edit ${section} information`, 'info');
    
    // You can implement modal editing here
};

// Add Family Member
window.addFamilyMember = function() {
    console.log('➕ Adding family member');
    
    // Create modal for adding family member
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.background = 'rgba(0, 0, 0, 0.6)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); border-radius: 20px; padding: 32px; max-width: 500px; width: 100%; border: 2px solid var(--border);">
            <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px;">Add Family Member</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Full Name</label>
                <input type="text" id="memberName" placeholder="Enter full name" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-size: 15px;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Relationship</label>
                <select id="memberRelation" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-size: 15px;">
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="spouse">Spouse</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Email</label>
                <input type="email" id="memberEmail" placeholder="email@example.com" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-size: 15px;">
            </div>
            
            <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Access Level</label>
                <select id="memberAccess" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary); font-size: 15px;">
                    <option value="full">Full Access</option>
                    <option value="limited">Limited Access</option>
                    <option value="emergency">Emergency Only</option>
                </select>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button onclick="this.closest('div').parentElement.parentElement.remove()" style="flex: 1; padding: 14px; background: var(--bg-secondary); border: 2px solid var(--border); border-radius: 12px; color: var(--text-primary); font-size: 16px; font-weight: 600; cursor: pointer;">Cancel</button>
                <button onclick="saveFamilyMember()" style="flex: 1; padding: 14px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer;">Add Member</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

// Save Family Member
window.saveFamilyMember = function() {
    const name = document.getElementById('memberName').value;
    const relation = document.getElementById('memberRelation').value;
    const email = document.getElementById('memberEmail').value;
    const access = document.getElementById('memberAccess').value;
    
    if (!name || !email) {
        alert('Please fill in all required fields');
        return;
    }
    
    console.log('💾 Saving family member:', { name, relation, email, access });
    
    // In production, save to backend
    // For demo, just show success
    showNotification(`${name} added successfully!`, 'success');
    
    // Close modal
    document.querySelector('div[style*="position: fixed"]').remove();
    
    // Add to list (you can append to the family members section)
};

// Delete Account
window.deleteAccount = function() {
    console.log('⚠️ Delete account requested');
    
    const confirmed = confirm(
        'Are you absolutely sure you want to delete your account?\n\n' +
        'This will permanently delete:\n' +
        '• All your personal information\n' +
        '• All conversation history\n' +
        '• All health data and analytics\n' +
        '• Your Life-Vault information\n\n' +
        'This action CANNOT be undone!'
    );
    
    if (confirmed) {
        const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
        
        if (doubleConfirm === 'DELETE') {
            console.log('🗑️ Account deletion confirmed');
            
            // In production, call backend API to delete account
            // For demo, show notification
            showNotification('Account deletion initiated. You will be logged out shortly.', 'error');
            
            // Simulate logout after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } else {
            showNotification('Account deletion cancelled', 'info');
        }
    }
};

// Preference Changes
const preferenceSelects = document.querySelectorAll('.preference-select');
preferenceSelects.forEach(select => {
    select.addEventListener('change', function() {
        const preference = this.closest('.preference-item').querySelector('.preference-label span').textContent;
        console.log(`⚙️ ${preference} changed to: ${this.value}`);
        
        // Auto-save preference
        savePreference(preference, this.value);
    });
});

// Toggle Switches
const toggleSwitches = document.querySelectorAll('.toggle-switch input');
toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', function() {
        const preference = this.closest('.preference-item').querySelector('.preference-label span').textContent;
        console.log(`⚙️ ${preference} toggled: ${this.checked}`);
        
        // Auto-save preference
        savePreference(preference, this.checked);
    });
});

// Save Preference
function savePreference(name, value) {
    console.log(`💾 Saving preference: ${name} = ${value}`);
    
    // In production, save to backend
    // For demo, save to localStorage
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences[name] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    showNotification(`${name} updated`, 'success');
}

// Plan Management
const upgradeBtn = document.querySelector('.upgrade-btn');
if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
        console.log('⬆️ Upgrade plan clicked');
        
        // Show upgrade options
        const modal = createUpgradeModal();
        document.body.appendChild(modal);
    });
}

const manageBtn = document.querySelector('.manage-btn');
if (manageBtn) {
    manageBtn.addEventListener('click', () => {
        console.log('⚙️ Manage subscription clicked');
        showNotification('Opening subscription management...', 'info');
        
        // In production, redirect to payment portal
    });
}

// Create Upgrade Modal
function createUpgradeModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.right = '0';
    modal.style.bottom = '0';
    modal.style.background = 'rgba(0, 0, 0, 0.6)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    modal.style.overflowY = 'auto';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); border-radius: 24px; padding: 40px; max-width: 900px; width: 100%; border: 2px solid var(--border);">
            <h2 style="font-size: 32px; font-weight: 700; color: var(--text-primary); margin-bottom: 32px; text-align: center;">Choose Your Plan</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 32px;">
                <!-- Free Plan -->
                <div style="background: var(--bg-secondary); border: 2px solid var(--border); border-radius: 16px; padding: 24px;">
                    <h3 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Free</h3>
                    <p style="font-size: 32px; font-weight: 700; color: var(--primary); margin-bottom: 20px;">₹0<span style="font-size: 16px; font-weight: 400;">/month</span></p>
                    <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Basic AI conversations</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Simple memory games</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Emergency contacts</li>
                        <li style="margin-bottom: 12px; color: var(--text-muted);">✗ 24/7 Support</li>
                    </ul>
                    <button style="width: 100%; padding: 12px; background: var(--bg-card); border: 2px solid var(--border); border-radius: 10px; color: var(--text-primary); font-weight: 600; cursor: pointer;">Current Plan</button>
                </div>
                
                <!-- Premium Plan -->
                <div style="background: linear-gradient(135deg, rgba(74, 159, 199, 0.1), rgba(93, 188, 198, 0.1)); border: 3px solid var(--primary); border-radius: 16px; padding: 24px; position: relative;">
                    <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;">CURRENT</span>
                    <h3 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Premium</h3>
                    <p style="font-size: 32px; font-weight: 700; color: var(--primary); margin-bottom: 20px;">₹999<span style="font-size: 16px; font-weight: 400;">/month</span></p>
                    <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Unlimited AI conversations</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ 24/7 Emergency SOS</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Advanced analytics</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Video messages</li>
                    </ul>
                    <button style="width: 100%; padding: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer;">Subscribed</button>
                </div>
                
                <!-- Enterprise Plan -->
                <div style="background: var(--bg-secondary); border: 2px solid var(--border); border-radius: 16px; padding: 24px;">
                    <h3 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">Enterprise</h3>
                    <p style="font-size: 32px; font-weight: 700; color: var(--primary); margin-bottom: 20px;">₹2,499<span style="font-size: 16px; font-weight: 400;">/month</span></p>
                    <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Everything in Premium</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Priority support</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Dedicated care manager</li>
                        <li style="margin-bottom: 12px; color: var(--text-secondary);">✓ Custom integrations</li>
                    </ul>
                    <button onclick="upgradeToPlan('enterprise')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; border-radius: 10px; color: white; font-weight: 600; cursor: pointer;">Upgrade</button>
                </div>
            </div>
            
            <button onclick="this.closest('div').parentElement.remove()" style="display: block; margin: 0 auto; padding: 12px 32px; background: var(--bg-secondary); border: 2px solid var(--border); border-radius: 10px; color: var(--text-primary); font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    
    return modal;
}

// Upgrade to Plan
window.upgradeToPlan = function(plan) {
    console.log(`⬆️ Upgrading to ${plan} plan`);
    
    showNotification(`Redirecting to payment for ${plan} plan...`, 'info');
    
    // In production, redirect to payment gateway
    setTimeout(() => {
        showNotification('Payment integration coming soon!', 'info');
    }, 1500);
};

// Security Actions
const actionBtns = document.querySelectorAll('.action-btn');
actionBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.closest('.security-item').querySelector('h4').textContent;
        console.log(`🔒 Security action: ${action}`);
        
        if (action.includes('Password')) {
            showChangePasswordModal();
        } else if (action.includes('Two-Factor')) {
            showTwoFactorModal();
        } else if (action.includes('Privacy')) {
            showPrivacyModal();
        }
    });
});

// Show Change Password Modal
function showChangePasswordModal() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); border-radius: 20px; padding: 32px; max-width: 500px; width: 100%; border: 2px solid var(--border);">
            <h2 style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 24px;">Change Password</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Current Password</label>
                <input type="password" placeholder="Enter current password" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary);">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">New Password</label>
                <input type="password" placeholder="Enter new password" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary);">
            </div>
            
            <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" style="width: 100%; padding: 12px; border: 2px solid var(--border); border-radius: 10px; background: var(--bg-secondary); color: var(--text-primary);">
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button onclick="this.closest('div').parentElement.parentElement.remove()" style="flex: 1; padding: 14px; background: var(--bg-secondary); border: 2px solid var(--border); border-radius: 12px; color: var(--text-primary); font-weight: 600; cursor: pointer;">Cancel</button>
                <button onclick="showNotification('Password changed successfully!', 'success'); this.closest('div').parentElement.parentElement.remove();" style="flex: 1; padding: 14px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer;">Change Password</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show Two-Factor Modal
function showTwoFactorModal() {
    showNotification('Two-factor authentication settings', 'info');
}

// Show Privacy Modal
function showPrivacyModal() {
    showNotification('Privacy settings panel', 'info');
}

// Danger Zone - Export Data
const exportBtn = document.querySelector('.danger-btn.secondary');
if (exportBtn && exportBtn.textContent.includes('Export')) {
    exportBtn.addEventListener('click', () => {
        console.log('📦 Exporting user data');
        
        showNotification('Preparing your data export...', 'info');
        
        // Simulate data export
        setTimeout(() => {
            showNotification('Data export complete! Download started.', 'success');
        }, 2000);
    });
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 100px; right: 24px; padding: 16px 24px; border-radius: 12px; color: white; font-weight: 600; z-index: 10000; box-shadow: 0 8px 24px rgba(0,0,0,0.2); animation: slideInRight 0.3s ease;';
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
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);

console.log('✅ Profile page initialization complete');
