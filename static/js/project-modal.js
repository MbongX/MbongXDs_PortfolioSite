/**
 * Project Modal Component
 * Handles the display and interaction with project modals
 */
class ProjectModal {
    /**
     * Default options for the modal
     */
    static defaultOptions = {
        animationDuration: 300,
        closeOnEsc: true,
        closeOnOverlayClick: true
    };

    /**
     * Create a new ProjectModal instance
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        this.options = { ...ProjectModal.defaultOptions, ...options };
        this.isOpen = false;
        this.init();
    }

    /**
     * Initialize the modal
     */
    init() {
        this.createModal();
        this.bindEvents();
    }

    /**
     * Create the modal HTML structure
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'project-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('aria-hidden', 'true');
        
        this.modal.innerHTML = `
            <div class="modal-overlay" tabindex="-1" data-modal-close></div>
            <div class="modal-content" role="document">
                <button class="modal-close" aria-label="Close modal">&times;</button>
                <div class="modal-body">
                    <div class="project-media"></div>
                    <div class="project-details">
                        <h2 class="project-title"></h2>
                        <div class="project-description"></div>
                        <div class="project-technologies">
                            <h3>Technologies Used</h3>
                            <div class="tech-tags"></div>
                        </div>
                        <div class="project-links"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close modal events
        const closeBtn = this.modal.querySelector('.modal-close');
        const overlay = this.modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', () => this.close());
        
        if (this.options.closeOnOverlayClick) {
            overlay.addEventListener('click', () => this.close());
        }
        
        if (this.options.closeOnEsc) {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }
        
        // Trap focus inside modal when open
        this.modal.addEventListener('keydown', this.trapFocus.bind(this));
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }

    /**
     * Trap focus inside the modal for better accessibility
     * @param {KeyboardEvent} e - The keyboard event
     */
    trapFocus(e) {
        if (e.key !== 'Tab') return;

        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [data-modal-close]'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Open the modal with project data
     * @param {Object} project - Project data to display
     */
    open(project) {
        if (!project) {
            console.error('No project data provided');
            return;
        }

        // Update modal content
        this.updateContent(project);
        
        // Show the modal
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Focus on the first focusable element
        const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [data-modal-close]');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
        
        // Trigger animation
        this.modal.style.transition = `opacity ${this.options.animationDuration}ms ease`;
    }

    /**
     * Close the modal
     */
    close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    /**
     * Update modal content with project data
     * @param {Object} project - Project data
     */
    updateContent(project) {
        const { 
            title = '',
            description = '',
            technologies = [],
            links = {},
            media = {}
        } = project;

        // Update title
        const titleEl = this.modal.querySelector('.project-title');
        if (titleEl) titleEl.textContent = title;

        // Update description
        const descEl = this.modal.querySelector('.project-description');
        if (descEl) descEl.innerHTML = description;

        // Update technologies
        const techContainer = this.modal.querySelector('.tech-tags');
        if (techContainer) {
            techContainer.innerHTML = technologies
                .map(tech => `<span class="tech-tag">${tech}</span>`)
                .join('');
        }

        // Update links
        const linksContainer = this.modal.querySelector('.project-links');
        if (linksContainer) {
            linksContainer.innerHTML = Object.entries(links)
                .filter(([_, url]) => url) // Filter out empty URLs
                .map(([type, url]) => {
                    const label = type === 'demo' ? 'View Live Demo' : 'View on GitHub';
                    const icon = type === 'demo' ? '🌐' : '💻';
                    return `
                        <a href="${url}" 
                           class="project-link" 
                           target="_blank" 
                           rel="noopener noreferrer">
                            ${icon} ${label}
                        </a>
                    `;
                })
                .join('');
        }

        // Update media
        const mediaContainer = this.modal.querySelector('.project-media');
        if (mediaContainer) {
            if (media.type && media.url) {
                mediaContainer.innerHTML = media.type === 'image' 
                    ? `<img src="${media.url}" alt="${title}" loading="lazy">`
                    : `<video src="${media.url}" controls></video>`;
            } else {
                mediaContainer.innerHTML = '';
            }
        }
    }

    /**
     * Clean up event listeners and remove the modal
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.modal.removeEventListener('keydown', this.trapFocus);
        this.modal.remove();
    }
}

/**
 * Initialize project modals for all project cards on the page
 * @returns {ProjectModal} The initialized modal instance
 */
function initProjectModals() {
    const projectCards = document.querySelectorAll('.project-card');
    
    if (projectCards.length === 0) {
        console.warn('No project cards found');
        return null;
    }
    
    // Create a single modal instance
    const modal = new ProjectModal();
    
    // Add click event to each project card
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent default if it's a link inside the card
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }
            
            // Get project data from data attributes
            const projectData = {
                title: card.dataset.title || '',
                description: card.dataset.description || '',
                technologies: card.dataset.technologies ? JSON.parse(card.dataset.technologies) : [],
                links: {
                    demo: card.dataset.demoUrl || '',
                    github: card.dataset.githubUrl || ''
                },
                media: {
                    type: card.dataset.mediaType || 'image',
                    url: card.dataset.mediaUrl || ''
                }
            };
            
            // Open modal with project data
            modal.open(projectData);
        });
    });
    
    return modal;
}

// Initialize modals when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectModals);
} else {
    // In case the DOM is already loaded
    setTimeout(initProjectModals, 100);
}

// Export for testing
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { ProjectModal, initProjectModals };
} else {
    window.ProjectModal = ProjectModal;
    window.initProjectModals = initProjectModals;
}
