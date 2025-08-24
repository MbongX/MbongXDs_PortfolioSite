/**
 * Project Modal Component
 * Handles the display and interaction with project modals
 */
class ProjectModal {
    static defaultOptions = {
        animationDuration: 300,
        closeOnEsc: true,
        closeOnOverlayClick: true
    };

    constructor(options = {}) {
        this.options = { ...ProjectModal.defaultOptions, ...options };
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

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
                        <div class="project-technologies"></div>
                        <div class="project-links">
                            <a href="#" class="btn btn-primary project-link" target="_blank" rel="noopener">View Project</a>
                            <a href="#" class="btn btn-outline" target="_blank" rel="noopener">View Code</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);
        this.overlay = this.modal.querySelector('.modal-overlay');
        this.closeButton = this.modal.querySelector('.modal-close');
        this.titleElement = this.modal.querySelector('.project-title');
        this.descriptionElement = this.modal.querySelector('.project-description');
        this.technologiesElement = this.modal.querySelector('.project-technologies');
        this.mediaElement = this.modal.querySelector('.project-media');
        this.projectLink = this.modal.querySelector('.project-link');
        this.codeLink = this.modal.querySelector('.btn-outline');
    }

    bindEvents() {
        this.closeButton.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => {
            if (this.options.closeOnOverlayClick) this.close();
        });
        
        if (this.options.closeOnEsc) {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
        }
        
        if (e.key === 'Tab' && this.isOpen) {
            this.trapFocus(e);
        }
    }

    trapFocus(e) {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    open(project) {
        if (this.isOpen) return;
        
        this.updateContent(project);
        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        this.modal.focus();
        
        const event = new CustomEvent('projectModal:open', { detail: { project } });
        document.dispatchEvent(event);
    }

    close() {
        if (!this.isOpen) return;
        
        this.modal.setAttribute('aria-hidden', 'true');
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
        document.dispatchEvent(new CustomEvent('projectModal:close'));
    }

    updateContent(project) {
        this.titleElement.textContent = project.title;
        this.descriptionElement.innerHTML = project.description;
        
        this.technologiesElement.innerHTML = '';
        if (project.technologies && project.technologies.length > 0) {
            const techList = document.createElement('ul');
            techList.className = 'tech-list';
            
            project.technologies.forEach(tech => {
                const techItem = document.createElement('li');
                techItem.textContent = tech;
                techList.appendChild(techItem);
            });
            
            this.technologiesElement.appendChild(techList);
        }
        
        this.mediaElement.innerHTML = '';
        if (project.media && project.media.url) {
            if (project.media.type === 'image') {
                const img = document.createElement('img');
                img.src = project.media.url;
                img.alt = project.title;
                this.mediaElement.appendChild(img);
            } else if (project.media.type === 'video') {
                const video = document.createElement('video');
                video.src = project.media.url;
                video.controls = true;
                this.mediaElement.appendChild(video);
            }
        }
        
        if (project.projectUrl) {
            this.projectLink.href = project.projectUrl;
            this.projectLink.style.display = 'inline-block';
        } else {
            this.projectLink.style.display = 'none';
        }
        
        if (project.codeUrl) {
            this.codeLink.href = project.codeUrl;
            this.codeLink.style.display = 'inline-block';
        } else {
            this.codeLink.style.display = 'none';
        }
    }

    destroy() {
        this.closeButton.removeEventListener('click', this.close);
        this.overlay.removeEventListener('click', this.close);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
    }
}

// Initialize project modals when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize modal instance
    const projectModal = new ProjectModal();
    
    // Use event delegation for better performance and dynamic content handling
    document.addEventListener('click', (e) => {
        // Find the closest project card that was clicked
        const card = e.target.closest('.project-card');
        if (!card) return;
        
        e.preventDefault();
        
        try {
            // Get project data from data attributes
            const projectData = {
                title: card.dataset.title || 'Project',
                description: card.dataset.description || 'No description available.',
                technologies: card.dataset.technologies ? 
                    JSON.parse(card.dataset.technologies) : [],
                projectUrl: card.dataset.projectUrl || '#',
                codeUrl: card.dataset.codeUrl || '#',
                media: {
                    type: card.dataset.mediaType || 'image',
                    url: card.dataset.mediaUrl || ''
                }
            };
            
            // Open the modal with the project data
            projectModal.open(projectData);
            
        } catch (error) {
            console.error('Error opening project modal:', error);
        }
    });
    
    console.log('Project modal system initialized');
});

// Expose the ProjectModal class globally
window.ProjectModal = ProjectModal;
