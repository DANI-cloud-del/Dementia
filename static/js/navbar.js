// ============================================
// NAVIGATION BAR - MOBILE MENU & DROPDOWNS
// Mobile menu, profile dropdown, active links
// ============================================

console.log('✅ Navbar.js loaded');

// Elements - MATCHING YOUR HTML IDs
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileNav = document.getElementById('mobileNav');
const userToggle = document.getElementById('userToggle');
const userDropdown = document.getElementById('userDropdown');
const themeToggle = document.getElementById('themeToggle');

let mobileMenuOpen = false;
let userDropdownOpen = false;

// Mobile Menu Toggle
if (mobileMenuToggle && mobileNav) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenuOpen = !mobileMenuOpen;
        
        mobileNav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            console.log('📱 Mobile menu opened');
        } else {
            document.body.style.overflow = '';
            console.log('📱 Mobile menu closed');
        }
    });
}

// Close mobile menu when clicking a link
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenuOpen) {
            mobileMenuToggle.click();
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenuOpen && mobileNav && mobileMenuToggle) {
        if (!mobileNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            console.log('👆 Clicked outside - closing mobile menu');
            mobileMenuToggle.click();
        }
    }
});

// User Dropdown Toggle
if (userToggle && userDropdown) {
    userToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdownOpen = !userDropdownOpen;
        userDropdown.classList.toggle('active');
        
        console.log(userDropdownOpen ? '👤 User dropdown opened' : '👤 User dropdown closed');
    });
}

// Close user dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (userDropdownOpen && userDropdown && userToggle) {
        if (!userDropdown.contains(e.target) && !userToggle.contains(e.target)) {
            console.log('👆 Clicked outside - closing user dropdown');
            userDropdownOpen = false;
            userDropdown.classList.remove('active');
        }
    }
});

// Close dropdowns on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (mobileMenuOpen && mobileMenuToggle) {
            mobileMenuToggle.click();
        }
        if (userDropdownOpen && userDropdown) {
            userDropdownOpen = false;
            userDropdown.classList.remove('active');
        }
    }
});

// Highlight Active Page
function highlightActivePage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
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
const logoutLinks = document.querySelectorAll('a[href="/logout"]');
logoutLinks.forEach(logoutLink => {
    logoutLink.addEventListener('click', (e) => {
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
});

// Add transitions style once when document loads
document.addEventListener('DOMContentLoaded', () => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .navbar {
            transition: box-shadow 0.3s ease;
        }
        
        .mobile-nav {
            transition: transform 0.3s ease;
        }
        
        .mobile-nav.active {
            transform: translateX(0);
        }
        
        .user-dropdown {
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        
        .user-dropdown.active {
            opacity: 1;
            visibility: visible;
        }
        
        .mobile-toggle span {
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
    `;
    document.head.appendChild(styleSheet);
});

console.log('✅ Navbar initialization complete');
console.log('📱 Mobile menu: Ready');
console.log('👤 User dropdown: Ready');
