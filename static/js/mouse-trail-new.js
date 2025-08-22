/**
 * Enhanced Mouse Trail Effect
 * Features:
 * - Smooth particle-based trail with matrix-style characters
 * - Performance optimized with requestAnimationFrame
 * - Configurable appearance and behavior
 * - Clean memory management
 */
class MouseTrail {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            maxParticles: 100,      // Maximum number of particles
            particleSize: 2.5,      // Base size of particles
            colors: [
                '#00ff41', '#00e63d', '#00cc38', '#00b332', 
                '#00992c', '#00ff88', '#00cc6a', '#00aa55',
                '#00ffcc', '#00ffaa', '#00ff99', '#00dd88'
            ],
            baseSpeed: 0.8,         // Base movement speed
            maxSpeed: 3.5,          // Maximum movement speed
            trailLength: 40,        // Length of the trail
            particleLifetime: 150,  // How long particles live (frames)
            spawnRate: 3,           // Particles per frame
            opacity: 1.0,           // Base opacity
            characters: '01',       // Characters to use for the trail
            fontSize: 16,           // Base font size
            glowIntensity: 8,       // Glow effect intensity
            ...options
        };
        
        // Initialize state
        this.particles = [];
        this.particlePool = []; // Initialize particle pool for reuse
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.animationId = null;
        this.lastFrameTime = 0;
        this.lastMove = 0;
        this.dpr = window.devicePixelRatio || 1;
        this.frameCount = 0; // Add frame counter for timing
        
        // Bind methods
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.start();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { 
            alpha: true,
            desynchronized: true // Improve performance
        });
        
        // Style canvas
        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: '9998', // Below content, above background
            opacity: '1',
            mixBlendMode: 'screen' // Better blending with the background
        });
        
        // Set canvas size
        this.handleResize();
        document.body.appendChild(this.canvas);
    }
    
    handleResize() {
        this.dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Set canvas size with high DPI support
        this.canvas.width = Math.floor(width * this.dpr);
        this.canvas.height = Math.floor(height * this.dpr);
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    setupEventListeners() {
        // Throttled mousemove handler
        this.handleMouseMove = (e) => {
            // Throttle the mousemove handler for better performance
            const now = performance.now();
            if (now - this.lastMove < 16) return; // ~60fps
            
            // Update mouse position with device pixel ratio
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
            
            // Calculate velocity with smoothing
            this.velocityX = this.mouseX - this.lastMouseX;
            this.velocityY = this.mouseY - this.lastMouseY;
            
            // Update last move timestamp
            this.lastMove = now;
            
            // Create particles on mouse move
            this.createParticle();
        };
        
        // Add event listeners with passive where appropriate
        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        window.addEventListener('resize', this.handleResize, { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    createParticle() {
        // Only create particles if mouse has moved recently
        const now = performance.now();
        if (now - this.lastMove > 100) return; // Skip if mouse hasn't moved recently
        
        // Reuse particles from pool if available
        let particle;
        if (this.particlePool && this.particlePool.length > 0) {
            particle = this.particlePool.pop();
        } else if (this.particles.length < this.config.maxParticles) {
            // Create new particle if pool is empty and we haven't reached max
            particle = {};
        } else {
            // Reuse the oldest particle if we've reached max
            const oldParticle = this.particles.shift();
            if (oldParticle) {
                this.particlePool.push(oldParticle);
                particle = this.particlePool.pop();
            }
        }
        
        if (!particle) return;
        
        // Calculate position based on mouse movement
        const angle = Math.atan2(this.velocityY, this.velocityX);
        const speed = Math.min(Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY), 30);
        const spread = 5 + speed * 0.5;
        
        // Update particle properties
        Object.assign(particle, {
            x: this.mouseX + (Math.random() - 0.5) * spread,
            y: this.mouseY + (Math.random() - 0.5) * spread,
            char: Math.random() > 0.1 ? (Math.random() > 0.5 ? '0' : '1') : String.fromCharCode(0x30A0 + Math.random() * 96),
            vx: (Math.random() - 0.5) * 0.3 + Math.cos(angle) * speed * 0.01,
            vy: (Math.random() - 0.5) * 0.3 + Math.sin(angle) * speed * 0.01,
            size: this.config.fontSize * (0.7 + Math.random() * 0.6),
            baseSize: 0, // Will be set after creation
            life: this.config.particleLifetime * (0.8 + Math.random() * 0.4),
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            opacity: 1.0,
            originalLife: 0,
            rotation: (Math.random() - 0.5) * 0.1, // Less rotation for better performance
            rotationSpeed: (Math.random() - 0.5) * 0.02, // Slower rotation
            createdAt: now
        });
        
        particle.baseSize = particle.size;
        particle.originalLife = particle.life;
        
        // Add to active particles
        this.particles.push(particle);
        this.activeParticles = this.particles.length;
    }
    
    updateParticles(deltaTime) {
        // Use a fixed time step for consistent animation
        const fixedDeltaTime = Math.min(deltaTime, 1000 / 30); // Cap at 30fps for physics
        
        // Update existing particles in reverse order for safe removal
        let i = this.particles.length;
        while (i--) {
            const p = this.particles[i];
            
            // Update position with velocity
            p.x += p.vx * fixedDeltaTime * 0.03; // Scale by time delta
            p.y += p.vy * fixedDeltaTime * 0.03;
            
            // Apply gravity with time scaling
            p.vy += 0.02 * fixedDeltaTime * 0.03;
            
            // Update rotation with time scaling
            p.rotation += p.rotationSpeed * fixedDeltaTime * 0.03;
            
            // Update opacity with time scaling
            p.opacity -= p.fadeSpeed * fixedDeltaTime * 0.03;
            
            // Remove dead particles
            if (p.opacity <= 0.01 || p.life <= 0) {
                // Reuse the particle object
                if (this.particlePool.length < this.config.maxParticles * 2) {
                    this.particlePool.push(this.particles[i]);
                }
                this.particles.splice(i, 1);
            } else {
                p.life--;
            }
        }
    }
    
    drawParticles() {
        // Skip rendering if we're in the background
        if (document.hidden) return;
        
        // Use requestAnimationFrame timestamp for smooth animation
        const now = performance.now();
        const timeSinceLastFrame = now - this.lastFrameTime;
        
        // Skip frame if we're rendering too fast (cap at 60fps)
        if (timeSinceLastFrame < 16) return;
        this.lastFrameTime = now - (timeSinceLastFrame % 16);
        
        // Clear only the dirty regions for better performance
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Batch draw calls with similar properties
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw each particle
        const particles = this.particles;
        const length = particles.length;
        
        for (let i = 0; i < length; i++) {
            const p = particles[i];
            
            // Skip if particle is not visible
            if (p.opacity <= 0.01) continue;
            
            // Set common properties
            this.ctx.globalAlpha = p.opacity * this.config.opacity;
            
            // Only set shadow if needed
            if (this.config.glowIntensity > 0) {
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = this.config.glowIntensity * (p.size / 2);
            } else {
                this.ctx.shadowColor = 'transparent';
            }
            
            // Set font and color
            this.ctx.font = `${p.size}px 'Roboto Mono', monospace`;
            this.ctx.fillStyle = p.color;
            
            // Draw with transform for rotation
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.fillText(p.char, 0, 0);
            this.ctx.restore();
        }
        
        // Reset shadow to avoid affecting other canvas operations
        this.ctx.shadowColor = 'transparent';
    }
    
    // Helper function to lighten a color
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    
    // Helper function to darken a color
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        
        return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
    }
    
    animate(timestamp) {
        // Calculate time delta for smooth animation
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        
        // Only update if we have a reasonable delta time (prevents large jumps when tab is inactive)
        if (deltaTime < 1000) {
            this.updateParticles(deltaTime);
            this.drawParticles();
        }
        
        // Continue animation loop
        this.animationId = requestAnimationFrame(this.animate);
    }
    
    start() {
        if (!this.animationId) {
            this.lastFrameTime = performance.now();
            this.animationId = requestAnimationFrame(this.animate);
        }
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    destroy() {
        this.stop();
        
        // Remove event listeners
        if (this.handleMouseMove) {
            window.removeEventListener('mousemove', this.handleMouseMove);
        }
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Remove canvas from DOM
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export the MouseTrail class for manual initialization
window.MouseTrail = MouseTrail;

// Auto-initialize if not explicitly disabled
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not already initialized
    if (!window.mouseTrail) {
        const mouseTrail = new MouseTrail({
            maxParticles: 50,
            particleSize: 14,
            colors: ['#00ff41', '#00cc33', '#00aa33'],
            baseSpeed: 0.6,
            maxSpeed: 2.5,
            trailLength: 20,
            particleLifetime: 60,
            spawnRate: 1,
            opacity: 0.7,
            glowIntensity: 8,
            fontSize: 14
        });
        
        // Handle page visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                mouseTrail.stop();
            } else {
                mouseTrail.start();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Cleanup function
        const cleanup = () => {
            mouseTrail.destroy();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', cleanup);
        };
        
        window.addEventListener('beforeunload', cleanup);
        
        // Expose to window for debugging
        window.mouseTrail = mouseTrail;
    }
});

// Export for Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MouseTrail };
}
