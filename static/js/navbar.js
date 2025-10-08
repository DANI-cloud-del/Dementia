// ============================================
// NAVIGATION BAR - MOBILE MENU & DROPDOWNS
// Mobile menu, profile dropdown, active links
// (Dark mode handled in base.html)
// ============================================

console.log('✅ Navbar.js loaded');

// Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const profileDropdownToggle = document.getElementById('profileDropdownToggle');
const profileDropdown = document.getElementById('profileDropdown');

let mobileMenuOpen = false;
let profileDropdownOpen = false;

// Mobile Menu Toggle
if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenuOpen = !mobileMenuOpen;
        
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Update hamburger icon
        const bars = mobileMenuToggle.querySelectorAll('.bar');
        if (mobileMenuOpen) {
            bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            
            // Prevent body scrolling when menu is open
            document.body.style.overflow = 'hidden';
            
            console.log('📱 Mobile menu opened');
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
            
            // Restore body scrolling
            document.body.style.overflow = '';
            
            console.log('📱 Mobile menu closed');
        }
    });
}

// Close mobile menu when clicking a link
const navLinkItems = document.querySelectorAll('.nav-link');
navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenuOpen) {
            mobileMenuToggle.click();
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenuOpen && navLinks && mobileMenuToggle) {
        if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            console.log('👆 Clicked outside - closing mobile menu');
            mobileMenuToggle.click();
        }
    }
});

// Profile Dropdown Toggle
if (profileDropdownToggle && profileDropdown) {
    profileDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdownOpen = !profileDropdownOpen;
        profileDropdown.classList.toggle('active');
        
        console.log(profileDropdownOpen ? '👤 Profile dropdown opened' : '👤 Profile dropdown closed');
    });
}

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (profileDropdownOpen && profileDropdown && profileDropdownToggle) {
        if (!profileDropdown.contains(e.target) && !profileDropdownToggle.contains(e.target)) {
            console.log('👆 Clicked outside - closing profile dropdown');
            profileDropdownOpen = false;
            profileDropdown.classList.remove('active');
        }
    }
});

// Close dropdowns on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (mobileMenuOpen && mobileMenuToggle) {
            mobileMenuToggle.click();
        }
        if (profileDropdownOpen && profileDropdown) {
            profileDropdownOpen = false;
            profileDropdown.classList.remove('active');
        }
    }
});

// Highlight Active Page
function highlightActivePage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Check if current path matches link href
        if (currentPath === href || currentPath.endsWith(href)) {
            link.classList.add('active');
            console.log(`✅ Active page: ${href}`);
        } else {
            link.classList.remove('active');
        }
    });
}

// Call on page load
highlightActivePage();

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Close mobile menu if resizing to desktop
        if (window.innerWidth > 768 && mobileMenuOpen) {
            mobileMenuToggle.click();
        }
        
        // Restore body scrolling on resize
        if (window.innerWidth > 768) {
            document.body.style.overflow = '';
        }
    }, 250);
});

// Navbar scroll effect (adds shadow on scroll)
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 10) {
        navbar.style.boxShadow = '0 4px 12px var(--shadow)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// Logout functionality
const logoutBtn = document.querySelector('.dropdown-item[href*="logout"]');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const confirmLogout = confirm('Are you sure you want to logout?');
        
        if (confirmLogout) {
            console.log('👋 User logging out');
            
            // Clear any stored data
            localStorage.removeItem('userPreferences');
            localStorage.removeItem('lifeVaultData');
            
            // Redirect to login page
            window.location.href = '/logout';
        }
    });
}

// Add CSS for smooth transitions
const style = document.createElement('style');
style.textContent = `
    .navbar {
        transition: box-shadow 0.3s ease;
    }
`;
document.head.appendChild(style);

console.log('✅ Navbar initialization complete');
console.log('📱 Mobile menu: Ready');
console.log('👤 Profile dropdown: Ready');
