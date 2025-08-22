/**
 * Main JavaScript for Portfolio Website
 * Organized and optimized for performance
 */

// Configuration
const CONFIG = {
    scrollOffset: 80,
    animationTriggerOffset: 0.7,
    animationElements: '.timeline-item, .project-card, .about-content',
    navLinks: 'nav a',
    sections: 'section'
};

// DOM Elements
let elements = {
    navLinks: null,
    sections: null,
    animatedElements: null
};

/**
 * Initialize the application
 */
function init() {
    cacheDOMElements();
    setupEventListeners();
    setupInitialState();
    initTypewriter();
}

/**
 * Cache DOM elements for better performance
 */
function cacheDOMElements() {
    elements = {
        navLinks: document.querySelectorAll(CONFIG.navLinks),
        sections: document.querySelectorAll(CONFIG.sections),
        animatedElements: document.querySelectorAll(CONFIG.animationElements)
    };
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Smooth scrolling for anchor links
    document.addEventListener('click', handleSmoothScroll);
    
    // Scroll events with throttling
    window.addEventListener('scroll', throttle(handleScroll, 100));
    
    // Handle window resize with debounce
    window.addEventListener('resize', debounce(handleResize, 200));
}

/**
 * Set initial state for animations and other elements
 */
function setupInitialState() {
    // Set initial state for animations
    elements.animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });
    
    // Trigger initial animations
    animateOnScroll();
}

/**
 * Handle smooth scrolling for anchor links
 * @param {Event} e - The click event
 */
function handleSmoothScroll(e) {
    const target = e.target.closest('a[href^="#"]');
    if (!target) return;
    
    e.preventDefault();
    const targetId = target.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - CONFIG.scrollOffset,
            behavior: 'smooth'
        });
    }
}

/**
 * Handle scroll events
 */
function handleScroll() {
    updateActiveNavLink();
    animateOnScroll();
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    let current = '';
    const scrollPosition = window.scrollY;
    
    elements.sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    elements.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

/**
 * Animate elements when they come into view
 */
function animateOnScroll() {
    elements.animatedElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight * CONFIG.animationTriggerOffset;
            
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

/**
 * Handle window resize
 */
function handleResize() {
    // Re-cache DOM elements that might change on resize
    cacheDOMElements();
}

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - The function to throttle
 * @param {number} limit - Time in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function to delay function execution
 * @param {Function} func - The function to debounce
 * @param {number} wait - Time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Initialize typewriter effect for the hero section
 */
function initTypewriter() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;

    const text = heroSubtitle.textContent.trim();
    heroSubtitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            heroSubtitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    // Start the typewriter effect after a short delay
    setTimeout(typeWriter, 1000);
}

// Initialize the application when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // In case the document is already loaded
    init();
}

// Mobile menu toggle (if you add a mobile menu later)
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');
    
if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Form submission handling (if you add a contact form later)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Add form submission logic here
        alert('Thank you for your message! I will get back to you soon.');
        this.reset();
    });
}

// Initialize typewriter effect when the page loads
window.addEventListener('load', initTypewriter);
