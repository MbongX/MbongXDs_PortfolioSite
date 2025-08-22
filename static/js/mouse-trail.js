/**
 * Optimized Mouse Trail Effect
 * Features:
 * - Smooth particle-based trail
 * - Performance optimized with requestAnimationFrame
 * - Configurable appearance and behavior
 * - Clean memory management
 */
class MouseTrail {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            maxParticles: 80, // Increased for a longer trail
            particleSize: 3,
            colors: [
                '#00ff41', // Matrix green
                '#00e63d', // Slightly darker green
                '#00cc38', // Even darker green
                '#00b332', 
                '#00992c',  // Darkest green
                '#00ff88',  // Brighter teal
                '#00cc6a',  // Medium teal
                '#00aa55'   // Darker teal
            ],
            baseSpeed: 0.8,  // Slightly faster base speed
            maxSpeed: 3.5,   // Increased max speed
            trailLength: 35, // Longer trail
            particleLifetime: 120, // Longer lifetime (frames)
            spawnRate: 3,    // More particles per frame
            opacity: 0.9,    // More visible
            characters: '01', // Simple binary effect
            fontSize: 18,    // Larger text for better visibility
            ...options
        };
        
        // State
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.animationId = null;
        this.lastFrameTime = 0;
        this.frameInterval = 1000 / 60; // Target 60 FPS
        this.dpr = window.devicePixelRatio || 1;
        
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
            zIndex: '9998', // Below content, above matrix
            opacity: '0.9',
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
            const now = performance.now();
            if (now - this.lastMove < 8) return; // ~120fps for smoother tracking
            this.lastMove = now;
            
            // Update position with easing for smoother movement
            this.lastMouseX = this.mouseX;
            this.lastMouseY = this.mouseY;
            
            this.mouseX += (e.clientX - this.mouseX) * 0.5;
            this.mouseY += (e.clientY - this.mouseY) * 0.5;
            
            // Calculate velocity with smoothing
            this.velocityX = (this.mouseX - this.lastMouseX) * 0.3;
            this.velocityY = (this.mouseY - this.lastMouseY) * 0.3;
            
            // Create new particles with velocity-based spawning
            const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            const particlesToSpawn = Math.min(
                Math.ceil(speed * 0.1 * this.config.spawnRate),
                this.config.spawnRate * 3
            );
            
            for (let i = 0; i < particlesToSpawn; i++) {
                this.createParticle();
            }
        };
        
        // Add event listeners with passive where appropriate
        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        window.addEventListener('resize', this.handleResize, { passive: true });
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    createParticle() {
        // Remove oldest particle if we've reached max
        if (this.particles.length >= this.config.maxParticles) {
            this.particles.shift();
        }
        
        // Get a random character from the character set
        const char = this.config.characters.charAt(
            Math.floor(Math.random() * this.config.characters.length)
        );
        
        // Calculate velocity-based positioning
        const angle = Math.atan2(this.velocityY, this.velocityX);
        const speed = Math.min(Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY), 30);
        const spread = 15 + speed * 0.5;
        
        // Create particle with matrix-style falling effect
        const particle = {
            x: this.mouseX + (Math.random() - 0.5) * spread,
            y: this.mouseY + (Math.random() - 0.5) * spread,
            char: char,
            vx: (Math.random() - 0.5) * 1.5 + Math.cos(angle) * speed * 0.1,
            vy: (Math.random() - 0.5) * 1.5 + Math.sin(angle) * speed * 0.1,
            size: this.config.fontSize * (0.7 + Math.random() * 0.6),
            life: this.config.particleLifetime * (0.7 + Math.random() * 0.6),
            color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
            opacity: 0.9 + Math.random() * 0.1,
            originalLife: 0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
        
        particle.originalLife = particle.life;
        this.particles.push(particle);
        
        // Occasionally add a second particle for a better trail effect
        if (Math.random() > 0.7 && this.particles.length < this.config.maxParticles - 1) {
            const secondParticle = {...particle};
            secondParticle.char = this.config.characters.charAt(
                Math.floor(Math.random() * this.config.characters.length)
            );
            secondParticle.y += 10 + Math.random() * 20;
            secondParticle.opacity *= 0.7;
            this.particles.push(secondParticle);
        }
    }
    
    updateParticles(deltaTime) {
        // Normalize deltaTime to 60fps
        const deltaFactor = Math.min(deltaTime / (1000 / 60), 2);
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position with velocity and slight gravity
            p.vy += 0.01 * deltaFactor; // Very gentle downward acceleration
            p.vx += (Math.random() - 0.5) * 0.1 * deltaFactor; // Random horizontal movement
            
            // Apply velocity
            p.x += p.vx * deltaFactor;
            p.y += p.vy * deltaFactor;
            
            // Apply air resistance with some randomness
            const resistance = 0.96 + Math.random() * 0.03;
            p.vx *= Math.pow(resistance, deltaFactor);
            p.vy *= Math.pow(resistance, deltaFactor);
            
            // Update rotation
            p.rotation += p.rotationSpeed * deltaFactor;
            
            // Update life and calculate age ratio
            p.life -= deltaFactor;
            const ageRatio = p.life / p.originalLife;
            
            // Dynamic opacity based on age and position
            p.opacity = ageRatio * this.config.opacity * (0.7 + 0.3 * Math.sin(p.life * 0.1));
            
            // Size variation based on life
            p.currentSize = p.size * (0.7 + 0.3 * ageRatio);
            
            // Occasionally change the character for a digital effect
            if (Math.random() > 0.95) {
                p.char = this.config.characters.charAt(
                    Math.floor(Math.random() * this.config.characters.length)
                );
            }
            
            // Remove dead particles or particles that are off-screen
            if (p.life <= 0 || 
                p.y > this.canvas.height + 100 || 
                p.x < -100 || 
                p.x > this.canvas.width + 100) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    animate(timestamp) {
        // Calculate delta time for smooth animation
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Cap delta time to prevent large jumps
        const cappedDelta = Math.min(deltaTime, 100);
        
        // Update and render with the actual time delta
        this.updateParticles(cappedDelta);
        this.renderParticles();
        
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

// Initialize MouseTrail when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and start the mouse trail effect
    const mouseTrail = new MouseTrail({
        maxParticles: 60,
        particleSize: 3,
        color: '#00ff41',
        baseSpeed: 0.8,
        maxSpeed: 3,
        trailLength: 20,
        particleLifetime: 45
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
    
    // Expose to window for debugging if needed
    window.mouseTrail = mouseTrail;
});
